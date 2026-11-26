-- ============================================================
-- Zonas de entrega com taxa por região
-- Rodar no Supabase SQL Editor (uma vez)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality  TEXT NOT NULL,
  zone_name     TEXT NOT NULL,
  fee           DECIMAL(10, 2) NOT NULL CHECK (fee >= 0),
  display_order INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_order ON public.delivery_zones (display_order);

-- ------------------------------------------------------------
-- RLS: leitura pública, escrita apenas admins
-- ------------------------------------------------------------
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_zones_public_select" ON public.delivery_zones;
CREATE POLICY "delivery_zones_public_select"
  ON public.delivery_zones FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "delivery_zones_admin_all" ON public.delivery_zones;
CREATE POLICY "delivery_zones_admin_all"
  ON public.delivery_zones FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- Zonas iniciais (só insere se a tabela estiver vazia)
-- ------------------------------------------------------------
INSERT INTO public.delivery_zones (municipality, zone_name, fee, display_order)
SELECT * FROM (VALUES
  ('Rio das Ostras', 'Vila Verde', 40.00, 1),
  ('Rio das Ostras', 'Recanto → Vila Verde', 20.00, 2),
  ('Rio das Ostras', 'Recanto → Centro', 12.00, 3),
  ('Rio das Ostras', 'Nova Cidade → Marilea', 15.00, 4),
  ('Rio das Ostras', 'Âncora → Enseada', 20.00, 5),
  ('Rio das Ostras', 'Mar do Norte → Alphaville', 30.00, 6),
  ('Macaé', 'Zen → Centro', 40.00, 7),
  ('Macaé', 'Centro → HPM', 50.00, 8),
  ('Macaé', 'HPM → Ponte', 60.00, 9),
  ('Macaé', 'Aeroporto', 70.00, 10),
  ('Barra de São João', 'Cidade inteira', 30.00, 11),
  ('Unamar', 'Até o Shopping', 40.00, 12),
  ('Unamar', 'Shopping → final', 50.00, 13),
  ('Casimiro', 'Cidade inteira', 60.00, 14)
) AS v(municipality, zone_name, fee, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.delivery_zones);
