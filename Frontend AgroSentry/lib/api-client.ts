import type { DensityPoint, PipelineResult, VerifiedQAItem } from "./types";
import {
  generateMockDiagnosis,
  getMockRegionalDensity,
  getMockVerifiedQA,
} from "./mock-api";
import { isDemoModeForced, setDemoModeActive } from "./demo-mode";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// True only for a network-level failure
function isNetworkFailure(err: unknown): boolean {
  return err instanceof TypeError;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(res.status, body || res.statusText);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitDiagnosis(
  imageBlob: Blob,
  meta: { districtId: string; consentGiven: true }
): Promise<PipelineResult> {
  if (isDemoModeForced()) {
    return generateMockDiagnosis(imageBlob, meta.districtId);
  }

  const form = new FormData();
  form.append("image", imageBlob, "leaf.jpg");
  form.append("district_id", meta.districtId);
  form.append("consent", String(meta.consentGiven));

  try {
    const result = await request<PipelineResult>("/api/diagnose", {
      method: "POST",
      body: form,
    });
    setDemoModeActive(false);
    return result;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (isNetworkFailure(err) || (err as Error)?.name === "AbortError") {
      setDemoModeActive(true);
      return generateMockDiagnosis(imageBlob, meta.districtId);
    }
    throw err;
  }
}

// Regional density
export async function fetchRegionalDensity(windowDays: number): Promise<DensityPoint[]> {
  if (isDemoModeForced()) return getMockRegionalDensity(windowDays);
  try {
    const result = await request<DensityPoint[]>(`/api/regional-density?window_days=${windowDays}`);
    setDemoModeActive(false);
    return result;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (isNetworkFailure(err) || (err as Error)?.name === "AbortError") {
      setDemoModeActive(true);
      return getMockRegionalDensity(windowDays);
    }
    throw err;
  }
}

export async function fetchVerifiedQA(): Promise<VerifiedQAItem[]> {
  if (isDemoModeForced()) return getMockVerifiedQA();
  try {
    const result = await request<VerifiedQAItem[]>("/api/community/verified-qa");
    setDemoModeActive(false);
    return result;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (isNetworkFailure(err) || (err as Error)?.name === "AbortError") {
      setDemoModeActive(true);
      return getMockVerifiedQA();
    }
    throw err;
  }
}

export { ApiError };
