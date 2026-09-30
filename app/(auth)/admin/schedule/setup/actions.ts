"use server";

import { setupHapioProject } from "@/lib/hapio"; // Adjust path if needed
import { createAdminBooking, AdminBlockCategory } from "@/lib/hapio";

export async function runHapioSetup(formData: FormData) {
  const locationName = formData.get("locationName") as string;
  const serviceName = formData.get("serviceName") as string;
  const resourceName = formData.get("resourceName") as string;

  // New Dynamic Settings
  const settings = {
    duration: formData.get("duration") as string,
    bookableInterval: formData.get("interval") as string,
    bufferAfter: formData.get("buffer") as string,
    advanceNotice: formData.get("advanceNotice") as string,
    futureLimit: formData.get("futureLimit") as string,
  };

  if (!locationName || !serviceName || !resourceName) {
    throw new Error("All text fields are required");
  }

  try {
    const ids = await setupHapioProject(locationName, serviceName, resourceName, settings);
    return { success: true, data: ids };
  } catch (error: any) {
    console.error("Hapio setup failed:", error);
    return { success: false, error: error.message };
  }
}





export async function addAdminBlock(formData: FormData) {
  const resourceId = formData.get("resourceId") as string;
  const startsAt = formData.get("startsAt") as string;
  const endsAt = formData.get("endsAt") as string;
  const category = formData.get("category") as AdminBlockCategory;
  const note = formData.get("note") as string;

  if (!resourceId || !startsAt || !endsAt || !category) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    // Because your helper explicitly uses `ignore_bookable_slots: true`, 
    // the admin can book *any* time frame they want (e.g. 1:12 PM - 3:45 PM).
    const booking = await createAdminBooking({
      resourceId,
      startsAt,
      endsAt,
      category,
      note,
    });
    
    return { success: true, data: booking };
  } catch (error: any) {
    console.error("Admin block failed:", error);
    return { success: false, error: error.message };
  }
}