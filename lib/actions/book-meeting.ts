"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomerBooking, cancelHapioBooking } from "@/lib/hapio";
import { createZoomMeeting } from "@/lib/zoom";
import { buildIcs } from "@/lib/ics";
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
  const t0 = Date.now();
  let tag = "[book]"; // becomes [book:<bookingId>] once we have one
  const log = (msg: string, extra?: unknown) =>
    extra === undefined ? console.log(`${tag} ${msg}`) : console.log(`${tag} ${msg}`, extra);
  const logError = (msg: string, err?: unknown) =>
    console.error(`${tag} ${msg}`, err instanceof Error ? err.message : err ?? "");

  // 1. Must be logged in
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "Please log in to book a session." };
  }
  const user = session.user;
  log(`start for ${user.email}`, { startsAt, endsAt });

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
    logError("provider not found for resource", resourceId);
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
    log(`OK   hapio booking ${hapioBooking.id}`);
  } catch (err: any) {
    logError("FAIL hapio booking:", err);
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
    tag = `[book:${booking.id}]`;
    log("OK   db booking saved");
  } catch (err: any) {
    logError("FAIL db booking, rolling back hapio:", err);
    try {
      await cancelHapioBooking(hapioBooking.id);
      log("OK   hapio rollback");
    } catch (rollbackErr: any) {
      logError(`FAIL hapio rollback (booking ${hapioBooking.id} is orphaned):`, rollbackErr);
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // 6. Zoom meeting. A failure here must not cost us the booking.
  const time = formatWhen(booking.startsAt);
  const minutes = Math.round(
    (booking.endsAt.getTime() - booking.startsAt.getTime()) / 60000,
  );
  const duration = `${minutes} minutes`;

  let joinUrl: string | undefined;
  let zoomStatus: "created" | "created-not-saved" | "failed" = "failed";
  try {
    const zoom = await createZoomMeeting({
      topic: `Session with ${user.name}`,
      startsAt: booking.startsAt,
      durationMinutes: minutes,
    });
    joinUrl = zoom.joinUrl;
    zoomStatus = "created-not-saved";
    log(`OK   zoom meeting ${zoom.id} created`);

    await prisma.booking.update({
      where: { id: booking.id },
      data: { zoomMeetingId: zoom.id, zoomJoinUrl: zoom.joinUrl },
    });
    zoomStatus = "created";
    log("OK   zoom meeting saved to db");
  } catch (err: any) {
    if (zoomStatus === "created-not-saved") {
      logError("FAIL saving zoom ids to db (meeting exists in Zoom, link will still be emailed):", err);
    } else {
      logError("FAIL zoom meeting (booking kept, emails go without a link):", err);
    }
  }

  // 7. Emails. A failed email must not fail the booking, and one failing
  //    must not stop the other, so they send independently.
  const [clientRes, adminRes] = await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: "Your session is booked",
      react: MeetingBookedEmail({
        firstName: user.name.split(" ")[0],
        time,
        duration,
        joinUrl,
      }),
      attachments: [
        {
          filename: "session.ics",
          content: Buffer.from(
            buildIcs({
              uid: booking.id,
              title: "Session with Dwayne",
              startsAt: booking.startsAt,
              endsAt: booking.endsAt,
              joinUrl,
            }),
          ),
        },
      ],
    }),
    sendEmail({
      to: process.env.EMAIL_TO!,
      subject: `New booking: ${user.name}`,
      react: MeetingBookedAdminEmail({
        clientName: user.name,
        clientEmail: user.email,
        time,
        duration,
        joinUrl,
      }),
    }),
  ]);

  for (const [label, r] of [["client", clientRes], ["admin", adminRes]] as const) {
    if (r.status === "fulfilled") {
      log(`OK   ${label} email sent`, { id: r.value?.id });
    } else {
      logError(`FAIL ${label} email:`, r.reason);
    }
  }

  // 8. One-line summary
  log(
    `done in ${Date.now() - t0}ms | zoom=${zoomStatus} | client email=${clientRes.status} | admin email=${adminRes.status}`,
  );

  return { success: true };
}