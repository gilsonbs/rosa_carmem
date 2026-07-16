-- ============================================================
-- Rosa Carmen — Realtime na vitrine (Dia 4)
-- Rode este script manualmente no SQL Editor do Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Ajuste de RLS em "products"
--
-- A policy "products_public_select_active" restringia o SELECT direto na
-- tabela a `active = true`. O Supabase Realtime (postgres_changes) usa essa
-- mesma policy para decidir se um evento pode ser entregue ao role "anon" —
-- e ele avalia a policy contra a LINHA NOVA do evento. Ou seja: exatamente
-- o UPDATE que muda active de true para false (o que precisamos escutar
-- para remover o produto da vitrine em tempo real) tem a linha nova com
-- active = false, falha na policy `using (active = true)` e o evento nunca
-- chegaria ao navegador do cliente.
--
-- A tabela "products" não tem colunas sensíveis (nome, descrição, preço,
-- imagem — tudo já é público via a view active_products), então liberar o
-- SELECT completo da tabela para anon/authenticated não vaza nada novo; a
-- vitrine continua filtrando por active+estoque através da view.
-- ------------------------------------------------------------

drop policy if exists "products_public_select_active" on public.products;

create policy "products_public_select"
  on public.products for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------
-- 2) Publicar a tabela para o Realtime
-- Sem isso, nenhum evento de "products" é emitido, independente de RLS.
-- ------------------------------------------------------------

alter publication supabase_realtime add table public.products;
