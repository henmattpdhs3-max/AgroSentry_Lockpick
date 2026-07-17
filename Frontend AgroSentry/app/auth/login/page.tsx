"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <Card className="max-w-md">
        <h1 className="font-display text-3xl leading-tight text-asp-ink">Masuk</h1>
        <p className="mt-3 text-sm text-asp-ink/70">
          Gunakan akun Anda untuk memulai diagnosis tanaman.
        </p>

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-asp-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="anda@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded border border-asp-ink/20 px-3 py-2 text-asp-ink placeholder:text-asp-ink/40 focus:border-asp-primary focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-asp-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded border border-asp-ink/20 px-3 py-2 text-asp-ink placeholder:text-asp-ink/40 focus:border-asp-primary focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-asp-reject">{error}</p>}

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Memproses..." : "Masuk dengan Email"}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 border-t border-asp-ink/20" />
          <span className="text-xs text-asp-ink/60">atau</span>
          <div className="flex-1 border-t border-asp-ink/20" />
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          variant="secondary"
          className="mt-4 w-full"
        >
          Masuk dengan Google
        </Button>

        <p className="mt-6 text-center text-sm text-asp-ink/70">
          Belum punya akun?{" "}
          <Link href="/auth/signup" className="font-medium text-asp-primary underline">
            Daftar di sini
          </Link>
        </p>
      </Card>
    </main>
  );
}
