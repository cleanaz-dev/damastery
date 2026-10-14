// lib/google-calendar.ts
import { google, calendar_v3 } from "googleapis";

const CALENDAR_ID = process.env.DWAYNE_GOOGLE_CALENDAR_ID!;

function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
    clientOptions: { subject: CALENDAR_ID }, 
  });
  return google.calendar({ version: "v3", auth });
}

export async function getGoogleCalendarEvents(from: string, to: string) {
  if (!CALENDAR_ID || !process.env.GOOGLE_CLIENT_EMAIL) return [];
  const calendar = getCalendarClient();

  const items: calendar_v3.Schema$Event[] = [];
  let pageToken: string | undefined;
  do {
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date(from).toISOString(),
      timeMax: new Date(to).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
      pageToken,
    });
    items.push(...(res.data.items ?? []));
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return items
    .filter(
      (ev) =>
        ev.start?.dateTime &&
        ev.end?.dateTime &&
        ev.status !== "cancelled" &&
        ev.transparency !== "transparent"
    )
    .map((ev) => ({
      googleEventId: ev.id!,
      summary: ev.summary || "Google Calendar Event",
      description: ev.description || "",
      startsAt: ev.start!.dateTime!,
      endsAt: ev.end!.dateTime!,
      hapioBookingId: ev.extendedProperties?.private?.hapioBookingId,
    }));
}

// 2. Push Hapio booking/block TO Google Calendar (returns google event id)
export async function pushEventToGoogleCalendar(params: {
  hapioBookingId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}) {
  if (!CALENDAR_ID || !process.env.GOOGLE_CLIENT_EMAIL) return null;
  const calendar = getCalendarClient();

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: params.title,
      description: params.description || "Synced from Damastery Schedule",
      start: { dateTime: params.startsAt, timeZone: "America/Toronto" },
      end: { dateTime: params.endsAt, timeZone: "America/Toronto" },
      extendedProperties: {
        private: { hapioBookingId: params.hapioBookingId },
      },
    },
  });

  return res.data.id;
}

// 3. Stamp a Google Event with its matching Hapio ID so we don't duplicate it
export async function stampGoogleEventWithHapioId(googleEventId: string, hapioBookingId: string) {
  if (!CALENDAR_ID) return;
  const calendar = getCalendarClient();

  await calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId: googleEventId,
    requestBody: {
      extendedProperties: {
        private: { hapioBookingId },
      },
    },
  });
}

// 4. Remove event from Google Calendar when unblocked in app
export async function removeEventFromGoogleCalendar(hapioBookingId: string) {
  if (!CALENDAR_ID) return;
  const calendar = getCalendarClient();

  const list = await calendar.events.list({
    calendarId: CALENDAR_ID,
    privateExtendedProperty: [`hapioBookingId=${hapioBookingId}`],
  });

  const eventId = list.data.items?.[0]?.id;
  if (eventId) {
    await calendar.events.delete({ calendarId: CALENDAR_ID, eventId });
  }
}