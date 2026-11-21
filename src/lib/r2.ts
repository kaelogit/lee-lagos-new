import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function imageBaseUrl() {
  return (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").replace(/\/$/, "");
}

export function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      imageBaseUrl()
  );
}

function r2Client() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: required("R2_ACCESS_KEY_ID"),
        secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

export function publicUrlForKey(key: string) {
  const base = imageBaseUrl();
  if (!base) throw new Error("Missing NEXT_PUBLIC_IMAGE_BASE_URL");
  return `${base}/${key}`;
}

export function keyFromImageUrl(url: string) {
  const base = imageBaseUrl();
  if (!base || !url.startsWith(`${base}/`)) return null;
  const path = url.slice(base.length + 1).split("?")[0];
  if (!path) return null;
  return decodeURIComponent(path);
}

export function supabaseProductImagePath(url: string) {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/product_images/";
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const path = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    return path || null;
  } catch {
    return null;
  }
}

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: required("R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return publicUrlForKey(key);
}

export async function deleteFromR2(url: string) {
  const key = keyFromImageUrl(url);
  if (!key) return false;
  await r2Client().send(
    new DeleteObjectCommand({
      Bucket: required("R2_BUCKET_NAME"),
      Key: key,
    })
  );
  return true;
}
