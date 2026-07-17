import { clsx } from "clsx";
import type { PipelineStage } from "@/lib/types";

// Signature visual element
const GATES: { key: PipelineStage; label: string }[] = [
  { key: "guardrail", label: "Guardrail" },
  { key: "classifying", label: "Classifier" },
  { key: "confidence_check", label: "Confidence" },
  { key: "retrieving_context", label: "Kementan RAG" },
  { key: "reasoning", label: "Reasoning" },
];

const ORDER: PipelineStage[] = [
  "idle",
  "consent",
  "uploading",
  "guardrail",
  "classifying",
  "confidence_check",
  "retrieving_context",
  "reasoning",
  "done",
];

export function PipelineStatus({ stage }: { stage: PipelineStage }) {
  const currentIndex = ORDER.indexOf(stage);

  if (stage === "queued_offline") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-asp-escalate/10 px-3 py-2 text-sm text-asp-escalate">
        <span className="h-2 w-2 rounded-full bg-asp-escalate" />
        Tersimpan offline — akan otomatis dikirim saat koneksi kembali
      </div>
    );
  }

  return (
    <ol className="flex items-center gap-1" aria-label="Diagnosis pipeline status">
      {GATES.map((gate, i) => {
        const gateIndex = ORDER.indexOf(gate.key);
        const passed = currentIndex > gateIndex || stage === "done";
        const active = stage === gate.key;
        return (
          <li key={gate.key} className="flex items-center gap-1">
            <span
              className={clsx(
                "flex h-6 items-center rounded-full px-2 text-[11px] font-medium transition-colors",
                passed && "bg-asp-primary text-white",
                active && !passed && "bg-asp-escalate text-white animate-pulse",
                !active && !passed && "bg-asp-ink/10 text-asp-ink/50"
              )}
            >
              {gate.label}
            </span>
            {i < GATES.length - 1 && <span className="h-px w-3 bg-asp-ink/20" />}
          </li>
        );
      })}
    </ol>
  );
}
