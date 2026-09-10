create table if not exists pp_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check(role in ('ADMIN','ANALYST','ADVISOR','EDITOR','VIEWER')),
  created_at timestamptz not null default now()
);

alter table pp_calculation_runs
  add column if not exists review_status text not null default 'PENDING'
    check(review_status in ('PENDING','APPROVED','REJECTED')),
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_comment text;

create index if not exists ix_pp_runs_review
  on pp_calculation_runs(property_id, review_status, created_at desc);
