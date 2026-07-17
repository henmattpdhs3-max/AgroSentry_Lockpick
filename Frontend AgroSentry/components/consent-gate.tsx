"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

// Gate 0
export function ConsentGate({ onConsent }: { onConsent: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <Card className="max-w-md">
      <h2 className="font-display text-lg text-asp-ink">Sebelum mulai</h2>
      <p className="mt-2 text-sm text-asp-ink/70">
        Foto daun Anda akan dianalisis untuk mendeteksi kemungkinan penyakit. Data lokasi
        (tingkat kabupaten/kota saja, bukan lokasi persis) dan jenis penyakit yang terdeteksi
        dapat disimpan secara anonim untuk membantu petani lain di wilayah Anda. Foto tidak
        pernah dibagikan dengan identitas Anda.
      </p>
      <label className="mt-4 flex items-start gap-2 text-sm text-asp-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1"
        />
        Saya mengerti dan setuju.
      </label>
      <Button className="mt-4" disabled={!checked} onClick={onConsent}>
        Lanjutkan
      </Button>
    </Card>
  );
}
