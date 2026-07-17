"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraIcon, ChevronRightIcon, ShieldCheckIcon, UsersIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { fetchRegionalDensity } from "@/lib/api-client";
import { DENSITY_WINDOW_DAYS, K_THRESHOLD } from "@/lib/constants";

const STEPS = [
  { label: "Foto", detail: "Ambil foto daun yang bergejala" },
  { label: "Diagnosis", detail: "Dianalisis lewat model + panduan resmi" },
  { label: "Rekomendasi", detail: "Langkah konkret, bukan tebakan" },
  { label: "Kontribusi", detail: "Membantu petani lain di wilayah Anda" },
];

const PILLARS = [
  {
    Icon: CameraIcon,
    title: "Diagnosis yang bisa dijelaskan",
    body: "Setiap hasil disertai area foto yang paling mempengaruhi keputusan model, bukan sekadar angka.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Rekomendasi berdasar panduan resmi",
    body: "Jawaban disusun dari dokumen panduan Kementerian Pertanian, bukan tebakan model bahasa yang bebas.",
  },
  {
    Icon: UsersIcon,
    title: "Kekuatan komunitas, tanpa identitas",
    body: "Setiap diagnosis menjadi data anonim yang memperkuat pemantauan wilayah untuk petani lain.",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: density } = useQuery({
    queryKey: ["regional-density", DENSITY_WINDOW_DAYS],
    queryFn: () => fetchRegionalDensity(DENSITY_WINDOW_DAYS),
  });

  const monitoredDistricts = density?.filter((d) => d.observedCases !== null).length ?? null;
  const totalDistricts = density?.length ?? null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-asp-primary via-asp-primary to-[#3f481f] px-6 py-10 text-asp-bg">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 85% 60%, white 0, transparent 40%)",
          }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          <ShieldCheckIcon className="h-3.5 w-3.5" />
          Informasi Komunitas Pertanian
        </span>
        <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">AgroSentry</h1>
        <p className="mt-3 max-w-md text-sm text-asp-bg/85">
          Foto daun tanaman Anda, dapatkan diagnosis awal dan rekomendasi berdasarkan panduan
          terpercaya. Tetap bisa dilakukan meski dengan koneksi yang kurang
          stabil, dan setiap laporan membantu petani lain di wilayah Anda.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/diagnose" className="sm:flex-1">
            <Button variant="hero" className="w-full">
              {isAuthenticated ? "Lanjutkan diagnosis" : "Mulai diagnosis"}
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link href="/auth/login" className="sm:flex-1">
              <Button variant="hero-outline" className="w-full">
                Masuk ke akun
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Floating stat card, overlapping the hero like a weather-widget readout */}
      <div className="relative z-10 -mt-6 px-2">
        <Card className="flex items-center justify-between gap-4 shadow-md">
          <div>
            <p className="asp-metric text-2xl text-asp-ink">
              {monitoredDistricts !== null ? monitoredDistricts : "—"}
              <span className="text-sm font-normal text-asp-ink/50">
                {" "}
                / {totalDistricts ?? "…"}
              </span>
            </p>
            <p className="text-xs text-asp-ink/60">wilayah dengan data cukup untuk ditampilkan</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-asp-primary">
            Lihat wilayah
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* How it works */}
      <section className="mt-10">
        <h2 className="font-display text-lg text-asp-ink">Cara kerjanya</h2>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.label} className="rounded-lg border border-asp-ink/10 bg-white/60 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-asp-primary text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="mt-2 text-sm font-semibold text-asp-ink">{step.label}</p>
              <p className="mt-0.5 text-xs text-asp-ink/60">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pillars */}
      <section className="mt-10 space-y-3">
        {PILLARS.map(({ Icon, title, body }) => (
          <Card key={title} className="flex gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-asp-primary/10 text-asp-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-asp-ink">{title}</p>
              <p className="mt-0.5 text-sm text-asp-ink/65">{body}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Footer links */}
      <section className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-asp-ink/10 pt-6 text-sm">
        <Link href="/community" className="font-medium text-asp-primary underline">
          Tanya jawab terverifikasi
        </Link>
        <p className="text-xs text-asp-ink/50">
          Data wilayah hanya ditampilkan setelah ≥{K_THRESHOLD} laporan anonim terkumpul.
        </p>
      </section>
    </main>
  );
}
