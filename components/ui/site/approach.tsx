import { ArrowUpRight } from "lucide-react";

export function Approach() {
  return (
    <section
      id="approach"
      className="bg-background px-6 py-28 sm:px-10 lg:px-16 lg:py-44"
    >
      <div className="mx-auto grid max-w-[1180px] gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-28">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
            The work
          </p>

          <div className="mt-16 hidden h-px w-24 bg-accent lg:block" />
        </div>

        <div>
          <h2 className="max-w-3xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            You already know the way.{" "}
            <em className="text-primary/55">
              Let&apos;s make space to hear it.
            </em>
          </h2>

          <p className="mt-10 max-w-xl text-base leading-8 text-muted-foreground">
            We&apos;ll slow down enough to notice what is true. Through
            thoughtful conversation, grounded practices, and honest reflection,
            we create a life that feels like yours — not one you inherited.
          </p>

          <a
            href="#contact"
            className="mt-12 inline-flex items-center gap-3 border-b border-primary pb-3 text-xs uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            Explore the approach
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
