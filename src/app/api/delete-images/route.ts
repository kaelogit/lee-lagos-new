import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/require-admin";
import { deleteFromR2, keyFromImageUrl, supabaseProductImagePath } from "../../../lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const urls = Array.isArray(body?.urls) ? body.urls.filter((url: unknown) => typeof url === "string") : [];

  if (urls.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const warnings: string[] = [];
  let deleted = 0;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${admin.token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  for (const url of urls) {
    if (keyFromImageUrl(url)) {
      try {
        const removed = await deleteFromR2(url);
        if (removed) deleted += 1;
      } catch (error) {
        console.error("R2 delete failed:", error);
        return NextResponse.json(
          { error: "A photo could not be deleted from storage." },
          { status: 500 }
        );
      }
      continue;
    }

    const path = supabaseProductImagePath(url);
    if (path && supabase) {
      const { error } = await supabase.storage.from("product_images").remove([path]);
      if (error) {
        console.error("Supabase image delete failed:", error.message);
        warnings.push(url);
      } else {
        deleted += 1;
      }
    }
  }

  return NextResponse.json({ deleted, warnings });
}
