-- ============================================================
-- Migração: adiciona suporte a múltiplos itens por pedido
-- Rodar no Supabase SQL Editor (uma vez)
-- ============================================================

-- 1. Tabela order_items
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  quantity    integer not null default 1 check (quantity > 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- 2. RLS
alter table public.order_items enable row level security;

-- Qualquer pessoa pode inserir (mesma política de orders)
create policy "order_items_public_insert"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

-- Apenas admins podem ler/atualizar/deletar
create policy "order_items_admin_select"
  on public.order_items for select
  to authenticated
  using (public.is_admin());

create policy "order_items_admin_update"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_admin_delete"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());
