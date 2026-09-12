-- V5: Add missing tenant subscription columns and seed default demo tenant/admin

ALTER TABLE tenant ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'GROWTH';
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS monthly_lead_limit INTEGER DEFAULT 1000;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS monthly_ai_action_limit INTEGER DEFAULT 10000;

INSERT INTO tenant (id, name, slug, timezone, currency, ai_tone, plan, subscription_status, monthly_lead_limit, monthly_ai_action_limit, is_active, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Apex Growth Digital Agency',
    'tech-agency',
    'America/New_York',
    'USD',
    'Professional, consultative, value-driven',
    'PROFESSIONAL',
    'ACTIVE',
    500,
    5000,
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- BCrypt hash for 'password123': $2a$10$7Z8v4d3e2c1b0a9f8e7d6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f
-- Standard BCrypt hash: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a
INSERT INTO app_user (id, email, password_hash, first_name, last_name, is_email_verified, is_active, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'admin@techagency.com',
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
    'Alex',
    'Morgan',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO membership (id, tenant_id, user_id, role, is_active, created_at)
SELECT 
    'c0000000-0000-0000-0000-000000000001',
    t.id,
    u.id,
    'OWNER',
    true,
    NOW()
FROM tenant t, app_user u
WHERE t.slug = 'tech-agency' AND u.email = 'admin@techagency.com'
ON CONFLICT (id) DO NOTHING;
