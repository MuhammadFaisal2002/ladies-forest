"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getUploadSignature } from "@/lib/actions/admin/uploads";

/**
 * "Upload photos" button: files go straight from the browser to Cloudinary
 * (signed), and the resulting URLs are handed back via onUploaded.
 */
export function ImageUploader({
  onUploaded,
  multiple = true,
  label = "Upload photos",
}: {
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const sig = await getUploadSignature();
      if (!sig.ok) {
        toast.error(sig.error);
        return;
      }
      const { cloudName, apiKey, timestamp, folder, signature } = sig.data;

      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", apiKey);
        body.append("timestamp", String(timestamp));
        body.append("folder", folder);
        body.append("signature", signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body },
        );
        const json = (await res.json()) as {
          secure_url?: string;
          error?: { message?: string };
        };
        if (!res.ok || !json.secure_url) {
          toast.error(
            `"${file.name}" upload failed: ${json.error?.message ?? "unknown error"}`,
          );
          continue;
        }
        urls.push(json.secure_url);
      }

      if (urls.length) {
        onUploaded(urls);
        toast.success(
          urls.length === 1 ? "Photo uploaded" : `${urls.length} photos uploaded`,
        );
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 className="animate-spin" /> : <Upload />}
        {busy ? "Uploading..." : label}
      </Button>
    </>
  );
}
