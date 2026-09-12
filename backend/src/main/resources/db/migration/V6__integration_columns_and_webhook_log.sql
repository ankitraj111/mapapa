-- V6: Add missing columns to integration and create webhook_delivery_log table

ALTER TABLE integration ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'CONNECTED';
ALTER TABLE integration ADD COLUMN IF NOT EXISTS last_error_message TEXT;
ALTER TABLE integration ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS webhook_delivery_log (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    source VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE,
    payload TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    attempts INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_webhook_idempotency ON webhook_delivery_log(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_webhook_tenant_source ON webhook_delivery_log(tenant_id, source);
