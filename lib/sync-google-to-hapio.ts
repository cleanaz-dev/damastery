// lib/sync-google-to-hapio.ts
import { getGoogleCalendarEvents, stampGoogleEventWithHapioId } from "./google-calendar";
import { getHapioBookings, createAdminBooking, cancelHapioBooking } from "./hapio";

export async function syncGoogleCalendarToHapio(resourceId: string, from: string, to: string) {
  try {
    // 1. Fetch Dwayne's Google events and existing Hapio bookings in parallel
    const [googleEvents, hapioRes] = await Promise.all([
      getGoogleCalendarEvents(from, to),
      getHapioBookings({ resourceId, from, to }),
    ]);

    const hapioBookings = hapioRes.data || [];

    // Map of existing Hapio admin blocks by their Google event link or time
    const syncedHapioIds = new Set(
      hapioBookings
        .filter((b) => b.metadata?.is_admin_block)
        .map((b) => b.metadata?.googleEventId || b.id)
    );

    for (const gEvent of googleEvents) {
      // If this Google event was created by our app originally, skip it (avoid infinite loops)
      if (gEvent.hapioBookingId) continue;

      // Check if we already synced this Google event into Hapio
      const alreadySynced = hapioBookings.some(
        (b) => b.starts_at === gEvent.startsAt && b.ends_at === gEvent.endsAt && b.metadata?.is_admin_block
      );

      if (!alreadySynced) {
        // 2. Create the block in Hapio so customer availability closes immediately!
        const newHapioBlock = await createAdminBooking({
          resourceId,
          startsAt: gEvent.startsAt,
          endsAt: gEvent.endsAt,
          category: "work",
          note: `Google Cal: ${gEvent.summary}`,
        });

        // 3. Stamp the Google Calendar event with the Hapio ID
        await stampGoogleEventWithHapioId(gEvent.googleEventId, newHapioBlock.id);
      }
    }
  } catch (err) {
    console.error("Error syncing Google Calendar to Hapio:", err);
  }
}