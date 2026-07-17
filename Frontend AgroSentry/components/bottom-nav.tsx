"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/lib/auth-context";
import { CameraIcon, HomeIcon, MapPinIcon, MessageIcon, UserIcon } from "./icons";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const items = [
    { href: "/", label: "Beranda", Icon: HomeIcon },
    { href: "/diagnose", label: "Diagnosis", Icon: CameraIcon },
    { href: "/dashboard", label: "Wilayah", Icon: MapPinIcon },
    { href: "/community", label: "Tanya", Icon: MessageIcon },
    {
      href: isAuthenticated ? "/account" : "/auth/login",
      label: isAuthenticated ? "Akun" : "Masuk",
      Icon: UserIcon,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-asp-ink/10 bg-asp-bg/95 backdrop-blur sm:hidden"
      aria-label="Navigasi utama"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                active ? "text-asp-primary" : "text-asp-ink/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
