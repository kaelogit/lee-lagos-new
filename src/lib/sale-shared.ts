export const SALE_KINDS = [
  "December Sale",
  "Christmas",
  "Boxing Day",
  "New Year",
  "Valentine's Day",
  "Easter",
  "Eid al-Fitr",
  "Eid al-Adha",
  "Children's Day",
  "Democracy Day",
  "Independence Day",
  "Workers' Day",
  "Mother's Day",
  "Father's Day",
  "Black Friday",
  "End of Year",
  "Flash Sale",
  "Custom",
] as const;

export const RESERVED_SHOP_SLUGS = new Set([
  "watches",
  "moissanite",
  "diamond",
  "eyeglasses",
  "gold",
  "perfumes",
  "hustle-x-lee",
  "hustlexlee",
]);

export const DECEMBER_BANNERS = [
  "/sales/december-30-days.jpg",
  "/sales/december-gifts.jpg",
  "/sales/december-20-off.jpg",
];

export type SaleStatus = "live" | "scheduled" | "ended" | "off";

export type SaleInput = {
  id?: string;
  name: string;
  slug: string;
  kind: string;
  discount_percent: number;
  banners: string[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids: string[];
};

export type PublicSale = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  discount_percent: number;
  banners: string[];
  starts_at: string;
  ends_at: string;
  status: SaleStatus;
  products: any[];
};

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug === "december-sale") return "decembersales";
  return slug;
}

export function priceAfterDiscount(price: number, percent: number) {
  const regular = Number(price);
  if (!regular || regular <= 0) return 0;
  return Math.max(1, Math.round((regular * (100 - percent)) / 100));
}

export function saleStatus(
  sale: { is_active: boolean; starts_at: string; ends_at: string },
  now = Date.now()
): SaleStatus {
  const start = new Date(sale.starts_at).getTime();
  const end = new Date(sale.ends_at).getTime();
  if (now >= end) return "ended";
  if (!sale.is_active) return "off";
  if (now < start) return "scheduled";
  return "live";
}

export function cleanBanners(value: unknown) {
  if (!Array.isArray(value)) return [];
  const banners: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const url = item.trim();
    if (!url) continue;
    if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) {
      banners.push(url);
    }
  }
  return [...new Set(banners)].slice(0, 8);
}

export function validateSale(input: SaleInput) {
  const name = input.name.trim();
  if (!name) return "Give the sale a name.";

  const slug = slugify(input.slug || name);
  if (!slug) return "Add a link for this sale.";
  if (RESERVED_SHOP_SLUGS.has(slug)) {
    return "That link is already used by a shop category. Pick another.";
  }

  if (!SALE_KINDS.includes(input.kind as (typeof SALE_KINDS)[number])) {
    return "Pick the kind of sale.";
  }

  const percent = Number(input.discount_percent);
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) {
    return "The discount needs to be a whole number from 1 to 90.";
  }

  const banners = cleanBanners(input.banners);
  if (banners.length === 0) return "Add at least one banner before saving.";

  const start = new Date(input.starts_at).getTime();
  const end = new Date(input.ends_at).getTime();
  if (!start || !end || Number.isNaN(start) || Number.isNaN(end)) {
    return "Set when the sale starts and when it ends.";
  }
  if (end <= start) return "The end needs to be after the start.";

  return null;
}

export function formatSaleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
