"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVerifiedQA } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageIcon } from "@/components/icons";
import { Outcome } from "@/lib/types";

const OUTCOME_LABEL: Record<Outcome, string> = {
  [Outcome.DIAGNOSED]: "Diagnosis pasti",
  [Outcome.DIAGNOSED_WITH_WARNING]: "Perlu verifikasi",
  [Outcome.ESCALATED_LOW_CONF]: "Kurang meyakinkan",
  [Outcome.NO_CONTEXT_FALLBACK]: "Panduan belum tersedia",
  [Outcome.REJECTED_NON_PLANT]: "Bukan tanaman",
};

export default function CommunityPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["verified-qa"],
    queryFn: fetchVerifiedQA,
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-asp-primary/10 text-asp-primary">
          <MessageIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl text-asp-ink">Tanya Jawab Terverifikasi</h1>
          <p className="text-sm text-asp-ink/60">Terhubung ke hasil diagnosis nyata, ditinjau sebelum tampil</p>
        </div>
      </div>

      {isLoading && <p className="mt-6 text-sm text-asp-ink/50">Memuat...</p>}
      {error && (
        <p className="mt-6 text-sm text-asp-reject">
          Gagal memuat tanya jawab. Coba lagi nanti.
        </p>
      )}
      {data && data.length === 0 && (
        <Card className="mt-6">
          <p className="text-sm text-asp-ink/60">
            Belum ada tanya jawab terverifikasi untuk ditampilkan.
          </p>
        </Card>
      )}

      <div className="mt-3 space-y-3">
        {data?.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-center gap-1">
              {item.verified && <Badge tone="primary">Terverifikasi</Badge>}
              {item.linkedDiagnosisOutcome && (
                <Badge tone="neutral">{OUTCOME_LABEL[item.linkedDiagnosisOutcome]}</Badge>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-asp-ink">{item.question}</p>
            <p className="mt-1 text-sm text-asp-ink/70">{item.answer}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
