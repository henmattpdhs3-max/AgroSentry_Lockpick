import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-5xl text-asp-primary">404</p>
      <h1 className="font-display text-xl text-asp-ink">Halaman tidak ditemukan</h1>
      <p className="text-sm text-asp-ink/60">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/" className="mt-2">
        <Button>Kembali ke beranda</Button>
      </Link>
    </main>
  );
}
