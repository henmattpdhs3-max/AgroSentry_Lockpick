const CONSENT_KEY_PREFIX = "agrosentry:consent:";

function consentKey(userId?: string | null): string {
  return `${CONSENT_KEY_PREFIX}${userId ?? "anonymous"}`;
}

export function hasConsented(userId?: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(consentKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function recordConsent(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(consentKey(userId), "1");
  } catch {
  }
}

export function clearConsent(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(consentKey(userId));
  } catch {
  }
}
