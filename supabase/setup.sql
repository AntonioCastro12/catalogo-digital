-- Fernanda Lara: catálogo, fotografías y permisos para Supabase.
-- Ejecuta este archivo completo una vez desde SQL Editor en Supabase.

create table if not exists public.products (
  id bigint primary key,
  code text not null unique,
  name text not null,
  description text not null default '',
  category text not null check (category in ('Ropa', 'Calzado', 'Lotes')),
  subcategory text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  previous_price numeric(12, 2) check (previous_price is null or previous_price >= 0),
  is_offer boolean not null default false,
  available boolean not null default true,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  pieces integer check (pieces is null or pieces >= 0),
  lot_contents text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  sold_at timestamptz not null default now(),
  customer_name text,
  notes text,
  total numeric(12, 2) not null check (total >= 0),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id bigint generated always as identity primary key,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  product_code text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_position_idx
  on public.product_images(product_id, position);

create index if not exists sales_sold_at_idx
  on public.sales(sold_at desc);

create index if not exists sales_created_by_idx
  on public.sales(created_by);

create index if not exists sale_items_sale_id_idx
  on public.sale_items(sale_id);

create index if not exists sale_items_product_id_idx
  on public.sale_items(product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.admin_users enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_catalog_admin() from public;
grant execute on function private.is_catalog_admin() to authenticated;

drop policy if exists "Catalogo visible para todos" on public.products;
create policy "Catalogo visible para todos"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Administrador crea productos" on public.products;
create policy "Administrador crea productos"
on public.products for insert
to authenticated
with check ((select private.is_catalog_admin()));

drop policy if exists "Administrador actualiza productos" on public.products;
create policy "Administrador actualiza productos"
on public.products for update
to authenticated
using ((select private.is_catalog_admin()))
with check ((select private.is_catalog_admin()));

drop policy if exists "Administrador elimina productos" on public.products;
create policy "Administrador elimina productos"
on public.products for delete
to authenticated
using ((select private.is_catalog_admin()));

drop policy if exists "Fotos visibles para todos" on public.product_images;
create policy "Fotos visibles para todos"
on public.product_images for select
to anon, authenticated
using (true);

drop policy if exists "Administrador crea fotos" on public.product_images;
create policy "Administrador crea fotos"
on public.product_images for insert
to authenticated
with check ((select private.is_catalog_admin()));

drop policy if exists "Administrador actualiza fotos" on public.product_images;
create policy "Administrador actualiza fotos"
on public.product_images for update
to authenticated
using ((select private.is_catalog_admin()))
with check ((select private.is_catalog_admin()));

drop policy if exists "Administrador elimina fotos" on public.product_images;
create policy "Administrador elimina fotos"
on public.product_images for delete
to authenticated
using ((select private.is_catalog_admin()));

drop policy if exists "Administrador consulta ventas" on public.sales;
create policy "Administrador consulta ventas"
on public.sales for select
to authenticated
using ((select private.is_catalog_admin()));

drop policy if exists "Administrador crea ventas" on public.sales;
create policy "Administrador crea ventas"
on public.sales for insert
to authenticated
with check (
  (select private.is_catalog_admin())
  and created_by = (select auth.uid())
);

drop policy if exists "Administrador elimina ventas" on public.sales;
create policy "Administrador elimina ventas"
on public.sales for delete
to authenticated
using ((select private.is_catalog_admin()));

drop policy if exists "Administrador consulta partidas" on public.sale_items;
create policy "Administrador consulta partidas"
on public.sale_items for select
to authenticated
using ((select private.is_catalog_admin()));

drop policy if exists "Administrador crea partidas" on public.sale_items;
create policy "Administrador crea partidas"
on public.sale_items for insert
to authenticated
with check ((select private.is_catalog_admin()));

drop policy if exists "Administrador elimina partidas" on public.sale_items;
create policy "Administrador elimina partidas"
on public.sale_items for delete
to authenticated
using ((select private.is_catalog_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Fotos publicas del catalogo" on storage.objects;
create policy "Fotos publicas del catalogo"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Administrador sube fotos" on storage.objects;
create policy "Administrador sube fotos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (select private.is_catalog_admin()));

drop policy if exists "Administrador reemplaza fotos" on storage.objects;
create policy "Administrador reemplaza fotos"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (select private.is_catalog_admin()))
with check (bucket_id = 'product-images' and (select private.is_catalog_admin()));

drop policy if exists "Administrador elimina fotos almacenadas" on storage.objects;
create policy "Administrador elimina fotos almacenadas"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (select private.is_catalog_admin()));

-- Permisos explícitos para la Data API (RLS sigue siendo la autorización final).
grant usage on schema public to anon, authenticated;
grant select on table public.products, public.product_images to anon, authenticated;
grant insert, update, delete on table public.products, public.product_images to authenticated;
grant select, insert, delete on table public.sales, public.sale_items to authenticated;
grant usage, select on sequence public.product_images_id_seq, public.sale_items_id_seq to authenticated;
revoke all on table public.sales, public.sale_items from anon;

-- Limpia la función pública usada por versiones anteriores del archivo.
drop function if exists public.is_catalog_admin();

-- Después de crear a Fernanda en Authentication > Users, autorízala una sola vez:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'CORREO_DE_FERNANDA';

-- Productos ficticios iniciales. Se conservan los cambios si vuelves a ejecutar el archivo.
insert into public.products
  (id, code, name, description, category, subcategory, price, previous_price, is_offer, available, sizes, colors, pieces, lot_contents)
values
  (1, 'R-025', 'Vestido Lino Rosé', 'Vestido midi de caída suave con tirantes ajustables y una silueta que acompaña el movimiento.', 'Ropa', 'Vestidos', 450, 650, true, true, array['CH','M','G','EG'], array['Rosa','Beige','Negro'], null, null),
  (2, 'R-031', 'Blusa Serena', 'Blusa ligera con manga amplia y textura sutil.', 'Ropa', 'Blusas', 380, null, false, true, array['CH','M','G'], array['Marfil','Rosa','Café'], null, null),
  (3, 'R-042', 'Conjunto Arena', 'Conjunto de dos piezas en tono neutro, cómodo y pulido.', 'Ropa', 'Conjuntos', 720, null, false, true, array['CH','M','G'], array['Arena','Olivo'], null, null),
  (4, 'C-018', 'Tenis Aura', 'Tenis urbanos de líneas limpias con suela ligera.', 'Calzado', 'Tenis', 750, null, false, true, array['24','25','26','27','28'], array['Blanco','Rosa'], null, null),
  (5, 'C-023', 'Sandalia Emilia', 'Sandalia de tacón medio con tiras delicadas.', 'Calzado', 'Sandalias', 590, 780, true, true, array['23','24','25','26','27'], array['Nude','Negro'], null, null),
  (6, 'C-029', 'Botín Olivia', 'Botín de acabado mate y tacón estable.', 'Calzado', 'Botines', 890, null, false, false, array['24','25','26','27'], array['Camel','Negro'], null, null),
  (7, 'L-015', 'Lote Boutique Rosé', 'Selección curada para iniciar o renovar tu inventario.', 'Lotes', 'Mixto', 2500, 2900, true, true, '{}', '{}', 25, array['8 blusas','5 vestidos','7 pantalones','5 conjuntos']),
  (8, 'L-021', 'Lote Esencial Neutro', 'Lote versátil en una paleta neutra.', 'Lotes', 'Ropa', 3200, null, false, true, '{}', '{}', 30, array['10 blusas','8 pantalones','6 vestidos','6 faldas']),
  (9, 'R-056', 'Falda Magnolia', 'Falda midi con volumen sutil, pretina definida y textura ligera.', 'Ropa', 'Faldas', 420, 520, true, true, array['CH','M','G'], array['Marfil','Rosa viejo'], null, null)
on conflict (id) do nothing;

insert into public.product_images (product_id, image_url, position)
select seed.product_id, seed.image_url, seed.position
from (values
  (1::bigint, 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=86', 0),
  (2::bigint, 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=1000&q=86', 0),
  (3::bigint, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=86', 0),
  (4::bigint, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=86', 0),
  (5::bigint, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1000&q=86', 0),
  (6::bigint, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=86', 0),
  (7::bigint, 'https://images.unsplash.com/photo-1668011372564-fc933d6c84d8?auto=format&fit=crop&w=1400&q=86', 0),
  (8::bigint, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=86', 0),
  (9::bigint, 'https://images.unsplash.com/photo-1583496661160-fb5886a13d27?auto=format&fit=crop&w=1000&q=86', 0)
) as seed(product_id, image_url, position)
where not exists (
  select 1 from public.product_images existing
  where existing.product_id = seed.product_id
);
