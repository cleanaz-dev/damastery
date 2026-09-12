export function ForYou() {
  const items = [
    "A meaningful pivot",
    "The courage to choose",
    "A gentler inner voice",
    "A life with more room",
  ];

  return (
    <section
      id="for-you"
      className="bg-secondary px-6 py-24 sm:px-10 lg:px-16 lg:py-36"
    >
      <div className="mx-auto grid max-w-[1180px] items-center gap-16 lg:grid-cols-2 lg:gap-28">
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -left-5 -top-5 h-full w-full rounded-t-[12rem] border border-accent/40" />

          <img
            src="/images/coach-portrait.png"
            alt="Damastery life coach, in soft natural light"
            className="relative aspect-[4/5] w-full rounded-t-[12rem] object-cover grayscale-[15%]"
          />

          <p className="absolute bottom-5 left-5 text-[10px] uppercase tracking-[0.24em] text-primary-foreground">
            Presence over pressure
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
            A space for you
          </p>

          <h2 className="mt-8 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-primary-foreground sm:text-7xl">
            Not a better version of you.{" "}
            <em className="text-accent">A truer one.</em>
          </h2>

          <div className="mt-12 grid gap-7 sm:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={item}
                className="border-t border-primary-foreground/20 pt-4"
              >
                <span className="font-mono text-xs text-accent">
                  0{index + 1}
                </span>

                <p className="mt-5 font-serif text-xl text-primary-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
