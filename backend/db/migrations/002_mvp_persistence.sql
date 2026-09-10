create extension if not exists pgcrypto;

create table if not exists pp_properties (
  id uuid primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pp_sources (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references pp_properties(id),
  document_type text not null,
  issuer text,
  source_date date,
  received_at timestamptz not null default now(),
  status text not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists pp_calculation_runs (
  id uuid primary key,
  property_id uuid not null references pp_properties(id),
  engine_version text not null,
  methodology_version text not null,
  input_snapshot_hash text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists ix_pp_runs_property_created
  on pp_calculation_runs(property_id,created_at desc);

create table if not exists pp_publications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references pp_properties(id),
  calculation_run_id uuid not null references pp_calculation_runs(id),
  published_at timestamptz not null default now(),
  published_by text not null
);

create index if not exists ix_pp_publications_property_created
  on pp_publications(property_id,published_at desc);

create table if not exists pp_audit_log (
  id bigserial primary key,
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);
