-- Adiciona campo archived para arquivar pedidos entregues do Kanban
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;
