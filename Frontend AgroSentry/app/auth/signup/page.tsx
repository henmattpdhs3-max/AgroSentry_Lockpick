"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 8) {
      setError("Password harus minimal 8 karakter");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      setIsSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign up failed");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
        <Card className="max-w-md">
          <h1 className="font-display text-3xl leading-tight text-asp-ink">Cek Email Anda</h1>
          <p className="mt-3 text-sm text-asp-ink/70">
            Kami telah mengirim email konfirmasi ke <strong>{email}</strong>. Silakan cek email
            dan ikuti instruksi untuk menyelesaikan pendaftaran.
          </p>
          <Link href="/auth/login">
            <Button className="mt-6 w-full">Kembali ke Login</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <Card className="max-w-md">
        <h1 className="font-display text-3xl leading-tight text-asp-ink">Daftar</h1>
        <p className="mt-3 text-sm text-asp-ink/70">
          Buat akun baru untuk memulai diagnosis tanaman.
        </p>

        <form onSubmit={handleSignUp} className="mt-6 space-y-4">
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
            <p className="mt-1 text-xs text-asp-ink/60">Minimal 8 karakter</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="text-sm font-medium text-asp-ink">
              Konfirmasi Password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded border border-asp-ink/20 px-3 py-2 text-asp-ink placeholder:text-asp-ink/40 focus:border-asp-primary focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-asp-reject">{error}</p>}

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 border-t border-asp-ink/20" />
          <span className="text-xs text-asp-ink/60">atau</span>
          <div className="flex-1 border-t border-asp-ink/20" />
        </div>

        <Button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          variant="secondary"
          className="mt-4 w-full"
        >
          Daftar dengan Google
        </Button>

        <p className="mt-6 text-center text-sm text-asp-ink/70">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="font-medium text-asp-primary underline">
            Masuk di sini
          </Link>
        </p>
      </Card>
    </main>
  );
}
