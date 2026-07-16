-- ============================================================
-- Rosa Carmen — Schema do banco de dados (Supabase / Postgres)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabelas
-- ------------------------------------------------------------

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  image_url   text,
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.stock_items (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  item_name   text not null,
  quantity    integer not null default 0 check (quantity >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id                          uuid primary key default gen_random_uuid(),
  customer_id                 uuid not null references public.customers (id) on delete restrict,
  product_id                  uuid not null references public.products (id) on delete restrict,
  amount                      numeric(10, 2) not null check (amount >= 0),
  payment_status              text not null default 'pending'
                                check (payment_status in ('pending', 'approved', 'rejected', 'refunded')),
  order_status                text not null default 'new'
                                check (order_status in ('new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  street                      text not null,
  number                      text not null,
  complement                  text,
  neighborhood                text not null,
  city                        text not null,
  state                       text not null,
  zip_code                    text not null,
  delivery_date               date,
  delivery_time               time,
  mercadopago_preference_id  text,
  mercadopago_payment_id     text,
  created_at                  timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      text not null,
  changed_at  timestamptz not null default now()
);

create table if not exists public.admins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  name        text not null,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------

create index if not exists idx_products_active on public.products (active);
create index if not exists idx_products_featured on public.products (featured);
create index if not exists idx_stock_items_product_id on public.stock_items (product_id);
create index if not exists idx_orders_customer_id on public.orders (customer_id);
create index if not exists idx_orders_product_id on public.orders (product_id);
create index if not exists idx_orders_order_status on public.orders (order_status);
create index if not exists idx_order_status_history_order_id on public.order_status_history (order_id);

-- ------------------------------------------------------------
-- Helper: verifica se o usuário autenticado é admin
-- SECURITY DEFINER evita recursão de RLS ao consultar public.admins
-- ------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.products enable row level security;
alter table public.stock_items enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.admins enable row level security;

-- products: leitura pública (o Realtime avalia esta policy contra a linha
-- NOVA de cada evento — restringir a "active = true" impediria o cliente de
-- receber o próprio UPDATE que desativa um produto). Não há colunas
-- sensíveis aqui; a vitrine filtra active+estoque via a view active_products.
create policy "products_public_select"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products_admin_all"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- stock_items: apenas admins
create policy "stock_items_admin_all"
  on public.stock_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- customers: insert público, select/update apenas admins
create policy "customers_public_insert"
  on public.customers for insert
  to anon, authenticated
  with check (true);

create policy "customers_admin_select"
  on public.customers for select
  to authenticated
  using (public.is_admin());

create policy "customers_admin_update"
  on public.customers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- orders: insert público (qualquer um pode criar pedido), select/update apenas admins
create policy "orders_public_insert"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "orders_admin_select"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- order_status_history: apenas admins
create policy "order_status_history_admin_all"
  on public.order_status_history for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- admins: apenas admins
create policy "admins_admin_all"
  on public.admins for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- Realtime: a vitrine escuta UPDATE em products para remover da tela um
-- produto assim que ele é desativado por falta de estoque (ver
-- src/hooks/useProducts.ts).
-- ------------------------------------------------------------

alter publication supabase_realtime add table public.products;
