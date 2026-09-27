import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/misc/reveal";

const journalEntries = [
  {
    title: "On beginning again",
    text: "The permission to be new at something.",
  },
  {
    title: "The shape of enough",
    text: "A note on ambition, attention, and ease.",
  },
  {
    title: "A life that fits",
    text: "What it means to stop performing your own life.",
  },
];

export function Journal() {
  return (
    <section
      id="journal"
      className="px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="mx-auto max-w-[1180px]">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">

          <div>
            <Reveal y={16} delay={0.05}>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">
                From the journal
              </p>
            </Reveal>

            <Reveal y={24} delay={0.15}>
              <h2 className="mt-5 font-serif text-5xl tracking-[-0.05em] sm:text-7xl">
                Small truths.
              </h2>
            </Reveal>
          </div>

          <Reveal y={12} delay={0.25}>
            <a
              href="#contact"
              className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
            >
              Read all
              <ArrowUpRight size={15} />
            </a>
          </Reveal>
        </div>

        {/* Journal entries */}
        <div className="grid gap-0 sm:grid-cols-3">
          {journalEntries.map((entry, index) => (
            <Reveal
              key={entry.title}
              y={28}
              delay={0.2 + index * 0.12}
              className="border-b border-border sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0"
            >
              <article className="py-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  0{index + 1} / Field note
                </p>

                <h3 className="mt-10 font-serif text-3xl leading-none tracking-[-0.04em]">
                  {entry.title}
                </h3>

                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  {entry.text}
                </p>

                <a
                  href="#contact"
                  aria-label={`Read ${entry.title}`}
                  className="mt-8 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                >
                  <ArrowUpRight size={15} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}