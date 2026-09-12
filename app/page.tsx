
import { Footer } from "@/components/ui/site/footer";
import { Hero } from "@/components/ui/site/hero";
import { Approach } from "@/components/ui/site/approach";
import { ForYou } from "@/components/ui/site/for-you";
import { Journal } from "@/components/ui/site/journal";
import { Contact } from "@/components/ui/site/contact";

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Hero />
      <Approach />
      <ForYou />
      <Journal />
      <Contact />
      <Footer />
    </main>
  );
}

export const dynamic = "force-static";
