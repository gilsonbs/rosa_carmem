-- ============================================================
-- Migração: coluna category na tabela products
-- Rodar no Supabase SQL Editor (uma vez)
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;
