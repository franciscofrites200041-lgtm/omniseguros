-- Tabla de Siniestros
create table public.siniestros (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  nombre_cliente text not null,
  telefono_cliente text,
  ramo text not null,
  compania text not null,
  resuelto boolean not null default false,
  fecha_resolucion text,
  nota text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.siniestros enable row level security;

create policy "Ver propios siniestros"
  on public.siniestros for select using (auth.uid() = user_id);

create policy "Insertar propios siniestros"
  on public.siniestros for insert with check (auth.uid() = user_id);

create policy "Editar propios siniestros"
  on public.siniestros for update using (auth.uid() = user_id);

create policy "Eliminar propios siniestros"
  on public.siniestros for delete using (auth.uid() = user_id);

create index siniestros_user_id_idx on public.siniestros (user_id);
create index siniestros_resuelto_idx on public.siniestros (resuelto);
create index siniestros_created_at_idx on public.siniestros (created_at desc);
