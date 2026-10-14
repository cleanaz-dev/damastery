"use server";

import { createCustomerBooking } from "@/lib/hapio";
import { revalidatePath } from "next/cache";

export async function bookSessionAction(resourceId: string, startsAt: string, endsAt: string) {
    try {
        await createCustomerBooking({
            resourceId,
            startsAt,
            endsAt,
            isTemporary: false,
        });
        
        // Refresh the dashboard so the new session appears in "Upcoming Sessions"
        revalidatePath("/dashboard"); 
        
        return { success: true };
    } catch (error: any) {
        console.error("Booking error:", error);
        return { success: false, error: error.message || "Failed to book session" };
    }
}