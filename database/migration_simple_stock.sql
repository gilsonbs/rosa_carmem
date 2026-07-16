-- ============================================================
-- Migração: estoque simples por produto
-- Rodar no Supabase SQL Editor (uma vez)
-- ============================================================

-- 1. Adiciona coluna stock diretamente na tabela products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);

-- 2. Atualiza a view active_products:
--    produto aparece na vitrine quando active = true E stock > 0
CREATE OR REPLACE VIEW public.active_products
WITH (security_invoker = false) AS
SELECT * FROM public.products
WHERE active = true AND stock > 0;
