-- ============================================================
-- Rosa Carmen — Dados de teste (seed)
-- ============================================================
-- 6 produtos: 3 normais (um deles sem estoque) + 3 em destaque.
-- Rode este arquivo depois de schema.sql e views.sql.
-- ============================================================

insert into public.products (id, name, description, price, image_url, featured, active) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Buquê Rosa Encanto',
    'Buquê de rosas nacionais em tons de rosa, embalado com papel kraft e laço de cetim.',
    129.90,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    false,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Caixa Surpresa Doce Momento',
    'Caixa presenteável com chocolates finos, vela aromática e cartão personalizado.',
    159.90,
    'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    false,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Arranjo Girassóis do Campo',
    'Arranjo de girassóis frescos em vaso de cerâmica rústica — no momento esgotado.',
    89.90,
    'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    false,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Cesta Premium Rosa Carmen',
    'Cesta luxuosa com espumante, flores selecionadas e chocolates importados.',
    389.90,
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Arranjo Jardim Encantado',
    'Arranjo floral nobre com rosas, astromélias e folhagens em vaso de vidro.',
    249.90,
    'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80',
    true,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Kit Spa & Aromaterapia',
    'Kit com difusor aromático, vela artesanal e sais de banho perfumados.',
    219.90,
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80',
    true,
    true
  );

insert into public.stock_items (product_id, item_name, quantity) values
  ('11111111-1111-1111-1111-111111111111', 'Buquê tamanho único', 12),
  ('11111111-1111-1111-1111-111111111111', 'Laço extra de cetim rosa', 20),

  ('22222222-2222-2222-2222-222222222222', 'Caixa tamanho P', 8),
  ('22222222-2222-2222-2222-222222222222', 'Caixa tamanho M', 5),
  ('22222222-2222-2222-2222-222222222222', 'Vela aromática avulsa', 15),

  -- produto sem estoque: não deve aparecer em active_products
  ('33333333-3333-3333-3333-333333333333', 'Arranjo padrão', 0),
  ('33333333-3333-3333-3333-333333333333', 'Vaso de cerâmica extra', 0),

  ('44444444-4444-4444-4444-444444444444', 'Cesta completa', 4),
  ('44444444-4444-4444-4444-444444444444', 'Espumante avulso', 10),

  ('55555555-5555-5555-5555-555555555555', 'Arranjo padrão', 7),
  ('55555555-5555-5555-5555-555555555555', 'Vaso de vidro', 9),
  ('55555555-5555-5555-5555-555555555555', 'Folhagem extra', 6),

  ('66666666-6666-6666-6666-666666666666', 'Kit completo', 11),
  ('66666666-6666-6666-6666-666666666666', 'Difusor avulso', 14);
