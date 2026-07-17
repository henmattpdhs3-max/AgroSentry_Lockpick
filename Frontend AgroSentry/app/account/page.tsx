"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clearConsent, hasConsented } from "@/lib/consent-store";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, signOut, isAuthenticated } = useAuth();
  const [consentReset, setConsentReset] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
        <p className="text-center text-asp-ink">Memuat...</p>
      </main>
    );
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleResetConsent = () => {
    clearConsent(user?.id);
    setConsentReset(true);
  };

  const emailVerified = Boolean(user?.email_confirmed_at);
  const consented = consentReset ? false : hasConsented(user?.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          ← Kembali
        </Button>
      </Link>

      <Card className="max-w-md">
        <h1 className="font-display text-3xl leading-tight text-asp-ink">Akun Saya</h1>

        <div className="mt-6 space-y-4">
          <div className="rounded-md bg-asp-bg p-4">
            <p className="text-xs text-asp-ink/60">Email</p>
            <p className="mt-1 font-medium text-asp-ink">{user?.email}</p>
          </div>

          <div className="rounded-md bg-asp-bg p-4">
            <p className="text-xs text-asp-ink/60">User ID</p>
            <p className="mt-1 font-mono text-xs text-asp-ink/80">{user?.id}</p>
          </div>

          <div className="rounded-md bg-asp-bg p-4">
            <p className="text-xs text-asp-ink/60">Status</p>
            <div className="mt-1.5">
              <Badge tone={emailVerified ? "primary" : "escalate"}>
                {emailVerified ? "Terverifikasi" : "Belum terverifikasi"}
              </Badge>
            </div>
          </div>

          <div className="border-t border-asp-ink/10 pt-4">
            <p className="text-xs text-asp-ink/60">Bergabung sejak</p>
            <p className="mt-1 text-sm text-asp-ink">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button className="w-full" onClick={handleLogout}>
            Keluar
          </Button>
          <Link href="/diagnose">
            <Button variant="secondary" className="w-full">
              Mulai Diagnosis
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="max-w-md">
        <h2 className="font-display text-lg text-asp-ink">Privasi</h2>
        <p className="mt-1.5 text-sm text-asp-ink/70">
          Anda menyetujui penggunaan data anonim untuk diagnosis
          {consented ? " dan sudah tidak akan ditanya ulang di perangkat ini." : "."}
        </p>
        <Button
          variant="secondary"
          className="mt-3 w-full"
          onClick={handleResetConsent}
          disabled={!consented}
        >
          {consented ? "Setel ulang persetujuan" : "Persetujuan sudah disetel ulang"}
        </Button>
        <p className="mt-2 text-xs text-asp-ink/50">
          Setelah disetel ulang, layar persetujuan akan muncul kembali saat diagnosis berikutnya.
        </p>
      </Card>

      <p className="text-center text-xs text-asp-ink/60">
        Perlu bantuan? Hubungi support@agrosentry.id
      </p>
    </main>
  );
}
