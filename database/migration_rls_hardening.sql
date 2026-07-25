-- ============================================================
-- RLS Hardening — Rosa Carmen
-- Executar no SQL Editor do painel Supabase
--
-- Contexto: o backend usa supabaseAdmin (service_role) para
-- todas as escritas em orders, customers e order_items.
-- service_role bypassa RLS completamente, então as políticas
-- de insert público abaixo são desnecessárias e representam
-- um risco: qualquer pessoa com a anon-key (visível no bundle)
-- poderia inserir pedidos falsos como 'approved' ou poluir
-- a tabela de clientes com dados falsos.
-- ============================================================

-- 1. Remove insert público de customers
--    (o backend insere via service_role — esta policy é desnecessária)
drop policy if exists "customers_public_insert" on public.customers;

-- 2. Remove insert público de orders
--    RISCO REAL: sem esta remoção, qualquer pessoa poderia fazer:
--    supabase.from('orders').insert({ payment_status: 'approved', ... })
--    e criar pedidos confirmados sem pagar.
drop policy if exists "orders_public_insert" on public.orders;

-- 3. Remove insert público de order_items
drop policy if exists "order_items_public_insert" on public.order_items;

-- 4. Corrige settings: a policy anterior usava auth.role() = 'authenticated'
--    o que permite que QUALQUER usuário autenticado (não só admins)
--    altere hero, categorias e banner. Substitui por is_admin().
drop policy if exists "Auth write settings" on public.settings;

create policy "Admin escreve settings"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Verificação (opcional — rode depois para confirmar)
-- ============================================================
-- select schemaname, tablename, policyname, roles, cmd, qual
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, cmd;
