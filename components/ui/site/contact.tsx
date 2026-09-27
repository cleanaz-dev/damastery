"use client";

import type { SubmitEvent } from "react";

import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Reveal } from "@/components/misc/reveal";

export function Contact() {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-primary px-6 py-28 text-primary-foreground sm:px-10 lg:px-16 lg:py-40"
    >
      {/* Decorative logo */}
      <img
        src="/images/logo-white.png"
        alt=""
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          z-0
          h-[520px]
          w-[520px]
          object-contain
          opacity-[0.045]
          blur-[0.2px]
          right-[-80px]
          top-1/2
          -translate-y-1/2
          lg:h-[620px]
          lg:w-[620px]
          lg:right-[-40px]
        "
      />

      <div className="relative z-10 mx-auto max-w-[1180px]">

        {/* Heading */}
        <div className="max-w-4xl">

          <Reveal y={16} delay={0.05}>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              The first step
            </p>
          </Reveal>

          <Reveal y={32} delay={0.15}>
            <h2 className="mt-8 font-serif text-6xl leading-[0.88] tracking-[-0.06em] sm:text-8xl">
              What if this is the moment{" "}
              <em className="text-accent">you choose yourself?</em>
            </h2>
          </Reveal>

          <Reveal y={20} delay={0.3}>
            <p className="mt-10 max-w-lg text-base leading-7 text-primary-foreground/65">
              Tell me a little about where you are and what you&apos;re longing
              for. There&apos;s no perfect way to begin.
            </p>
          </Reveal>

        </div>

        {/* Form */}
        <Reveal
          y={28}
          delay={0.4}
          className="relative z-10 mt-16 max-w-3xl"
        >
          <form
            className="grid gap-8"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-8 sm:grid-cols-2">

              <div className="grid gap-3">
                <Label
                  htmlFor="name"
                  className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60"
                >
                  Your name
                </Label>

                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="h-auto rounded-none border-0 border-b border-primary-foreground/25 bg-transparent px-0 pb-4 font-serif text-xl normal-case tracking-normal text-primary-foreground shadow-none outline-none placeholder:text-primary-foreground/35 focus-visible:border-accent focus-visible:ring-0"
                />
              </div>

              <div className="grid gap-3">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60"
                >
                  Email address
                </Label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-auto rounded-none border-0 border-b border-primary-foreground/25 bg-transparent px-0 pb-4 font-serif text-xl normal-case tracking-normal text-primary-foreground shadow-none outline-none placeholder:text-primary-foreground/35 focus-visible:border-accent focus-visible:ring-0"
                />
              </div>

            </div>

            <div className="grid gap-3">
              <Label
                htmlFor="message"
                className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60"
              >
                What&apos;s on your mind?
              </Label>

              <Textarea
                id="message"
                name="message"
                required
                rows={3}
                placeholder="A few words about where you are..."
                className="min-h-24 resize-none rounded-none border-0 border-b border-primary-foreground/25 bg-transparent px-0 pb-4 font-serif text-xl normal-case tracking-normal text-primary-foreground shadow-none outline-none placeholder:text-primary-foreground/35 focus-visible:border-accent focus-visible:ring-0"
              />
            </div>

            <Button
              type="submit"
              variant="link"
              className="mt-2 h-auto w-fit gap-4 rounded-none border-b border-accent px-0 pb-4 text-xs uppercase tracking-[0.2em] text-accent no-underline hover:text-primary-foreground"
            >
              Start a conversation
              <ArrowUpRight size={16} />
            </Button>
          </form>
        </Reveal>
      </div>

      {/* Existing decorative circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border border-accent/20"
      />
    </section>
  );
}