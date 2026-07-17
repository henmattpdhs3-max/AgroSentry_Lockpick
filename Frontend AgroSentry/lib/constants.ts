export const CONFIDENCE_MIN = 0.7; // below this: escalate, never diagnose
export const CONFIDENCE_HIGH = 0.85; // below this (except >= MIN): show a verify-with-PPL warning

export const K_THRESHOLD = 5; // minimum observations before a district count renders

export const DENSITY_WINDOW_DAYS = 30;

export const OFFLINE_QUEUE_DB_NAME = "agrosentry-offline-queue";
export const OFFLINE_QUEUE_STORE = "pending-submissions";
