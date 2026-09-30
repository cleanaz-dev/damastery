"use client";

import { useEffect, useState } from "react";
import { quotes, type Quote } from "@/lib/config/quote-data";

export function QuoteBlock() {
  const [quote, setQuote] = useState<Quote | null>(null);

  // Pick after mount so server and client HTML match (avoids hydration errors)
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <blockquote className="relative z-10 min-h-28 space-y-2">
      {quote && (
        <>
          <p className="text-2xl font-medium leading-snug">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="text-sm opacity-80 text-accent">{quote.author}</footer>
        </>
      )}
    </blockquote>
  );
}