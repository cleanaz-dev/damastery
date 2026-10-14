import { getBookableSlots } from "@/lib/hapio";
import { BookingDrawerClient, HapioSlot } from "./book-drawer-client";

// Hapio wants Y-m-d\TH:i:sP: no milliseconds, numeric offset instead of "Z"
const toHapioDate = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "+00:00");

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
        initialSlotsData = await getBookableSlots({
            resourceId,
            from: toHapioDate(today),
            to: toHapioDate(futureDate),
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