-- Run this in Supabase SQL Editor.
-- Goal: allow deleting products even if they were used in past orders,
-- while keeping order history intact.
--
-- order_items already stores product_name and price_at_purchase, so we
-- can safely drop the hard link when a product is removed.

-- 1) Make sure product_id can be NULL (if it's currently NOT NULL)
ALTER TABLE public.order_items
  ALTER COLUMN product_id DROP NOT NULL;

-- 2) Drop the old foreign key that blocks deletes
ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS "order_items_product_id_key";

-- 3) Re-create the foreign key with ON DELETE SET NULL
--    so deleting a product just clears product_id on existing items.
ALTER TABLE public.order_items
  ADD CONSTRAINT "order_items_product_id_fkey"
  FOREIGN KEY (product_id)
  REFERENCES public.products(id)
  ON DELETE SET NULL;

