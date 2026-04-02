alter table public.member_profiles
  add column if not exists strava_last_sync_at timestamptz;

update public.member_profiles
set strava_last_sync_at = timezone('utc', now())
where strava_connected = true
  and strava_last_sync_at is null;

create table if not exists public.strava_connections (
  member_id uuid primary key references public.member_profiles (user_id) on delete cascade,
  athlete_id bigint unique,
  access_token text not null default '',
  refresh_token text not null default '',
  expires_at bigint not null default 0,
  scopes text[] not null default '{}',
  status text not null default 'active',
  last_sync_at timestamptz,
  last_webhook_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint strava_connections_status_check check (
    status in ('active', 'revoked', 'disconnected')
  ),
  constraint strava_connections_expires_at_check check (expires_at >= 0)
);

create or replace function public.set_strava_connections_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_strava_connections_updated_at on public.strava_connections;

create trigger set_strava_connections_updated_at
before update on public.strava_connections
for each row
execute function public.set_strava_connections_updated_at();

alter table public.strava_connections enable row level security;
alter table public.strava_connections force row level security;

revoke all on public.strava_connections from anon, authenticated;

drop function if exists public.list_member_profiles_for_league();

create or replace function public.list_member_profiles_for_league()
returns table (
  id uuid,
  first_name text,
  last_name text,
  full_name text,
  member_number text,
  gender text,
  city text,
  upload_photo text,
  strava_photo text,
  photo_source text,
  strava_connected boolean,
  strava_athlete_id bigint,
  strava_last_sync_at timestamptz,
  year_km numeric,
  year_elevation integer,
  is_admin boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    member_profiles.user_id as id,
    member_profiles.first_name,
    member_profiles.last_name,
    member_profiles.full_name,
    member_profiles.member_number,
    member_profiles.gender,
    member_profiles.city,
    member_profiles.upload_photo,
    member_profiles.strava_photo,
    member_profiles.photo_source,
    member_profiles.strava_connected,
    member_profiles.strava_athlete_id,
    member_profiles.strava_last_sync_at,
    member_profiles.year_km,
    member_profiles.year_elevation,
    member_profiles.is_admin
  from public.member_profiles
  order by member_profiles.created_at asc;
$$;

revoke all on function public.list_member_profiles_for_league() from public;
grant execute on function public.list_member_profiles_for_league() to anon, authenticated;

create or replace function public.set_current_member_strava(
  p_profile jsonb,
  p_use_strava_photo boolean default true
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile jsonb := coalesce(p_profile, '{}'::jsonb);
  v_city text := btrim(coalesce(v_profile ->> 'city', ''));
  v_first_name text := btrim(coalesce(v_profile ->> 'firstname', ''));
  v_last_name text := btrim(coalesce(v_profile ->> 'lastname', ''));
  v_strava_photo text := coalesce(
    nullif(v_profile ->> 'profileMedium', ''),
    nullif(v_profile ->> 'profile', ''),
    ''
  );
begin
  if v_user_id is null then
    raise exception 'Necesitas iniciar sesion para continuar.';
  end if;

  update public.member_profiles
  set
    first_name = coalesce(nullif(first_name, ''), nullif(v_first_name, ''), first_name),
    last_name = coalesce(nullif(last_name, ''), nullif(v_last_name, ''), last_name),
    city = case
      when city = '' and v_city <> '' then v_city
      else city
    end,
    strava_connected = true,
    strava_athlete_id = case
      when nullif(v_profile ->> 'id', '') is null then strava_athlete_id
      else (v_profile ->> 'id')::bigint
    end,
    strava_photo = coalesce(nullif(v_strava_photo, ''), strava_photo),
    photo_source = case
      when p_use_strava_photo then 'strava'
      else photo_source
    end,
    year_km = coalesce(
      case
        when nullif(v_profile ->> 'ytdKm', '') is null then null
        else round((v_profile ->> 'ytdKm')::numeric, 1)
      end,
      year_km
    ),
    year_elevation = coalesce(
      case
        when nullif(v_profile ->> 'ytdElevation', '') is null then null
        else round((v_profile ->> 'ytdElevation')::numeric)::integer
      end,
      year_elevation
    ),
    strava_last_sync_at = timezone('utc', now())
  where user_id = v_user_id;

  if not found then
    raise exception 'No hemos encontrado tu perfil.';
  end if;
end;
$$;

revoke all on function public.set_current_member_strava(jsonb, boolean) from public;
grant execute on function public.set_current_member_strava(jsonb, boolean) to authenticated;

create or replace function public.clear_current_member_strava()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Necesitas iniciar sesion para continuar.';
  end if;

  update public.member_profiles
  set
    strava_connected = false,
    strava_athlete_id = null,
    strava_photo = '',
    photo_source = 'upload',
    year_km = 0,
    year_elevation = 0,
    strava_last_sync_at = null
  where user_id = v_user_id;

  if not found then
    raise exception 'No hemos encontrado tu perfil.';
  end if;
end;
$$;

revoke all on function public.clear_current_member_strava() from public;
grant execute on function public.clear_current_member_strava() to authenticated;
