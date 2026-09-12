-- V4: Add missing columns not in initial migration

ALTER TABLE scheduled_follow_up ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);
ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS prompt_version VARCHAR(100);
ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS token_usage INTEGER;
ALTER TABLE agent_action ADD COLUMN IF NOT EXISTS latency_ms INTEGER;
