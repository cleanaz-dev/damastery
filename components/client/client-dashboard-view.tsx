"use client";

import type { ClientData } from "@/lib/actions/get-client-data";
import { Calendar, CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";

const TZ = "America/Toronto"; // or a per-client timezone

export default function ClientDashboardView({
    clientData: data,
}: {
    clientData: ClientData;
}) {
    // Extract first name for a warmer greeting
    const firstName = data.name.split(" ")[0];

    // Determine basic to-dos based on submissions (Example logic)
    const hasIntake = data.profile?.submissions.some(s => s.formSlug === "intake");
    const hasPreSession = data.profile?.submissions.some(s => s.formSlug === "pre-session");

    return (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Greeting */}
            <header className="space-y-3">
                <h1 className="font-serif text-4xl md:text-5xl text-stone-900 tracking-tight">
                    Welcome back, {firstName}.
                </h1>
                <p className="text-stone-500 text-lg md:text-xl font-light max-w-xl">
                    Your personal space to track your growth, prepare for sessions, and access your resources.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                {/* SESSIONS SECTION */}
                <section className="space-y-8">
                    <h2 className="text-xs font-semibold tracking-[0.2em] text-stone-400 uppercase">
                        Upcoming Sessions
                    </h2>

                    <div className="space-y-6">
                        {data.bookings.length > 0 ? (
                            data.bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="group border-b border-stone-200 pb-6 flex items-start justify-between hover:border-stone-400 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-stone-900">
                                            {new Intl.DateTimeFormat("en-US", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                timeZone: TZ,
                                            }).format(booking.startsAt)}
                                        </p>
                                        <p className="text-stone-500 mt-1">
                                            {new Intl.DateTimeFormat("en-US", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                                timeZoneName: "short",
                                                timeZone: TZ,
                                            }).format(booking.startsAt)}
                                            {" • "}
                                            <span className="capitalize">{booking.status.toLowerCase()}</span>
                                        </p>
                                    </div>
                                    <button className="text-stone-300 group-hover:text-stone-900 transition-colors pt-1">
                                        <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="border border-stone-200 border-dashed rounded-2xl p-8 text-center">
                                <Calendar className="w-6 h-6 text-stone-300 mx-auto mb-3" />
                                <p className="text-stone-500 text-sm">No upcoming sessions.</p>
                                <button className="mt-4 text-sm text-stone-900 border-b border-stone-900 pb-0.5 hover:text-stone-600 hover:border-stone-600 transition-all">
                                    Book your next session
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* TO-DO SECTION */}
                <section className="space-y-8">
                    <h2 className="text-xs font-semibold tracking-[0.2em] text-stone-400 uppercase">
                        Action Items
                    </h2>

                    <div className="space-y-4">
                        <ActionItem
                            title="Complete Initial Intake Form"
                            isCompleted={hasIntake ?? false}
                            actionText="Begin Intake"
                        />

                        <ActionItem
                            title="Pre-session Reflection"
                            isCompleted={hasPreSession ?? false}
                            actionText="Start Reflection"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

// Reusable micro-component for Action Items
function ActionItem({
    title,
    isCompleted,
    actionText,
}: {
    title: string;
    isCompleted: boolean;
    actionText: string;
}) {
    return (
        <div
            className={`flex items-center justify-between p-5 transition-all duration-300 ${
                isCompleted
                    ? "bg-transparent border border-stone-100 opacity-60"
                    : "bg-white border border-stone-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
            }`}
        >
            <div className="flex items-center gap-4">
                {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-stone-300" strokeWidth={1.5} />
                ) : (
                    <CircleDashed className="w-5 h-5 text-stone-800" strokeWidth={1.5} />
                )}
                <span
                    className={`text-sm ${
                        isCompleted
                            ? "text-stone-400 line-through decoration-stone-200"
                            : "text-stone-800"
                    }`}
                >
                    {title}
                </span>
            </div>

            {!isCompleted && (
                <button className="text-xs font-medium uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors">
                    {actionText}
                </button>
            )}
        </div>
    );
}