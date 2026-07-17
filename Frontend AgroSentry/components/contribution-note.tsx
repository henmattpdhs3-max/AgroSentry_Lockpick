import Link from "next/link";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

// Feature #4
export function ContributionNote({ districtName }: { districtName?: string }) {
  return (
    <Card className="border-asp-primary/20 bg-asp-primary/5">
      <Badge tone="primary">Kontribusi tersimpan</Badge>
      <p className="mt-2 text-sm text-asp-ink/80">
        Diagnosis ini otomatis menjadi bagian dari data anonim{" "}
        {districtName ? <>untuk wilayah <strong>{districtName}</strong></> : "wilayah Anda"}
        {" "}. Tanpa nama, tanpa lokasi persis. Setiap laporan membantu petani lain di sekitar
        Anda melihat lebih awal jika penyakit yang sama sedang menyebar.
      </p>
      <Link
        href="/dashboard"
        className="mt-3 inline-block text-sm font-medium text-asp-primary underline"
      >
        Lihat data wilayah →
      </Link>
    </Card>
  );
}
