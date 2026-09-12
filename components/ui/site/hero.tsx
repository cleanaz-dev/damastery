import { ArrowDown } from "lucide-react";

import { Navbar } from "./navbar";
import { HeroImage } from "./hero-image";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[760px] overflow-hidden bg-primary text-primary-foreground lg:min-h-screen"
    >
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col px-6 sm:px-10 lg:px-16">
        <Navbar />

        {/* Increased bottom padding (pb-40, lg:pb-48) to leave space for the absolute button */}
        <div className="grid flex-1 items-center gap-12 pb-40 pt-20 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:pb-48 lg:pt-12">
          {/* Text */}
          <div className="relative z-10">
            <p className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-accent">
              <span className="h-px w-8 bg-accent" />
              A quieter way forward
            </p>

            <h1 className="max-w-3xl font-serif text-[clamp(4rem,8vw,8.5rem)] leading-[0.84] tracking-[-0.065em] text-balance">
              Come back
              <br />
              <em className="font-light text-accent">to yourself.</em>
            </h1>

            {/* Removed the flex layout here so the paragraph just sits cleanly by itself */}
            <div className="mt-12">
              <p className="max-w-sm text-base leading-7 text-primary-foreground/65">
                Life coaching for the in-between seasons — when the old way no
                longer fits, and the next chapter is asking to be lived.
              </p>
            </div>
          </div>

          {/* Desktop image composition */}
          <div className="flex items-center justify-end">
            <HeroImage />
          </div>
        </div>
      </div>

      {/* Centered "Begin here" Button */}
      <div className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center sm:bottom-40">
        <a
          href="#approach"
          className="group flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-accent"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent transition-colors group-hover:bg-accent group-hover:text-primary">
            <ArrowDown size={16} />
          </span>
          Begin here
        </a>
      </div>

      {/* Bottom transition */}
      <div className="pointer-events-none absolute bottom-[-1px] left-0 right-0 h-24 overflow-hidden sm:h-36">
        <div className="absolute -bottom-28 left-[-10%] h-48 w-[120%] rounded-[50%] bg-background sm:-bottom-44 sm:h-72" />
      </div>
    </section>
  );
}