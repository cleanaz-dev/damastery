// app/api/admin/schedule/block/route.ts
import { NextResponse } from "next/server";
import { createAdminBooking, cancelHapioBooking } from "@/lib/hapio";
import {
  pushEventToGoogleCalendar,
  removeEventFromGoogleCalendar,
} from "@/lib/google-calendar";

export async function POST(req: Request) {
  try {
    const { resourceId, from, to, category, note } = await req.json();

    // 1. Create block in Hapio
    const hapioBooking = await createAdminBooking({
      resourceId,
      startsAt: from,
      endsAt: to,
      category,
      note,
    });

    // 2. Push to Google Calendar as well
    await pushEventToGoogleCalendar({
      hapioBookingId: hapioBooking.id,
      title: `Blocked: ${category.toUpperCase()}`,
      description: note,
      startsAt: from,
      endsAt: to,
    }).catch((err) => console.error("Google Calendar push error:", err));

    return NextResponse.json({ data: hapioBooking });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to block time slot." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json({ message: "Missing booking ID" }, { status: 400 });
    }

    // 1. Delete from Hapio
    await cancelHapioBooking(bookingId);

    // 2. Remove from Google Calendar
    await removeEventFromGoogleCalendar(bookingId).catch((err) =>
      console.error("Google Calendar delete error:", err)
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to delete time block." },
      { status: 500 }
    );
  }
}