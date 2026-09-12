CREATE TABLE IF NOT EXISTS tenant (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    working_hours_start TIME,
    working_hours_end TIME,
    working_days JSONB,
    ai_tone VARCHAR(50),
    qualification_rules JSONB,
    scoring_rules JSONB,
    follow_up_enabled BOOLEAN DEFAULT true,
    escalation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    avatar_url VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    is_email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membership (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenant(id),
    user_id UUID REFERENCES app_user(id),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS lead (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    source VARCHAR(100),
    source_campaign VARCHAR(255),
    location VARCHAR(255),
    requirement TEXT,
    estimated_budget DECIMAL(15,2),
    timeline VARCHAR(100),
    intent VARCHAR(50),
    score INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    owner_id UUID REFERENCES app_user(id),
    qualification_status VARCHAR(100),
    conversation_summary TEXT,
    ai_summary TEXT,
    human_notes TEXT,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    next_follow_up_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    lead_id UUID REFERENCES lead(id),
    channel VARCHAR(50) NOT NULL DEFAULT 'WEBHOOK',
    status VARCHAR(50) DEFAULT 'OPEN',
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    conversation_id UUID REFERENCES conversation(id),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    sender_name VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_document (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    lead_id UUID REFERENCES lead(id),
    conversation_id UUID,
    title VARCHAR(255),
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    meeting_link VARCHAR(255),
    google_event_id VARCHAR(255),
    assigned_to_id UUID,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    lead_id UUID REFERENCES lead(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    assigned_to_id UUID,
    due_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS follow_up_sequence (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    stop_on_reply BOOLEAN DEFAULT true,
    stop_on_booking BOOLEAN DEFAULT true,
    max_follow_ups INT DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS follow_up_step (
    id UUID PRIMARY KEY,
    sequence_id UUID REFERENCES follow_up_sequence(id),
    step_number INT NOT NULL,
    delay_hours INT NOT NULL,
    message_template TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'EMAIL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheduled_follow_up (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    lead_id UUID REFERENCES lead(id),
    sequence_id UUID,
    step_id UUID,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_action (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    lead_id UUID,
    conversation_id UUID,
    action_type VARCHAR(255) NOT NULL,
    action_input JSONB,
    action_result JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    ai_model VARCHAR(100),
    prompt_version VARCHAR(100),
    token_usage INT,
    latency_ms BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    actor_type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id VARCHAR(255),
    input_summary TEXT,
    result TEXT,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    config JSONB,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prompt_version (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version INT NOT NULL,
    purpose TEXT,
    system_instructions TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, version)
);

CREATE TABLE IF NOT EXISTS notification (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
