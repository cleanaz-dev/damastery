const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export function buildIcs(params: {
    uid: string; // use booking.id so a later cancel/update can reuse it
    title: string;
    startsAt: Date;
    endsAt: Date;
    joinUrl?: string;
}) {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//damastery//booking//EN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${params.uid}@damastery`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(params.startsAt)}`,
        `DTEND:${fmt(params.endsAt)}`,
        `SUMMARY:${esc(params.title)}`,
        ...(params.joinUrl
            ? [
                  `LOCATION:${esc(params.joinUrl)}`,
                  `DESCRIPTION:${esc(`Join Zoom: ${params.joinUrl}`)}`,
              ]
            : []),
        "END:VEVENT",
        "END:VCALENDAR",
    ];
    return lines.join("\r\n");
}