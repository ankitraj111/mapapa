# AI Revenue Operator — Live E2E Testing & Production Runbook

This runbook provides step-by-step verification checklists for validating every real-world integration, security safeguard, payment workflow, and autonomous AI capability in the **AI Revenue Operator** platform.

---

## 1. Prerequisites & Environment Setup

Ensure environment variables are configured in `.env` (or docker-compose):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/airevenue` |
| `SPRING_DATA_REDIS_HOST` | Redis cache & queue host | `localhost` |
| `JWT_SECRET` | 256-bit secret key for authentication | `[Secure Random String]` |
| `GEMINI_API_KEY` | Google Gemini AI Key | `AIzaSy...` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth Client ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth Client Secret | `GOCSPX-...` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_TYP96qdegz7nIV` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `kZjnPVYSUgf5kT2Cz4QkpGuk` |

---

## 2. Inbound Website Lead Capture & Autonomous AI Qualification

### Verification Steps:
1. **Send Inbound Webhook Lead**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/webhooks/leads/tech-agency \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Alex",
       "lastName": "Rivera",
       "email": "alex.rivera@fintechcorp.io",
       "phone": "+1 555-0199",
       "company": "Fintech Corp",
       "requirement": "We need custom CRM development with 2-month timeline and $40,000 budget.",
       "estimatedBudget": 40000,
       "timeline": "2 months"
     }'
   ```
2. **Verify Response**:
   - HTTP 200 with status `"INGESTED_AND_PROCESSING"` and a generated `leadId`.
3. **Verify Deduplication & Idempotency**:
   - Immediately re-send the exact same payload within 5 minutes.
   - Expected response: `"status": "DUPLICATE_IGNORED"`.
4. **Verify Pipeline & Scoring**:
   - Check lead in Dashboard (`http://localhost:3000/leads`).
   - Expected Score: $\ge 80$ (Hot lead).
   - Expected Pipeline Status: `HOT` or `QUALIFIED`.
   - Autonomous AI Response generated in `Conversation`.

---

## 3. Google Workspace (Gmail & Google Calendar) Verification

### Verification Steps:
1. **Connect Account**:
   - Navigate to `http://localhost:3000/integrations`.
   - Click **Connect Gmail & Calendar**.
   - Complete Google OAuth consent.
2. **Verify Gmail Inbound & Token Expiry Resilience**:
   - Send an inquiry email to the connected Gmail account.
   - Run manual poll or wait for 60s background cycle.
   - Confirm email parsed into `Conversation` and AI reply generated.
   - **Simulate Token Expiry**: Revoke token in Google Account Security settings.
   - Next poll detects 401 `invalid_grant` $\rightarrow$ transitions status to `RECONNECT_REQUIRED`.
   - Amber warning badge and 1-click reconnect button display in UI.
3. **Verify Google Calendar Booking**:
   - Send lead a meeting booking request.
   - Confirm proposed slot checks `getFreeBusy` on Google Calendar API.
   - Confirm booking creates Google Calendar Event with Google Meet link and attendees.

---

## 4. WhatsApp Business Cloud API Sandbox

### Verification Steps:
1. **Webhook Challenge Verification**:
   ```bash
   curl -X GET "http://localhost:8080/api/v1/webhooks/whatsapp/tech-agency?hub.mode=subscribe&hub.verify_token=tech-agency_whatsapp_secret&hub.challenge=CHALLENGE_CODE_123"
   ```
   - Expected output: `CHALLENGE_CODE_123` (HTTP 200).
2. **Simulate Inbound WhatsApp Message**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/webhooks/whatsapp/tech-agency \
     -H "Content-Type: application/json" \
     -d '{
       "entry": [{
         "changes": [{
           "value": {
             "messages": [{
               "id": "wamid.HBgLMTIzNDU2Nzg5MA==",
               "from": "919876543210",
               "text": { "body": "Hi, we are looking for enterprise AI automation consulting." }
             }]
           }
         }]
       }]
     }'
   ```
3. **Verify Processing**:
   - Webhook returns HTTP 200 `EVENT_RECEIVED`.
   - Idempotency prevents duplicate processing of same `wamid` for 7 days.

---

## 5. Razorpay Payment Gateway & Instant Activation

### Verification Steps:
1. **Create Order**:
   - Navigate to `http://localhost:3000/settings` $\rightarrow$ Billing & Subscription tab.
   - Click **Upgrade Tier** on "Professional" plan ($99/mo).
   - Razorpay standard checkout popup opens with Test Mode pre-configured.
2. **Simulate Test Payment**:
   - In Razorpay modal, select **Netbanking / Card (Success)**.
   - On completion, `POST /api/v1/billing/razorpay/verify` validates HMAC SHA256 signature.
   - Tenant plan upgrades to `PROFESSIONAL` immediately.
   - Quotas refreshed (500 leads/mo, 5 seats).
3. **Webhook Redundancy Test**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/webhooks/razorpay \
     -H "Content-Type: application/json" \
     -H "X-Razorpay-Signature: [HMAC_SHA256]" \
     -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test_123","order_id":"order_test_456","amount":9900,"currency":"INR"}}}}'
   ```

---

## 6. Security, Anti-XSS & Rate Limiting Audit

### Verification Steps:
1. **Anti-XSS Sanitization**:
   - Send lead with `<script>alert('xss')</script><b>Inquiry</b>`.
   - Verify saved name/requirement has script and HTML stripped cleanly.
2. **Rate Limiting Protection**:
   - Execute 65 rapid requests within 10 seconds to `/api/v1/webhooks/leads/tech-agency`.
   - First 60 return HTTP 200.
   - 61st to 65th return HTTP 429 (`Too Many Requests`, `Retry-After: 60`).
3. **Multi-Tenant Boundary Isolation**:
   - Verify Tenant A's JWT token receives HTTP 404/403 when requesting Tenant B's Lead IDs or Settings.

---

## 7. Production Deployment Commands

### Docker Compose Startup:
```bash
# Build and run all services in detached mode
docker-compose -f docker-compose.prod.yml up -d --build

# Verify container health status
docker-compose -f docker-compose.prod.yml ps

# View backend and frontend logs
docker-compose -f docker-compose.prod.yml logs -f backend frontend
```

### Health & Metrics Endpoints:
- Application Health: `http://localhost:8080/actuator/health`
- Prometheus Metrics: `http://localhost:8080/actuator/prometheus`
- Frontend UI: `http://localhost:3000`
