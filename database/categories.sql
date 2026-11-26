-- ============================================================
-- Categorias de produtos (N:N) — substitui settings.categories
-- e a coluna products.category (mantida, mas não mais usada).
-- Rodar no Supabase SQL Editor (uma vez). Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  image_url     TEXT,                       -- foto do círculo na home
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
  ON public.product_categories (category_id);

-- ------------------------------------------------------------
-- RLS: leitura pública, escrita apenas admins
-- ------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_select" ON public.categories;
CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_categories_public_select" ON public.product_categories;
CREATE POLICY "product_categories_public_select"
  ON public.product_categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "product_categories_admin_all" ON public.product_categories;
CREATE POLICY "product_categories_admin_all"
  ON public.product_categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 1. Migra as categorias já configuradas no admin (settings.categories),
--    mantendo nome, foto e ordem.
-- ------------------------------------------------------------
INSERT INTO public.categories (name, slug, image_url, display_order)
SELECT t.elem->>'label', t.elem->>'value', NULLIF(t.elem->>'image', ''), t.ord::int
FROM public.settings s,
     jsonb_array_elements(s.value) WITH ORDINALITY AS t(elem, ord)
WHERE s.key = 'categories'
  AND jsonb_typeof(s.value) = 'array'
  AND coalesce(t.elem->>'value', '') <> ''
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Garante uma categoria para todo valor usado em products.category
--    (cobre lojas que nunca salvaram a tela de categorias e usavam
--    a lista padrão do código).
-- ------------------------------------------------------------
INSERT INTO public.categories (name, slug, display_order)
SELECT DISTINCT
  CASE p.category
    WHEN 'flores' THEN 'Flores'
    WHEN 'cestas' THEN 'Cestas'
    WHEN 'corporativo' THEN 'Corporativo'
    WHEN 'personalizados' THEN 'Personalizados'
    WHEN 'coffee_break' THEN 'Coffee Break'
    WHEN 'pronta_entrega' THEN 'Pronta Entrega'
    ELSE initcap(replace(p.category, '_', ' '))
  END,
  p.category,
  50
FROM public.products p
WHERE coalesce(p.category, '') <> ''
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 3. Categorias pedidas pelo cliente
-- ------------------------------------------------------------
INSERT INTO public.categories (name, slug, display_order) VALUES
  ('Flores', 'flores', 100),
  ('Chocolates', 'chocolates', 101),
  ('Kits', 'kits', 102),
  ('Perfumes', 'perfumes', 103),
  ('Personalizados', 'personalizados', 104)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 4. Vincula os produtos à categoria que já tinham
-- ------------------------------------------------------------
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
JOIN public.categories c ON c.slug = p.category
ON CONFLICT DO NOTHING;
