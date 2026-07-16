-- ============================================================
-- Rosa Carmen — Histórico automático de status + Realtime em orders (Dia 6)
-- Rode este script manualmente no SQL Editor do Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Trigger: registra em order_status_history toda vez que
-- orders.order_status muda, não importa a origem (app, script,
-- suporte). Isso substitui o insert manual que o front-end fazia —
-- a partir de agora o front só faz o UPDATE em orders.
-- ------------------------------------------------------------

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.order_status is distinct from new.order_status then
    insert into public.order_status_history (order_id, status, changed_at)
    values (new.id, new.order_status, now());
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_order_status_change on public.orders;

create trigger trigger_order_status_change
after update on public.orders
for each row
execute function public.log_order_status_change();

-- ------------------------------------------------------------
-- 2) Publicar "orders" para o Realtime
-- Necessário para o Kanban (sincronia entre admins) e para a
-- notificação de novos pedidos na sidebar (INSERT).
-- A policy "orders_admin_select" já restringe os eventos a
-- usuários autenticados admin, então isso não vaza pedidos para
-- clientes anônimos.
-- ------------------------------------------------------------

alter publication supabase_realtime add table public.orders;
