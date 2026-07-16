-- ============================================================
-- Migração: estoque compartilhado por componentes (BOM)
-- Rodar no Supabase SQL Editor (uma vez)
-- ============================================================

-- 1. Componentes globais (rosas, vasos, cestas etc.)
create table if not exists public.components (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  quantity    integer not null default 0 check (quantity >= 0),
  created_at  timestamptz not null default now()
);

-- 2. Receita por produto: quantas unidades de cada componente por unidade vendida
create table if not exists public.product_components (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  component_id      uuid not null references public.components(id) on delete restrict,
  required_quantity integer not null default 1 check (required_quantity > 0),
  created_at        timestamptz not null default now(),
  unique (product_id, component_id)
);

create index if not exists idx_product_components_product_id on public.product_components (product_id);
create index if not exists idx_product_components_component_id on public.product_components (component_id);

-- 3. RLS
alter table public.components enable row level security;
alter table public.product_components enable row level security;

-- Componentes: leitura pública (vitrine precisa calcular estoque), escrita só admin
create policy "components_public_select"
  on public.components for select
  to anon, authenticated
  using (true);

create policy "components_admin_write"
  on public.components for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Receita: leitura pública, escrita só admin
create policy "product_components_public_select"
  on public.product_components for select
  to anon, authenticated
  using (true);

create policy "product_components_admin_write"
  on public.product_components for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Atualiza a view active_products para usar a nova lógica de estoque.
--    Um produto aparece na vitrine quando:
--      (a) active = true
--      (b) tem ao menos um product_component cadastrado
--      (c) nenhum componente tem quantidade inferior ao mínimo necessário
--          para produzir 1 unidade
create or replace view public.active_products
with (security_invoker = false)
as
select p.*
from public.products p
where p.active = true
  and exists (
    select 1 from public.product_components pc
    where pc.product_id = p.id
  )
  and not exists (
    select 1 from public.product_components pc
    join public.components c on c.id = pc.component_id
    where pc.product_id = p.id
      and c.quantity < pc.required_quantity
  );

-- 5. (Opcional) Migra dados existentes de stock_items → components + product_components
--    Execute esta parte APENAS se quiser preservar o estoque atual.
--    Descomente o bloco abaixo:

/*
do $$
declare
  r record;
  comp_id uuid;
begin
  for r in
    select distinct item_name from public.stock_items
  loop
    insert into public.components (name, quantity)
    select r.item_name, coalesce(sum(quantity), 0)
    from public.stock_items
    where item_name = r.item_name
    on conflict (name) do nothing;
  end loop;

  for r in
    select si.product_id, si.item_name, 1 as required_quantity
    from public.stock_items si
  loop
    select id into comp_id from public.components where name = r.item_name;
    if comp_id is not null then
      insert into public.product_components (product_id, component_id, required_quantity)
      values (r.product_id, comp_id, r.required_quantity)
      on conflict (product_id, component_id) do nothing;
    end if;
  end loop;
end;
$$;
*/
