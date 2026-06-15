create extension if not exists pgcrypto;

create type public.organization_role as enum ('admin', 'employee');
create type public.member_status as enum ('active', 'invited', 'disabled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'employee',
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_user_id_idx on public.organization_members(user_id);
create index organization_members_organization_id_idx on public.organization_members(organization_id);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.is_org_admin(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can read their organizations"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

create policy "Admins can update their organizations"
on public.organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

create policy "Members can read memberships in their organizations"
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Admins can manage memberships"
on public.organization_members
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, 'organization')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.unique_organization_slug(base_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text := nullif(public.slugify(base_name), '');
  candidate text;
  suffix int := 0;
begin
  if base_slug is null then
    base_slug := 'organization';
  end if;

  candidate := base_slug;

  while exists (select 1 from public.organizations where slug = candidate) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  organization_name text;
  organization_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  organization_name := nullif(new.raw_user_meta_data ->> 'organization_name', '');

  if organization_name is not null then
    insert into public.organizations (name, slug, created_by)
    values (organization_name, public.unique_organization_slug(organization_name), new.id)
    returning id into organization_id;

    insert into public.organization_members (organization_id, user_id, role, status)
    values (organization_id, new.id, 'admin', 'active');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
