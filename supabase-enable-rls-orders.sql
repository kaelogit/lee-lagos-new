-- Run this in Supabase SQL Editor to fix the linter errors:
-- "Policy Exists RLS Disabled" and "RLS Disabled in Public" for orders & order_items.
--
-- You already have policies ("Guests can create orders", "Guests can add items").
-- Enabling RLS makes those policies active so the table is properly protected.

-- Enable RLS on orders (your policy will control who can insert/select)
ALTER TABLE public.orders
  ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items (your policy will control who can insert/select)
ALTER TABLE public.order_items
  ENABLE ROW LEVEL SECURITY;
