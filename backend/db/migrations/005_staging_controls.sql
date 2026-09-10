alter table pp_users add column if not exists is_active boolean not null default true;
create index if not exists ix_pp_audit_entity on pp_audit_log(entity_type,entity_id,created_at desc);

-- calculation run payloads are application-immutable; revoke UPDATE/DELETE from app role in deployment.
-- Example (replace pp_app with actual role):
-- revoke update, delete on pp_calculation_runs from pp_app;
