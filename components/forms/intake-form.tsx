// components/forms/intake-form.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { submitIntake } from "@/lib/actions/intake-form";
import { AckField } from "./parts/ack-field";
import { ChoiceField } from "./parts/choice-field";
import { FormHeader } from "./parts/form-header";
import { FormProgress } from "./parts/form-progress";
import { FormSection } from "./parts/form-section";
import { LikertQuestion } from "./parts/likert-question";
import { TextAreaField } from "./parts/text-area-field";
import { TextListField } from "./parts/text-list-field";

// [SECTIONS array remains exactly the same]
export const SECTIONS = [
  {
    id: "A",
    title: "The body",
    sub: "Sleep, movement, and what your nervous system does under load.",
    zone: "Structural",
    items: [
      { t: "I go to sleep and wake up at roughly the same times, including weekends.", r: true },
      { t: "I get seven or more hours of sleep on a typical night.", r: true },
      { t: "I do something physically demanding — lifting, hard cardio, cold — most days.", r: true },
      { t: "When something stressful hits, my body stays wound up for hours afterward.", r: false },
      { t: "I rely on caffeine, sugar, or a screen to get through the afternoon.", r: false },
    ],
  },
  {
    id: "B",
    title: "The week",
    sub: "Who owns your 168 hours.",
    zone: "Structural",
    items: [
      { t: "I plan my week before it starts.", r: true },
      { t: "Most days I have at least one block where I work on one thing, uninterrupted, for an hour.", r: true },
      { t: "My week gets decided by whatever is loudest — other people's needs, the phone, the urgent thing.", r: false },
      { t: "I know where my time went last week.", r: true },
      { t: "I keep doing things I know are low-value because stopping feels harder than continuing.", r: false },
    ],
  },
  {
    id: "C",
    title: "The reach",
    sub: "What you move toward before you've noticed what you're feeling.",
    zone: "Behavioral",
    items: [
      { t: "When I'm stressed, bored, or hurt, I reach for something — a screen, food, a drink, a scroll, an argument — before I've noticed what I'm feeling.", r: false },
      { t: "I could name the three things that set off my worst habits.", r: true },
      { t: 'I\'ve told myself "this is the last time" about the same thing more than once this month.', r: false },
      { t: "I lose an hour or more a day to something I'd be embarrassed to log honestly.", r: false },
      { t: "When I slip once, one slip turns into a bad day or a bad week.", r: false },
    ],
  },
  {
    id: "D",
    title: "The room",
    sub: "How you show up with the people closest to you.",
    zone: "Behavioral",
    items: [
      { t: "In a tense conversation, I respond before I've decided to.", r: false },
      { t: "When someone criticizes me, my first move is to explain why they're wrong.", r: false },
      { t: "People close to me would say I'm the calmest person in the room when things go wrong.", r: true },
      { t: "I've had the same argument with the same person more than twice this month.", r: false },
      { t: "I ask for honest feedback and act on it.", r: true },
    ],
  },
  {
    id: "E",
    title: "The story",
    sub: "What you've decided is true about who you are.",
    zone: "Narrative",
    items: [
      { t: "I read my past mistakes as proof of what kind of man I am.", r: false },
      { t: "When I think about a goal, I've usually decided how it'll fail before I start.", r: false },
      { t: 'If I do something wrong, I move quickly from "I did that" to "I am that."', r: false },
      { t: "I believe my future can look different from my past.", r: true },
      { t: "There's a sentence about myself I've been repeating for years that I've never questioned.", r: false },
    ],
  },
] as const;

const TOTAL = 25;

type Props = {
  token: string;
  defaults: { name: string; email: string; message: string };
};

export function IntakeForm({ token, defaults }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reach, setReach] = useState(["", "", ""]);
  const [story, setStory] = useState("");
  const [first, setFirst] = useState("");
  const [want, setWant] = useState("");
  const [support, setSupport] = useState("");
  const [heavy, setHeavy] = useState("");
  const [ack, setAck] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const answered = Object.keys(answers).length;

  const numbered = useMemo(() => {
    let n = 0;
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.map((it) => ({ ...it, key: `q${++n}`, n })),
    }));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setError(null);

    const missing: string[] = [];
    if (answered < TOTAL) missing.push(`${TOTAL - answered} of the 25 statements`);
    if (!support) missing.push("the therapist/treatment question");
    if (!heavy) missing.push("the 'heavier than a habit' question");
    if (!ack) missing.push("the checkbox");

    if (missing.length > 0) {
      setError("Missing: " + missing.join(", "));
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          answers,
          open: { reach: reach.filter(Boolean), story, first, want },
          fit: { support, heavy, ack },
        };
        await submitIntake(token, payload);
        console.log("submit intake", token, payload);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16 animate-in fade-in duration-700">
      
      <div className="space-y-8">
        <FormHeader 
          eyebrow="Damastery · Week 0" 
          title="The Baseline Audit"
        >
          {/* UPDATED: Changed from text-slate-600 to text-slate-900 and text-xl for stark readability */}
          <p className="text-xl md:text-2xl text-slate-900 font-serif leading-relaxed max-w-2xl">
            Hi {defaults.name.split(" ")[0]}. Twenty-five statements, four questions, ten
            minutes. Answer for the last 30 days, not your best week. Honest beats impressive.
          </p>
        </FormHeader>

        <FormProgress done={answered} total={TOTAL} />
      </div>

      <div className="space-y-12">
        {numbered.map((s) => (
          <FormSection key={s.id} step={s.id} title={s.title} sub={s.sub}>
            <FieldGroup className="gap-0 divide-y divide-slate-200 px-5 md:px-8">
              {s.items.map((it) => (
                <LikertQuestion
                  key={it.key}
                  name={it.key}
                  n={it.n}
                  text={it.t}
                  value={answers[it.key] ?? ""}
                  onChange={(v) => setAnswers((a) => ({ ...a, [it.key]: v }))}
                  missing={showErrors && !answers[it.key]}
                />
              ))}
            </FieldGroup>
          </FormSection>
        ))}
      </div>

      {/* F — open */}
      <FormSection
        step="F"
        title="In your own words"
        sub="This is the part that matters most. Short is fine. Honest is required."
      >
        <FieldGroup className="gap-8 p-6 md:p-8">
          <TextListField
            label="The three things I reach for when it gets hard"
            values={reach}
            onChange={setReach}
          />
          <TextAreaField
            id="story"
            label="The sentence I've been telling myself about who I am — the one I've never questioned"
            placeholder={`"I'm the kind of man who…"`}
            value={story}
            onChange={setStory}
          />
          <TextAreaField
            id="first"
            label="The one thing I'd change first, if I knew how"
            value={first}
            onChange={setFirst}
          />
          <TextAreaField
            id="want"
            label="What I actually want"
            description="One sentence, present tense, as if it's already true."
            value={want}
            onChange={setWant}
          />
        </FieldGroup>
      </FormSection>

      {/* G — fit check */}
      <FormSection
        step="G"
        title="Fit check"
        sub="Coaching is not therapy. These make sure you get the right kind of help first."
      >
        <FieldGroup className="gap-8 p-6 md:p-8">
          <ChoiceField
            name="support"
            label="Are you currently working with a therapist, doctor, counsellor, or treatment program?"
            options={["Yes", "No"]}
            value={support}
            onChange={setSupport}
            showError={showErrors}
          />
          <ChoiceField
            name="heavy"
            label="Is there anything going on right now that feels heavier than a habit — something you'd want a licensed professional for?"
            options={["Yes", "Not sure", "No"]}
            value={heavy}
            onChange={setHeavy}
            showError={showErrors}
          />
          <AckField id="ack" checked={ack} onChange={setAck} showError={showErrors}>
            {/* UPDATED: text-slate-900 instead of slate-600 */}
            <span className="text-base md:text-lg text-slate-900 leading-relaxed font-medium">
              I understand this is a coaching self-assessment, not a clinical screening or a
              diagnosis, and that coaching is not a substitute for therapy or medical care.
            </span>
          </AckField>
        </FieldGroup>
      </FormSection>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="pt-8">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full py-8 text-lg bg-slate-900 hover:bg-slate-800 text-white font-medium tracking-wide uppercase shadow-xl hover:shadow-2xl transition-all" 
          disabled={pending}
        >
          {pending ? "Submitting…" : "Submit my baseline"}
        </Button>
      </div>
    </form>
  );
}