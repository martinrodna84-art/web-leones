-- Persisted annual, monthly, and weekly Strava stats for Liga Felina.
alter table public.member_profiles
  add column if not exists month_km numeric(10, 1) not null default 0,
  add column if not exists month_elevation integer not null default 0,
  add column if not exists week_km numeric(10, 1) not null default 0,
  add column if not exists week_elevation integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_month_km_check'
  ) then
    alter table public.member_profiles
      add constraint member_profiles_month_km_check check (month_km >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_month_elevation_check'
  ) then
    alter table public.member_profiles
      add constraint member_profiles_month_elevation_check check (month_elevation >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_week_km_check'
  ) then
    alter table public.member_profiles
      add constraint member_profiles_week_km_check check (week_km >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_profiles_week_elevation_check'
  ) then
    alter table public.member_profiles
      add constraint member_profiles_week_elevation_check check (week_elevation >= 0);
  end if;
end
$$;

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
  month_km numeric,
  month_elevation integer,
  week_km numeric,
  week_elevation integer,
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
    member_profiles.month_km,
    member_profiles.month_elevation,
    member_profiles.week_km,
    member_profiles.week_elevation,
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
    month_km = coalesce(
      case
        when nullif(v_profile ->> 'monthKm', '') is null then null
        else round((v_profile ->> 'monthKm')::numeric, 1)
      end,
      month_km
    ),
    month_elevation = coalesce(
      case
        when nullif(v_profile ->> 'monthElevation', '') is null then null
        else round((v_profile ->> 'monthElevation')::numeric)::integer
      end,
      month_elevation
    ),
    week_km = coalesce(
      case
        when nullif(v_profile ->> 'weekKm', '') is null then null
        else round((v_profile ->> 'weekKm')::numeric, 1)
      end,
      week_km
    ),
    week_elevation = coalesce(
      case
        when nullif(v_profile ->> 'weekElevation', '') is null then null
        else round((v_profile ->> 'weekElevation')::numeric)::integer
      end,
      week_elevation
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
    month_km = 0,
    month_elevation = 0,
    week_km = 0,
    week_elevation = 0,
    strava_last_sync_at = null
  where user_id = v_user_id;

  if not found then
    raise exception 'No hemos encontrado tu perfil.';
  end if;
end;
$$;

revoke all on function public.clear_current_member_strava() from public;
grant execute on function public.clear_current_member_strava() to authenticated;
