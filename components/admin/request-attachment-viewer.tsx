"use client";

import { useState } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { getRequestAttachmentUrlAction } from "@/lib/actions/admin-requests";

export function RequestAttachmentViewer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleView() {
    setLoading(true);
    setUrl(await getRequestAttachmentUrlAction(path));
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
        <Paperclip className="h-4 w-4" />
        Open attachment
      </a>
    );
  }

  return (
    <button
      onClick={handleView}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      View attachment
    </button>
  );
}
