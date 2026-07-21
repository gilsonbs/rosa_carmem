-- ============================================================
-- Migração: tabela settings para configurações globais (hero, etc.)
-- Rodar no Supabase SQL Editor (uma vez)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  key  TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública (vitrine carrega configurações do hero)
CREATE POLICY "Public read settings" ON public.settings
  FOR SELECT USING (true);

-- Escrita apenas para usuários autenticados (admin)
CREATE POLICY "Auth write settings" ON public.settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Valor padrão do hero
INSERT INTO public.settings (key, value)
VALUES ('hero', '{"product_ids": [], "auto_advance": true, "interval_seconds": 5}')
ON CONFLICT (key) DO NOTHING;
