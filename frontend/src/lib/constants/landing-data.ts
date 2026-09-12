/* Landing Page Data and Presets */
import {
  Activity,
  Database,
  ShieldCheck,
  Zap,
  Lock,
  Globe,
} from 'lucide-react';

export const CLIENT_LOGOS = [
  { name: 'M3M India', src: '/images/ravan/client-m3m.png' },
  { name: 'Oswaal Books', src: '/images/ravan/client-oswaal.png' },
  { name: 'Tata Group', src: '/images/ravan/client-logo-1.svg' },
  { name: 'Lodha Luxury', src: '/images/ravan/client-logo-2.png' },
  { name: 'Godrej Properties', src: '/images/ravan/client-logo-3.png' },
  { name: 'DLF CyberCity', src: '/images/ravan/client-logo-4.webp' },
  { name: 'Sobha Realty', src: '/images/ravan/client-logo-5.png' },
  { name: 'Prestige Group', src: '/images/ravan/client-logo-6.png' },
  { name: 'Brigade Group', src: '/images/ravan/client-logo-7.png' },
  { name: 'Hiranandani Communities', src: '/images/ravan/client-logo-8.png' },
  { name: 'Piramal Realty', src: '/images/ravan/client-logo-9.png' },
  { name: 'Mahindra Lifespaces', src: '/images/ravan/client-logo-10.png' },
  { name: 'Shapoorji Pallonji', src: '/images/ravan/client-logo-11.png' },
];

export const CLIENTS = [
  'TechCorp Global', 'Apex Digital', 'Elevate AI', 'HyperScale Ventures',
  'Pulse Marketing', 'Fintech Alpha', 'Singhania Group', 'ScaleOps Media',
  'Nexus Partners', 'GrowthForge'
];

export const SCENARIOS = [
  {
    id: 'agency',
    name: 'Digital Agency Retainer',
    prospect: 'Rahul Sharma (TechCorp)',
    inquiry: 'We need custom AI sales automation & CRM pipeline setup. Budget is ₹5,00,000.',
    budget: '₹5,00,000',
    timeline: 'Within 30 days',
    score: 94,
    status: 'HOT',
    aiReply: 'Thanks Rahul! Our enterprise sprint covers full CRM & multi-channel AI automation. I have reserved Thursday 3:00 PM for an engineering demo. Does that work?',
    action: 'Booked Google Meet for Thursday 3:00 PM',
  },
  {
    id: 'saas',
    name: 'B2B SaaS Lead',
    prospect: 'Sarah Jenkins (GlobalCloud)',
    inquiry: 'Looking for 24/7 lead qualification for our website and WhatsApp funnel.',
    budget: '$25,000 / yr',
    timeline: 'Next quarter',
    score: 88,
    status: 'QUALIFIED',
    aiReply: 'Hi Sarah! We integrate directly with WhatsApp Cloud & Webhooks with <5s response time. Would you like a 15-min sandbox walkthrough tomorrow?',
    action: 'Dispatched instant qualification & proposed demo slot',
  },
  {
    id: 'enterprise',
    name: 'Custom Enterprise Deal',
    prospect: 'Vikram Singhania (Singhania Group)',
    inquiry: 'Require on-premise SLA and HIPAA/GDPR compliant lead routing.',
    budget: '₹15,00,000+',
    timeline: 'Immediate',
    score: 98,
    status: 'HOT',
    aiReply: 'Namaste Vikram ji. We offer dedicated tenant isolation with full audit logs and enterprise SLAs. Connecting you with our Solutions Director.',
    action: 'Escalated to Senior Solutions Director & flagged VIP',
  }
];

export const TRANSCRIPT_STEPS = [
  {
    speaker: 'PROSPECT',
    time: '00:04',
    text: 'Hi, we are an agency getting 200+ inbound leads a month. We miss leads after 6 PM.',
    annotation: 'Inbound Captured via Website Webhook',
    badge: 'NEW LEAD',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    speaker: 'OPERATOR',
    time: '00:09',
    text: 'Hello! AI Revenue Operator responds in under 5 seconds 24/7 via WhatsApp, Email & Webhook. What is your average retainer size and target timeline?',
    annotation: 'Sub-5s Autonomous Reply with Value-Focused Qualification',
    badge: 'QUALIFYING',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    speaker: 'PROSPECT',
    time: '00:27',
    text: 'Average client retainer is ₹1,50,000/mo. We need to deploy this within the next 2 weeks.',
    annotation: 'Budget & Urgent Timeline Extracted with High Buying Intent',
    badge: 'HIGH INTENT',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    speaker: 'OPERATOR',
    time: '00:35',
    text: 'Understood. Based on 200 leads at ₹1.5L deal size, capturing night leads typically adds 6–8 closed retainers monthly. Let’s do a live architecture walkthrough on Google Meet. How does tomorrow at 4:00 PM sound?',
    annotation: 'Score: 95/100 (HOT) · Proposing Calendar Slot with Meet Link',
    badge: 'HOT LEAD 🔥',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    speaker: 'PROSPECT',
    time: '00:48',
    text: 'Tomorrow 4 PM works perfectly.',
    annotation: 'Prospect Confirms Slot',
    badge: 'CONFIRMED',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    speaker: 'OPERATOR',
    time: '00:54',
    text: 'Confirmed! Google Calendar invite with Meet video link dispatched to your email. Looking forward to speaking with you!',
    annotation: 'Google Calendar Event Created · Status: MEETING_BOOKED',
    badge: 'MEETING_BOOKED',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
];

export const VOICE_SAMPLES = [
  {
    id: 'maya',
    name: 'Maya',
    role: 'Consultative B2B Agency Specialist',
    language: 'Hinglish Native (Hindi + English)',
    accent: 'Urban Indian / Corporate Consultative',
    audioText: 'Namaste Rahul ji! Main AI Revenue Operator se Maya bol rahi hoon. Aapne TechCorp ke AI lead automation ke liye inquiry drop ki thi. Aapka average client retainer kitna rehta hai?',
    translation: 'Hello Rahul ji! This is Maya from AI Revenue Operator. You dropped an inquiry for TechCorp lead automation. What is your average client retainer size?',
    avatar: '👩',
    latency: '138ms',
    sampleTag: 'MOST POPULAR · AGENCIES'
  },
  {
    id: 'aryan',
    name: 'Aryan',
    role: 'Enterprise Tech & SaaS Closer',
    language: 'Indian English · Neutral Corporate',
    accent: 'Modern Pan-Indian Tech',
    audioText: 'Hi Sarah! Aryan here from Operator. We handle sub-150ms real-time voice streaming with zero data loss and automated Google Meet calendar locking. What is your target deployment timeline?',
    translation: 'Enterprise technical discovery & timeline qualification.',
    avatar: '👨',
    latency: '142ms',
    sampleTag: 'B2B SAAS & TECH'
  },
  {
    id: 'pooja',
    name: 'Pooja',
    role: 'Luxury Real Estate & Wealth Advisory',
    language: 'Polite Conversational Hinglish',
    accent: 'Premium / High-Ticket Hospitality',
    audioText: 'Namaste Vikram ji. Singhania Group ke luxury penthouse project ke regarding call kar rahi hoon. Hum verified buyers ko instant 30-minute discovery slots allocate kar rahe hain. Kya kal shaam 4 baje convenient rahega?',
    translation: 'High-ticket budget discovery & immediate executive slot scheduling.',
    avatar: '👩‍💼',
    latency: '140ms',
    sampleTag: 'LUXURY REAL ESTATE'
  }
];


export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    desc: 'Essential AI sales automation for boutique agencies and founders.',
    popular: false,
    features: [
      '1 Workspace Tenant',
      '500 Leads / month',
      'Autonomous First-Touch & Qualification',
      'Mathematical Lead Scoring Engine (0-100)',
      'Business Knowledge Base Grounding',
      'REST Webhook & Embed Form',
      'Standard Email Support',
    ],
    cta: 'Deploy Starter',
  },
  {
    name: 'Professional',
    price: '₹9,999',
    period: '/month',
    desc: 'High-volume autonomous revenue operations for growing sales teams.',
    popular: true,
    features: [
      '5 Team Member Seats',
      '2,500 Leads / month',
      'Multi-Touch Automated Follow-up Sequences',
      'Google Calendar & Gmail Direct Sync',
      'WhatsApp Business Cloud API Connector',
      'AI Command Center Natural Language Console',
      'Seamless Human Handoff Queue',
      'Priority 24/7 SLA Support',
    ],
    cta: 'Deploy Professional',
  },
  {
    name: 'Enterprise',
    price: '₹24,999',
    period: '/month',
    desc: 'Full-scale enterprise pipeline autonomy with custom AI tone models.',
    popular: false,
    features: [
      'Unlimited Team Seats',
      '10,000+ Leads / month',
      'Custom Brand Voice & AI Tone Fine-Tuning',
      'Multi-Channel Webhook & CRM Sync',
      'Advanced Executive Analytics & ROI Tracking',
      'Custom Security Audits & Role Isolation',
      'Dedicated Account Engineer',
    ],
    cta: 'Deploy Enterprise',
  },
];

export const FAQS = [
  {
    q: 'What is an AI Revenue Operator?',
    a: 'An AI Revenue Operator is an autonomous digital sales employee that manages your entire inbound pipeline 24/7. It ingests leads from website forms, webhooks, and WhatsApp in sub-5 seconds, conducts voice qualification, scores leads from 0 to 100, and locks confirmed Google Meet discovery calls without human intervention.',
  },
  {
    q: 'How does lead qualification & mathematical scoring work?',
    a: 'When an inquiry arrives, the AI conducts conversational discovery to extract requirement scope, budget range, and timeline urgency. Leads are scored 0–100 using a deterministic model: Budget (+25 pts), Timeline (+20 pts), Requirement (+20 pts), Company fit (+15 pts), and Intent (+10 pts). Scores 70+ are tagged HOT and routed immediately for meeting bookings.',
  },
  {
    q: 'What is the latency between form submission and the outbound call?',
    a: 'Average webhook processing latency is 18 milliseconds. The automated outbound voice call or WhatsApp engagement initiates within 3 to 5 seconds of the prospect submitting their information on your website, engaging buyers at the moment of peak intent.',
  },
  {
    q: 'Can a human sales rep take over during or after a conversation?',
    a: 'Yes, seamlessly. If a prospect asks to speak with a human or if an enterprise deal flags custom handling, the system marks the deal for HUMAN_REVIEW, triggers a priority WhatsApp/Slack alert, and pauses autonomous replies so your rep can take over in the live console.',
  },
  {
    q: 'How do I connect my website forms, CRM, and WhatsApp?',
    a: 'Setup takes under 5 minutes. You receive a dedicated HTTPS webhook URL compatible with WordPress, Webflow, React, Typeform, HubSpot, and GoHighLevel. WhatsApp connects via official Meta Cloud API with 7-day message deduplication.',
  },
  {
    q: 'Does it support Google Calendar and custom timezones?',
    a: 'Yes. Qualified prospects are given live booking options that check your real-time Free/Busy calendar availability, generate unique Google Meet conference links, and automatically send calendar invites synced across all attendee timezones.',
  },
  {
    q: 'Is Operator compliant with Indian DND and telecommunication rules?',
    a: '100%. Operator integrates automated TRAI DND registry scrubbing, explicit opt-in recording, consent timestamping, and AES-256 encrypted audit logging. Numbers on active DND registries are automatically filtered to guarantee complete regulatory compliance.',
  },
  {
    q: 'What happens to inquiries arriving after 6 PM and on weekends?',
    a: 'Operator operates 24/7/365 with zero downtime. Night and weekend leads are called or messaged within 5 seconds, fully qualified, and booked into your calendar for the next business morning before competitors even open their inbox.',
  },
];

export const PLAYBOOKS = [
  {
    id: 'agency',
    title: 'Digital Marketing & Performance Agencies',
    tag: 'HIGH-TICKET RETAINERS',
    badgeColor: 'bg-orange-50 text-[#e8572a] border-orange-200',
    leadChannels: ['Website Form Webhooks', 'Meta Ad Inbounds', 'WhatsApp Cloud API'],
    avgTicket: '₹1,50,000 – ₹5,00,000 / mo',
    metrics: [
      { label: 'Night Lead Capture', value: '100%', change: '+100% after 6 PM' },
      { label: 'Lead Response Time', value: '3.8s', change: 'vs 4.2h industry avg' },
      { label: 'Discovery Call Rate', value: '68%', change: '+42% pipeline lift' },
      { label: 'Monthly Retainers Closed', value: '6–8', change: 'avg new clients' },
    ],
    qualificationFocus: [
      'Extracts monthly ad spend budget and business niche',
      'Confirms decision maker status (Founder / CMO / Growth Head)',
      'Identifies target deliverables (SEO, Meta Ads, Funnel Revamp)',
      'Direct Google Meet booking with account strategist',
    ],
    sampleSnippet: 'Operator engages prospect, confirms ₹3,00,000/mo retainer budget, and locks in Thursday 3 PM Google Meet slot within 48 seconds.',
  },
  {
    id: 'realestate',
    title: 'High-Ticket Real Estate & Developers',
    tag: 'LUXURY INVENTORIES',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    leadChannels: ['Facebook / Instagram Lead Forms', 'Google Search Ads', '99acres / MagicBricks Webhook'],
    avgTicket: '₹1.2 Cr – ₹7.5 Cr',
    metrics: [
      { label: 'Site Visit Conversion', value: '+340%', change: 'verified bookings' },
      { label: 'Cost Per Qualified Lead', value: '-64%', change: 'efficient ad spend' },
      { label: 'First-Touch Latency', value: '4.1s', change: 'instant phone/WA' },
      { label: 'Pipeline ROI', value: '8.4x', change: 'verified by developers' },
    ],
    qualificationFocus: [
      'Discovers carpet area requirement (2BHK, 3BHK, Luxury Penthouse)',
      'Verifies budget readiness and financing vs cash payout',
      'Captures preferred location (Golf Course Road, BKC, etc.)',
      'Schedules physical or VR site visit with project sales director',
    ],
    sampleSnippet: 'Operator confirms 3BHK luxury requirement in DLF CyberCity, ₹2.5 Cr budget, and reserves Sunday 11 AM VIP site visit.',
  },
  {
    id: 'saas',
    title: 'B2B SaaS & Enterprise Software',
    tag: 'ANNUAL CONTRACT VALUE (ACV)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    leadChannels: ['Interactive Website Demo CTA', 'G2 / Capterra Inbounds', 'Segment & Zapier Webhooks'],
    avgTicket: '$15,000 – $75,000 / yr',
    metrics: [
      { label: 'Demo Fill Rate', value: '4.8x', change: 'zero dropped demos' },
      { label: 'Audio Latency', value: '142ms', change: 'natural live voice' },
      { label: 'MQL to SQL Ratio', value: '78%', change: '+38% quality boost' },
      { label: 'Rep Time Saved', value: '26 hrs', change: 'per SDR / week' },
    ],
    qualificationFocus: [
      'Captures tech stack, team seats, and annual software budget',
      'Scores urgency and procurement timeline (<30 days vs next quarter)',
      'Checks GDPR/SOC-2 compliance prerequisite before demo',
      'Dispatches verified Google Calendar invite with custom agenda',
    ],
    sampleSnippet: 'Operator qualifies 50-seat requirement, confirms $35k budget, and auto-routes to Senior Solutions Architect with calendar sync.',
  },
  {
    id: 'consulting',
    title: 'High-Ticket Consulting & Advisory',
    tag: 'EXECUTIVE ADVISORY',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    leadChannels: ['LinkedIn Inbound Campaigns', 'Executive Newsletter', 'Direct Referral Webhook'],
    avgTicket: '₹5,00,000 – ₹25,00,000',
    metrics: [
      { label: 'Calendar Attendance', value: '92%', change: 'with SMS/WA reminders' },
      { label: 'Unqualified Filter', value: '88%', change: 'no tire-kickers' },
      { label: 'Lead Scoring Accuracy', value: '97.4%', change: 'deterministic engine' },
      { label: 'Annual SDR Savings', value: '₹15.6L', change: 'vs 2 full-time SDRs' },
    ],
    qualificationFocus: [
      'Assesses current company annual revenue (>₹10 Cr baseline)',
      'Filters tire-kickers with structured diagnostic questions',
      'Confirms sponsor authority and executive decision urgency',
      'Routes high-intent deals straight to the Managing Partner',
    ],
    sampleSnippet: 'Operator checks annual turnover (₹25 Cr), verifies corporate restructuring need, and sets up 30-min strategy advisory call.',
  },
];


export const SDR_COMPARISON_DATA = [
  {
    metric: 'Annual Financial Cost',
    sdr: '₹14,40,000 + PF/Bonus (2 SDRs)',
    chatbot: '₹36,000 / year',
    operator: '₹1,19,988 / year (₹9,999/mo)',
    highlight: 'Operator saves ₹13,20,000+ per year',
  },
  {
    metric: 'Coverage & Availability',
    sdr: '8 hrs/day · Mon–Fri only',
    chatbot: '24/7 (Rigid canned text)',
    operator: '24/7/365 Autonomous Voice & Text',
    highlight: 'Never misses night or weekend leads',
  },
  {
    metric: 'First-Touch Speed',
    sdr: '4.2 Hours (Industry Average)',
    chatbot: 'Instant (<1 sec, low value)',
    operator: 'Sub-4.8 Seconds Guaranteed',
    highlight: 'Speed wins the conversation',
  },
  {
    metric: 'Lead Scoring Intelligence',
    sdr: 'Subjective rep intuition',
    chatbot: 'None (Treats all visitors same)',
    operator: '0–100 Mathematical Engine (Budget + Intent)',
    highlight: 'Deterministic buying scoring',
  },
  {
    metric: 'Follow-up Cadence',
    sdr: 'Often dropped after 1–2 attempts',
    chatbot: 'Zero follow-up capability',
    operator: 'Deterministic 4-step multi-channel sequence',
    highlight: 'Stops automatically when lead replies',
  },
  {
    metric: 'Meeting Booking',
    sdr: 'Back-and-forth email scheduling',
    chatbot: 'Dumb Calendly link drop',
    operator: 'Proactive Free/Busy slot proposal with Google Meet',
    highlight: 'Instant calendar confirmation',
  },
  {
    metric: 'Human Representative Handoff',
    sdr: 'Manual CRM updates required',
    chatbot: 'Generic ticket in unread inbox',
    operator: 'Instant push alert with structured dossier',
    highlight: 'Seamless rep takeover with zero context loss',
  },
  {
    metric: 'Monthly Qualified Capacity',
    sdr: '250–350 leads max per rep',
    chatbot: 'High volume, near-zero quality',
    operator: '2,500+ Qualified Inbound Leads',
    highlight: 'Scales instantly during high-traffic ad spikes',
  },
];

export const SECURITY_METRICS = [
  {
    title: '99.98% High Availability SLA',
    desc: 'Redundant containerized architecture with sub-second health checks and multi-zone active-passive failover.',
    icon: Activity,
    badge: '99.98% UPTIME',
  },
  {
    title: 'Dead-Letter Queue (DLQ) Zero-Loss',
    desc: 'Inbound webhooks are committed to persistent storage instantly. 3-stage exponential backoff guarantees 0 lost leads.',
    icon: Database,
    badge: 'ZERO DATA LOSS',
  },
  {
    title: '256-Bit AES Tenant Isolation',
    desc: 'Every tenant workspace is isolated at the database and memory layer. Client data is never mixed or cross-trained.',
    icon: ShieldCheck,
    badge: 'ENTERPRISE ISOLATION',
  },
  {
    title: 'Sub-150ms Neural Voice Streaming',
    desc: 'Ultra-low latency duplex audio pipeline with dynamic acoustic echo cancellation and natural interruption handling.',
    icon: Zap,
    badge: '142ms LATENCY',
  },
  {
    title: 'Anti-XSS & Payload Sanitization',
    desc: 'Every incoming lead payload passes through strict input sanitization filters that strip scripts, CSS injections, and exploits.',
    icon: Lock,
    badge: 'SECURITY HARDENED',
  },
  {
    title: 'MeitY & GDPR Data Localization',
    desc: 'Compliant with Indian digital personal data protection norms and GDPR standards with Mumbai AWS data residency.',
    icon: Globe,
    badge: 'DATA RESIDENCY',
  },
];

export const CLIENT_REVIEWS = [
  {
    quote: 'We missed 40% of our high-budget inquiries because our sales reps clocked out at 6 PM. Operator qualified a ₹4.5 Lakh retainer at 11:30 PM on a Saturday and booked a Monday 10 AM Google Meet. Paid for itself on Day 3.',
    author: 'Vikramaditya Singhal',
    role: 'Managing Director, Apex Digital Media',
    location: 'Gurgaon, India',
    metrics: '8.4x Pipeline ROI · ₹32L New Pipeline',
    rating: 5,
  },
  {
    quote: 'Traditional chatbots felt robotic and cheapened our luxury real estate brand. Operator speaks with immense polish, knows every square foot specification, and booked 140+ verified site visits in month one.',
    author: 'Ananya Deshmukh',
    role: 'VP Marketing & Sales, Crestline Luxury Estates',
    location: 'Mumbai, India',
    metrics: '+340% Site Visits · 4.1s First Touch',
    rating: 5,
  },
  {
    quote: 'Our SDR team was drowning in tire-kickers. The 0-100 mathematical scoring algorithm immediately filtered out unqualified leads and only passed high-budget, ready-to-buy prospects to our closers.',
    author: 'Rohan Mehta',
    role: 'Co-Founder & CEO, ScaleForge Technologies',
    location: 'Bengaluru, India',
    metrics: '26 SDR Hours Saved/Wk · 96/100 Intent',
    rating: 5,
  },
];

export const RAVAN_SCRUBBER_TAPES = [
  {
    id: 'tape-recovery',
    tapeCode: 'TAPE RR-2209-117 · 00:56 · HI-IN → MR-IN',
    disclaimer: 'RE-ENACTED FROM A REAL RECOVERY CALL · DETAILS CHANGED',
    account: 'LOAN ACCOUNT XX4217 · PII MASKED',
    title: 'One call. Scrub it yourself.',
    label: 'AGNI',
    duration: 56,
    markers: [
      { time: '00:04', seconds: 4, label: '00:04 LANGUAGE DETECTED HI-IN', leftPct: 7.1 },
      { time: '00:41', seconds: 41, label: '00:41 PTP CAPTURED', leftPct: 73.2 },
      { time: '00:53', seconds: 53, label: '00:53 CRM UPDATED PTP', leftPct: 94.6 },
    ],
    dialogues: [
      {
        start: 0,
        end: 15,
        speaker: 'AGNI',
        vernacular: 'नमस्ते रमेश जी, मैं कॉल कर रही हूँ आपके एक्टिव लोन के संबंध में।',
        transliteration: 'Namaste Ramesh ji, main call kar rahi hoon aapke active loan ke sambandh mein.',
        translation: '“Namaste Ramesh ji, I am calling regarding your active loan account.”',
      },
      {
        start: 16,
        end: 38,
        speaker: 'RAMESH',
        vernacular: 'हो, मला माहिती आहे. पण या महिन्यात थोडी अडचण आहे.',
        transliteration: 'Ho, mala mahiti aahe. Pan ya mahinyat thodi adchan aahe.',
        translation: '“Yes, I know. But there is a slight difficulty this month.”',
      },
      {
        start: 39,
        end: 50,
        speaker: 'AGNI',
        vernacular: 'काही हरकत नाही. आपण येत्या सोमवारी पेमेंट करू शकता का?',
        transliteration: 'Kahi harkat nahi. Aapan yetya Somwari payment karu shakta ka?',
        translation: '“No problem at all. Could you make the payment by coming Monday?”',
      },
      {
        start: 51,
        end: 56,
        speaker: 'AGNI',
        vernacular: 'छान! काही प्रॉब्लेम असेल तर मिस्ड कॉल करा. खूप धन्यवाद, रमेश जी.',
        transliteration: 'Chhan! Kahi problem asel tar missed call kara. Khup dhanyavad, Ramesh ji.',
        translation: '“If anything comes up, just leave a missed call. Thank you so much, Ramesh ji.”',
      },
    ]
  },
  {
    id: 'tape-sales',
    tapeCode: 'TAPE OP-8821-204 · 00:54 · HI-IN → EN-IN',
    disclaimer: 'RE-ENACTED FROM A REAL B2B AGENCY QUALIFICATION RUN · DETAILS MASKED',
    account: 'AGENCY INBOUND #9812 · PII MASKED',
    title: 'One lead. Scrub it yourself.',
    label: 'OPERATOR',
    duration: 54,
    markers: [
      { time: '00:04', seconds: 4, label: '00:04 WEBHOOK INGESTED', leftPct: 7.4 },
      { time: '00:35', seconds: 35, label: '00:35 BUDGET ₹5L QUALIFIED', leftPct: 64.8 },
      { time: '00:52', seconds: 52, label: '00:52 GOOGLE MEET BOOKED', leftPct: 96.2 },
    ],
    dialogues: [
      {
        start: 0,
        end: 15,
        speaker: 'OPERATOR',
        vernacular: 'नमस्ते राहुल जी! ऑपरेटर से बात कर रही हूँ। आपने एजेंसी ऑटोमेशन के लिए इंक्वायरी ड्रॉप की थी।',
        transliteration: 'Namaste Rahul ji! Operator se baat kar rahi hoon. Aapne agency automation ke liye inquiry drop ki thi.',
        translation: '“Hello Rahul ji! This is Operator. You dropped an inquiry for agency sales automation.”',
      },
      {
        start: 16,
        end: 38,
        speaker: 'RAHUL',
        vernacular: 'हाँ, हमारे 200+ इनबाउंड लीड्स आते हैं पर शाम 6 बजे के बाद टीम नहीं होती। बजट 5 लाख है।',
        transliteration: 'Haan, hamare 200+ inbound leads aate hain par shaam 6 baje ke baad team nahi hoti. Budget 5 lakh hai.',
        translation: '“Yes, we get 200+ inbound leads but miss them after 6 PM. Our budget is ₹5,00,000.”',
      },
      {
        start: 39,
        end: 50,
        speaker: 'OPERATOR',
        vernacular: 'समझ गई। ₹5L बजट और 30 दिन की टाइमलाइन पर हम 15-मिनट का गूगल मीट स्लॉट गुरुवार 3 बजे फिक्स कर सकते हैं?',
        transliteration: 'Samajh gayi. ₹5L budget aur 30 din ki timeline par hum 15-minute ka Google Meet slot Guruwar 3 baje fix kar sakte hain?',
        translation: '“Understood. For ₹5L budget and 30-day timeline, shall we lock in a Google Meet slot for Thursday 3 PM?”',
      },
      {
        start: 51,
        end: 54,
        speaker: 'OPERATOR',
        vernacular: 'पुष्टि हो गई! गूगल मीट लिंक आपके ईमेल पर भेज दिया गया है। धन्यवाद राहुल जी!',
        transliteration: 'Pushti ho gayi! Google Meet link aapke email par bhej diya gaya hai. Dhanyavad Rahul ji!',
        translation: '“Confirmed! Google Meet link has been dispatched to your email. Thank you Rahul ji!”',
      },
    ]
  }
];

