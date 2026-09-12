import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Damastery - Life Coach",
    template: "%s | Damastery - Life Coach",
  },
  description:
    "Damastery is a life coaching practice helping you navigate change, find clarity, and create a more intentional life.",
  keywords: [
    "Damastery",
    "life coach",
    "life coaching",
    "personal growth",
    "self-discovery",
    "mindfulness coaching",
    "personal transformation",
  ],
  authors: [{ name: "Damastery" }],
  creator: "Damastery",
  publisher: "Damastery",
  metadataBase: new URL("https://damastery.com"),
  openGraph: {
    title: "Damastery - Life Coach",
    description:
      "Life coaching to help you find clarity, navigate change, and move forward with intention.",
    url: "https://damastery.com",
    siteName: "Damastery - Life Coach",
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: "/images/damastery-hero-art.png",
        width: 1200,
        height: 630,
        alt: "Damastery - Life Coach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Damastery - Life Coach",
    description:
      "Life coaching to help you find clarity and move forward with intention.",
    images: ["/images/damastery-hero-art.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}