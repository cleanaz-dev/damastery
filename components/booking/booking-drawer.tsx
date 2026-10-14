import { getBookableSlots } from "@/lib/hapio";
import { BookingDrawerClient, HapioSlot } from "./book-drawer-client";

const TZ = "America/Toronto";
const OPEN_MINUTES = 10 * 60;  // 10:00 AM
const CLOSE_MINUTES = 20 * 60; // 8:00 PM (a slot starting at 8:00 PM is kept)

// Hapio wants Y-m-d\TH:i:sP: no milliseconds, numeric offset instead of "Z"
const toHapioDate = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "+00:00");

// Minutes since midnight, in Toronto time
function torontoMinutes(iso: string) {
    const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
        timeZone: TZ,
    }).formatToParts(new Date(iso));
    const hour = Number(parts.find((p) => p.type === "hour")!.value);
    const minute = Number(parts.find((p) => p.type === "minute")!.value);
    return hour * 60 + minute;
}

export async function BookingDrawer({
    children,
    resourceId,
}: {
    children: React.ReactElement;
    resourceId: string;
}) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 14);

    let initialSlotsData: HapioSlot[] = [];

    try {
        const slots = await getBookableSlots({
            resourceId,
            from: toHapioDate(today),
            to: toHapioDate(futureDate),
        });

        initialSlotsData = slots.filter((slot) => {
            const m = torontoMinutes(slot.starts_at);
            return m >= OPEN_MINUTES && m <= CLOSE_MINUTES;
        });
    } catch (error) {
        console.error("Failed to fetch bookable slots:", error);
    }

    return (
        <BookingDrawerClient initialSlots={initialSlotsData} resourceId={resourceId}>
            {children}
        </BookingDrawerClient>
    );
}