-- Run this in Supabase SQL Editor.
-- After enabling RLS on orders & order_items, only policies allow access.
-- Your existing policies let guests INSERT (checkout). Add these so the
-- ADMIN (authenticated) can read and update orders.

-- 1. Admin can read all orders (Overview + Orders page)
CREATE POLICY "Allow authenticated to read orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Admin can update order status (e.g. Processing → Shipped)
CREATE POLICY "Allow authenticated to update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Admin can read order items (so order details show in admin)
CREATE POLICY "Allow authenticated to read order_items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (true);
