"use server";

import { createHash } from "crypto";
import { requireAdmin } from "@/lib/auth";

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/**
 * Signed direct-to-Cloudinary uploads: the browser sends the file straight
 * to Cloudinary with this signature, so images never pass through our
 * server. Signature is valid for ~1 hour and only for the given folder.
 */
export async function getUploadSignature(): Promise<
  { ok: true; data: UploadSignature } | { ok: false; error: string }
> {
  await requireAdmin();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: "Cloudinary is not configured" };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "ladies-forest";
  // Cloudinary signs the alphabetically-sorted params + the API secret.
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  return {
    ok: true,
    data: { cloudName, apiKey, timestamp, folder, signature },
  };
}
