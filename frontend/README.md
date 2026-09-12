# Frontend Setup

## Quick Start

`ash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your settings

# 3. Run development server
npm run dev
`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| NEXT_PUBLIC_API_URL | Backend API base URL | http://localhost:8080 |
| NEXT_PUBLIC_APP_NAME | App display name | AI Revenue Operator |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Space Grotesk font
- **State**: Zustand + TanStack React Query
- **HTTP**: Axios with interceptors
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Design**: 21st.dev patterns + UI UX Pro Max dark theme

## Pages

| Route | Description |
|---|---|
| / | Landing page (public) |
| /login | Login page |
| /register | Registration |
| /onboarding | 6-step setup wizard |
| /dashboard | Main dashboard with stats |
| /leads | Lead listing with filters |
| /leads/[id] | Lead detail + conversation |
| /pipeline | Kanban pipeline view |
| /conversations | All conversations |
| /appointments | Meeting management |
| /tasks | Task management |
| /analytics | Charts and insights |
| /command | AI Command Center |
| /settings | Settings (5 tabs) |
