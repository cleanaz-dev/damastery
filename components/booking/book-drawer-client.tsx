"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { bookSessionAction } from "@/lib/actions/book-session";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Loader2 } from "lucide-react";

const TZ = "America/Toronto";

export type HapioSlot = {
    starts_at: string;
    ends_at: string;
};

export function BookingDrawerClient({
    children,
    resourceId,
    initialSlots,
}: {
    children: React.ReactElement; // must be a single element (e.g. a <Button>)
    resourceId: string;
    initialSlots?: HapioSlot[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<HapioSlot | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const slotsByDay = useMemo(() => {
        const grouped: Record<string, HapioSlot[]> = {};
        initialSlots?.forEach((slot) => {
            const dateKey = new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                timeZone: TZ,
            }).format(new Date(slot.starts_at));

            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(slot);
        });
        return grouped;
    }, [initialSlots]);

    const handleBook = async () => {
        if (!selectedSlot) return;
        setIsSubmitting(true);

        const res = await bookSessionAction(
            resourceId,
            selectedSlot.starts_at,
            selectedSlot.ends_at
        );

        setIsSubmitting(false);

        if (res.success) {
            setIsOpen(false);
            setSelectedSlot(null);
            router.refresh();
        } else {
            alert(res.error || "Failed to book session. Please try again.");
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger render={children} />
            <DrawerContent className="bg-stone-100 border-stone-200 text-stone-900 max-h-[85vh]">
                <div className="max-w-md mx-auto w-full">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="font-serif text-2xl">
                            Book a Session
                        </DrawerTitle>
                        <DrawerDescription className="text-stone-500 italic">
                            Select an available time for your next appointment.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 overflow-y-auto max-h-[50vh] space-y-6 scrollbar-hide">
                        {Object.entries(slotsByDay).length === 0 ? (
                            <p className="text-stone-500 italic text-center py-8">
                                No available slots found for the next 14 days.
                            </p>
                        ) : (
                            Object.entries(slotsByDay).map(([dateLabel, slots]) => (
                                <div key={dateLabel} className="space-y-3">
                                    <h3 className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                        {dateLabel}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {slots.map((slot) => {
                                            const isSelected =
                                                selectedSlot?.starts_at === slot.starts_at;
                                            return (
                                                <Button
                                                    key={slot.starts_at}
                                                    type="button"
                                                    variant={isSelected ? "default" : "outline"}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className="w-full"
                                                >
                                                    {new Intl.DateTimeFormat("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        timeZone: TZ,
                                                    }).format(new Date(slot.starts_at))}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <DrawerFooter className="border-t border-stone-200 mt-4 pt-4">
                        <Button
                            type="button"
                            size="lg"
                            onClick={handleBook}
                            disabled={!selectedSlot || isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                "Confirm Booking"
                            )}
                        </Button>
                        <DrawerClose render={<Button variant="ghost" className="w-full" />}>
                            Cancel
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}