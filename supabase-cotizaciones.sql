-- Tabla de Cotizaciones (seguimiento de conversión de ventas)
create table public.cotizaciones (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  nombre_cliente text not null,
  telefono_cliente text,
  ramo text not null,
  companias_cotizadas text not null,
  estado text not null default 'PENDIENTE', -- VENDIDO, NO_VENDIDO, PENDIENTE
  observacion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security
alter table public.cotizaciones enable row level security;

-- Políticas de Seguridad
create policy "Los usuarios pueden ver sus propias cotizaciones"
  on public.cotizaciones for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar sus propias cotizaciones"
  on public.cotizaciones for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden editar sus propias cotizaciones"
  on public.cotizaciones for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propias cotizaciones"
  on public.cotizaciones for delete
  using (auth.uid() = user_id);

-- Índices
create index cotizaciones_user_id_idx on public.cotizaciones (user_id);
create index cotizaciones_estado_idx on public.cotizaciones (estado);
create index cotizaciones_created_at_idx on public.cotizaciones (created_at desc);
