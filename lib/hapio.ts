// lib/hapio/index.ts

const HAPIO_URL = process.env.HAPIO_URL ?? "https://eu-central-1.hapio.net/v1";
const HAPIO_KEY = process.env.HAPIO_API_KEY!;

export type AdminBlockCategory = "work" | "personal" | "meeting" | "maintenance" | "other";

// Hardcoded — single location, single service for the whole app
export const HAPIO_LOCATION_ID = "705cc639-ed36-4169-bf2b-cab8be5c7f93";
export const HAPIO_SERVICE_ID = "d8fcf10f-fef7-4f23-ab16-b0b621fa37c8";

async function hapioFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${HAPIO_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${HAPIO_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hapio API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

type HapioSlot = {
  starts_at: string;
  ends_at: string;
  buffer_starts_at: string;
  buffer_ends_at: string;
  resources: { id: string; name: string }[];
};

// --- Bookable slots for a specific room ---
export async function getBookableSlots(params: {
  resourceId: string; // maps to Room.hapioResourceId
  from: string; // ISO string with offset
  to: string;
}) {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    location: HAPIO_LOCATION_ID,
  });

  const res = await hapioFetch<{ data: HapioSlot[] }>(
    `/services/${HAPIO_SERVICE_ID}/bookable-slots?${query.toString()}`
  );

  // Hapio returns slots for ALL linked resources at once — filter to just this room
  return res.data.filter((slot) =>
    slot.resources.some((r) => r.id === params.resourceId)
  );
}

// --- Create booking ---
export async function createHapioBooking(params: {
  resourceId: string;
  startsAt: string;
  endsAt: string;
  isTemporary: boolean
}) {
  return hapioFetch<{ id: string; [key: string]: unknown }>(`/bookings`, {
    method: "POST",
    body: JSON.stringify({
      location_id: HAPIO_LOCATION_ID,
      service_id: HAPIO_SERVICE_ID,
      resource_id: params.resourceId,
      starts_at: params.startsAt,
      ends_at: params.endsAt,
      is_temporary: params.isTemporary,
      // ADD THIS LINE: Tells Hapio to accept merged multi-hour blocks
      ignore_bookable_slots: true 
    }),
  });
}
// --- Cancel booking ---
export async function cancelHapioBooking(hapioBookingId: string) {
  return hapioFetch(`/bookings/${hapioBookingId}`, {
    method: "DELETE",
  });
}

// --- Confirm temporary booking (Remove temporary hold) ---
export async function confirmHapioBooking(hapioBookingId: string) {
  return hapioFetch(`/bookings/${hapioBookingId}`, {
    method: "PATCH",
    body: JSON.stringify({
      is_temporary: false,
    }),
  });
}

export async function createAdminBooking(params: {
  resourceId: string;
  startsAt: string;
  endsAt: string;
  category: AdminBlockCategory; // <-- Require the admin to pick a category
  note?: string;                // <-- Optional extra details
}) {
  return hapioFetch<{ id: string; [key: string]: unknown }>(`/bookings`, {
    method: "POST",
    body: JSON.stringify({
      location_id: HAPIO_LOCATION_ID,
      service_id: HAPIO_SERVICE_ID,
      resource_id: params.resourceId,
      starts_at: params.startsAt,
      ends_at: params.endsAt,
      is_temporary: false,
      ignore_bookable_slots: true,
      // Pass the categorization into Hapio's metadata
      metadata: { 
        is_admin_block: true,       // Flag to easily separate from customers
        category: params.category,  // "work", "personal", etc.
        note: params.note || ""     // Any custom text the admin typed
      }
    }),
  });
}


// --- Create CUSTOMER booking ---
// Normal users must follow the schedule rules.
export async function createCustomerBooking(params: {
  resourceId: string;
  startsAt: string;
  endsAt: string;
  isTemporary: boolean;
}) {
  return hapioFetch<{ id: string; [key: string]: unknown }>(`/bookings`, {
    method: "POST",
    body: JSON.stringify({
      location_id: HAPIO_LOCATION_ID,
      service_id: HAPIO_SERVICE_ID,
      resource_id: params.resourceId,
      starts_at: params.startsAt,
      ends_at: params.endsAt,
      is_temporary: params.isTemporary, 
      
      // FIX THIS LINE: Must be false for standard users so they are forced 
      // to pick times that actually exist in getBookableSlots()
      ignore_bookable_slots: false 
    }),
  });
}


export async function setupHapioProject(
  clinicName: string, 
  serviceName: string, 
  adminName: string,
  settings: {
    duration: string;
    bookableInterval: string;
    bufferAfter: string;
    advanceNotice: string;
    futureLimit: string;
  }
) {
  // 1. Create Location
  const location = await hapioFetch<{ id: string }>(`/locations`, {
    method: "POST",
    body: JSON.stringify({
      name: clinicName,
      time_zone: "America/Toronto", 
      resource_selection_strategy: "equalize",
      enabled: true
    })
  });

  // 2. Create Service (NOW 100% DYNAMIC FROM FRONTEND)
  const service = await hapioFetch<{ id: string }>(`/services`, {
    method: "POST",
    body: JSON.stringify({
      name: serviceName,
      type: "fixed",
      duration: settings.duration,
      bookable_interval: settings.bookableInterval, 
      buffer_time_after: settings.bufferAfter,
      booking_window_start: settings.advanceNotice,
      booking_window_end: settings.futureLimit,
      enabled: true
    })
  });

  // 3. Create Resource
  const resource = await hapioFetch<{ id: string }>(`/resources`, {
    method: "POST",
    body: JSON.stringify({
      name: adminName,
      max_simultaneous_bookings: 1,
      enabled: true
    })
  });

  // 4. Link Resource to Service
  await hapioFetch(`/services/${service.id}/resources/${resource.id}`, {
    method: "PUT"
  });

  return {
    locationId: location.id,
    serviceId: service.id,
    resourceId: resource.id
  };
}

export async function getHapioBookings(params: {
  resourceId: string;
  from: string; // ISO string 
  to: string;   // ISO string
}) {
  const query = new URLSearchParams({
    location_id: HAPIO_LOCATION_ID,
    resource_id: params.resourceId,
    from: params.from,
    to: params.to,
  });

  // Returns all bookings. Admin blocks will have `metadata.is_admin_block: true`
  return hapioFetch<{ data: any[] }>(`/bookings?${query.toString()}`);
}