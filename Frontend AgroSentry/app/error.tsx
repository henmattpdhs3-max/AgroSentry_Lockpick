"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-xl text-asp-reject">Terjadi kesalahan</p>
      <p className="text-sm text-asp-ink/60">
        Maaf, sesuatu tidak berjalan sesuai rencana. Coba lagi dalam beberapa saat.
      </p>
      <Button className="mt-2" onClick={reset}>
        Coba lagi
      </Button>
    </main>
  );
}
