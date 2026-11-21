import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/require-admin";
import { r2Configured, uploadToR2 } from "../../../lib/r2";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  if (!r2Configured()) {
    return NextResponse.json(
      { error: "Image storage is not set up yet. Add the Cloudflare R2 keys, then try again." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "That file is not a photo." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large. Use one under 12 MB." }, { status: 400 });
  }

  const rawExt = file.name.split(".").pop() || "jpg";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, bytes, file.type || "image/jpeg");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("R2 upload failed:", error);
    return NextResponse.json({ error: "The photo could not be uploaded." }, { status: 500 });
  }
}
