-- ============================================================
-- Migração: mensagem do cartão + taxa de entrega nos pedidos
-- Rodar no Supabase SQL Editor (uma vez) — DEPOIS de delivery_zones.sql
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS personal_message TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone_id ON public.orders (delivery_zone_id);
