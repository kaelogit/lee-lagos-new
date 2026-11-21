import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/require-admin";

export const runtime = "nodejs";

function backgroundKeys() {
  const names = [1, 2, 3, 4].flatMap((n) => [
    `REMOVE_BG_KEY_${n}`,
    `NEXT_PUBLIC_REMOVE_BG_KEY_${n}`,
  ]);

  return names
    .map((name) => process.env[name])
    .filter((value): value is string => Boolean(value));
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const keys = backgroundKeys();
  if (keys.length === 0) {
    return NextResponse.json(
      { error: "Background removal is not set up yet." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const file = form.get("image_file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo first." }, { status: 400 });
  }

  let lastStatus = 500;

  for (const key of keys) {
    const outbound = new FormData();
    outbound.append("image_file", file);
    outbound.append("size", "auto");

    try {
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": key },
        body: outbound,
      });

      if (response.ok) {
        const bytes = await response.arrayBuffer();
        return new NextResponse(bytes, {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }

      lastStatus = response.status;
      if (response.status === 402 || response.status === 429 || response.status === 403) {
        continue;
      }

      console.error("Background removal failed:", await response.text());
      return NextResponse.json(
        { error: "Background removal failed. The subject was not clear enough. Try a different photo." },
        { status: 400 }
      );
    } catch (error) {
      console.error("Background removal request failed:", error);
    }
  }

  const message = lastStatus === 402 || lastStatus === 429
    ? "Background removal is temporarily unavailable. Please try another photo."
    : "Background removal failed. Please try another photo.";

  return NextResponse.json({ error: message }, { status: 503 });
}
