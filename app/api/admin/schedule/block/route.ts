// app/api/admin/schedule/block/route.ts
import { NextResponse } from "next/server";
import { createAdminBooking, AdminBlockCategory, cancelHapioBooking } from "@/lib/hapio";

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming JSON body from the AdminTimeBlocker component
    const body = await req.json();
    const { resourceId, from, to, category, note } = body;

    // 2. Validate the required fields
    if (!resourceId || !from || !to) {
      return NextResponse.json(
        { message: "Missing required fields: resourceId, from, to." },
        { status: 400 }
      );
    }

    // 3. Map the frontend UI category names to your strict AdminBlockCategory type in lib/hapio
    let mappedCategory: AdminBlockCategory = "other";
    
    switch (category) {
      case "Work Block / Busy":
        mappedCategory = "work";
        break;
      case "Lunch Break":
      case "Personal":
        mappedCategory = "personal";
        break;
      case "Out of Office":
        mappedCategory = "other";
        break;
      default:
        mappedCategory = "other";
    }

    // 4. Send the request to Hapio via your helper function
    const booking = await createAdminBooking({
      resourceId: resourceId,
      startsAt: from,     // UI sends 'from', Hapio helper expects 'startsAt'
      endsAt: to,         // UI sends 'to', Hapio helper expects 'endsAt'
      category: mappedCategory,
      note: note || "",
    });

    // 5. Return a success response
    return NextResponse.json({ success: true, booking }, { status: 201 });

  } catch (error: any) {
    console.error("Admin time block error:", error);
    
    // Return a 500 error if something fails during the Hapio fetch
    return NextResponse.json(
      { message: error.message || "Failed to block out time in the schedule." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { message: "Missing booking ID" },
        { status: 400 }
      );
    }

    await cancelHapioBooking(bookingId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to delete time block." },
      { status: 500 }
    );
  }
}