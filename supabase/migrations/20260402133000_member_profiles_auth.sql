create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name text not null,
  full_name text generated always as (
    btrim(coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
  ) stored,
  member_number text not null,
  gender text not null,
  city text not null default '',
  upload_photo text not null default '',
  strava_photo text not null default '',
  photo_source text not null default 'upload',
  strava_connected boolean not null default false,
  strava_athlete_id bigint,
  year_km numeric(10, 1) not null default 0,
  year_elevation integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint member_profiles_gender_check check (gender in ('men', 'women')),
  constraint member_profiles_photo_source_check check (photo_source in ('upload', 'strava')),
  constraint member_profiles_member_number_check check (
    member_number ~ '^L-[0-9]{3}$'
    and member_number <> 'L-000'
  ),
  constraint member_profiles_year_km_check check (year_km >= 0),
  constraint member_profiles_year_elevation_check check (year_elevation >= 0)
);

create unique index if not exists member_profiles_email_lower_idx
  on public.member_profiles (lower(email));

create unique index if not exists member_profiles_member_number_upper_idx
  on public.member_profiles (upper(member_number));

create or replace function public.set_member_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_member_profiles_updated_at on public.member_profiles;

create trigger set_member_profiles_updated_at
before update on public.member_profiles
for each row
execute function public.set_member_profiles_updated_at();

alter table public.member_profiles enable row level security;
alter table public.member_profiles force row level security;

revoke all on public.member_profiles from anon, authenticated;
grant select, update on public.member_profiles to authenticated;

drop policy if exists "Members can read own profile" on public.member_profiles;
create policy "Members can read own profile"
on public.member_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Members can update own profile" on public.member_profiles;
create policy "Members can update own profile"
on public.member_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

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
    member_profiles.year_km,
    member_profiles.year_elevation,
    member_profiles.is_admin
  from public.member_profiles
  order by member_profiles.created_at asc;
$$;

revoke all on function public.list_member_profiles_for_league() from public;
grant execute on function public.list_member_profiles_for_league() to anon, authenticated;

create or replace function public.create_member_profile(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_member_number text,
  p_gender text,
  p_city text default '',
  p_upload_photo text default null,
  p_use_strava_photo boolean default false,
  p_draft_strava_profile jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_first_name text := btrim(coalesce(p_first_name, ''));
  v_last_name text := btrim(coalesce(p_last_name, ''));
  v_member_number text := upper(btrim(coalesce(p_member_number, '')));
  v_gender text := btrim(coalesce(p_gender, ''));
  v_city text := btrim(coalesce(p_city, ''));
  v_profile jsonb := coalesce(p_draft_strava_profile, '{}'::jsonb);
  v_strava_connected boolean := p_draft_strava_profile is not null;
  v_strava_photo text := coalesce(
    nullif(v_profile ->> 'profileMedium', ''),
    nullif(v_profile ->> 'profile', ''),
    ''
  );
  v_strava_athlete_id bigint;
  v_year_km numeric(10, 1);
  v_year_elevation integer;
begin
  if p_user_id is null then
    raise exception 'No hemos podido identificar al nuevo socio.';
  end if;

  if exists (select 1 from public.member_profiles where user_id = p_user_id) then
    raise exception 'Ese usuario ya tiene un perfil creado.';
  end if;

  if v_first_name = '' or v_last_name = '' then
    raise exception 'Debes indicar nombre y apellidos.';
  end if;

  if v_email = '' then
    raise exception 'Debes indicar un email valido.';
  end if;

  if length(coalesce(v_email, '')) > 320 then
    raise exception 'El email es demasiado largo.';
  end if;

  if v_member_number = '' or v_member_number !~ '^L-[0-9]{3}$' then
    raise exception 'El numero de socio debe tener formato L-000.';
  end if;

  if v_member_number = 'L-000' then
    raise exception 'L-000 queda reservado para administracion.';
  end if;

  if v_gender not in ('men', 'women') then
    raise exception 'El sexo para la clasificacion no es valido.';
  end if;

  if nullif(v_profile ->> 'id', '') is not null then
    v_strava_athlete_id := (v_profile ->> 'id')::bigint;
  end if;

  if nullif(v_profile ->> 'ytdKm', '') is not null then
    v_year_km := round((v_profile ->> 'ytdKm')::numeric, 1);
  end if;

  if nullif(v_profile ->> 'ytdElevation', '') is not null then
    v_year_elevation := round((v_profile ->> 'ytdElevation')::numeric)::integer;
  end if;

  insert into public.member_profiles (
    user_id,
    email,
    first_name,
    last_name,
    member_number,
    gender,
    city,
    upload_photo,
    strava_photo,
    photo_source,
    strava_connected,
    strava_athlete_id,
    year_km,
    year_elevation
  )
  values (
    p_user_id,
    v_email,
    v_first_name,
    v_last_name,
    v_member_number,
    v_gender,
    v_city,
    coalesce(nullif(p_upload_photo, ''), ''),
    v_strava_photo,
    case
      when p_use_strava_photo and v_strava_connected then 'strava'
      else 'upload'
    end,
    v_strava_connected,
    v_strava_athlete_id,
    coalesce(v_year_km, 0),
    coalesce(v_year_elevation, 0)
  );
exception
  when unique_violation then
    if exists (
      select 1
      from public.member_profiles
      where lower(email) = v_email
        and user_id <> p_user_id
    ) then
      raise exception 'Ese email ya esta registrado.';
    end if;

    if exists (
      select 1
      from public.member_profiles
      where upper(member_number) = v_member_number
        and user_id <> p_user_id
    ) then
      raise exception 'Ese numero de socio ya existe.';
    end if;

    raise;
end;
$$;

revoke all on function public.create_member_profile(uuid, text, text, text, text, text, text, text, boolean, jsonb) from public;
grant execute on function public.create_member_profile(uuid, text, text, text, text, text, text, text, boolean, jsonb) to service_role;

create or replace function public.update_current_member_profile(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_member_number text,
  p_gender text,
  p_city text default '',
  p_upload_photo text default null,
  p_use_strava_photo boolean default false
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_first_name text := btrim(coalesce(p_first_name, ''));
  v_last_name text := btrim(coalesce(p_last_name, ''));
  v_member_number text := upper(btrim(coalesce(p_member_number, '')));
  v_gender text := btrim(coalesce(p_gender, ''));
  v_city text := btrim(coalesce(p_city, ''));
begin
  if v_user_id is null then
    raise exception 'Necesitas iniciar sesion para continuar.';
  end if;

  if v_first_name = '' or v_last_name = '' then
    raise exception 'Debes indicar nombre y apellidos.';
  end if;

  if v_email = '' then
    raise exception 'Debes indicar un email valido.';
  end if;

  if v_member_number = '' or v_member_number !~ '^L-[0-9]{3}$' then
    raise exception 'El numero de socio debe tener formato L-000.';
  end if;

  if v_member_number = 'L-000' then
    raise exception 'L-000 queda reservado para administracion.';
  end if;

  if v_gender not in ('men', 'women') then
    raise exception 'El sexo para la clasificacion no es valido.';
  end if;

  update public.member_profiles
  set
    email = v_email,
    first_name = v_first_name,
    last_name = v_last_name,
    member_number = v_member_number,
    gender = v_gender,
    city = v_city,
    upload_photo = coalesce(nullif(p_upload_photo, ''), upload_photo),
    photo_source = case
      when p_use_strava_photo and strava_connected then 'strava'
      else 'upload'
    end
  where user_id = v_user_id;

  if not found then
    raise exception 'No hemos encontrado tu perfil.';
  end if;
exception
  when unique_violation then
    if exists (
      select 1
      from public.member_profiles
      where lower(email) = v_email
        and user_id <> v_user_id
    ) then
      raise exception 'Ya existe otro socio con ese email.';
    end if;

    if exists (
      select 1
      from public.member_profiles
      where upper(member_number) = v_member_number
        and user_id <> v_user_id
    ) then
      raise exception 'Ya existe otro socio con ese numero.';
    end if;

    raise;
end;
$$;

revoke all on function public.update_current_member_profile(text, text, text, text, text, text, text, boolean) from public;
grant execute on function public.update_current_member_profile(text, text, text, text, text, text, text, boolean) to authenticated;

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
    )
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
    year_elevation = 0
  where user_id = v_user_id;

  if not found then
    raise exception 'No hemos encontrado tu perfil.';
  end if;
end;
$$;

revoke all on function public.clear_current_member_strava() from public;
grant execute on function public.clear_current_member_strava() to authenticated;

create or replace function public.find_member_profile_for_password_reset(
  p_email text,
  p_member_number text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select user_id
  into v_user_id
  from public.member_profiles
  where lower(email) = lower(btrim(coalesce(p_email, '')))
    and upper(member_number) = upper(btrim(coalesce(p_member_number, '')))
  limit 1;

  if v_user_id is null then
    raise exception 'No hemos encontrado un socio con ese email y numero.';
  end if;

  return v_user_id;
end;
$$;

revoke all on function public.find_member_profile_for_password_reset(text, text) from public;
grant execute on function public.find_member_profile_for_password_reset(text, text) to service_role;
