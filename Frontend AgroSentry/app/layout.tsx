// @ts-ignore
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { DemoModeBanner } from "@/components/demo-mode-banner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AgroSentry",
  description:
    "Grounded crop diagnosis and regional agricultural intelligence for Indonesian smallholder farmers.",
};

export const viewport: Viewport = {
  themeColor: "#fefae0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-body">
        <Providers>
          <SiteHeader />
          <DemoModeBanner />
          <div className="pb-16 sm:pb-0">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
