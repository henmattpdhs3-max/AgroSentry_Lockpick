import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { RecommendationCard } from "./recommendation-card";
import { ContributionNote } from "./contribution-note";
import { Outcome, type PipelineResult } from "@/lib/types";
import { districtName } from "@/lib/districts";

export function DiagnosisResult({
  result,
  onReset,
}: {
  result: PipelineResult;
  onReset: () => void;
}) {
  const isWarning = result.outcome === Outcome.DIAGNOSED_WITH_WARNING;

  return (
    <div className="max-w-md space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-asp-ink">{result.disease}</h2>
          <Badge tone={isWarning ? "escalate" : "primary"}>
            {isWarning ? "perlu verifikasi" : "keyakinan tinggi"}
          </Badge>
        </div>
        <p className="asp-metric mt-1 text-xs text-asp-ink/50">
          confidence: {(result.confidence * 100).toFixed(1)}%
        </p>

        {result.gradCam && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${result.gradCam.heatmapPng}`}
              alt="Area yang mempengaruhi keputusan model (Grad-CAM)"
              className="w-full rounded-md border border-asp-ink/10"
            />
            <p className="mt-1 text-xs text-asp-ink/50">
              Area yang disorot adalah bagian yang paling mempengaruhi hasil deteksi.
            </p>
          </div>
        )}
      </Card>

      <RecommendationCard text={result.recommendation} source={result.groundingSource} />

      {isWarning && (
        <p className="text-xs text-asp-escalate">
          Hasil ini perlu diverifikasi tambahan oleh PPL sebelum mengambil tindakan besar.
        </p>
      )}

      <ContributionNote
        districtName={result.districtId ? districtName(result.districtId) : undefined}
      />

      <Button variant="secondary" className="w-full" onClick={onReset}>
        Diagnosis tanaman lain
      </Button>
    </div>
  );
}
