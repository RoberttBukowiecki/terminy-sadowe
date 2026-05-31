import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://roberttbukowiecki.github.io/terminy-sadowe/"),
  applicationName: "Terminy sądowe",
  title: {
    default: "Terminy sądowe - kalkulator biegu terminów",
    template: "%s | Terminy sądowe",
  },
  description:
    "Prosty kalkulator terminów sądowych z obsługą przerw w biegu terminu oraz przesunięć z weekendów i świąt.",
  keywords: [
    "terminy sądowe",
    "kalkulator terminów",
    "bieg terminu",
    "termin procesowy",
    "polskie prawo",
  ],
  authors: [{ name: "Terminy sądowe" }],
  creator: "Terminy sądowe",
  manifest: "site.webmanifest",
  alternates: {
    canonical: ".",
  },
  openGraph: {
    title: "Terminy sądowe - kalkulator biegu terminów",
    description:
      "Oblicz datę końcową terminu, dodaj przerwy i sprawdź przesunięcia z weekendów oraz świąt.",
    locale: "pl_PL",
    siteName: "Terminy sądowe",
    type: "website",
    url: ".",
    images: [
      {
        url: "og-image.png",
        width: 1200,
        height: 630,
        alt: "Terminy sądowe - kalkulator biegu terminów",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminy sądowe - kalkulator biegu terminów",
    description:
      "Oblicz datę końcową terminu, dodaj przerwy i sprawdź przesunięcia z weekendów oraz świąt.",
    images: ["og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "favicon.svg",
    apple: "favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#20251f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
