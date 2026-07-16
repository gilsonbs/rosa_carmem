-- ============================================================
-- Rosa Carmen — Views (Supabase / Postgres)
-- ============================================================

-- ------------------------------------------------------------
-- active_products
--
-- Expõe apenas produtos com active = true E que tenham ao menos
-- um stock_item com quantity > 0. Isso mantém a regra de estoque
-- fora do frontend: a vitrine consulta esta view, nunca a tabela
-- "products" diretamente.
--
-- IMPORTANTE sobre segurança:
-- Esta view é criada deliberadamente SEM "security_invoker" (ou
-- seja, roda com o privilégio do dono da view, o papel "postgres").
-- Isso é necessário porque a tabela stock_items tem RLS restrita
-- apenas a admins — se a view rodasse como o papel "anon", o JOIN
-- de EXISTS contra stock_items retornaria sempre vazio para o
-- público, e nenhum produto apareceria na vitrine.
-- A view não vaza dados sensíveis: ela só retorna colunas de
-- "products" (já públicas via RLS para active = true) e usa
-- stock_items apenas para checar existência de estoque, sem expor
-- suas linhas.
-- ------------------------------------------------------------

create or replace view public.active_products
with (security_invoker = false)
as
select p.*
from public.products p
where p.active = true
  and exists (
    select 1
    from public.stock_items si
    where si.product_id = p.id
      and si.quantity > 0
  );

grant select on public.active_products to anon, authenticated;
