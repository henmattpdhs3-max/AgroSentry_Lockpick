"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitDiagnosis } from "@/lib/api-client";
import { enqueueSubmission, flushQueueOnReconnect } from "@/lib/offline-queue";
import type { PipelineResult, PipelineStage } from "@/lib/types";
import { Outcome } from "@/lib/types";

interface UseDiagnosisResult {
  stage: PipelineStage;
  result: PipelineResult | null;
  error: string | null;
  submit: (image: Blob, districtId: string) => Promise<void>;
  reset: () => void;
}

const NARRATED_STAGES: PipelineStage[] = [
  "guardrail",
  "classifying",
  "confidence_check",
  "retrieving_context",
  "reasoning",
];
const STAGE_INTERVAL_MS = 550;

// Fail-safe with backend
export function useDiagnosis(): UseDiagnosisResult {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const narrationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const narrationIndex = useRef(0);

  const stopNarration = useCallback(() => {
    if (narrationTimer.current) {
      clearInterval(narrationTimer.current);
      narrationTimer.current = null;
    }
  }, []);

  const startNarration = useCallback(() => {
    stopNarration();
    narrationIndex.current = 0;
    setStage("guardrail");
    narrationTimer.current = setInterval(() => {
      narrationIndex.current += 1;
      const next = NARRATED_STAGES[narrationIndex.current];
      if (next) {
        setStage(next);
      } else {
        stopNarration();
      }
    }, STAGE_INTERVAL_MS);
  }, [stopNarration]);

  const mutation = useMutation({
    mutationFn: async ({ image, districtId }: { image: Blob; districtId: string }) => {
      setStage("uploading");
      startNarration();
      const res = await submitDiagnosis(image, { districtId, consentGiven: true });
      return res;
    },
    onError: async (_err, variables) => {
      stopNarration();
      // Network/backend failure: connectivity fix.
      // Queue it instead of showing a dead-end error.
      await enqueueSubmission({
        imageBlob: variables.image,
        districtId: variables.districtId,
        consentGiven: true,
      });
      setStage("queued_offline");
    },
    onSuccess: (res) => {
      stopNarration();
      switch (res.outcome) {
        case Outcome.REJECTED_NON_PLANT:
        case Outcome.ESCALATED_LOW_CONF:
        case Outcome.NO_CONTEXT_FALLBACK:
          setStage("confidence_check"); // rendered as escalation-notice.tsx
          break;
        case Outcome.DIAGNOSED:
        case Outcome.DIAGNOSED_WITH_WARNING:
          setStage("done"); // rendered as diagnosis-result.tsx
          break;
      }
    },
  });

  const submit = useCallback(
    async (image: Blob, districtId: string) => {
      await mutation.mutateAsync({ image, districtId });
    },
    [mutation]
  );

  const reset = useCallback(() => {
    stopNarration();
    setStage("idle");
    mutation.reset();
  }, [mutation, stopNarration]);

  // Flush anything queued while offline as soon as connectivity returns.
  useEffect(() => {
    const handleOnline = () => {
      void flushQueueOnReconnect((blob, meta) => submitDiagnosis(blob, meta));
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      stopNarration();
    };
  }, [stopNarration]);

  return {
    stage,
    result: mutation.data ?? null,
    error: mutation.error ? String(mutation.error) : null,
    submit,
    reset,
  };
}
