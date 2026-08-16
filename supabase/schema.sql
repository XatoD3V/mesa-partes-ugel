-- ============================================================================
-- MESA DE PARTES VIRTUAL - UGEL
-- Esquema completo para Supabase (Postgres + Auth + Storage + RLS + Realtime)
-- Ejecutar completo en: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================================

-- ---------- 1. TIPOS ---------------------------------------------------------
do $$ begin
  create type rol_usuario as enum ('externo', 'mesa_partes', 'jefe_oficina', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_documento as enum (
    'recibido',        -- registrado en mesa de partes, aún no derivado
    'derivado',        -- enviado a una oficina
    'en_proceso',      -- la oficina lo está atendiendo
    'observado',       -- requiere subsanación por parte del usuario
    'atendido',        -- resuelto / respondido
    'archivado'        -- cerrado y archivado
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type prioridad_documento as enum ('normal', 'urgente');
exception when duplicate_object then null; end $$;

-- ---------- 2. OFICINAS -------------------------------------------------------
create table if not exists public.oficinas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,              -- ej: 'RRHH', 'MESA_PARTES'
  nombre text not null,
  descripcion text,
  orden int not null default 100,           -- RRHH = 1 (oficina principal)
  es_mesa_partes boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.oficinas is 'Oficinas / áreas de la UGEL que reciben y atienden documentos';

-- ---------- 3. PERFILES (extiende auth.users) --------------------------------
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombres text not null,
  apellidos text not null,
  tipo_documento text default 'DNI',
  numero_documento text,
  telefono text,
  email text,
  rol rol_usuario not null default 'externo',
  oficina_id uuid references public.oficinas(id) on delete set null, -- null si es 'externo'
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.perfiles is 'Datos de cada usuario del sistema: ciudadanos/docentes (externo) y personal de la UGEL';

-- ---------- 4. DOCUMENTOS (expedientes) ---------------------------------------
create sequence if not exists public.correlativo_expediente start 1;

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  codigo_expediente text unique not null,
  asunto text not null,
  tipo_documento text not null,             -- Solicitud, Oficio, Carta, Expediente, Queja, etc.
  descripcion text,
  numero_folios int default 1,
  prioridad prioridad_documento not null default 'normal',
  archivo_url text,                          -- Storage: bucket 'documentos'
  archivo_nombre text,
  usuario_emisor_id uuid not null references public.perfiles(id),
  oficina_actual_id uuid references public.oficinas(id),  -- oficina donde está actualmente
  estado estado_documento not null default 'recibido',
  observacion_actual text,
  creado_por_mesa_partes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.documentos is 'Expedientes / documentos ingresados a la UGEL';

-- ---------- 5. DERIVACIONES (flujo entre oficinas) -----------------------------
create table if not exists public.derivaciones (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references public.documentos(id) on delete cascade,
  oficina_origen_id uuid references public.oficinas(id),
  oficina_destino_id uuid not null references public.oficinas(id),
  derivado_por uuid not null references public.perfiles(id),
  observacion text,
  archivos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.derivaciones is 'Historial de derivaciones (a qué oficina pasó cada expediente y quién lo derivó)';

-- ---------- 6. HISTORIAL / TRAZABILIDAD ---------------------------------------
create table if not exists public.documento_historial (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references public.documentos(id) on delete cascade,
  estado estado_documento not null,
  oficina_id uuid references public.oficinas(id),
  usuario_id uuid references public.perfiles(id),
  comentario text,
  created_at timestamptz not null default now()
);

comment on table public.documento_historial is 'Línea de tiempo completa de cada expediente, para seguimiento en tiempo real';

-- ---------- 7. NOTIFICACIONES ---------------------------------------------------
create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  documento_id uuid references public.documentos(id) on delete cascade,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 8. ÍNDICES ----------------------------------------------------------
create index if not exists idx_documentos_oficina on public.documentos(oficina_actual_id);
create index if not exists idx_documentos_usuario on public.documentos(usuario_emisor_id);
create index if not exists idx_documentos_estado on public.documentos(estado);
create index if not exists idx_derivaciones_doc on public.derivaciones(documento_id);
create index if not exists idx_historial_doc on public.documento_historial(documento_id);
create index if not exists idx_notif_usuario on public.notificaciones(usuario_id, leido);

-- ---------- 9. FUNCIÓN: generar código de expediente -----------------------------
create or replace function public.generar_codigo_expediente()
returns text
language plpgsql
as $$
declare
  nro bigint;
  anio text := to_char(now(), 'YYYY');
begin
  nro := nextval('public.correlativo_expediente');
  return 'UGEL-' || anio || '-' || lpad(nro::text, 6, '0');
end;
$$;

-- ---------- 10. TRIGGER: asignar código + registrar historial inicial ------------
create or replace function public.fn_before_insert_documento()
returns trigger
language plpgsql
as $$
begin
  if new.codigo_expediente is null or new.codigo_expediente = '' then
    new.codigo_expediente := public.generar_codigo_expediente();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_before_insert_documento on public.documentos;
create trigger trg_before_insert_documento
  before insert on public.documentos
  for each row execute function public.fn_before_insert_documento();

create or replace function public.fn_after_insert_documento()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.documento_historial (documento_id, estado, oficina_id, usuario_id, comentario)
  values (new.id, new.estado, new.oficina_actual_id, new.usuario_emisor_id, 'Documento registrado en el sistema');
  return new;
end;
$$;

drop trigger if exists trg_after_insert_documento on public.documentos;
create trigger trg_after_insert_documento
  after insert on public.documentos
  for each row execute function public.fn_after_insert_documento();

-- ---------- 11. TRIGGER: updated_at automático en updates ------------------------
create or replace function public.fn_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_documentos on public.documentos;
create trigger trg_touch_documentos
  before update on public.documentos
  for each row execute function public.fn_touch_updated_at();

-- ---------- 12. FUNCIÓN: crear perfil automáticamente al registrarse -------------
create or replace function public.fn_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombres, apellidos, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombres', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'apellidos', ''),
    new.email,
    'externo'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.fn_handle_new_user();

-- ---------- 13. FUNCIÓN AUXILIAR: rol y oficina del usuario actual ----------------
create or replace function public.mi_rol()
returns rol_usuario
language sql stable security definer set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

create or replace function public.mi_oficina()
returns uuid
language sql stable security definer set search_path = public
as $$
  select oficina_id from public.perfiles where id = auth.uid();
$$;

-- ---------- 14. FUNCIÓN: derivar documento (transaccional) -----------------------
create or replace function public.derivar_documento(
  p_documento_id uuid,
  p_oficina_destino_id uuid,
  p_observacion text default null,
  p_nuevo_estado estado_documento default 'derivado',
  p_archivos jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_oficina_origen uuid;
  v_rol rol_usuario;
  v_mi_oficina uuid;
begin
  select rol, oficina_id into v_rol, v_mi_oficina from public.perfiles where id = auth.uid();
  select oficina_actual_id into v_oficina_origen from public.documentos where id = p_documento_id;

  if v_rol not in ('admin','mesa_partes','jefe_oficina') then
    raise exception 'No tiene permisos para derivar documentos';
  end if;

  if v_rol = 'jefe_oficina' and v_mi_oficina is distinct from v_oficina_origen then
    raise exception 'Solo puede derivar documentos asignados a su oficina';
  end if;

  insert into public.derivaciones (documento_id, oficina_origen_id, oficina_destino_id, derivado_por, observacion, archivos)
  values (p_documento_id, v_oficina_origen, p_oficina_destino_id, auth.uid(), p_observacion, coalesce(p_archivos, '[]'::jsonb));

  update public.documentos
    set oficina_actual_id = p_oficina_destino_id,
        estado = p_nuevo_estado,
        observacion_actual = p_observacion
    where id = p_documento_id;

  insert into public.documento_historial (documento_id, estado, oficina_id, usuario_id, comentario)
  values (p_documento_id, p_nuevo_estado, p_oficina_destino_id, auth.uid(), coalesce(p_observacion, 'Derivado a otra oficina'));

  insert into public.notificaciones (usuario_id, documento_id, mensaje)
  select p.id, p_documento_id, 'Tiene un nuevo expediente derivado a su oficina'
  from public.perfiles p
  where p.oficina_id = p_oficina_destino_id and p.rol in ('jefe_oficina','mesa_partes');
end;
$$;

-- ---------- 15. FUNCIÓN: cambiar estado (atender / observar / archivar) ----------
create or replace function public.cambiar_estado_documento(
  p_documento_id uuid,
  p_nuevo_estado estado_documento,
  p_comentario text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_rol rol_usuario;
  v_mi_oficina uuid;
  v_oficina_doc uuid;
  v_emisor uuid;
begin
  select rol, oficina_id into v_rol, v_mi_oficina from public.perfiles where id = auth.uid();
  select oficina_actual_id, usuario_emisor_id into v_oficina_doc, v_emisor from public.documentos where id = p_documento_id;

  if v_rol not in ('admin','mesa_partes','jefe_oficina') then
    raise exception 'No tiene permisos para actualizar este documento';
  end if;

  if v_rol = 'jefe_oficina' and v_mi_oficina is distinct from v_oficina_doc then
    raise exception 'Solo puede actualizar documentos de su oficina';
  end if;

  update public.documentos
    set estado = p_nuevo_estado,
        observacion_actual = coalesce(p_comentario, observacion_actual)
    where id = p_documento_id;

  insert into public.documento_historial (documento_id, estado, oficina_id, usuario_id, comentario)
  values (p_documento_id, p_nuevo_estado, v_oficina_doc, auth.uid(), p_comentario);

  insert into public.notificaciones (usuario_id, documento_id, mensaje)
  values (v_emisor, p_documento_id, 'Su expediente cambió de estado a: ' || p_nuevo_estado);
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.oficinas enable row level security;
alter table public.perfiles enable row level security;
alter table public.documentos enable row level security;
alter table public.derivaciones enable row level security;
alter table public.documento_historial enable row level security;
alter table public.notificaciones enable row level security;

-- OFICINAS: todos los autenticados pueden leer (para elegir destino); solo admin edita
drop policy if exists "oficinas_select" on public.oficinas;
create policy "oficinas_select" on public.oficinas for select using (true);

drop policy if exists "oficinas_admin_write" on public.oficinas;
create policy "oficinas_admin_write" on public.oficinas for all
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- PERFILES: cada quien ve/edita el suyo; personal UGEL ve todos los perfiles (para asignar/mostrar nombres)
drop policy if exists "perfiles_select_propio" on public.perfiles;
create policy "perfiles_select_propio" on public.perfiles for select
  using (id = auth.uid() or public.mi_rol() in ('admin','mesa_partes','jefe_oficina'));

drop policy if exists "perfiles_update_propio" on public.perfiles;
create policy "perfiles_update_propio" on public.perfiles for update
  using (id = auth.uid() or public.mi_rol() = 'admin');

drop policy if exists "perfiles_admin_insert" on public.perfiles;
create policy "perfiles_admin_insert" on public.perfiles for insert
  with check (id = auth.uid() or public.mi_rol() = 'admin');

-- DOCUMENTOS: el emisor ve los suyos; el personal ve los de su oficina; mesa_partes/admin ven todo
drop policy if exists "documentos_select" on public.documentos;
create policy "documentos_select" on public.documentos for select
  using (
    usuario_emisor_id = auth.uid()
    or public.mi_rol() in ('admin','mesa_partes')
    or (public.mi_rol() = 'jefe_oficina' and oficina_actual_id = public.mi_oficina())
  );

drop policy if exists "documentos_insert" on public.documentos;
create policy "documentos_insert" on public.documentos for insert
  with check (usuario_emisor_id = auth.uid());

drop policy if exists "documentos_update" on public.documentos;
create policy "documentos_update" on public.documentos for update
  using (public.mi_rol() in ('admin','mesa_partes','jefe_oficina'));

-- DERIVACIONES: visibles para quien pueda ver el documento
drop policy if exists "derivaciones_select" on public.derivaciones;
create policy "derivaciones_select" on public.derivaciones for select
  using (
    exists (
      select 1 from public.documentos d
      where d.id = derivaciones.documento_id
        and (
          d.usuario_emisor_id = auth.uid()
          or public.mi_rol() in ('admin','mesa_partes')
          or (public.mi_rol() = 'jefe_oficina' and d.oficina_actual_id = public.mi_oficina())
        )
    )
  );

drop policy if exists "derivaciones_insert" on public.derivaciones;
create policy "derivaciones_insert" on public.derivaciones for insert
  with check (public.mi_rol() in ('admin','mesa_partes','jefe_oficina'));

-- HISTORIAL: mismo criterio que documentos (lectura pública limitada vía función RPC de seguimiento)
drop policy if exists "historial_select" on public.documento_historial;
create policy "historial_select" on public.documento_historial for select
  using (
    exists (
      select 1 from public.documentos d
      where d.id = documento_historial.documento_id
        and (
          d.usuario_emisor_id = auth.uid()
          or public.mi_rol() in ('admin','mesa_partes')
          or (public.mi_rol() = 'jefe_oficina' and d.oficina_actual_id = public.mi_oficina())
        )
    )
  );

drop policy if exists "historial_insert" on public.documento_historial;
create policy "historial_insert" on public.documento_historial for insert
  with check (
    usuario_id = auth.uid()
    or public.mi_rol() in ('admin','mesa_partes','jefe_oficina')
  );

-- NOTIFICACIONES: cada quien ve solo las suyas
drop policy if exists "notif_select" on public.notificaciones;
create policy "notif_select" on public.notificaciones for select using (usuario_id = auth.uid());

drop policy if exists "notif_update" on public.notificaciones;
create policy "notif_update" on public.notificaciones for update using (usuario_id = auth.uid());

-- ============================================================================
-- FUNCIÓN PÚBLICA DE SEGUIMIENTO (sin necesidad de iniciar sesión)
-- Permite a cualquier ciudadano consultar el estado de su expediente con el código
-- ============================================================================
create or replace function public.consultar_expediente(p_codigo text)
returns table (
  codigo_expediente text,
  asunto text,
  tipo_documento text,
  estado estado_documento,
  oficina_actual text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer set search_path = public
as $$
  select d.codigo_expediente, d.asunto, d.tipo_documento, d.estado, o.nombre, d.created_at, d.updated_at
  from public.documentos d
  left join public.oficinas o on o.id = d.oficina_actual_id
  where d.codigo_expediente = p_codigo;
$$;

create or replace function public.consultar_expediente_historial(p_codigo text)
returns table (
  estado estado_documento,
  oficina text,
  comentario text,
  created_at timestamptz
)
language sql
security definer set search_path = public
as $$
  select h.estado, o.nombre, h.comentario, h.created_at
  from public.documento_historial h
  join public.documentos d on d.id = h.documento_id
  left join public.oficinas o on o.id = h.oficina_id
  where d.codigo_expediente = p_codigo
  order by h.created_at asc;
$$;

grant execute on function public.consultar_expediente(text) to anon, authenticated;
grant execute on function public.consultar_expediente_historial(text) to anon, authenticated;
grant execute on function public.derivar_documento(uuid, uuid, text, estado_documento, jsonb) to authenticated;
grant execute on function public.cambiar_estado_documento(uuid, estado_documento, text) to authenticated;

-- ============================================================================
-- REALTIME: publicar cambios para que la bandeja se actualice en vivo
-- ============================================================================
do $$ begin
  alter publication supabase_realtime add table public.documentos;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.documento_historial;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.notificaciones;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- STORAGE: bucket para los archivos adjuntos (PDF, imágenes escaneadas, etc.)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

drop policy if exists "storage_documentos_insert" on storage.objects;
create policy "storage_documentos_insert" on storage.objects for insert
  with check (bucket_id = 'documentos' and auth.role() = 'authenticated');

drop policy if exists "storage_documentos_select" on storage.objects;
create policy "storage_documentos_select" on storage.objects for select
  using (bucket_id = 'documentos');

-- ============================================================================
-- SEMILLA: OFICINAS DE LA UGEL (RRHH como oficina principal, orden = 1)
-- ============================================================================
insert into public.oficinas (codigo, nombre, descripcion, orden, es_mesa_partes) values
  ('RRHH',        'Recursos Humanos',                  'Legajos, licencias, contratos, escalafón del personal docente y administrativo', 1, false),
  ('MESA_PARTES', 'Mesa de Partes / Trámite Documentario', 'Recepción, registro y derivación de todo documento que ingresa a la UGEL', 2, true),
  ('DIRECCION',   'Dirección / Gerencia',               'Despacho del Director de la UGEL', 3, false),
  ('ADMINISTRACION', 'Administración', 'Gestión administrativa y financiera', 4, false),
  ('ASESORIA_JURIDICA', 'Asesoría Jurídica', 'Informes legales y asuntos normativos', 5, false),
  ('PLANIFICACION', 'Planificación y Presupuesto', 'Racionalización, estadística y presupuesto', 6, false),
  ('GESTION_PEDAGOGICA', 'Gestión Pedagógica', 'Acompañamiento pedagógico y asuntos académicos', 7, false),
  ('GESTION_INSTITUCIONAL', 'Gestión Institucional', 'Infraestructura educativa y gestión de instituciones', 8, false),
  ('TESORERIA', 'Tesorería', 'Pagos, planillas y ejecución financiera', 9, false),
  ('LOGISTICA', 'Logística y Abastecimiento', 'Adquisiciones, almacén y patrimonio', 10, false),
  ('ESCALAFON', 'Escalafón', 'Legajos y hoja de vida del personal', 11, false),
  ('SECRETARIA_GENERAL', 'Secretaría General', 'Trámite documentario y archivo central', 12, false)
on conflict (codigo) do nothing;

-- ============================================================================
-- AVISOS / BANNERS de la plataforma principal (gestionados por el admin)
-- ============================================================================
create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  mensaje text not null,
  tipo text not null default 'info', -- 'info' | 'urgente'
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.avisos enable row level security;

drop policy if exists "avisos_select" on public.avisos;
create policy "avisos_select" on public.avisos for select using (true);

drop policy if exists "avisos_admin_write" on public.avisos;
create policy "avisos_admin_write" on public.avisos for all
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- ============================================================================
-- CONFIGURACIÓN DE APARIENCIA del sitio (fila única, editable solo por admin)
-- ============================================================================
create table if not exists public.configuracion_sitio (
  id int primary key default 1,
  color_primario text not null default '#152F4A',
  color_fondo text not null default '#F7F3EA',
  fuente_body text not null default 'Inter',
  updated_at timestamptz not null default now(),
  constraint solo_una_fila check (id = 1)
);

insert into public.configuracion_sitio (id) values (1) on conflict (id) do nothing;

alter table public.configuracion_sitio enable row level security;

drop policy if exists "config_select" on public.configuracion_sitio;
create policy "config_select" on public.configuracion_sitio for select using (true);

drop policy if exists "config_admin_write" on public.configuracion_sitio;
create policy "config_admin_write" on public.configuracion_sitio for update
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');
