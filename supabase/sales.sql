-- Sales for Lees Jewellers. Safe to run more than once.

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind text not null default 'Custom',
  discount_percent integer not null,
  banners text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint sales_discount_percent check (discount_percent >= 1 and discount_percent <= 90),
  constraint sales_dates check (ends_at > starts_at),
  constraint sales_needs_banner check (cardinality(banners) >= 1)
);

create table if not exists public.sale_products (
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  previous_on_sale boolean,
  previous_sale_price numeric,
  prices_applied boolean not null default false,
  primary key (sale_id, product_id)
);

create index if not exists sales_slug_idx on public.sales (slug);
create index if not exists sale_products_product_idx on public.sale_products (product_id);

alter table public.sales enable row level security;
alter table public.sale_products enable row level security;

drop policy if exists "Anyone can read sales" on public.sales;
drop policy if exists "Signed-in staff can manage sales" on public.sales;
drop policy if exists "Anyone can read sale products" on public.sale_products;
drop policy if exists "Signed-in staff can manage sale products" on public.sale_products;

create policy "Anyone can read sales"
  on public.sales for select
  using (true);

create policy "Signed-in staff can manage sales"
  on public.sales for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Anyone can read sale products"
  on public.sale_products for select
  using (true);

create policy "Signed-in staff can manage sale products"
  on public.sale_products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

grant select on public.sales to anon, authenticated;
grant select on public.sale_products to anon, authenticated;
grant insert, update, delete on public.sales to authenticated;
grant insert, update, delete on public.sale_products to authenticated;

-- Example December sale. These are real pieces already in the shop.
-- Running this again will not replace a sale you have already changed.

insert into public.sales (
  id, name, slug, kind, discount_percent, banners, starts_at, ends_at, is_active
) values (
  'b7c1a2e0-6f4d-4a1e-9c3b-2d8e5f7a9c10',
  'December Sale',
  'decembersales',
  'December Sale',
  20,
  array[
    '/sales/december-30-days.jpg',
    '/sales/december-gifts.jpg',
    '/sales/december-20-off.jpg'
  ],
  timestamptz '2026-11-22 00:00:00+01',
  timestamptz '2026-12-31 23:59:00+01',
  true
)
on conflict (slug) do nothing;

insert into public.sale_products (
  sale_id, product_id, previous_on_sale, previous_sale_price, prices_applied
)
select
  'b7c1a2e0-6f4d-4a1e-9c3b-2d8e5f7a9c10',
  p.id,
  coalesce(p.on_sale, false),
  p.sale_price,
  true
from public.products p
where p.id in (
  '836db053-f702-465b-b80b-d753c3300da8', -- Costa eyewear camouflage, ₦45,000
  'd78a14ad-d3df-4819-8b3e-0090265d1d9c', -- Hustler Chain, ₦150,000
  '2fae06fb-4a27-47bd-a381-4d0dbdeeb8f6', -- Afnan 9pm Eau De Parfum, ₦45,000
  'd79759a1-5aa9-4d50-b8d1-441fc95bfb59', -- CASIO A158WA-1, ₦200,000
  'ee961f37-59d4-4d3b-96c4-f21d3ed6b158', -- Armaf Club de Nuit Intense Man, ₦60,000
  '33762b54-c45f-49fc-ba71-945f574855a6'  -- hustler x Lee black, ₦35,000
)
on conflict (sale_id, product_id) do nothing;

update public.products p
set
  on_sale = true,
  sale_price = round(p.price * 0.8)
where p.id in (
  select sp.product_id
  from public.sale_products sp
  where sp.sale_id = 'b7c1a2e0-6f4d-4a1e-9c3b-2d8e5f7a9c10'
    and sp.prices_applied = true
)
and (p.on_sale is not true or p.sale_price is null or p.sale_price >= p.price);
