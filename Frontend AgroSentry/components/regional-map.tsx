"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { DensityPoint } from "@/lib/types";
import { K_THRESHOLD } from "@/lib/constants";
import { districtName as sharedDistrictName } from "@/lib/districts";

/**
 * Deliberately NOT a geographically accurate map. Team decision: a real
 * GeoJSON map (Leaflet + district boundaries) was judged too expensive for
 * the remaining build time, and a stylized map reads as more intentional
 * in a short demo than a default-styled Leaflet map would anyway.
 *
 * Node positions below are hand-placed approximations of relative location
 * for a West Java / Banten cluster (matches the target SAM region in the
 * proposal — Tangerang, Bogor, etc). Adjust freely; there is no coordinate
 * system to keep in sync with anything real.
 *
 * "Live update on submission" requirement: this component is pure/stateless
 * — it re-renders whenever `points` changes. The parent (dashboard/page.tsx)
 * is responsible for invalidating the query after a diagnosis submission so
 * a new point actually flows down. See the invalidation hook wired in
 * hooks/use-diagnosis.ts (onSuccess) if you add that later.
 */

// A significant portion of this component is written by AI

interface MapNode {
  districtId: string;
  cx: number; // 0-100, illustrative viewBox position
  cy: number;
}

// Hand-placed layout, not real coordinates
const LAYOUT: MapNode[] = [
  { districtId: "kab-tangerang", cx: 22, cy: 58 },
  { districtId: "kab-bogor", cx: 34, cy: 66 },
  { districtId: "kota-bogor", cx: 38, cy: 70 },
  { districtId: "kab-bandung", cx: 55, cy: 62 },
  { districtId: "kab-cianjur", cx: 46, cy: 60 },
  { districtId: "kab-sukabumi", cx: 40, cy: 74 },
  { districtId: "kab-serang", cx: 12, cy: 40 },
];

function radiusForCount(count: number | null): number {
  if (count === null) return 4;
  if (count < K_THRESHOLD) return 4;
  // sqrt scale so area (not radius) grows roughly with count
  return Math.min(22, 6 + Math.sqrt(count) * 3);
}

export function RegionalMap({ points }: { points: DensityPoint[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, DensityPoint>();
    for (const p of points) map.set(p.districtId, p);
    return map;
  }, [points]);

  const active = activeId ? byId.get(activeId) : null;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 90"
        className="w-full rounded-lg border border-asp-ink/10 bg-white"
        role="img"
        aria-label="Peta ilustratif kepadatan kasus per wilayah"
      >
        <path
          d="M8,35 Q20,25 40,28 Q60,22 80,30 Q92,35 90,50 Q88,65 70,72 Q55,80 38,78 Q20,76 10,62 Q4,48 8,35 Z"
          fill="var(--asp-bg)"
          stroke="var(--asp-primary)"
          strokeOpacity={0.15}
          strokeWidth={0.5}
        />

        {LAYOUT.map((node) => {
          const point = byId.get(node.districtId);
          const count = point?.observedCases ?? null;
          const suppressed = count === null || count < K_THRESHOLD;
          const r = radiusForCount(count);
          const isActive = activeId === node.districtId;

          return (
            <g key={node.districtId}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={r}
                className={clsx(
                  "cursor-pointer transition-all",
                  suppressed ? "fill-asp-ink/10" : "fill-asp-accent/70",
                  isActive && "fill-asp-accent"
                )}
                stroke={isActive ? "var(--asp-accent)" : "transparent"}
                strokeWidth={1}
                onMouseEnter={() => setActiveId(node.districtId)}
                onFocus={() => setActiveId(node.districtId)}
                onMouseLeave={() => setActiveId((cur) => (cur === node.districtId ? null : cur))}
                tabIndex={0}
                aria-label={point?.districtName ?? sharedDistrictName(node.districtId)}
              />
              {isActive && (
                <text
                  x={node.cx}
                  y={node.cy - r - 3}
                  textAnchor="middle"
                  className="fill-asp-ink font-body text-[3.5px] font-medium"
                >
                  {point?.districtName ?? sharedDistrictName(node.districtId)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center justify-between text-xs text-asp-ink/50">
        <span>
          Ukuran titik ~ jumlah kasus terkonfirmasi, {points[0]?.windowDays ?? 30} hari terakhir
          (deskriptif, bukan prediksi)
        </span>
        {active && (
          <span className="asp-metric font-medium text-asp-accent">
            {active.districtName}:{" "}
            {active.observedCases !== null && active.observedCases >= K_THRESHOLD
              ? `${active.observedCases} kasus`
              : "belum cukup data"}
          </span>
        )}
      </div>
    </div>
  );
}
