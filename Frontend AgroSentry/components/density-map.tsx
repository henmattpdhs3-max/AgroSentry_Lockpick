import { Card } from "./ui/card";
import type { DensityPoint } from "@/lib/types";
import { K_THRESHOLD } from "@/lib/constants";

/**
 * This replaces the old "Regional Risk Indicator." No weather data, no
 * heuristic risk score, no forward-looking language anywhere in this file
 * or its copy. If a future teammate is tempted to add a forecast here,
 * that's a scope decision that needs to go back through the same review
 * that flagged the original attribution problem — not a quiet addition.
 *
 * districts below K_THRESHOLD render "belum cukup data" instead of a
 * number. The backend is expected to already suppress these server-side;
 * this check is a second, cheap layer of defense, not the only one.
 */
export function DensityMap({ points }: { points: DensityPoint[] }) {
  return (
    <div>
      <p className="mb-3 text-xs text-asp-ink/50">
        Jumlah kasus terkonfirmasi per kabupaten, {points[0]?.windowDays ?? 30} hari terakhir.
        Data ini bersifat deskriptif atas kejadian yang telah terjadi, bukan prediksi.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {points.map((p) => {
          const suppressed = p.observedCases === null || p.observedCases < K_THRESHOLD;
          return (
            <Card key={p.districtId} className="p-3">
              <p className="text-sm font-medium text-asp-ink">{p.districtName}</p>
              <p className="asp-metric mt-1 text-lg text-asp-primary">
                {suppressed ? "—" : p.observedCases}
              </p>
              <p className="text-xs text-asp-ink/40">
                {suppressed ? "belum cukup data" : "kasus terkonfirmasi"}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
