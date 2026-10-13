import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-5xl tracking-tight">
        Thank you for reaching out.
      </h1>

      <p className="mt-6 max-w-md text-muted-foreground">
        Your message has been received. Please check your inbox for an email
        from us with the next steps. I look forward to connecting with you.
      </p>

      <Link href="/" className="mt-10 text-sm underline underline-offset-4">
        Back to the site
      </Link>
    </main>
  );
}