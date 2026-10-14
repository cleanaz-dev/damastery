import "server-only";

const ZOOM_API = "https://api.zoom.us/v2";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getZoomToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
        return cachedToken.value;
    }

    const basic = Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString("base64");

    const res = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
        { method: "POST", headers: { Authorization: `Basic ${basic}` } }
    );

    if (!res.ok) {
        throw new Error(`Zoom token error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = {
        value: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    };
    return cachedToken.value;
}

export async function createZoomMeeting(params: {
    topic: string;
    startsAt: Date;
    durationMinutes: number;
}) {
    const token = await getZoomToken();

    const res = await fetch(
        `${ZOOM_API}/users/${encodeURIComponent(process.env.ZOOM_HOST_EMAIL!)}/meetings`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                topic: params.topic,
                type: 2, // scheduled meeting
                start_time: params.startsAt.toISOString().replace(/\.\d{3}Z$/, "Z"),
                duration: params.durationMinutes,
                timezone: "America/Toronto",
                settings: { join_before_host: false, waiting_room: true },
            }),
        }
    );

    if (!res.ok) {
        throw new Error(`Zoom create error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { id: number; join_url: string };
    return { id: String(data.id), joinUrl: data.join_url };
}

export async function deleteZoomMeeting(meetingId: string) {
    const token = await getZoomToken();
    const res = await fetch(`${ZOOM_API}/meetings/${meetingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 404) {
        throw new Error(`Zoom delete error ${res.status}: ${await res.text()}`);
    }
}