// lib/sync-google-to-hapio.ts
import { getGoogleCalendarEvents, stampGoogleEventWithHapioId } from "./google-calendar";
import { getHapioBookings, createAdminBooking } from "./hapio";

export async function syncGoogleCalendarToHapio(resourceId: string, from: string, to: string) {
  try {
    // 1. Fetch Dwayne's Google events and existing Hapio bookings in parallel
    const [googleEvents, hapioRes] = await Promise.all([
      getGoogleCalendarEvents(from, to),
      getHapioBookings({ resourceId, from, to }),
    ]);

    const hapioBookings = hapioRes.data || [];

    for (const gEvent of googleEvents) {
      // Skip events our app created originally (avoid infinite loops)
      if (gEvent.hapioBookingId) continue;

      // Skip if we already synced this Google event into Hapio
      const alreadySynced = hapioBookings.some(
        (b) =>
          b.starts_at === gEvent.startsAt &&
          b.ends_at === gEvent.endsAt &&
          b.metadata?.is_admin_block
      );
      if (alreadySynced) continue;

      try {
        // 2. Create the block in Hapio so customer availability closes immediately
        const newHapioBlock = await createAdminBooking({
          resourceId,
          startsAt: gEvent.startsAt,
          endsAt: gEvent.endsAt,
          category: "work",
          note: `Google Cal: ${gEvent.summary}`,
        });

        // 3. Stamp the Google Calendar event with the Hapio ID
        await stampGoogleEventWithHapioId(gEvent.googleEventId, newHapioBlock.id);
      } catch (err: any) {
        // 422 = outside the resource's open schedule, nothing to block
        if (String(err?.message).includes("422")) continue;
        console.error("Failed to sync event", gEvent.googleEventId, err?.message);
      }
    }
  } catch (err: any) {
    console.error("Error syncing Google Calendar to Hapio:", err?.code, err?.message);
  }
}