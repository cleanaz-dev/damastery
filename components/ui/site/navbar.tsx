"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navItems = [
  { label: "Approach", href: "#approach" },
  { label: "For you", href: "#for-you" },
  { label: "Journal", href: "#journal" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-primary-foreground/20 py-6">
      <a
        href="#top"
        className="font-serif text-xl tracking-[-0.04em]"
        aria-label="Damastery home"
      >
        damastery<span className="text-accent">.</span>
      </a>

      <nav
        className="hidden items-center gap-10 md:flex"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-xs uppercase tracking-[0.18em] text-primary-foreground/75 transition-colors hover:text-accent"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a
        href="#contact"
        className="hidden items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary-foreground md:flex"
      >
        Book a conversation
        <ArrowUpRight size={15} strokeWidth={1.5} />
      </a>

      <button
        type="button"
        className="md:hidden"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {menuOpen && (
        <nav
          className="absolute left-0 right-0 top-[73px] z-30 flex flex-col gap-5 bg-primary px-6 py-6 md:hidden"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm uppercase tracking-[0.16em]"
            >
              {item.label}
            </a>
          ))}

          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-accent"
          >
            Book a conversation
            <ArrowUpRight size={15} />
          </a>
        </nav>
      )}
    </header>
  );
}
