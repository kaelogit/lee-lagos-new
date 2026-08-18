-- Run this in Supabase SQL Editor to track pre-order items on orders

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS is_preorder boolean DEFAULT false;

-- Optional: index for admin queries on pre-orders
CREATE INDEX IF NOT EXISTS order_items_is_preorder_idx ON public.order_items (is_preorder)
WHERE is_preorder = true;
