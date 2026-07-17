"use client";

import { supabase } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Callback failed");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
        <div className="rounded-md bg-asp-reject/10 p-4">
          <p className="text-sm text-asp-reject">Error: {error}</p>
          <p className="mt-2 text-xs text-asp-ink/60">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <p className="text-center text-asp-ink">Processing login...</p>
    </main>
  );
}
