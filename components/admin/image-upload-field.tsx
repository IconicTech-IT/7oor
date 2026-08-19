"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { uploadProductImageAction } from "@/lib/actions/upload";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUploadField({ value, onChange, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const t = useTranslations("admin.products.imageUpload");

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImageAction(formData);
      if (result.error) throw new Error(result.error);
      if (result.url) onChange(result.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-semibold text-muted">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
          {value ? (
            <Image src={value} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-2">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? t("uploading") : t("upload")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
