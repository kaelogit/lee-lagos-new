/**
 * One-time move of product photos from Supabase Storage to Cloudflare R2.
 * Product rows stay in Supabase. Only the picture URLs change.
 *
 * Reads .env.local and .env. Does not delete the old files.
 * Leave the old bucket public for a week so carts saved in browsers still load,
 * then empty it.
 *
 *   node scripts/migrate-images-to-r2.mjs
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(name) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) missing.push(name);
  return value || "";
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const missing = [];
const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
const accountId = required("R2_ACCOUNT_ID");
const accessKey = required("R2_ACCESS_KEY_ID");
const secretKey = required("R2_SECRET_ACCESS_KEY");
const bucket = required("R2_BUCKET_NAME");
const imageBase = required("NEXT_PUBLIC_IMAGE_BASE_URL").replace(/\/$/, "");

if (missing.length > 0) {
  console.error("Cannot move photos yet. Add these values to .env.local:");
  for (const name of missing) console.error(`  - ${name}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
});

function supabasePath(url) {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/product_images/";
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, images");

if (error) {
  console.error("Could not read products:", error.message);
  process.exit(1);
}

let moved = 0;
let skipped = 0;
let failed = 0;

for (const product of products || []) {
  const images = Array.isArray(product.images) ? product.images : [];
  if (images.length === 0) continue;

  let changed = false;
  const nextImages = [];

  for (const url of images) {
    if (typeof url !== "string" || !url) {
      nextImages.push(url);
      continue;
    }

    if (url.startsWith(`${imageBase}/`)) {
      nextImages.push(url);
      skipped += 1;
      continue;
    }

    const path = supabasePath(url);
    if (!path) {
      nextImages.push(url);
      skipped += 1;
      continue;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const contentType = (response.headers.get("content-type") || "image/jpeg").split(";")[0];
      const fileName = path.split("/").pop();
      const key = `products/${product.id}-${fileName}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: contentType,
        })
      );

      nextImages.push(`${imageBase}/${key}`);
      changed = true;
      moved += 1;
      console.log(`Moved ${product.name}: ${path}`);
    } catch (err) {
      failed += 1;
      nextImages.push(url);
      console.error(`Failed ${product.name} (${url}):`, err instanceof Error ? err.message : err);
    }
  }

  if (!changed) continue;

  const { error: updateError } = await supabase
    .from("products")
    .update({ images: nextImages })
    .eq("id", product.id);

  if (updateError) {
    failed += 1;
    console.error(`Could not update ${product.name}:`, updateError.message);
  }
}

console.log("");
console.log(`Photos copied: ${moved}`);
console.log(`Already on the new host, or not a product photo: ${skipped}`);
console.log(`Failed: ${failed}`);
console.log("");
console.log("Old Supabase files were left in place.");
console.log("Keep that bucket public for one week, then empty it.");

if (failed > 0) process.exit(1);
