const footerLinks = [
  { label: "Approach", href: "#approach" },
  { label: "For you", href: "#for-you" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="bg-primary px-6 pb-8 pt-16 text-primary-foreground sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 border-b border-primary-foreground/15 pb-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a href="#top" className="font-serif text-3xl tracking-[-0.05em]">
              damastery<span className="text-accent">.</span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/50">
              A quieter way forward. Life coaching for the in-between seasons.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
              Explore
            </p>

            <nav className="mt-6 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
              Begin
            </p>

            <a
              href="#contact"
              className="mt-6 inline-block font-serif text-2xl transition-colors hover:text-accent"
            >
              Book a conversation
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-8 sm:flex-row">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40">
            © 2026 Damastery Coaching
          </p>

          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40">
            Made for becoming
          </p>
        </div>
      </div>
    </footer>
  );
}
