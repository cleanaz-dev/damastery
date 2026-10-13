"use client";

import type { ClientData } from "@/lib/actions/get-client-data";
import { CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";
import { Reveal } from "../misc/reveal";

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
        <div className="space-y-20">
            
            {/* Header / Greeting */}
            <Reveal delay={0} y={20}>
                <header className="space-y-4 mt-8">
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-900 tracking-tight">
                        Welcome back, {firstName}.
                    </h1>
                    <p className="text-stone-500 text-lg md:text-xl font-light max-w-xl italic">
                        Your personal space to track your growth, prepare for sessions, and access your resources.
                    </p>
                </header>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                
                {/* SESSIONS SECTION */}
                <Reveal 
                    as="section" 
                    delay={0.15} 
                    y={30}
                    className="space-y-8"
                >
                    <h2 className="text-xs font-semibold tracking-[0.2em]  uppercase">
                        Upcoming Sessions
                    </h2>

                    <div className="space-y-2">
                        {data.bookings.length > 0 ? (
                            data.bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="group border-b border-stone-200 py-4 flex items-center justify-between hover:border-stone-400 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-stone-900 text-lg">
                                            {new Intl.DateTimeFormat("en-US", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                timeZone: TZ,
                                            }).format(booking.startsAt)}
                                        </p>
                                        <p className="text-stone-500 mt-1 italic">
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
                                    <button className="text-stone-300 group-hover:text-stone-900 transition-colors">
                                        <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-4">
                                <p className="text-stone-500 italic">
                                    You currently have no upcoming sessions.
                                </p>
                                <button className="mt-4 text-sm font-medium text-stone-900 border-b border-stone-900 pb-0.5 hover:text-stone-500 hover:border-stone-500 transition-all">
                                    Book your next session
                                </button>
                            </div>
                        )}
                    </div>
                </Reveal>

                {/* TO-DO SECTION */}
                <Reveal 
                    as="section" 
                    delay={0.3} 
                    y={30}
                    className="space-y-8"
                >
                    <h2 className="text-xs font-semibold tracking-[0.2em]  uppercase">
                        Action Items
                    </h2>

                    <div className="space-y-2">
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
                </Reveal>
            </div>
        </div>
    );
}

// Minimal, text-based Action Items
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
            className={`group flex items-center justify-between py-4 border-b border-stone-200 transition-all duration-300 ${
                isCompleted ? "opacity-50" : "hover:border-stone-400"
            }`}
        >
            <div className="flex items-center gap-4">
                {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-stone-400" strokeWidth={1} />
                ) : (
                    <CircleDashed className="w-5 h-5 text-stone-800" strokeWidth={1} />
                )}
                <span
                    className={`text-base ${
                        isCompleted
                            ? "text-stone-400 line-through decoration-stone-200"
                            : "text-stone-900 font-medium"
                    }`}
                >
                    {title}
                </span>
            </div>

            {!isCompleted && (
                <button className="text-sm italic text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-2">
                    {actionText}
                </button>
            )}
        </div>
    );
}