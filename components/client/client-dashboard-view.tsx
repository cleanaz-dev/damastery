"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ClientData } from "@/lib/actions/get-client-data";
import { getMissingRequiredForms } from "@/lib/forms/required-forms";
import {
  CheckCircle2,
  CircleDashed,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Reveal } from "../misc/reveal";
import { authClient } from "@/lib/auth-client";

const TZ = "America/Toronto";

export default function ClientDashboardView({
  clientData: data,
  bookingAction,
}: {
  clientData: ClientData;
  bookingAction: React.ReactNode;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: () => setLoggingOut(false),
      },
    });
  };

  const firstName = data.name.split(" ")[0];
  const pendingAssignments = data.profile?.assignments ?? [];
  const completedSubmissions = data.profile?.submissions ?? [];

  // Booking is locked until all required forms are submitted.
  // NOTE: this assumes submission.formSlug holds the form key
  // (e.g. "intake-form"). If it doesn't, use submission.form.key instead.
  const missingForms = getMissingRequiredForms(
    completedSubmissions.map((s) => s.form?.key ?? s.formSlug),
  );
  const bookingLocked = missingForms.length > 0;

  const bookingBlock = bookingLocked ? (
    <div className="rounded-lg border border-stone-300 bg-stone-100/60 p-5 space-y-3">
      <div className="flex items-center gap-2 text-stone-900">
        <Lock className="w-4 h-4" strokeWidth={1.5} />
        <p className="text-sm font-medium">
          Complete your forms to book a session
        </p>
      </div>
      <ul className="space-y-1 text-sm text-stone-500 italic">
        {missingForms.map((f) => (
          <li key={f.key} className="flex items-center gap-2">
            <CircleDashed className="w-4 h-4" strokeWidth={1} />
            {f.label}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    bookingAction
  );

  return (
    <div className="min-h-screen max-w-5xl mx-auto bg-stone-200 text-stone-800 font-sans selection:bg-stone-400">
      {/* Navigation */}
      <nav className="w-full px-8 md:px-12 py-8 flex justify-between items-center">
        <span className="font-serif text-lg tracking-wide text-stone-900">
          damastery.
        </span>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-5 py-2 text-xs font-semibold tracking-wider text-stone-600 uppercase bg-white border border-stone-200 rounded-full shadow-sm hover:bg-stone-50 hover:text-stone-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loggingOut ? "Logging out..." : "Log Out"}
        </button>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-8 md:px-12 py-16">
        <div className="space-y-20">
          {/* Header */}
          <Reveal delay={0} y={20}>
            <header className="space-y-4 mt-8">
              <h1 className="font-serif text-4xl md:text-5xl text-stone-900 tracking-tight">
                Welcome back, {firstName}.
              </h1>
              <p className="text-stone-500 text-lg md:text-xl font-light max-w-xl italic">
                Your personal space to track your growth, prepare for sessions,
                and access your resources.
              </p>
            </header>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            {/* SESSIONS SECTION */}
            <Reveal as="section" delay={0.15} y={30} className="space-y-8">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase">
                Upcoming Sessions
              </h2>

              <div className="space-y-2">
                {data.bookings.length > 0 ? (
                  <>
                    {data.bookings.map((booking) => (
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
                            {" — "}
                            <span className="capitalize">
                              {booking.status.toLowerCase()}
                            </span>
                          </p>
                        </div>
                        <button className="text-stone-300 group-hover:text-stone-900 transition-colors">
                          <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                    <div className="pt-4">{bookingBlock}</div>
                  </>
                ) : (
                  <div className="py-4">
                    <p className="text-stone-500 italic">
                      You currently have no upcoming sessions.
                    </p>
                    <div className="mt-4">{bookingBlock}</div>
                  </div>
                )}
              </div>
            </Reveal>

            {/* ACTION ITEMS / FORMS SECTION */}
            <Reveal as="section" delay={0.3} y={30} className="space-y-8">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase">
                Action Items
              </h2>

              <div className="space-y-2">
                {/* 1. Uncompleted / Pending Assignments */}
                {pendingAssignments.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/client/form/${assignment.token}`}
                    className="group flex items-center justify-between py-4 border-b border-stone-200 hover:border-stone-400 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <CircleDashed
                        className="w-5 h-5 text-stone-800"
                        strokeWidth={1}
                      />
                      <span className="text-base text-stone-900 font-medium">
                        {assignment.form.title}
                      </span>
                    </div>
                    <span className="text-sm italic text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-2">
                      Start Form &rarr;
                    </span>
                  </Link>
                ))}

                {/* 2. Completed Form Submissions */}
                {completedSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between py-4 border-b border-stone-300/60"
                  >
                    <div className="flex items-center gap-4">
                      {/* Subtle green check badge */}
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-950/5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      </span>
                      <div>
                        <span className="text-base text-stone-800 font-medium">
                          {submission.form?.title ?? submission.formSlug}
                        </span>
                      </div>
                    </div>

                    {/* Subtle status tag with date */}
                    <span className="text-xs font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-emerald-900/10 text-emerald-800">
                      Completed ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: TZ,
                      }).format(submission.createdAt)}
                    </span>
                  </div>
                ))}

                {/* Empty State */}
                {pendingAssignments.length === 0 &&
                  completedSubmissions.length === 0 && (
                    <div className="py-4">
                      <p className="text-stone-500 italic">
                        No action items at this time. You're all caught up!
                      </p>
                    </div>
                  )}
              </div>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}