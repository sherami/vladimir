CREATE TABLE IF NOT EXISTS pp_workspace_users (
  email text PRIMARY KEY,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN','ANALYST','ADVISOR','EDITOR','VIEWER')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
