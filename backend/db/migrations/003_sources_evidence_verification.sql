alter table pp_sources
  add column if not exists title text,
  add column if not exists uri text;

create table if not exists pp_evidence (
  id uuid primary key,
  property_id uuid not null references pp_properties(id),
  field text not null,
  value jsonb not null,
  unit text,
  status text not null,
  source_id uuid references pp_sources(id),
  as_of date,
  analyst_comment text,
  is_critical boolean not null default false,
  created_by text not null,
  supersedes_id uuid references pp_evidence(id),
  created_at timestamptz not null default now()
);

create index if not exists ix_pp_evidence_property_field_created
  on pp_evidence(property_id,field,created_at desc);

create table if not exists pp_verification_items (
  id uuid primary key,
  property_id uuid not null references pp_properties(id),
  field text,
  severity text not null check(severity in ('BLOCKER','WARNING','INFO')),
  code text not null,
  message text not null,
  state text not null default 'OPEN' check(state in ('OPEN','RESOLVED','WAIVED')),
  source_id uuid references pp_sources(id),
  resolution_comment text,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ix_pp_verify_queue
  on pp_verification_items(state,severity,created_at);
