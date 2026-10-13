"use client";

import { useEffect, useState } from "react";
import { LOGO_URL } from "@/lib/emails/config";

export function SplashGate({
  children,
  duration = 1500,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="relative size-24">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-muted border-t-accent" />
          <img
            src={LOGO_URL}
            alt=""
            className="absolute inset-0 m-auto size-12 object-contain"
          />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}