"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomerBooking, cancelHapioBooking } from "@/lib/hapio";
import { sendEmail } from "../emails/send";
import {
  MeetingBookedEmail,
  MeetingBookedAdminEmail,
} from "../emails/templates/meeting-booked";

type Result = { success: true } | { success: false; error: string };

const TZ = "America/Toronto";

function formatWhen(d: Date) {
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TZ,
  }).format(d);
  const clock = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: TZ,
  }).format(d);
  return `${date} at ${clock}`;
}

export async function bookMeetingAction(
  resourceId: string,
  startsAt: string,
  endsAt: string,
): Promise<Result> {
  // 1. Must be logged in
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Please log in to book a session." };
  }
  const user = session.user;

  // 2. Validate input (the client can send anything)
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return { success: false, error: "Invalid time slot." };
  }
  if (start <= new Date()) {
    return { success: false, error: "That time has already passed." };
  }

  // 3. Don't trust the resourceId from the browser
  const provider = await prisma.provider.findUnique({
    where: { hapioResourceId: resourceId },
  });
  if (!provider) {
    return { success: false, error: "Provider not found." };
  }

  // 4. Book in Hapio first. It is the source of truth and rejects taken slots.
  let hapioBooking: { id: string };
  try {
    hapioBooking = await createCustomerBooking({
      resourceId,
      startsAt, // Hapio's own timestamps, passed back unchanged
      endsAt,
      isTemporary: false,
    });
  } catch (err: any) {
    console.error("Hapio booking failed:", err?.message);
    return {
      success: false,
      error: "That time is no longer available. Please pick another.",
    };
  }

  // 5. Save to the DB. If this fails, undo the Hapio booking so nothing is orphaned.
  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        userId: user.id,
        hapioBookingId: hapioBooking.id,
        status: "BOOKED",
        startsAt: start,
        endsAt: end,
      },
    });
  } catch (err: any) {
    console.error("DB booking failed, rolling back Hapio:", err?.message);
    try {
      await cancelHapioBooking(hapioBooking.id);
    } catch (rollbackErr: any) {
      console.error("Rollback failed:", hapioBooking.id, rollbackErr?.message);
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // 6. Emails. A failed email must not fail the booking, and one failing
  //    must not stop the other, so they send independently.
  const time = formatWhen(booking.startsAt);
  const minutes = Math.round(
    (booking.endsAt.getTime() - booking.startsAt.getTime()) / 60000,
  );
  const duration = `${minutes} minutes`;

  const results = await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: "Your session is booked",
      react: MeetingBookedEmail({
        firstName: user.name.split(" ")[0],
        time,
        duration,
      }),
    }),
    sendEmail({
      to: process.env.EMAIL_TO!,
      subject: `New booking: ${user.name}`,
      react: MeetingBookedAdminEmail({
        clientName: user.name,
        clientEmail: user.email,
        time,
        duration,
      }),
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `${i === 0 ? "Client" : "Admin"} email failed:`,
        r.reason?.message,
      );
    }
  });

  return { success: true };
}
