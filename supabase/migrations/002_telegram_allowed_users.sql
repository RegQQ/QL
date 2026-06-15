create type public.telegram_login_status as enum ('pending', 'allowed', 'expired');

create table public.telegram_allowed_users (
  telegram_user_id bigint primary key,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  allowed boolean not null default true,
  allowed_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.telegram_login_sessions (
  token text primary key,
  bot_username text not null default 'qltrade_bot',
  status public.telegram_login_status not null default 'pending',
  telegram_user_id bigint references public.telegram_allowed_users(telegram_user_id) on delete set null,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  allowed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index telegram_allowed_users_allowed_idx on public.telegram_allowed_users(allowed);
create index telegram_login_sessions_status_idx on public.telegram_login_sessions(status);
create index telegram_login_sessions_expires_at_idx on public.telegram_login_sessions(expires_at);

alter table public.telegram_allowed_users enable row level security;
alter table public.telegram_login_sessions enable row level security;
