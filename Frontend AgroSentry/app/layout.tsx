// @ts-ignore
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { DemoModeBanner } from "@/components/demo-mode-banner";

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
    <html lang="id">
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
