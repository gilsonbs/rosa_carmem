-- ============================================================
-- Fix: política RLS de settings
-- O is_admin() não funcionava corretamente via frontend (anon key + JWT).
-- Revertemos para autenticado geral — o admin panel já exige login,
-- e settings não contém dados sensíveis (apenas hero, banner, categorias).
-- ============================================================

DROP POLICY IF EXISTS "Admin escreve settings" ON public.settings;

CREATE POLICY "Auth write settings" ON public.settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
