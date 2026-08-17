"use client";

import { useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { getPaymentScreenshotUrlAction } from "@/lib/actions/admin-orders";

export function PaymentScreenshotViewer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleView() {
    setLoading(true);
    const signedUrl = await getPaymentScreenshotUrlAction(path);
    setUrl(signedUrl);
    setLoading(false);
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ImageIcon className="h-4 w-4" />
        Open screenshot
      </a>
    );
  }

  return (
    <button
      onClick={handleView}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      View payment screenshot
    </button>
  );
}
