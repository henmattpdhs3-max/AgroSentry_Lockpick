"use client";

import { useEffect, useState } from "react";
import { ConsentGate } from "@/components/consent-gate";
import { PhotoUpload } from "@/components/photo-upload";
import { PipelineStatus } from "@/components/pipeline-status";
import { DiagnosisResult } from "@/components/diagnosis-result";
import { EscalationNotice } from "@/components/escalation-notice";
import { ProtectedRoute } from "@/components/protected-route";
import { useDiagnosis } from "@/hooks/use-diagnosis";
import { useAuth } from "@/lib/auth-context";
import { hasConsented, recordConsent } from "@/lib/consent-store";
import { DISTRICTS } from "@/lib/districts";
import { Outcome } from "@/lib/types";

function DiagnosePageContent() {
  const { user } = useAuth();

  // Gate 0 just once per account
  const [consented, setConsented] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  useEffect(() => {
    setConsented(hasConsented(user?.id));
    setCheckedStorage(true);
  }, [user?.id]);

  const [districtId, setDistrictId] = useState(DISTRICTS[0]?.id ?? "");
  const { stage, result, error, submit, reset } = useDiagnosis();

  const isEscalation =
    result &&
    [Outcome.REJECTED_NON_PLANT, Outcome.ESCALATED_LOW_CONF, Outcome.NO_CONTEXT_FALLBACK].includes(
      result.outcome
    );

  if (!checkedStorage) return null; // instant local check, avoids a consent-gate flash

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      {!consented ? (
        <ConsentGate
          onConsent={() => {
            recordConsent(user?.id);
            setConsented(true);
          }}
        />
      ) : (
        <>
          <div>
            <h1 className="font-display text-2xl text-asp-ink">Diagnosis Tanaman</h1>
            <p className="mt-1 text-sm text-asp-ink/60">
              Foto daun yang bergejala, sistem akan menganalisis dan memberi rekomendasi.
            </p>
          </div>

          {stage === "idle" && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-asp-ink/70">Wilayah Anda</span>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="rounded-md border border-asp-ink/15 bg-white px-3 py-2 text-asp-ink focus:border-asp-primary focus:outline-none"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-asp-ink/50">
                Dipakai hanya untuk data wilayah anonim, bukan lokasi persis Anda.
              </span>
            </label>
          )}

          {stage !== "idle" && <PipelineStatus stage={stage} />}

          {!result && (
            <PhotoUpload
              disabled={stage !== "idle" && stage !== "queued_offline"}
              onSubmit={(image) => void submit(image, districtId)}
            />
          )}

          {error && stage !== "queued_offline" && (
            <p className="text-sm text-asp-reject">
              Terjadi kesalahan yang tidak terduga. Coba lagi dalam beberapa saat.
            </p>
          )}

          {result && isEscalation && <EscalationNotice result={result} onRetry={reset} />}
          {result && !isEscalation && <DiagnosisResult result={result} onReset={reset} />}
        </>
      )}
    </main>
  );
}

export default function DiagnosePage() {
  return (
    <ProtectedRoute>
      <DiagnosePageContent />
    </ProtectedRoute>
  );
}
