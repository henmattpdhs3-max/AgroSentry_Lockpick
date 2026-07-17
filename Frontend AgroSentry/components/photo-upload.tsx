"use client";

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CameraIcon } from "./icons";

interface PhotoUploadProps {
  onSubmit: (image: Blob) => void;
  disabled?: boolean;
}

// Compression
export function PhotoUpload({ onSubmit, disabled }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);

  async function handleFile(file: File) {
    const compressed = await compressImage(file, 320, 0.85);
    setPendingBlob(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  function handleChangePhoto() {
    setPendingBlob(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="max-w-md">
      <h2 className="font-display text-lg text-asp-ink">Foto daun</h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {!preview ? (
        <label
          htmlFor="leaf-photo-input"
          onClick={(e) => {
            e.preventDefault();
            inputRef.current?.click();
          }}
          className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-asp-primary/30 bg-asp-primary/5 px-4 py-8 text-center transition-colors hover:bg-asp-primary/10"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-asp-primary/10 text-asp-primary">
            <CameraIcon className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium text-asp-ink">Ambil atau pilih foto</span>
          <span className="text-xs text-asp-ink/50">Fokus pada bagian daun yang bergejala</span>
        </label>
      ) : (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Pratinjau foto daun" className="w-full rounded-md" />
          <button
            type="button"
            onClick={handleChangePhoto}
            disabled={disabled}
            className="mt-2 text-sm font-medium text-asp-primary underline disabled:opacity-50"
          >
            Ganti foto
          </button>
        </div>
      )}

      <Button
        className="mt-4 w-full"
        disabled={disabled || !pendingBlob}
        onClick={() => pendingBlob && onSubmit(pendingBlob)}
      >
        Analisis foto
      </Button>
    </Card>
  );
}

function compressImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas unavailable"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))), "image/jpeg", quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
