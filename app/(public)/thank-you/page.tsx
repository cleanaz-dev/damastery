import Link from "next/link";
import { SplashGate } from "@/components/misc/splash-gate";

const FORMS: Record<string, string> = {
  "baseline-audit": "Baseline Audit",
  intake: "Intake Form",
};

type Props = {
  searchParams: Promise<{ name?: string; form?: string }>;
};

export default async function ThankYouPage({ searchParams }: Props) {
  const { name, form } = await searchParams;

  const firstName = name?.trim().split(" ")[0]?.slice(0, 40);
  const formName = form ? FORMS[form] : undefined;

  return (
    <SplashGate>
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-5xl tracking-tight">
          {firstName ? `${firstName}, thank you` : "Thank you"}
          {formName ? ` for completing the ${formName}.` : " for reaching out."}
        </h1>

        <p className="mt-6 max-w-md text-muted-foreground">
          {formName
            ? "I'll reach out to you within 24–48 hours. "
            : "Your message has been received. "}
          Please check your inbox for an email from us with the next steps. I look
          forward to connecting with you.
        </p>

        <Link href="/" className="mt-10 text-sm underline underline-offset-4">
          Back to the site
        </Link>
      </main>
    </SplashGate>
  );
}