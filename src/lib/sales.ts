import type { Database } from "../types/supabase";
import {
  cleanBanners,
  priceAfterDiscount,
  PublicSale,
  saleStatus,
  SaleInput,
  slugify,
  validateSale,
} from "./sale-shared";
import { supabaseAdmin } from "./supabase-admin";

type SaleRow = Database["public"]["Tables"]["sales"]["Row"];
type LinkRow = Database["public"]["Tables"]["sale_products"]["Row"];
type Admin = NonNullable<ReturnType<typeof supabaseAdmin>>;

export class SalesSetupError extends Error {
  setup = true;
}

function dbOrThrow() {
  const db = supabaseAdmin();
  if (!db) throw new Error("The database key for sales is missing.");
  return db;
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const message = error.message || "";
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}

async function applyRows(
  db: Admin,
  sale: SaleRow,
  rows: LinkRow[],
  productById: Map<string, { id: string; price: number; on_sale: boolean | null; sale_price: number | null }>
) {
  for (const row of rows) {
    const product = productById.get(row.product_id);
    if (!product) continue;

    const nextPrice = priceAfterDiscount(Number(product.price), sale.discount_percent);
    if (!nextPrice || nextPrice >= Number(product.price)) continue;

    if (!row.prices_applied) {
      const { error } = await db
        .from("sale_products")
        .update({
          previous_on_sale: product.on_sale,
          previous_sale_price: product.sale_price,
          prices_applied: true,
        })
        .eq("sale_id", row.sale_id)
        .eq("product_id", row.product_id);
      if (error) {
        console.error(error.message);
        continue;
      }
      row.prices_applied = true;
    }

    const current = product.sale_price == null ? null : Number(product.sale_price);
    if (product.on_sale && current === nextPrice) continue;

    const { error } = await db
      .from("products")
      .update({ on_sale: true, sale_price: nextPrice })
      .eq("id", product.id);
    if (!error) {
      product.on_sale = true;
      product.sale_price = nextPrice;
    }
  }
}

async function restoreRows(
  db: Admin,
  rows: LinkRow[],
  productById?: Map<string, { id: string; price: number; on_sale: boolean | null; sale_price: number | null }>
) {
  for (const row of rows) {
    if (!row.prices_applied) continue;
    const previous = row.previous_sale_price == null ? null : Number(row.previous_sale_price);
    const onSale = Boolean(row.previous_on_sale) && previous != null && previous > 0;
    const { error } = await db
      .from("products")
      .update({
        on_sale: onSale,
        sale_price: previous,
      })
      .eq("id", row.product_id);
    if (error) {
      console.error(error.message);
      continue;
    }
    await db
      .from("sale_products")
      .update({ prices_applied: false })
      .eq("sale_id", row.sale_id)
      .eq("product_id", row.product_id);
    row.prices_applied = false;
    const product = productById?.get(row.product_id);
    if (product) {
      product.on_sale = onSale;
      product.sale_price = previous;
    }
  }
}

export async function syncSales() {
  const db = supabaseAdmin();
  if (!db) return;

  const { data: sales, error } = await db.from("sales").select("*").eq("is_active", true);
  if (error) {
    if (!missingTable(error)) console.error("Could not read sales:", error.message);
    return;
  }
  if (!sales?.length) return;

  const now = Date.now();
  const { data: links } = await db.from("sale_products").select("*").in(
    "sale_id",
    sales.map((sale) => sale.id)
  );
  const productIds = [...new Set((links || []).map((link) => link.product_id))];
  const { data: products } = productIds.length
    ? await db.from("products").select("id, price, on_sale, sale_price").in("id", productIds)
    : { data: [] };
  const productById = new Map((products || []).map((product) => [product.id, product]));
  const linksBySale = new Map<string, LinkRow[]>();
  for (const link of links || []) {
    const list = linksBySale.get(link.sale_id) || [];
    list.push(link);
    linksBySale.set(link.sale_id, list);
  }

  const ordered = [...sales].sort((a, b) => {
    const aLive = saleStatus(a, now) === "live" ? 1 : 0;
    const bLive = saleStatus(b, now) === "live" ? 1 : 0;
    return aLive - bLive;
  });

  for (const sale of ordered) {
    const status = saleStatus(sale, now);
    const rows = linksBySale.get(sale.id) || [];
    if (status === "live") {
      await applyRows(db, sale, rows, productById);
    } else {
      await restoreRows(db, rows, productById);
      if (status === "ended") {
        await db.from("sales").update({ is_active: false }).eq("id", sale.id);
      }
    }
  }
}

async function attachProducts(db: Admin, sales: SaleRow[]): Promise<PublicSale[]> {
  if (!sales.length) return [];
  const { data: links } = await db
    .from("sale_products")
    .select("sale_id, product_id")
    .in(
      "sale_id",
      sales.map((sale) => sale.id)
    );
  const productIds = [...new Set((links || []).map((link) => link.product_id))];
  const { data: products } = productIds.length
    ? await db.from("products").select("*").in("id", productIds)
    : { data: [] };

  const byId = new Map((products || []).map((product) => [product.id, product]));

  return sales.map((sale) => ({
    id: sale.id,
    name: sale.name,
    slug: sale.slug,
    kind: sale.kind,
    discount_percent: sale.discount_percent,
    banners: sale.banners || [],
    starts_at: sale.starts_at,
    ends_at: sale.ends_at,
    status: saleStatus(sale),
    products: (links || [])
      .filter((link) => link.sale_id === sale.id)
      .map((link) => byId.get(link.product_id))
      .filter(Boolean)
      .sort((a, b) => String(a?.name).localeCompare(String(b?.name))),
  }));
}

export async function getLiveSales(): Promise<PublicSale[]> {
  try {
    await syncSales();
    const db = supabaseAdmin();
    if (!db) return [];
    const { data, error } = await db.from("sales").select("*").eq("is_active", true).order("starts_at");
    if (error || !data) return [];
    const live = data.filter((sale) => saleStatus(sale) === "live" && (sale.banners || []).length > 0);
    return attachProducts(db, live);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSaleBySlug(slug: string) {
  await syncSales();
  const db = dbOrThrow();
  const { data, error } = await db.from("sales").select("*").eq("slug", slugify(slug)).maybeSingle();
  if (error) {
    if (missingTable(error)) throw new SalesSetupError("Sales are not set up in the database yet.");
    throw new Error(error.message);
  }
  if (!data) return null;
  const [sale] = await attachProducts(db, [data]);
  return sale || null;
}

async function findConflict(db: Admin, productIds: string[], currentId?: string) {
  const { data: links, error } = await db
    .from("sale_products")
    .select("product_id, sale_id")
    .in("product_id", productIds);
  if (error) throw new Error(error.message);

  const otherIds = [...new Set((links || []).map((link) => link.sale_id).filter((id) => id !== currentId))];
  if (!otherIds.length) return null;

  const { data: others } = await db.from("sales").select("id, name, is_active, ends_at").in("id", otherIds);
  const blocking = new Map(
    (others || [])
      .filter((sale) => sale.is_active && new Date(sale.ends_at).getTime() > Date.now())
      .map((sale) => [sale.id, sale.name])
  );
  const hit = (links || []).find((link) => blocking.has(link.sale_id));
  if (!hit) return null;

  const { data: product } = await db.from("products").select("name").eq("id", hit.product_id).maybeSingle();
  const piece = product?.name || "One piece";
  return `${piece} is already in ${blocking.get(hit.sale_id)}. Take it out of that sale first.`;
}

export async function saveSale(input: SaleInput) {
  const problem = validateSale({ ...input, banners: cleanBanners(input.banners) });
  if (problem) throw new Error(problem);

  const db = dbOrThrow();
  const slug = slugify(input.slug || input.name);
  const banners = cleanBanners(input.banners);
  const productIds = [...new Set((input.product_ids || []).filter(Boolean))];

  const { data: slugOwner, error: slugError } = await db.from("sales").select("id").eq("slug", slug).maybeSingle();
  if (slugError) {
    if (missingTable(slugError)) throw new SalesSetupError("Sales are not set up in the database yet.");
    throw new Error(slugError.message);
  }
  if (slugOwner && slugOwner.id !== input.id) throw new Error("Another sale already uses that link.");

  if (productIds.length) {
    const conflict = await findConflict(db, productIds, input.id);
    if (conflict) throw new Error(conflict);
  }

  const payload = {
    name: input.name.trim(),
    slug,
    kind: input.kind,
    discount_percent: Number(input.discount_percent),
    banners,
    starts_at: new Date(input.starts_at).toISOString(),
    ends_at: new Date(input.ends_at).toISOString(),
    is_active: Boolean(input.is_active),
  };

  let id = input.id || "";
  if (id) {
    const { error } = await db.from("sales").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from("sales").insert(payload).select("id").single();
    if (error || !data) throw new Error(error?.message || "The sale could not be saved.");
    id = data.id;
  }

  const { data: existing, error: linkError } = await db.from("sale_products").select("*").eq("sale_id", id);
  if (linkError) throw new Error(linkError.message);

  const nextIds = new Set(productIds);
  const removed = (existing || []).filter((row) => !nextIds.has(row.product_id));
  await restoreRows(db, removed);
  if (removed.length) {
    const { error } = await db
      .from("sale_products")
      .delete()
      .eq("sale_id", id)
      .in(
        "product_id",
        removed.map((row) => row.product_id)
      );
    if (error) throw new Error(error.message);
  }

  const existingIds = new Set((existing || []).map((row) => row.product_id));
  const added = productIds.filter((productId) => !existingIds.has(productId));
  if (added.length) {
    const { error } = await db.from("sale_products").insert(
      added.map((productId) => ({
        sale_id: id,
        product_id: productId,
        prices_applied: false,
      }))
    );
    if (error) throw new Error(error.message);
  }

  await syncSales();
  return id;
}

export async function deleteSale(id: string) {
  const db = dbOrThrow();
  const { data: rows, error } = await db.from("sale_products").select("*").eq("sale_id", id);
  if (error) {
    if (missingTable(error)) throw new SalesSetupError("Sales are not set up in the database yet.");
    throw new Error(error.message);
  }
  await restoreRows(db, rows || []);
  const { error: deleteError } = await db.from("sales").delete().eq("id", id);
  if (deleteError) throw new Error(deleteError.message);
}

export async function listSales() {
  const db = dbOrThrow();
  const { error: probe } = await db.from("sales").select("id").limit(1);
  if (probe && missingTable(probe)) throw new SalesSetupError("Sales are not set up in the database yet.");
  if (probe) throw new Error(probe.message);

  await syncSales();

  const { data: sales, error } = await db.from("sales").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const detailed = await attachProducts(db, sales || []);
  const now = Date.now();
  const busyProducts = (sales || [])
    .filter((sale) => sale.is_active && new Date(sale.ends_at).getTime() > now)
    .flatMap((sale) => {
      const match = detailed.find((item) => item.id === sale.id);
      return (match?.products || []).map((product) => ({
        product_id: product.id as string,
        sale_id: sale.id,
        sale_name: sale.name,
      }));
    });

  return { sales: detailed, busyProducts };
}
