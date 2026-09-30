"use server";

import { setupHapioProject } from "@/lib/hapio"; // Adjust path if needed

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