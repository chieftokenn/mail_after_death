-- Supabase v1 schema for MAD (Mail After Death)
-- Email remains the primary communication channel.

create table public.profiles (
  id uuid primary key default auth.uid(),
  display_name text not null,
  kyc_level text not null default 'none',
  default_deadman_delay integer not null default 90,
  last_alive_ping timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create table public.packs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text,
  status text not null default 'draft',
  encryption_mode text not null default 'user_key',
  auto_release_after_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index packs_owner_idx on public.packs(owner_id);
alter table public.packs enable row level security;

create table public.pack_contents (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs(id) on delete cascade,
  content_kind text not null,
  storage_path text not null,
  checksum text,
  filesize bigint,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index pack_contents_pack_idx on public.pack_contents(pack_id);
alter table public.pack_contents enable row level security;

create table public.recipients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  preferred_channel text not null default 'email',
  public_key text,
  created_at timestamptz not null default now()
);

create unique index recipients_owner_email_idx on public.recipients(owner_id, email);
alter table public.recipients enable row level security;

create table public.pack_recipients (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs(id) on delete cascade,
  recipient_id uuid not null references public.recipients(id) on delete cascade,
  custom_message text,
  delivery_channel text not null default 'email',
  requires_manual_confirmation boolean not null default false,
  access_window_from timestamptz,
  access_window_to timestamptz,
  created_at timestamptz not null default now()
);

create unique index pack_recipient_unique on public.pack_recipients(pack_id, recipient_id);
alter table public.pack_recipients enable row level security;

create table public.recipient_payloads (
  id uuid primary key default gen_random_uuid(),
  pack_recipient_id uuid not null references public.pack_recipients(id) on delete cascade,
  pack_content_id uuid not null references public.pack_contents(id) on delete cascade,
  note_override text,
  created_at timestamptz not null default now()
);

create index recipient_payloads_pack_recipient_idx on public.recipient_payloads(pack_recipient_id);
alter table public.recipient_payloads enable row level security;

create table public.trigger_rules (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs(id) on delete cascade,
  type text not null default 'deadman',
  config jsonb not null default '{}'::jsonb,
  notification_sequence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index trigger_rules_pack_idx on public.trigger_rules(pack_id);
alter table public.trigger_rules enable row level security;

create table public.heartbeat_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  trigger_rule_id uuid references public.trigger_rules(id) on delete cascade,
  channel text not null default 'email',
  status text not null,
  sent_at timestamptz not null default now(),
  responded_at timestamptz
);

create index heartbeat_profile_idx on public.heartbeat_events(profile_id);
alter table public.heartbeat_events enable row level security;

create table public.release_requests (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.packs(id) on delete cascade,
  trigger_rule_id uuid references public.trigger_rules(id) on delete set null,
  opened_at timestamptz not null default now(),
  status text not null default 'pending',
  confirmed_by uuid references public.profiles(id),
  notes text
);

create index release_requests_pack_idx on public.release_requests(pack_id);
alter table public.release_requests enable row level security;

create table public.release_events (
  id uuid primary key default gen_random_uuid(),
  release_request_id uuid not null references public.release_requests(id) on delete cascade,
  pack_recipient_id uuid not null references public.pack_recipients(id) on delete cascade,
  delivery_channel text not null default 'email',
  delivery_state text not null default 'queued',
  delivery_payload jsonb,
  delivered_at timestamptz
);

create index release_events_request_idx on public.release_events(release_request_id);
alter table public.release_events enable row level security;

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  pack_id uuid references public.packs(id) on delete cascade,
  trigger_rule_id uuid references public.trigger_rules(id) on delete set null,
  channel text not null default 'email',
  step_index integer,
  status text not null,
  sent_at timestamptz not null default now(),
  response_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create index notification_pack_idx on public.notification_logs(pack_id);
alter table public.notification_logs enable row level security;

