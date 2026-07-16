-- ============================================================
-- Rosa Carmen — Supabase Storage (fotos de produtos)
-- ============================================================
-- Rode este script no SQL Editor do Supabase depois de já ter
-- aplicado schema.sql (precisa da função public.is_admin()).

-- Bucket público para as fotos dos produtos
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Leitura pública (qualquer pessoa pode ver as fotos na vitrine)
create policy "products_bucket_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

-- Upload/atualização/remoção apenas por admins autenticados
create policy "products_bucket_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());
