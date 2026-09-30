import Image from "next/image";
import { QuoteBlock } from "./quote-block";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel (hidden on mobile) */}
      <div className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        {/* Logo fills most of the panel */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative h-full w-full">
            <Image
              src="/images/logo-white.png"
              alt="Damastery"
              fill
              priority
              className="object-contain opacity-5"
            />
          </div>
        </div>

        {/* Content sits above the logo */}
        <div className="text-md relative z-10">damastery.</div>

        <QuoteBlock />
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}