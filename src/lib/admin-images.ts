import { supabase } from "./supabase";

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Please sign in again.");
  }
  return { Authorization: `Bearer ${token}` };
}

export async function uploadProductImage(file: File) {
  const headers = await authHeader();
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    headers,
    body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "The photo could not be uploaded.");
  }

  return payload.url as string;
}

export async function deleteStoredImages(urls: string[]) {
  const clean = urls.filter(Boolean);
  if (clean.length === 0) return;

  const headers = await authHeader();
  const response = await fetch("/api/delete-images", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ urls: clean }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "The photos could not be deleted.");
  }
}

export async function removeImageBackground(file: File) {
  const headers = await authHeader();
  const body = new FormData();
  body.append("image_file", file);

  const response = await fetch("/api/remove-background", {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Background removal failed. Please try another photo.");
  }

  const blob = await response.blob();
  const newName = file.name.replace(/\.[^/.]+$/, "") + "-nobg.png";
  return new File([blob], newName, { type: "image/png" });
}
