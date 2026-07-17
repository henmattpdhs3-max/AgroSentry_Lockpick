import { openDB, type IDBPDatabase } from "idb";
import { OFFLINE_QUEUE_DB_NAME, OFFLINE_QUEUE_STORE } from "./constants";

export interface QueuedSubmission {
  id: string;
  imageBlob: Blob;
  districtId: string;
  consentGiven: true;
  queuedAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(OFFLINE_QUEUE_DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(OFFLINE_QUEUE_STORE, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function enqueueSubmission(
  submission: Omit<QueuedSubmission, "id" | "queuedAt">
): Promise<QueuedSubmission> {
  const db = await getDb();
  const record: QueuedSubmission = {
    ...submission,
    id: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
  };
  await db.put(OFFLINE_QUEUE_STORE, record);
  return record;
}

export async function listQueuedSubmissions(): Promise<QueuedSubmission[]> {
  const db = await getDb();
  return db.getAll(OFFLINE_QUEUE_STORE);
}

export async function removeQueuedSubmission(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(OFFLINE_QUEUE_STORE, id);
}

export async function flushQueueOnReconnect(
  submit: (blob: Blob, meta: { districtId: string; consentGiven: true }) => Promise<unknown>
): Promise<void> {
  const pending = await listQueuedSubmissions();
  for (const item of pending) {
    try {
      await submit(item.imageBlob, {
        districtId: item.districtId,
        consentGiven: item.consentGiven,
      });
      await removeQueuedSubmission(item.id);
    } catch {
      // still offline or backend unreachable — leave it queued
      break;
    }
  }
}
