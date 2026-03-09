-- Habilitar extensión para UUIDs
create extension if not exists "uuid-ossp";

-- Crear la tabla de Polizas
create table public.polizas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- Vínculo fundamental con la sesión activa
  estado text not null,
  telefono text,
  codigo text not null,
  fecha text,
  asegurado text not null,
  compania text not null,
  numero_poliza text not null,
  cobertura text,
  vencimiento text,
  costo_mensual text, -- Guardaremos el texto formateado o numérico (ajustado al excel)
  observacion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Restricción opcional para asegurar que no se dupliquen pólizas únicas por cliente/usuario
  unique(user_id, codigo)
);

-- Habilitar Row Level Security (RLS)
alter table public.polizas enable row level security;

-- Políticas de Seguridad (Policies)
-- 1. Un usuario solo puede VER sus propias pólizas
create policy "Los usuarios pueden ver sus propias pólizas"
  on public.polizas for select
  using (auth.uid() = user_id);

-- 2. Un usuario solo puede INSERTAR pólizas suyas
create policy "Los usuarios pueden insertar sus propias pólizas"
  on public.polizas for insert
  with check (auth.uid() = user_id);

-- 3. Un usuario solo puede ACTUALIZAR sus propias pólizas
create policy "Los usuarios pueden editar sus propias pólizas"
  on public.polizas for update
  using (auth.uid() = user_id);

-- 4. Un usuario solo puede ELIMINAR sus propias pólizas
create policy "Los usuarios pueden eliminar sus propias pólizas"
  on public.polizas for delete
  using (auth.uid() = user_id);

-- (Opcional pero Recomendado) Crear índices para acelerar búsquedas
create index polizas_user_id_idx on public.polizas (user_id);
create index polizas_estado_idx on public.polizas (estado);
