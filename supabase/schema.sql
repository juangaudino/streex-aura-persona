-- ============================================================================
-- CV / Portfolio — schema completo para recrear el backend fuera de Lovable
-- Aplicar en un proyecto Supabase nuevo: SQL Editor → pegar todo → Run
-- (o con Supabase CLI: supabase db push / psql -f supabase/schema.sql)
--
-- Contenido:
--   1. Enums (app_role, timeline_kind)
--   2. Tablas: profiles, profile_settings, timeline_items, projects, skills,
--      markets, user_roles, profile_access_links
--   3. Grants (PostgREST no otorga permisos por defecto)
--   4. RLS: lectura pública, escritura solo admin
--   5. Funciones: has_role(), tg_set_updated_at()
--   6. Triggers updated_at
--   7. Storage: buckets cv-attachments y cv-projects + políticas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------
create type public.app_role as enum ('admin');
create type public.timeline_kind as enum ('work', 'study');

-- ----------------------------------------------------------------------------
-- 2. Tablas
-- ----------------------------------------------------------------------------

-- Perfiles independientes publicados bajo un slug privado.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Configuración específica de cada perfil.
create table public.profile_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true,
  profile_id uuid references public.profiles(id) on delete cascade,

  name text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  linkedin text not null default '',
  cv_url text not null default '',
  photo_light_url text not null default '',
  photo_dark_url text not null default '',

  hero_eyebrow_es text not null default '',
  hero_eyebrow_en text not null default '',
  hero_title_es text[] not null default '{}',
  hero_title_en text[] not null default '{}',
  hero_role_es text not null default '',
  hero_role_en text not null default '',
  hero_location_es text not null default '',
  hero_location_en text not null default '',
  hero_cta_es text not null default '',
  hero_cta_en text not null default '',
  hero_cta_alt_es text not null default '',
  hero_cta_alt_en text not null default '',

  about_eyebrow_es text not null default '',
  about_eyebrow_en text not null default '',
  about_title_es text not null default '',
  about_title_en text not null default '',
  about_body_es text[] not null default '{}',
  about_body_en text[] not null default '{}',
  about_stats jsonb not null default '[]',

  experience_eyebrow_es text not null default '',
  experience_eyebrow_en text not null default '',
  experience_title_es text not null default '',
  experience_title_en text not null default '',
  experience_lane_work_es text not null default '',
  experience_lane_work_en text not null default '',
  experience_lane_study_es text not null default '',
  experience_lane_study_en text not null default '',
  experience_tag_work_es text not null default '',
  experience_tag_work_en text not null default '',
  experience_tag_study_es text not null default '',
  experience_tag_study_en text not null default '',

  projects_eyebrow_es text not null default '',
  projects_eyebrow_en text not null default '',
  projects_title_es text not null default '',
  projects_title_en text not null default '',

  skills_eyebrow_es text not null default '',
  skills_eyebrow_en text not null default '',
  skills_title_es text not null default '',
  skills_title_en text not null default '',

  journey_eyebrow_es text,
  journey_eyebrow_en text,
  journey_title_es text,
  journey_title_en text,
  journey_body_es text,
  journey_body_en text,

  contact_eyebrow_es text not null default '',
  contact_eyebrow_en text not null default '',
  contact_title_es text not null default '',
  contact_title_en text not null default '',
  contact_sub_es text not null default '',
  contact_sub_en text not null default '',

  updated_at timestamptz not null default now()
);

-- Experiencia laboral y estudios (timeline dual)
create table public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  kind public.timeline_kind not null,
  org text not null default '',
  title_es text not null default '',
  title_en text not null default '',
  location text not null default '',
  period_label_es text not null default '',
  period_label_en text not null default '',
  start_date date,
  end_date date,
  summary_es text not null default '',
  summary_en text not null default '',
  bullets_es text[] not null default '{}',
  bullets_en text[] not null default '{}',
  attachments jsonb not null default '[]',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campañas / proyectos destacados con case study
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name_es text not null default '',
  name_en text not null default '',
  desc_es text not null default '',
  desc_en text not null default '',
  client text not null default '',
  year text not null default '',
  stack text not null default '',
  verticals text[] not null default '{}',
  image_url text not null default '',
  link text not null default '',
  challenge_es text not null default '',
  challenge_en text not null default '',
  approach_es text not null default '',
  approach_en text not null default '',
  outcome_es text not null default '',
  outcome_en text not null default '',
  metrics jsonb not null default '[]',
  gallery jsonb not null default '[]',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skills agrupadas por categoría
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'general',
  category_label_es text not null default '',
  category_label_en text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Ciudades del mapa Journey (LATAM → US)
create table public.markets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  city text not null,
  country text not null,
  country_code text,
  lat double precision not null,
  lng double precision not null,
  year_from integer,
  year_to integer,
  note_es text,
  note_en text,
  is_home boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Roles de usuario (NUNCA guardar roles en profiles/users)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Tokens de acceso privado; solo los consulta el Worker server-side.
create table public.profile_access_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  label text not null default '',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  constraint profile_access_links_token_hash_format check (length(token_hash) = 64)
);

-- Garantiza que el bootstrap pueda tener un solo admin incluso bajo concurrencia.
create unique index user_roles_one_admin_idx
  on public.user_roles (role)
  where role = 'admin';

-- ----------------------------------------------------------------------------
-- 3. Grants (obligatorios: Supabase no los otorga por defecto)
-- ----------------------------------------------------------------------------
grant select on public.profile_settings to anon, authenticated;
grant select, insert, update, delete on public.profile_settings to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.timeline_items to anon, authenticated;
grant select, insert, update, delete on public.timeline_items to authenticated;
grant select on public.projects to anon, authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select on public.skills to anon, authenticated;
grant select, insert, update, delete on public.skills to authenticated;
grant select on public.markets to anon, authenticated;
grant select, insert, update, delete on public.markets to authenticated;
grant select on public.user_roles to authenticated;

grant all on public.profile_settings to service_role;
grant all on public.profiles to service_role;
grant all on public.timeline_items to service_role;
grant all on public.projects to service_role;
grant all on public.skills to service_role;
grant all on public.markets to service_role;
grant all on public.user_roles to service_role;
grant all on public.profile_access_links to service_role;

-- ----------------------------------------------------------------------------
-- 5. Funciones (antes de las políticas que las usan)
-- ----------------------------------------------------------------------------

-- Las funciones SECURITY DEFINER internas viven fuera del esquema expuesto.
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

-- Verifica si un usuario tiene un rol. SECURITY DEFINER evita recursión en RLS.
create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- SECURITY DEFINER functions are explicit internal APIs, not public endpoints.
revoke all on function private.has_role(uuid, public.app_role) from public;
revoke all on function private.has_role(uuid, public.app_role) from anon;
grant execute on function private.has_role(uuid, public.app_role) to authenticated;
revoke all on function public.tg_set_updated_at() from public;

-- ----------------------------------------------------------------------------
-- 4. RLS — lectura pública, escritura solo admin
-- ----------------------------------------------------------------------------

alter table public.profile_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.timeline_items enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.markets enable row level security;
alter table public.user_roles enable row level security;
alter table public.profile_access_links enable row level security;

create policy "Admins read profiles" on public.profiles
  for select to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));
create policy "Admins insert profiles" on public.profiles
  for insert to authenticated
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));
create policy "Admins update profiles" on public.profiles
  for update to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));
create policy "Admins delete profiles" on public.profiles
  for delete to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));

create policy "No direct access to profile links" on public.profile_access_links
  for all to anon, authenticated
  using (false)
  with check (false);

-- profile_settings
create policy "Public read profile" on public.profile_settings
  for select to anon, authenticated using (true);
create policy "Admins write profile" on public.profile_settings
  for all to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));

-- timeline_items
create policy "Public read timeline" on public.timeline_items
  for select to anon, authenticated using (true);
create policy "Admins write timeline" on public.timeline_items
  for all to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));

-- projects
create policy "Public read projects" on public.projects
  for select to anon, authenticated using (true);
create policy "Admins write projects" on public.projects
  for all to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));

-- skills
create policy "Public read skills" on public.skills
  for select to anon, authenticated using (true);
create policy "Admins write skills" on public.skills
  for all to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));

-- markets
create policy "Public read markets" on public.markets
  for select to anon, authenticated using (true);
create policy "Admins write markets" on public.markets
  for all to authenticated
  using ((select private.has_role((select auth.uid()), 'admin'::public.app_role)))
  with check ((select private.has_role((select auth.uid()), 'admin'::public.app_role)));

-- user_roles: el usuario solo lee sus propios roles
create policy "Users read own roles" on public.user_roles
  for select to authenticated using ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 6. Triggers updated_at
-- ----------------------------------------------------------------------------
create trigger trg_profile_updated before update on public.profile_settings
  for each row execute function public.tg_set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger trg_timeline_updated before update on public.timeline_items
  for each row execute function public.tg_set_updated_at();
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.tg_set_updated_at();
create trigger markets_set_updated_at before update on public.markets
  for each row execute function public.tg_set_updated_at();

create unique index profile_settings_profile_id_key
  on public.profile_settings(profile_id)
  where profile_id is not null;
create index timeline_items_profile_id_sort_order_idx
  on public.timeline_items(profile_id, sort_order desc);
create index projects_profile_id_sort_order_idx
  on public.projects(profile_id, sort_order);
create index skills_profile_id_sort_order_idx
  on public.skills(profile_id, sort_order);
create index markets_profile_id_sort_order_idx
  on public.markets(profile_id, sort_order);
create index profile_access_links_profile_id_idx
  on public.profile_access_links(profile_id);

-- ----------------------------------------------------------------------------
-- 7. Storage
-- Buckets privados; el frontend genera signed URLs de corta duración al subir
-- y las consultas públicas las renuevan desde el Worker.
-- El límite de tamaño y MIME también se impone en Storage, no solo en la UI.
-- Se crean aquí para que un proyecto nuevo sea reproducible.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cv-attachments', 'cv-attachments', false, 26214400, array['image/*', 'application/pdf']::text[]),
  ('cv-projects', 'cv-projects', false, 26214400, array['image/*']::text[])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins read CV storage" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('cv-attachments', 'cv-projects')
    and (select private.has_role((select auth.uid()), 'admin'::public.app_role))
  );

create policy "Admins insert CV storage" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('cv-attachments', 'cv-projects')
    and (select private.has_role((select auth.uid()), 'admin'::public.app_role))
  );

create policy "Admins update CV storage" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('cv-attachments', 'cv-projects')
    and (select private.has_role((select auth.uid()), 'admin'::public.app_role))
  )
  with check (
    bucket_id in ('cv-attachments', 'cv-projects')
    and (select private.has_role((select auth.uid()), 'admin'::public.app_role))
  );

create policy "Admins delete CV storage" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('cv-attachments', 'cv-projects')
    and (select private.has_role((select auth.uid()), 'admin'::public.app_role))
  );

-- ----------------------------------------------------------------------------
-- Perfil y fila iniciales (el Admin los edita después).
-- ----------------------------------------------------------------------------
insert into public.profiles (slug, display_name)
values ('juanooh', 'Juan OOH')
on conflict (slug) do nothing;

insert into public.profile_settings (singleton, profile_id, name)
select true, id, 'Juan Gaudino'
from public.profiles
where slug = 'juanooh'
  and not exists (
  select 1 from public.profile_settings where profile_id = public.profiles.id
);
