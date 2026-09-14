import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CLIMASCORE — Borrower Climate-Risk Intelligence",
  description:
    "CLIMASCORE turns adaptation into measurable credit intelligence: borrower-level climate risk, counterfactual resilience analysis and lender decision support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral text-text">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-border bg-white py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-text-muted sm:px-6">
            <p>
              CLIMASCORE is decision support, not autonomous credit approval. Borrower figures for Surat
              Textile Works are illustrative / synthetic, created for prototype demonstration. Team DASK —
              IIT Kharagpur — SANKALP 2026, Climate Tech.
            </p>
            <Link href="/methodology" className="font-medium text-blue hover:text-blue-dark">
              How every score on this page is calculated →
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
