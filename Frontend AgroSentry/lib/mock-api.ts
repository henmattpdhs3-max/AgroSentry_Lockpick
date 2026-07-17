// ONLY FOR TESTING PURPOSES

import { Outcome, type DensityPoint, type PipelineResult, type VerifiedQAItem } from "./types";
import { CONFIDENCE_HIGH, CONFIDENCE_MIN, K_THRESHOLD } from "./constants";
import { DISTRICTS, districtName } from "./districts";

interface DiseaseEntry {
  crop: string;
  disease: string;
  recommendation: string;
  groundingSource: string;
}

const DISEASE_CATALOG: DiseaseEntry[] = [
  {
    crop: "Cabai",
    disease: "Virus Kuning Keriting Daun Cabai (dibawa kutu kebul)",
    recommendation:
      "Cabut dan musnahkan tanaman yang terinfeksi berat agar tidak jadi sumber penularan. " +
      "Kendalikan populasi kutu kebul (Bemisia tabaci) dengan perangkap kuning lengket dan " +
      "insektisida nabati terlebih dahulu. Gunakan mulsa plastik perak-hitam untuk mengurangi " +
      "hinggapnya kutu kebul pada pertanaman baru.",
    groundingSource:
      "Pedoman Pengendalian OPT Cabai 2023, Direktorat Perlindungan Tanaman Pangan — Kementerian Pertanian",
  },
  {
    crop: "Cabai",
    disease: "Antraknosa (Colletotrichum sp.)",
    recommendation:
      "Buang dan musnahkan buah yang terinfeksi, jangan dikompos di lahan yang sama. Perbaiki " +
      "drainase dan jarak tanam untuk menurunkan kelembapan kanopi. Rotasi dengan tanaman bukan " +
      "famili Solanaceae pada musim berikutnya.",
    groundingSource:
      "Pedoman Pengendalian OPT Cabai 2023, Direktorat Perlindungan Tanaman Pangan — Kementerian Pertanian",
  },
  {
    crop: "Tomat",
    disease: "Layu Fusarium (Fusarium oxysporum)",
    recommendation:
      "Cabut tanaman yang layu total beserta akarnya dan musnahkan — jangan dibiarkan di lahan. " +
      "Hindari menanam tomat berturut-turut di petak yang sama selama minimal 2 musim. " +
      "Gunakan varietas tomat yang toleran layu Fusarium untuk penanaman berikutnya.",
    groundingSource:
      "Pedoman Pengendalian OPT Tomat 2022, Direktorat Perlindungan Tanaman Pangan — Kementerian Pertanian",
  },
  {
    crop: "Padi",
    disease: "Blas Daun (Pyricularia oryzae)",
    recommendation:
      "Hindari pemupukan nitrogen berlebih, karena tanaman yang terlalu subur lebih rentan blas. " +
      "Jaga genangan air yang stabil di petakan. Jika serangan meluas di atas 5% luas daun, " +
      "segera koordinasikan dengan PPL setempat untuk rekomendasi fungisida yang sesuai ambang.",
    groundingSource:
      "Pedoman Pengendalian OPT Padi 2023, Direktorat Perlindungan Tanaman Pangan — Kementerian Pertanian",
  },
  {
    crop: "Padi",
    disease: "Hawar Daun Bakteri (Xanthomonas oryzae)",
    recommendation:
      "Kurangi pemupukan nitrogen dan perbaiki tata air agar tidak tergenang berlebihan. " +
      "Bersihkan sisa tanaman terinfeksi setelah panen agar tidak jadi sumber inokulum musim " +
      "berikutnya. Gunakan benih dari sumber bersertifikat untuk musim tanam selanjutnya.",
    groundingSource:
      "Pedoman Pengendalian OPT Padi 2023, Direktorat Perlindungan Tanaman Pangan — Kementerian Pertanian",
  },
  {
    crop: "Jagung",
    disease: "Bulai (Peronosclerospora spp.)",
    recommendation:
      "Cabut dan musnahkan tanaman bergejala sedini mungkin (sebelum umur 3 minggu) untuk " +
      "memutus siklus penularan ke tanaman sehat di sekitarnya. Gunakan benih berlabel yang " +
      "sudah diberi perlakuan fungisida sistemik untuk penanaman berikutnya.",
    groundingSource:
      "Pedoman Pengendalian OPT Jagung 2022, Direktorat Perlindungan Tanaman Pangan — Kementerian Pertanian",
  },
];

/** Deterministic per-photo hash so re-submitting the same photo during a
 * rehearsal gives a consistent result, while different photos naturally
 * land on different demo states. */
async function hashBlob(blob: Blob): Promise<number> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let hash = bytes.length || 1;
  const step = Math.max(1, Math.floor(bytes.length / 256));
  for (let i = 0; i < bytes.length; i += step) {
    hash = (hash * 31 + (bytes[i] ?? 0)) >>> 0;
  }
  return hash;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not decode image for mock Grad-CAM"));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Draws 1-2 seeded, plausible "hot region" overlays on top of the actual
 * uploaded photo. This is a stand-in for a real Grad-CAM heatmap — visually
 * demonstrates what "explainable AI" looks like in the UI without claiming
 * to be a real model attribution. Browser-only; returns "" outside a DOM
 * environment rather than throwing.
 */
async function generateMockGradCam(imageBlob: Blob, seed: number): Promise<string> {
  if (typeof document === "undefined") return "";
  try {
    const img = await blobToImage(imageBlob);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const rand = mulberry32(seed);
    const blobCount = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < blobCount; i++) {
      const cx = canvas.width * (0.3 + rand() * 0.4);
      const cy = canvas.height * (0.3 + rand() * 0.4);
      const r = Math.min(canvas.width, canvas.height) * (0.18 + rand() * 0.14);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      gradient.addColorStop(0, "rgba(217,142,4,0.55)");
      gradient.addColorStop(0.6, "rgba(217,142,4,0.28)");
      gradient.addColorStop(1, "rgba(217,142,4,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl.split(",")[1] ?? "";
  } catch {
    // Decoding can fail for unusual formats — degrade to "no overlay"
    // rather than breaking the whole diagnosis result.
    return "";
  }
}

// --- Session-local contribution ledger --------------------------------
// Mirrors the real pipeline's side effect (a diagnosis becomes an
// anonymous aggregate row) so the dashboard visibly updates within the
// same demo session, matching the original spec's demo flow ("the newly
// submitted observation immediately appears on the disease map").
const CONTRIBUTIONS_KEY = "agrosentry:mock-contributions";

interface MockContribution {
  districtId: string;
  submittedAt: string;
}

function readContributions(): MockContribution[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONTRIBUTIONS_KEY);
    return raw ? (JSON.parse(raw) as MockContribution[]) : [];
  } catch {
    return [];
  }
}

function recordContribution(districtId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readContributions();
    existing.push({ districtId, submittedAt: new Date().toISOString() });
    // Cap so localStorage doesn't grow unbounded over a long demo day.
    const capped = existing.slice(-200);
    window.localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(capped));
  } catch {
    // best-effort only — a failed write just means the dashboard won't
    // reflect this particular submission, not a broken diagnosis flow
  }
}

// Baseline seed counts so the map isn't empty on a fresh demo. A couple of
// districts are deliberately left under K_THRESHOLD to keep the
// suppression behavior ("belum cukup data") visibly demonstrable.
const BASELINE_COUNTS: Record<string, number> = {
  "kab-tangerang": 14,
  "kab-bogor": 9,
  "kota-bogor": 2,
  "kab-bandung": 7,
  "kab-cianjur": 3,
  "kab-sukabumi": 6,
  "kab-serang": 1,
};

export function getMockRegionalDensity(windowDays: number): DensityPoint[] {
  const contributions = readContributions();
  return DISTRICTS.map((d) => {
    const sessionCount = contributions.filter((c) => c.districtId === d.id).length;
    const observedCases = (BASELINE_COUNTS[d.id] ?? 0) + sessionCount;
    return {
      districtId: d.id,
      districtName: d.name,
      // Mirrors the real backend's k-anonymity gate (see core/ethics.py in
      // the README's architecture note): suppress at the source, not just
      // in the UI, so this behaves like the real contract will.
      observedCases: observedCases >= K_THRESHOLD ? observedCases : null,
      windowDays,
    };
  });
}

export function getMockVerifiedQA(): VerifiedQAItem[] {
  return [
    {
      id: "qa-1",
      question: "Daun cabai saya menguning dan keriting, tapi belum ada bercak. Apa itu virus kuning?",
      answer:
        "Kemungkinan besar iya, terutama jika ada kutu kebul di sekitar tanaman. Segera pisahkan " +
        "tanaman yang terinfeksi berat dan pasang perangkap kuning lengket untuk kutu kebulnya.",
      linkedDiagnosisOutcome: Outcome.DIAGNOSED,
      verified: true,
    },
    {
      id: "qa-2",
      question: "Setelah difoto, hasilnya 'perlu verifikasi'. Apa artinya tanaman saya pasti sakit?",
      answer:
        "Belum tentu. Status itu berarti sistem tidak cukup yakin untuk memberi diagnosis pasti — " +
        "coba foto ulang dengan cahaya lebih terang dan fokus pada bagian yang bergejala, atau " +
        "tunjukkan langsung ke PPL setempat.",
      linkedDiagnosisOutcome: Outcome.ESCALATED_LOW_CONF,
      verified: true,
    },
    {
      id: "qa-3",
      question: "Apakah foto dan lokasi saya dibagikan ke orang lain?",
      answer:
        "Tidak. Yang disimpan hanya jenis penyakit dan wilayah kabupaten/kota secara anonim, tanpa " +
        "identitas maupun lokasi persis Anda — dan hanya ditampilkan setelah cukup banyak laporan " +
        "terkumpul di wilayah itu.",
      linkedDiagnosisOutcome: Outcome.DIAGNOSED_WITH_WARNING,
      verified: true,
    },
    {
      id: "qa-4",
      question: "Padi saya kena hawar daun bakteri, apa boleh langsung disemprot pestisida kimia?",
      answer:
        "Sebaiknya perbaiki dulu tata air dan kurangi pupuk nitrogen sesuai anjuran — banyak kasus " +
        "membaik tanpa pestisida kimia. Jika serangan meluas, koordinasikan dosis dan jenisnya " +
        "dengan PPL agar sesuai ambang kendali.",
      linkedDiagnosisOutcome: Outcome.DIAGNOSED,
      verified: true,
    },
  ];
}

export async function generateMockDiagnosis(
  imageBlob: Blob,
  districtId: string
): Promise<PipelineResult> {
  const seed = await hashBlob(imageBlob);
  const rand = mulberry32(seed);
  const roll = rand();

  // Weighted outcome distribution — mostly successful diagnoses, but every
  // fail-safe state stays reachable so it can actually be demoed, not just
  // described. Same thresholds as lib/constants.ts.
  let outcome: Outcome;
  let confidence: number;
  if (roll < 0.55) {
    outcome = Outcome.DIAGNOSED;
    confidence = CONFIDENCE_HIGH + rand() * (0.99 - CONFIDENCE_HIGH);
  } else if (roll < 0.8) {
    outcome = Outcome.DIAGNOSED_WITH_WARNING;
    confidence = CONFIDENCE_MIN + rand() * (CONFIDENCE_HIGH - CONFIDENCE_MIN);
  } else if (roll < 0.92) {
    outcome = Outcome.ESCALATED_LOW_CONF;
    confidence = rand() * CONFIDENCE_MIN;
  } else if (roll < 0.97) {
    outcome = Outcome.NO_CONTEXT_FALLBACK;
    confidence = CONFIDENCE_MIN + rand() * (CONFIDENCE_HIGH - CONFIDENCE_MIN);
  } else {
    outcome = Outcome.REJECTED_NON_PLANT;
    confidence = rand() * 0.4;
  }

  const entry = DISEASE_CATALOG[Math.floor(rand() * DISEASE_CATALOG.length)] ?? DISEASE_CATALOG[0];
  const gradCamPng =
    outcome === Outcome.DIAGNOSED || outcome === Outcome.DIAGNOSED_WITH_WARNING
      ? await generateMockGradCam(imageBlob, seed)
      : "";

  if (outcome === Outcome.DIAGNOSED || outcome === Outcome.DIAGNOSED_WITH_WARNING) {
    recordContribution(districtId);
  }

  const base: PipelineResult = {
    outcome,
    disease: entry ? `${entry.crop} — ${entry.disease}` : "Tidak diketahui",
    confidence,
    recommendation: entry?.recommendation ?? "",
    message: "",
    groundingSource: entry?.groundingSource,
    districtId,
    submittedAt: new Date().toISOString(),
  };

  if (gradCamPng) {
    base.gradCam = { heatmapPng: gradCamPng, weight: 0.6 + rand() * 0.3 };
  }

  switch (outcome) {
    case Outcome.REJECTED_NON_PLANT:
      return {
        ...base,
        disease: "",
        recommendation: "",
        groundingSource: undefined,
        message: "Gambar tidak terdeteksi sebagai daun tanaman.",
      };
    case Outcome.NO_CONTEXT_FALLBACK:
      return {
        ...base,
        recommendation: "",
        message: `Terdeteksi kemungkinan ${entry?.disease ?? "penyakit"}, tetapi panduan resmi spesifik belum tersedia.`,
      };
    case Outcome.ESCALATED_LOW_CONF:
      return {
        ...base,
        disease: "",
        recommendation: "",
        groundingSource: undefined,
        message: "Keyakinan deteksi di bawah ambang minimum.",
      };
    default:
      return {
        ...base,
        message: `Terdiagnosis di ${districtName(districtId)}.`,
      };
  }
}
