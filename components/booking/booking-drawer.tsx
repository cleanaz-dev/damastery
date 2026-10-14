import { getBookableSlots } from "@/lib/hapio";
import { BookingDrawerClient, HapioSlot } from "./book-drawer-client";

export async function BookingDrawer({
    children,
    resourceId,
}: {
    children: React.ReactElement;
    resourceId: string;
}) {
    // We fetch slots 14 days into the future server-side so they are instantly ready
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 14);

    let initialSlotsData: HapioSlot[] = [];

    try {
        initialSlotsData = await getBookableSlots({
            resourceId,
            from: today.toISOString(),
            to: futureDate.toISOString(),
        });
        console.log("[BookingDrawer]", {
            resourceId,
            count: Array.isArray(initialSlotsData) ? initialSlotsData.length : null,
            raw: initialSlotsData,
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