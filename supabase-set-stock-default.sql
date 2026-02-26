-- Run this in Supabase SQL Editor to set stock default to 0 and keep in_stock in sync.
-- New products will start with stock 0 and not show on the storefront until admin sets stock.

-- 1. Set default value for stock to 0 (for new rows)
ALTER TABLE public.products
  ALTER COLUMN stock SET DEFAULT 0;

-- 2. (Optional) Ensure in_stock is false when stock is 0 for existing rows
UPDATE public.products
  SET in_stock = (stock > 0)
  WHERE stock <= 0 OR in_stock IS NULL;
