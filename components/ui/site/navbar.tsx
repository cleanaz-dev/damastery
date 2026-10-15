import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const navItems = [
  { label: "Approach", href: "#approach" },
  { label: "For you", href: "#for-you" },
  { label: "Journal", href: "#journal" },
];

export function Navbar() {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-primary-foreground/20 py-6">
      {/* Logo */}
      <a
        href="#top"
        className="flex items-center font-serif text-xl tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Damastery home"
      >
        <img
          src="/images/logo-white.png"
          alt="Damastery logo"
          className="mr-2 block h-9 w-9 object-contain"
        />
        <span>
          damastery<span className="text-accent">.</span>
        </span>
      </a>

      {/* Desktop navigation */}
      <nav
        className="hidden items-center gap-10 md:flex"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group relative text-xs uppercase tracking-[0.18em] text-primary-foreground/75 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
          >
            {item.label}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </nav>

      {/* Desktop actions */}
      <div className="hidden items-center gap-6 md:flex">
        <a
          href="#contact"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:text-accent"
        >
          Book a conversation
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </a>

        <Link
          href="/sign-in"
          className="inline-flex h-10 items-center rounded-full border border-primary-foreground/30 px-5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Sign in
        </Link>
      </div>

      {/* Mobile drawer */}
      <Drawer swipeDirection="right">
        <DrawerTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground md:hidden"
            />
          }
        >
          <Menu size={22} />
        </DrawerTrigger>

        <DrawerContent className="bg-primary text-primary-foreground">
          <div className="flex h-full flex-col px-6 py-6">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-6">
              <DrawerTitle className="font-serif text-xl tracking-[-0.04em]">
                damastery<span className="text-accent">.</span>
              </DrawerTitle>

              <DrawerClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close menu"
                    className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  />
                }
              >
                <X size={22} />
              </DrawerClose>
            </div>

            {/* Links */}
            <nav className="flex flex-col py-6" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <DrawerClose
                  key={item.label}
                  render={<a href={item.href} />}
                  className="border-b border-primary-foreground/10 py-5 font-serif text-3xl tracking-[-0.03em] transition-colors hover:text-accent"
                >
                  {item.label}
                </DrawerClose>
              ))}
            </nav>

            {/* Actions pinned to the bottom */}
            <div className="mt-auto flex flex-col gap-3">
              <DrawerClose
                render={<Link href="/sign-in" />}
                className="flex items-center justify-center rounded-full border border-primary-foreground/30 px-6 py-4 text-xs uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                Sign in
              </DrawerClose>

              <DrawerClose
                render={<a href="#contact" />}
                className="flex items-center justify-between rounded-full bg-accent px-6 py-4 text-xs uppercase tracking-[0.18em] text-primary"
              >
                Book a conversation
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
}