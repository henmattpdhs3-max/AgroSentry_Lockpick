// Mirrors core/pipeline.py on the backend

export enum Outcome {
  REJECTED_NON_PLANT = "ditolak_bukan_tanaman",
  ESCALATED_LOW_CONF = "eskalasi_keyakinan_rendah",
  DIAGNOSED = "terdiagnosis",
  DIAGNOSED_WITH_WARNING = "terdiagnosis_dengan_peringatan",
  NO_CONTEXT_FALLBACK = "tanpa_konteks_arahkan_ppl",
}

export interface GradCamOverlay {
  // base64-encoded PNG heatmap, same dimensions as the uploaded image
  heatmapPng: string;
  // 0-1, how much of the decision the highlighted region accounts for
  weight: number;
}

export interface PipelineResult {
  outcome: Outcome;
  disease: string;
  confidence: number; // 0-1
  recommendation: string;
  message: string;
  gradCam?: GradCamOverlay;
  groundingSource?: string;
  districtId?: string;
  submittedAt: string; // ISO timestamp
}
export type PipelineStage =
  | "idle"
  | "consent"
  | "uploading"
  | "guardrail"
  | "classifying"
  | "confidence_check"
  | "retrieving_context"
  | "reasoning"
  | "done"
  | "queued_offline";

export interface DensityPoint {
  districtId: string;
  districtName: string;
  observedCases: number | null;
  windowDays: number; // e.g. 7 or 30 — always backward-looking
}

export interface VerifiedQAItem {
  id: string;
  question: string;
  answer: string;
  linkedDiagnosisOutcome: Outcome;
  verified: boolean;
}
