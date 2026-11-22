"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { uploadProductImage } from "../../../lib/admin-images";
import {
  DECEMBER_BANNERS,
  SALE_KINDS,
  cleanBanners,
  formatSaleDate,
  priceAfterDiscount,
  PublicSale,
  slugify,
  validateSale,
} from "../../../lib/sale-shared";

type Piece = {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  category: string;
};

type Busy = { product_id: string; sale_id: string; sale_name: string };

type FormState = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  discount_percent: number;
  banners: string[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product_ids: string[];
  slugTouched: boolean;
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function blankForm(): FormState {
  const year = new Date().getFullYear();
  return {
    id: "",
    name: "December Sale",
    slug: "decembersales",
    kind: "December Sale",
    discount_percent: 20,
    banners: [...DECEMBER_BANNERS],
    starts_at: `${year}-12-01T00:00`,
    ends_at: `${year}-12-31T23:59`,
    is_active: true,
    product_ids: [],
    slugTouched: false,
  };
}

function formFromSale(sale: PublicSale): FormState {
  return {
    id: sale.id,
    name: sale.name,
    slug: sale.slug,
    kind: sale.kind,
    discount_percent: sale.discount_percent,
    banners: sale.banners || [],
    starts_at: toLocalInput(sale.starts_at),
    ends_at: toLocalInput(sale.ends_at),
    is_active: sale.status === "live" || sale.status === "scheduled",
    product_ids: (sale.products || []).map((product) => product.id),
    slugTouched: true,
  };
}

async function salesRequest(path: string, options?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token || ""}`,
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Something went wrong.") as Error & {
      setup?: boolean;
      sql?: string;
    };
    error.setup = payload.setup;
    error.sql = payload.sql;
    throw error;
  }
  return payload;
}

export default function SalesAdminPage() {
  const [sales, setSales] = useState<PublicSale[]>([]);
  const [busy, setBusy] = useState<Busy[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [setupSql, setSetupSql] = useState("");

  async function loadSales() {
    const payload = await salesRequest("/api/sales");
    setSales(payload.sales || []);
    setBusy(payload.busyProducts || []);
    setSetupSql("");
  }

  useEffect(() => {
    async function load() {
      try {
        await loadSales();
        const { data } = await supabase
          .from("products")
          .select("id, name, price, images, category")
          .order("name")
          .limit(500);
        setPieces(data || []);
      } catch (error) {
        const problem = error as Error & { setup?: boolean; sql?: string };
        setMessage(problem.message);
        if (problem.setup) setSetupSql(problem.sql || "");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selected = useMemo(
    () => (form ? pieces.filter((piece) => form.product_ids.includes(piece.id)) : []),
    [form, pieces]
  );

  const matches = useMemo(() => {
    if (!form) return [];
    const term = search.trim().toLowerCase();
    return pieces
      .filter((piece) => !form.product_ids.includes(piece.id))
      .filter((piece) => !term || piece.name.toLowerCase().includes(term) || piece.category.toLowerCase().includes(term))
      .slice(0, 8);
  }, [form, pieces, search]);

  function update(patch: Partial<FormState>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
  }

  function onName(name: string) {
    setForm((current) => {
      if (!current) return current;
      const next = { ...current, name };
      if (!current.slugTouched) next.slug = slugify(name);
      return next;
    });
  }

  async function onUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || !form) return;
    if (form.banners.length >= 8) {
      setMessage("A sale can have up to 8 banners.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const url = await uploadProductImage(file);
      update({ banners: cleanBanners([...form.banners, url]) });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The banner could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function onSave() {
    if (!form) return;
    const startTime = new Date(form.starts_at).getTime();
    const endTime = new Date(form.ends_at).getTime();
    if (!startTime || !endTime || Number.isNaN(startTime) || Number.isNaN(endTime)) {
      setMessage("Set when the sale starts and when it ends.");
      return;
    }

    const input = {
      id: form.id || undefined,
      name: form.name,
      slug: form.slug,
      kind: form.kind,
      discount_percent: Number(form.discount_percent),
      banners: form.banners,
      starts_at: new Date(startTime).toISOString(),
      ends_at: new Date(endTime).toISOString(),
      is_active: form.is_active,
      product_ids: form.product_ids,
    };
    const problem = validateSale({ ...input, banners: cleanBanners(input.banners) });
    if (problem) {
      setMessage(problem);
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await salesRequest("/api/sales", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(input),
      });
      await loadSales();
      setForm(null);
      setMessage("Sale saved.");
    } catch (error) {
      const problemError = error as Error & { setup?: boolean; sql?: string };
      setMessage(problemError.message);
      if (problemError.setup) setSetupSql(problemError.sql || "");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!form?.id) return;
    if (!window.confirm("Delete this sale? The pieces go back to their normal prices.")) return;
    setSaving(true);
    setMessage("");
    try {
      await salesRequest(`/api/sales?id=${form.id}`, { method: "DELETE" });
      await loadSales();
      setForm(null);
      setMessage("Sale deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The sale could not be deleted.");
    } finally {
      setSaving(false);
    }
  }

  const saveBlocked = !form || cleanBanners(form.banners).length === 0;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10 border-b border-lee-light-grey pb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-lee-black mb-1">Sales</h1>
          <p className="text-[10px] uppercase tracking-widest text-lee-grey">
            Banners, discounts, and how long each sale runs
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setForm(blankForm());
          }}
          className="bg-lee-black text-white px-6 py-3 text-[9px] font-bold uppercase tracking-widest rounded-sm"
        >
          New sale
        </button>
      </div>

      {message && (
        <p className="mb-6 text-sm text-lee-black border border-lee-light-grey bg-white px-4 py-3">{message}</p>
      )}

      {setupSql && (
        <div className="mb-8 border border-lee-light-grey bg-white p-6">
          <p className="text-sm mb-4">
            Open Supabase, go to SQL Editor, paste this, and run it once. Then refresh this page.
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(setupSql)}
            className="mb-4 border border-lee-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
          >
            Copy setup
          </button>
          <pre className="max-h-64 overflow-auto text-[11px] leading-relaxed bg-lee-light-grey/40 p-4">{setupSql}</pre>
        </div>
      )}

      {loading ? (
        <p className="text-[10px] uppercase tracking-[0.2em] animate-pulse">Loading sales...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 mb-10">
          {sales.length === 0 && !setupSql && (
            <p className="text-sm text-lee-grey">No sales yet. Start with the December sale.</p>
          )}
          {sales.map((sale) => (
            <button
              key={sale.id}
              type="button"
              onClick={() => {
                setMessage("");
                setForm(formFromSale(sale));
              }}
              className="text-left bg-white border border-lee-light-grey p-5 rounded-sm hover:border-lee-black/30"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest">{sale.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-lee-grey mt-1">
                    {sale.kind} · {sale.discount_percent}% off · {sale.products.length} pieces · /shop/{sale.slug}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {sale.status === "live" && `Live until ${formatSaleDate(sale.ends_at)}`}
                  {sale.status === "scheduled" && `Starts ${formatSaleDate(sale.starts_at)}`}
                  {sale.status === "ended" && "Ended"}
                  {sale.status === "off" && "Off"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {form && (
        <div className="bg-white border border-lee-light-grey p-6 md:p-8 rounded-sm">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-8">
            {form.id ? "Edit sale" : "New sale"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2">Kind of sale</span>
              <select
                value={form.kind}
                onChange={(event) => update({ kind: event.target.value })}
                className="w-full h-10 border border-lee-light-grey px-3 text-sm bg-white"
              >
                {SALE_KINDS.map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2">Name</span>
              <input
                value={form.name}
                onChange={(event) => onName(event.target.value)}
                className="w-full h-10 border border-lee-light-grey px-3 text-sm"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2">Page link</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-lee-grey shrink-0">leesjewellers.com/shop/</span>
                <input
                  value={form.slug}
                  onChange={(event) => update({ slug: slugify(event.target.value), slugTouched: true })}
                  className="w-full h-10 border border-lee-light-grey px-3 text-sm"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2">Discount %</span>
              <input
                type="number"
                min={1}
                max={90}
                value={form.discount_percent}
                onChange={(event) => update({ discount_percent: Number(event.target.value) })}
                className="w-full h-10 border border-lee-light-grey px-3 text-sm"
              />
            </label>

            <label className="flex items-end gap-3 pb-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => update({ is_active: event.target.checked })}
                className="w-4 h-4 accent-black"
              />
              <span className="text-sm">Show this sale during those dates</span>
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2">Starts</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) => update({ starts_at: event.target.value })}
                className="w-full h-10 border border-lee-light-grey px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest text-lee-grey mb-2">Ends</span>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(event) => update({ ends_at: event.target.value })}
                className="w-full h-10 border border-lee-light-grey px-3 text-sm"
              />
            </label>
          </div>

          <p className="text-xs text-lee-grey mt-3">
            When the end time passes, the banner leaves the home page and the pieces go back to their normal prices.
          </p>

          <div className="mt-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Banners</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => update({ banners: cleanBanners([...form.banners, ...DECEMBER_BANNERS]) })}
                  className="border border-lee-light-grey px-3 py-2 text-[10px] uppercase tracking-widest"
                >
                  Add December banners
                </button>
                <label className="border border-lee-black px-3 py-2 text-[10px] uppercase tracking-widest cursor-pointer">
                  {uploading ? "Uploading..." : "Upload banner"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => {
                      onUpload(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-lee-grey mb-4">
              Every banner sits in the same strip above the main pictures. A sale needs at least one.
            </p>
            {form.banners.length === 0 && (
              <p className="text-sm text-red-600 mb-4">Add at least one banner before saving.</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {form.banners.map((banner) => (
                <div key={banner} className="flex items-center gap-4 border border-lee-light-grey p-2">
                  <div className="relative w-40 h-10 bg-black overflow-hidden shrink-0">
                    <img src={banner} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => update({ banners: form.banners.filter((item) => item !== banner) })}
                    className="text-[10px] uppercase tracking-widest text-lee-grey hover:text-red-600"
                  >
                    Remove banner
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Pieces in this sale</h3>
            <p className="text-xs text-lee-grey mb-4">
              The discount comes off the regular price. You can take a piece out later, and its old price comes back when you save.
            </p>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pieces"
              className="w-full md:w-80 h-10 border border-lee-light-grey px-3 text-sm mb-4"
            />
            <div className="grid grid-cols-1 gap-2 mb-6">
              {matches.map((piece) => {
                const taken = busy.find((item) => item.product_id === piece.id && item.sale_id !== form.id);
                return (
                  <div key={piece.id} className="flex items-center justify-between gap-4 border border-lee-light-grey px-3 py-2">
                    <div>
                      <p className="text-sm">{piece.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-lee-grey">
                        {piece.category} · ₦{Number(piece.price).toLocaleString()}
                        {taken ? ` · Already in ${taken.sale_name}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(taken)}
                      onClick={() => update({ product_ids: [...form.product_ids, piece.id] })}
                      className="text-[10px] uppercase tracking-widest disabled:text-lee-grey"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {selected.map((piece) => {
                const nextPrice = priceAfterDiscount(Number(piece.price), Number(form.discount_percent));
                return (
                  <div key={piece.id} className="flex items-center justify-between gap-4 bg-lee-light-grey/30 px-3 py-2">
                    <div>
                      <p className="text-sm font-bold">{piece.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-lee-grey">
                        ₦{Number(piece.price).toLocaleString()} → ₦{nextPrice.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ product_ids: form.product_ids.filter((id) => id !== piece.id) })}
                      className="text-[10px] uppercase tracking-widest text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={saving || saveBlocked}
                className="bg-lee-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save sale"}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="border border-lee-light-grey px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
            {form.id && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="text-[10px] font-bold uppercase tracking-widest text-red-600"
              >
                Delete this sale
              </button>
            )}
          </div>

          {form.slug && (
            <p className="mt-6 text-xs text-lee-grey">
              Page:{" "}
              <Link href={`/shop/${form.slug}`} className="underline" target="_blank">
                leesjewellers.com/shop/{form.slug}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
