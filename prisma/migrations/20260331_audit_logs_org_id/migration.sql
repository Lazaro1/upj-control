-- Add organization isolation to audit logs
ALTER TABLE "audit_logs"
ADD COLUMN IF NOT EXISTS "org_id" TEXT;

CREATE INDEX IF NOT EXISTS "audit_logs_org_id_created_at_idx"
ON "audit_logs" ("org_id", "created_at");

CREATE INDEX IF NOT EXISTS "audit_logs_org_id_action_created_at_idx"
ON "audit_logs" ("org_id", "action", "created_at");

CREATE INDEX IF NOT EXISTS "audit_logs_org_id_actor_user_id_created_at_idx"
ON "audit_logs" ("org_id", "actor_user_id", "created_at");
