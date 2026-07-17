import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Outcome, type PipelineResult } from "@/lib/types";

// Renders REJECTED_NON_PLANT, ESCALATED_LOW_CONF, and NO_CONTEXT_FALLBACK
export function EscalationNotice({
  result,
  onRetry,
}: {
  result: PipelineResult;
  onRetry: () => void;
}) {
  const copy = {
    [Outcome.REJECTED_NON_PLANT]: {
      tone: "reject" as const,
      title: "Bukan gambar tanaman",
      body: "Foto tidak terdeteksi sebagai daun tanaman. Silakan unggah foto daun yang jelas dan fokus.",
    },
    [Outcome.ESCALATED_LOW_CONF]: {
      tone: "escalate" as const,
      title: "Keyakinan deteksi rendah",
      body: "Sistem tidak cukup yakin untuk memberi diagnosis. Coba foto ulang dengan pencahayaan lebih baik, atau hubungi Penyuluh Pertanian Lapangan (PPL) terdekat.",
    },
    [Outcome.NO_CONTEXT_FALLBACK]: {
      tone: "escalate" as const,
      title: "Panduan resmi belum tersedia",
      body: "Jenis penyakit terdeteksi, tetapi panduan resmi spesifik belum ada dalam basis data kami. Mohon hubungi PPL untuk verifikasi lanjutan — kami tidak akan menebak rekomendasi tanpa dasar resmi.",
    },
  }[result.outcome as Outcome.REJECTED_NON_PLANT | Outcome.ESCALATED_LOW_CONF | Outcome.NO_CONTEXT_FALLBACK];

  if (!copy) return null;

  return (
    <Card className="max-w-md">
      <Badge tone={copy.tone}>{copy.title}</Badge>
      <p className="mt-3 text-sm text-asp-ink/80">{copy.body}</p>
      {result.confidence > 0 && (
        <p className="asp-metric mt-2 text-xs text-asp-ink/50">
          confidence: {(result.confidence * 100).toFixed(1)}%
        </p>
      )}
      <Button variant="secondary" className="mt-4" onClick={onRetry}>
        Foto ulang
      </Button>
    </Card>
  );
}
