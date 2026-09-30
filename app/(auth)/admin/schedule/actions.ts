"use server";

import {
  setupHapioProject,
  createAdminBooking,
  AdminBlockCategory,
} from "@/lib/hapio";
import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
// IMPORT PRISMA HERE (Adjust the path if your instantiated prisma client is elsewhere)
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "America/Toronto";

export async function runHapioSetup(formData: FormData) {
  const locationName = formData.get("locationName") as string;
  const serviceName = formData.get("serviceName") as string;
  const resourceName = formData.get("resourceName") as string;

  const settings = {
    duration: formData.get("duration") as string,
    bookableInterval: formData.get("interval") as string,
    bufferAfter: formData.get("buffer") as string,
    advanceNotice: formData.get("advanceNotice") as string,
    futureLimit: formData.get("futureLimit") as string,
  };

  if (!locationName || !serviceName || !resourceName) {
    return { success: false, error: "All text fields are required" };
  }

  try {
    const ids = await setupHapioProject(
      locationName,
      serviceName,
      resourceName,
      settings,
    );

    // --- NEW DB LOGIC ---
    // If you only ever have 1 provider, delete old ones first to prevent duplicates
    await prisma.provider.deleteMany();

    // Save the newly generated Resource ID directly to the database!
    await prisma.provider.create({
      data: {
        name: resourceName,
        hapioResourceId: ids.resourceId,
      },
    });
    // --------------------

    return { success: true, data: ids };
  } catch (error: any) {
    console.error("Hapio setup failed:", error);
    return { success: false, error: error.message };
  }
}

export async function addAdminBlock(formData: FormData) {
  const resourceId = formData.get("resourceId") as string;
  const startsAtLocal = formData.get("startsAt") as string;
  const endsAtLocal = formData.get("endsAt") as string;
  const category = formData.get("category") as AdminBlockCategory;
  const note = formData.get("note") as string;

  if (!resourceId || !startsAtLocal || !endsAtLocal || !category) {
    return { success: false, error: "Missing required fields" };
  }

  // Safely parse timezone without Vercel/UTC messing it up
  const startDate = fromZonedTime(startsAtLocal, TIME_ZONE);
  const endDate = fromZonedTime(endsAtLocal, TIME_ZONE);

  // Validate overlap / midnight cross over
  if (endDate <= startDate) {
    return { success: false, error: "End time must be after the start time." };
  }

  try {
    const booking = await createAdminBooking({
      resourceId,
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      category,
      note,
    });

    // Refresh the schedule view instantly
    revalidatePath("/admin/schedule");

    return { success: true, data: booking };
  } catch (error: any) {
    console.error("Admin block failed:", error);
    return { success: false, error: error.message };
  }
}
