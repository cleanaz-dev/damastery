"use client";

import { useActionState } from "react";

import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Reveal } from "@/components/misc/reveal";

import {
  firstContactAction,
  type FirstContactState,
} from "@/lib/actions/first-time-contact";

const initialState: FirstContactState = {};

const labelClass =
  "text-sm uppercase tracking-[0.18em] text-primary-foreground/80";

const fieldClass =
  "h-auto rounded-none border-0 border-b border-primary-foreground/30 bg-transparent px-0 pb-4 font-serif text-2xl normal-case tracking-normal text-primary-foreground shadow-none outline-none placeholder:text-primary-foreground/50 focus-visible:border-accent focus-visible:ring-0";

export function Contact() {
  const [state, formAction, isPending] = useActionState(
    firstContactAction,
    initialState,
  );

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
            <p className="text-sm uppercase tracking-[0.22em] text-accent">
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
            <p className="mt-10 max-w-xl text-lg leading-8 text-primary-foreground/80 sm:text-xl sm:leading-9">
              Tell me a little about where you are and what you&apos;re longing
              for. There&apos;s no perfect way to begin.
            </p>
          </Reveal>
        </div>

        {/* Form */}
        <Reveal y={28} delay={0.4} className="relative z-10 mt-16 max-w-3xl">
          <form className="grid gap-10" action={formAction}>
            {/* Which questionnaire this lead continues into */}
            <input type="hidden" name="formId" value="intake" />

            <div className="grid gap-10 sm:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="name" className={labelClass}>
                  Your name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email" className={labelClass}>
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="message" className={labelClass}>
                What&apos;s on your mind?
              </Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={3}
                placeholder="A few words about where you are..."
                className={`min-h-28 resize-none ${fieldClass}`}
              />
            </div>

            {state.error && (
              <p role="alert" className="text-base text-accent">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              variant="link"
              disabled={isPending}
              className="mt-2 h-auto w-fit gap-4 rounded-none border-b border-accent px-0 pb-4 text-sm uppercase tracking-[0.18em] text-accent no-underline hover:text-primary-foreground"
            >
              {isPending ? "One moment..." : "Start a conversation"}
              <ArrowUpRight size={18} />
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