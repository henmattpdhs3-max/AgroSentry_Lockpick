// TESTING PURPOSES + FALLBACK

type Listener = (active: boolean) => void;

const FORCED = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

let active = FORCED;
const listeners = new Set<Listener>();

export function isDemoModeActive(): boolean {
  return active;
}

export function isDemoModeForced(): boolean {
  return FORCED;
}

export function setDemoModeActive(next: boolean): void {
  // If forced via env var, never let a transient successful call turn the
  // banner off underneath a presenter mid-rehearsal.
  if (FORCED) return;
  if (active === next) return;
  active = next;
  listeners.forEach((l) => l(active));
}

export function subscribeDemoMode(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
