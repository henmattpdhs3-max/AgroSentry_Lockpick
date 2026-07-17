"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRegionalDensity } from "@/lib/api-client";
import { RegionalMap } from "@/components/regional-map";
import { DensityMap } from "@/components/density-map";
import { Card } from "@/components/ui/card";
import { MapPinIcon } from "@/components/icons";
import { DENSITY_WINDOW_DAYS, K_THRESHOLD } from "@/lib/constants";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["regional-density", DENSITY_WINDOW_DAYS],
    queryFn: () => fetchRegionalDensity(DENSITY_WINDOW_DAYS),
  });

  const visibleDistricts = data?.filter((d) => d.observedCases !== null) ?? [];
  const totalCases = visibleDistricts.reduce((sum, d) => sum + (d.observedCases ?? 0), 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-asp-primary/10 text-asp-primary">
          <MapPinIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl text-asp-ink">Data Wilayah</h1>
          <p className="text-sm text-asp-ink/60">
            {DENSITY_WINDOW_DAYS} hari terakhir · anonim, agregat per kabupaten/kota
          </p>
        </div>
      </div>

      {data && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="asp-metric text-2xl text-asp-ink">{totalCases}</p>
            <p className="text-xs text-asp-ink/50">kasus terkonfirmasi</p>
          </Card>
          <Card className="p-3">
            <p className="asp-metric text-2xl text-asp-ink">
              {visibleDistricts.length}
              <span className="text-sm font-normal text-asp-ink/50"> / {data.length}</span>
            </p>
            <p className="text-xs text-asp-ink/50">wilayah dengan data cukup (≥{K_THRESHOLD})</p>
          </Card>
        </div>
      )}

      {isLoading && <p className="mt-6 text-sm text-asp-ink/50">Memuat data...</p>}
      {error && <p className="mt-6 text-sm text-asp-reject">Gagal memuat data. Coba lagi nanti.</p>}

      {data && (
        <>
          <div className="mt-6">
            <RegionalMap points={data} />
          </div>
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg text-asp-ink">Rincian per wilayah</h2>
            <DensityMap points={data} />
          </div>
        </>
      )}
    </main>
  );
}
