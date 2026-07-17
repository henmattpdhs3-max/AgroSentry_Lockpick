"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!user) {
    return (
      <nav className="flex gap-2">
        <Link href="/auth/login">
          <button className="rounded px-4 py-2 text-sm text-asp-primary underline hover:bg-asp-bg">
            Masuk
          </button>
        </Link>
        <Link href="/auth/signup">
          <button className="rounded bg-asp-primary px-4 py-2 text-sm text-white hover:opacity-90">
            Daftar
          </button>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4">
      <Link href="/account">
        <button className="text-sm text-asp-ink underline hover:text-asp-primary">
          {user.email}
        </button>
      </Link>
      <button
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="rounded bg-asp-reject px-4 py-2 text-sm text-white hover:opacity-90"
      >
        Keluar
      </button>
    </nav>
  );
}
