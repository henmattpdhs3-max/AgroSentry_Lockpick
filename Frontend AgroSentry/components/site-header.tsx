"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { UserNav } from "./user-nav";

const NAV_LINKS = [
  { href: "/diagnose", label: "Diagnosis" },
  { href: "/dashboard", label: "Data Wilayah" },
  { href: "/community", label: "Tanya Jawab" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-asp-ink/10 bg-asp-bg/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="AgroSentry" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-lg font-semibold text-asp-ink">AgroSentry</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-asp-primary"
                  : "text-asp-ink/60 hover:text-asp-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
