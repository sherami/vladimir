create table if not exists pp_publication_drafts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references pp_properties(id),
  calculation_run_id uuid not null references pp_calculation_runs(id),
  headline text,
  summary text,
  why_buy jsonb not null default '[]'::jsonb,
  why_not_buy jsonb not null default '[]'::jsonb,
  best_for jsonb not null default '[]'::jsonb,
  not_suitable_for jsonb not null default '[]'::jsonb,
  source_disclosures jsonb not null default '[]'::jsonb,
  scenario_disclosures jsonb not null default '[]'::jsonb,
  created_by text not null,
  updated_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id,calculation_run_id)
);

alter table pp_publications
  add column if not exists snapshot jsonb;
