# AI Revenue Operator

**Autonomous AI Sales Employee & Revenue Operations SaaS Platform for B2B Digital Agencies & Service Firms**

---

## ⚡ Overview

**AI Revenue Operator** provides high-growth service businesses and digital agencies with an autonomous 24/7 AI employee that captures inbound leads from multiple channels (Website Webhooks, Gmail, WhatsApp), scores and qualifies their budget, timeline, requirements, and intent, conducts automated multi-step follow-ups, and books meetings on Google Calendar with zero manual SDR overhead.

---

## 🏗️ Architecture & Tech Stack

```
ai-revenue-operator/
├── backend/          # Java 21 + Spring Boot 3.3.0 + Spring Security + JPA Hibernate + Redis
├── frontend/         # Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons
├── docs/             # Live E2E Testing Runbooks and Verification Guides
└── docker-compose.prod.yml  # Multi-service Production Stack (Postgres 16, Redis 7, Backend, Frontend)
```

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.3 | Enterprise REST API with multi-tenancy & distributed rate limiting |
| **Database** | PostgreSQL 16 | ACID multi-tenant relational persistence |
| **Cache & Distributed Queues** | Redis 7 & Webhook DLQ | Distributed caching, session validation, distributed rate limiting & DLQ |
| **Frontend** | Next.js 14 Standalone | Reactive Next.js dashboard, pipeline Kanban, command center |
| **AI Engine** | OpenAI GPT-4o / Groq Llama 3.3 | Abstracted `AIProvider` for high-speed structured qualification & responses |
| **Email** | Gmail REST API | OAuth2 with token auto-refresh & retry resilience |
| **Calendar** | Google Calendar API | Free/Busy validation & instant Google Meet link generation |
| **WhatsApp** | WhatsApp Cloud API | Direct inbound/outbound messaging with 7-day message-ID deduplication |
| **Payments** | Razorpay Standard SDK | Server order creation & HMAC SHA256 signature verification |

---

## 🚀 Quick Start (1-Command Docker)

```bash
# 1. Clone the repository and configure environment variables
cp .env.example .env

# 2. Spin up the entire production container stack
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Verify health status
docker-compose -f docker-compose.prod.yml ps
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`
- **Swagger Docs**: `http://localhost:8080/swagger-ui.html`
- **Health Endpoint**: `http://localhost:8080/actuator/health`

---

## 🔑 Demo Seed Credentials (Local / Dev Only)

> **Security Notice**: Seed data is guarded by `@Profile("!prod")` and is automatically disabled in production.

- **Email**: `admin@techagency.com`
- **Password**: `password123`
- **Tenant Workspace**: `tech-agency` (Apex Growth Digital Agency)
- **Active Plan**: `PROFESSIONAL` ($99/mo tier)
- **Sample Pipeline**: 5 pre-seeded leads (`HOT`, `MEETING_BOOKED`, `QUALIFIED`, `QUALIFYING`, `NEW`) & 1 confirmed Google Meet consultation.

---

## 🛡️ Resilience & Security Features

1. **Exponential Retry Backoff (`RetryUtils`)**: 3-attempt backoff (500ms $\rightarrow$ 1s $\rightarrow$ 2s) with jitter for 429, 500-599, and connection resets. Fail-fast for 400-499 and 401 `invalid_grant`.
2. **Google OAuth Token Auto-Recovery**: Detects token revocation, refreshes valid credentials, and transitions status to `RECONNECT_REQUIRED` with UI warning banners.
3. **Zero-Data-Loss Dead Letter Queue**: Saves incoming webhook payloads as `PENDING` before processing; archives failed deliveries as `DEAD` with retry timestamps.
4. **Channel-Specific Idempotency**:
   - **Website Inbound Leads**: 5-minute sliding window with SHA256 requirement hash.
   - **WhatsApp Cloud API**: 7-day unique message-ID (`wamid`) deduplication.
5. **Anti-XSS Sanitization (`SanitizationUtils`)**: Neutralizes `<script>`, HTML tags, and JavaScript URI protocols from prospect inputs.
6. **Distributed Redis Rate Limiting (`RateLimitingFilter`)**: 60 requests/minute per client IP across all backend cluster replicas (with in-memory fallback for local dev).

---

## 📊 Live Testing Runbook

For end-to-end verification of Gmail, Calendar, WhatsApp sandbox, Razorpay payments, and Webhooks, see:
👉 [`docs/LIVE_TESTING_RUNBOOK.md`](docs/LIVE_TESTING_RUNBOOK.md)

---

## 📜 License

Proprietary — All rights reserved.
