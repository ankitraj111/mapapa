'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, Bot, Calendar,
  Check, CheckCircle2, ChevronDown, ChevronRight, Clock,
  Cpu, Database, ExternalLink, Flame, Globe, HelpCircle,
  Inbox, Layers, LineChart, Lock, Mail, MessageCircle,
  MessageSquare, Mic, Minus, Phone, Play, Plus, Menu,
  RefreshCw, Send, Shield, ShieldCheck, Sliders, Sparkles,
  Target, Terminal, TrendingUp, User, UserCheck, Users,
  Video, Volume2, Webhook, X, Zap, AlertCircle, Compass,
  ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS & STATIC TELEMETRY DATA
───────────────────────────────────────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { id: 'NEW', label: 'New', count: 18, color: 'border-blue-500 text-blue-700 bg-blue-50', dot: 'bg-blue-500', desc: 'Inbound lead captured via Website, Gmail, or WhatsApp.' },
  { id: 'CONTACTED', label: 'Contacted', count: 14, color: 'border-indigo-500 text-indigo-700 bg-indigo-50', dot: 'bg-indigo-500', desc: 'First autonomous engagement message delivered.' },
  { id: 'QUALIFYING', label: 'Qualifying', count: 22, color: 'border-violet-500 text-violet-700 bg-violet-50', dot: 'bg-violet-500', desc: 'AI evaluating budget, timeline, scope, and intent.' },
  { id: 'QUALIFIED', label: 'Qualified', count: 16, color: 'border-emerald-500 text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500', desc: 'Verified fit meeting configured business thresholds.' },
  { id: 'HOT', label: 'Hot 🔥', count: 9, color: 'border-rose-500 text-rose-700 bg-rose-50', dot: 'bg-rose-500', desc: 'Score ≥ 70. AI proposes meeting slots & invites.' },
  { id: 'MEETING_BOOKED', label: 'Meeting Booked', count: 11, color: 'border-purple-500 text-purple-700 bg-purple-50', dot: 'bg-purple-500', desc: 'Prospect confirmed. Google Meet invite dispatched.' },
  { id: 'WON', label: 'Closed Won', count: 7, color: 'border-green-600 text-green-800 bg-green-50', dot: 'bg-green-600', desc: 'Deal finalized. Revenue attributed to source channel.' },
  { id: 'LOST', label: 'Closed Lost', count: 5, color: 'border-slate-400 text-slate-600 bg-slate-100', dot: 'bg-slate-400', desc: 'Disqualified or churned. Logged for telemetry.' }
];

const SECONDARY_STAGES = [
  { id: 'HUMAN_REVIEW', label: 'Human Review', count: 3, color: 'border-amber-500 text-amber-700 bg-amber-50', dot: 'bg-amber-500', desc: 'Complex edge case detected. AI paused. Rep alerted.' },
  { id: 'NURTURE', label: 'Nurture Cadence', count: 12, color: 'border-cyan-500 text-cyan-700 bg-cyan-50', dot: 'bg-cyan-500', desc: 'Post-sequence check-in. Auto-reawakens on prospect reply.' }
];

const KPIS = [
  { label: 'Active Pipeline Leads', value: '47', change: '+14% this week', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Hot Opportunities (≥70)', value: '12', change: '8 pending meeting', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'Live Pipeline Value', value: '₹28,40,000', change: 'Across 47 active deals', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Won Closed Revenue', value: '₹14,80,000', change: 'Attributed this month', icon: Target, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Google Meets Booked', value: '19', change: '6 scheduled today', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Autonomous Qual Rate', value: '68.4%', change: '+5.2% vs manual SDR', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'AI Actions (24h)', value: '184', change: 'Zero human latency', icon: Bot, color: 'text-[#e8572a]', bg: 'bg-orange-50' },
  { label: 'Median Response Time', value: '4.2s', change: 'Multi-channel instant', icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' }
];

const ACTIVITY_FEED = [
  { time: 'Just now', title: 'Google Meet Confirmed', detail: 'Prospect confirmed 3:30 PM slot. Google Meet generated & sent.', type: 'meeting', lead: 'Vikram Mehta (Apex Corp)', score: 92 },
  { time: '2m ago', title: 'Hot Lead Flagged', detail: 'Budget confirmed at ₹5L+, timeline < 30 days. Score elevated to 86.', type: 'hot', lead: 'Pooja Sharma (Zenith Media)', score: 86 },
  { time: '7m ago', title: 'Autonomous Follow-up Sent', detail: 'Day 3 value-nudge dispatched via WhatsApp after 72h quiet window.', type: 'followup', lead: 'Rahul Varma (Nexus Studios)', score: 64 },
  { time: '14m ago', title: 'Inbound Webhook Captured', detail: 'High-ticket website inquiry ingested from operator.ai/enterprise.', type: 'inbound', lead: 'Aditi Rao (Global Services)', score: 58 },
  { time: '22m ago', title: 'Escalated to HUMAN_REVIEW', detail: 'Prospect requested custom NDA before pricing. AI paused immediately.', type: 'review', lead: 'Karan Singhal (OmniTech)', score: 79 },
  { time: '38m ago', title: 'RAG Knowledge Grounding', detail: 'Query matched "Custom SLA & Multi-tenant isolation" from uploaded policy doc.', type: 'rag', lead: 'Ananya Deshmukh (FinCore)', score: 81 }
];

const HOT_LEADS = [
  { name: 'Karan Singhal', company: 'OmniTech Solutions', score: 88, budget: '₹6L - ₹10L', timeline: '< 30 days', intent: 'High / Ready to buy', source: 'Website', nba: 'Send custom Google Meet slot proposal', status: 'HOT' },
  { name: 'Pooja Sharma', company: 'Zenith Digital Agency', score: 84, budget: '₹4L - ₹6L', timeline: 'Immediate', intent: 'Replacing 2 SDRs', source: 'WhatsApp', nba: 'Follow up with agency headcount ROI matrix', status: 'HOT' },
  { name: 'Vikram Mehta', company: 'Apex Enterprise Corp', score: 92, budget: '₹12L+', timeline: 'Q3 Rollout', intent: 'Enterprise multi-tenant', source: 'Gmail', nba: 'Meeting confirmed — review meeting notes', status: 'MEETING_BOOKED' },
  { name: 'Aditi Rao', company: 'Global Services Ltd', score: 76, budget: '₹5L', timeline: '45 days', intent: 'Multi-channel inbound', source: 'Website', nba: 'Verify timeline flexibility in WhatsApp thread', status: 'HOT' }
];

const INTEGRATIONS_STATUS = [
  { name: 'Gmail Integration', type: 'Email Inbound & Outbound', status: 'CONNECTED', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', latency: '42ms', uptime: '100%' },
  { name: 'WhatsApp Business API', type: 'Instant Mobile Messaging', status: 'CONNECTED', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', latency: '38ms', uptime: '100%' },
  { name: 'Google Calendar & Meet', type: 'Autonomous Scheduling', status: 'CONNECTED', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', latency: '65ms', uptime: '100%' },
  { name: 'Website Webhooks', type: 'Inbound Form Lead Capture', status: 'CONNECTED', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', latency: '18ms', uptime: '100%' },
  { name: 'Razorpay Gateway', type: 'Revenue & Deal Attribution', status: 'CONNECTED', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200', latency: '52ms', uptime: '100%' },
  { name: 'Voice Telephony Trunk', type: 'Autonomous Calling Layer', status: 'ROADMAP', statusColor: 'text-amber-700 bg-amber-50 border-amber-200', latency: 'Planned', uptime: 'Coming Soon' }
];

const FAQ_ITEMS = [
  {
    q: 'What is the Live Command Center?',
    a: 'The Live Command Center is the unified mission-control interface of the AI Revenue Operator. It aggregates real-time pipeline telemetry, AI Sales Employee conversational activity, lead qualification scores, meeting bookings, revenue attribution, and stack integration health into one central operational view.'
  },
  {
    q: 'What can I monitor from the Command Center?',
    a: 'You can monitor live active leads across all inbound channels (Website, Gmail, WhatsApp), lead stage transitions, 0–100 mathematical qualification scores, upcoming Google Meet appointments, closed pipeline value, source attribution, and background system resilience health.'
  },
  {
    q: 'Can I see my AI Sales Employee’s activity as it happens?',
    a: 'Yes. Every conversational action — from initial inbound greeting and requirement extraction to budget discovery, lead scoring, follow-up cadence triggers, and meeting proposals — streams directly into the live activity telemetry panel.'
  },
  {
    q: 'How are Hot Leads identified?',
    a: 'Following our deterministic revenue logic, any prospect achieving a composite qualification score of 70/100 or higher based on confirmed budget, timeline urgency, clear requirements, and high buying intent is instantly designated as a HOT Lead and prioritized for meeting booking.'
  },
  {
    q: 'Does HOT automatically become MEETING_BOOKED?',
    a: 'No. The AI Sales Employee never assumes a meeting is finalized. When a lead reaches HOT or QUALIFIED status, the AI proposes matching Google Calendar slots. Only after the prospect explicitly confirms does the system generate the Google Meet link, dispatch calendar invites, and update the lead to MEETING_BOOKED.'
  },
  {
    q: 'What is Next Best Action (NBA)?',
    a: 'Next Best Action is the platform’s algorithmic guidance system. It continuously assesses conversation history, qualification signals, and dormancy windows to suggest the single highest-probability revenue action — such as sending a case study, re-engaging with a custom slot, or triggering human review.'
  },
  {
    q: 'Can I monitor integration health and token recovery?',
    a: 'Yes. The Command Center displays live connection states for Gmail, WhatsApp, Google Calendar, and inbound webhooks. In the event of an OAuth expiry or API failure, the platform triggers automatic recovery or alerts you with a clear RECONNECT_REQUIRED state.'
  },
  {
    q: 'Can I use natural-language commands to query my pipeline?',
    a: 'Yes. The integrated AI Command Center console allows managers to type plain-English questions like "Show me all hot leads that haven’t booked a meeting" or "Summarize today’s meetings" and immediately receive parsed, actionable record lists.'
  },
  {
    q: 'What is the 3D globe console representation?',
    a: 'The 3D globe console visually depicts inbound channel signals, multi-channel telemetry nodes, and autonomous pipeline event routing across your operational workspace. It serves as an illustrative high-tech network overview of your live revenue engine.'
  },
  {
    q: 'Does the Command Center expose data across different workspaces?',
    a: 'Never. AI Revenue Operator is engineered with strict multi-tenant row-level database isolation and JWT scoping. Every workspace administrator and sales representative sees exclusively their own organization’s leads, conversations, rules, and revenue analytics.'
  }
];

/* ─────────────────────────────────────────────────────────────────────────────
   3D GLOBE / NETWORK CANVAS COMPONENT
───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   PHOTOREALISTIC 3D EARTH GLOBE TELEMETRY CONSOLE (THREE.JS)
───────────────────────────────────────────────────────────────────────────── */

interface HubLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  ping: string;
  color?: string;
  hq?: boolean;
}

const TELEMETRY_HUBS: HubLocation[] = [
  { name: 'Delhi (HQ)', lat: 28.6139, lon: 77.2090, country: 'India', ping: '4ms', hq: true, color: '#e8572a' },
  { name: 'Mumbai Hub', lat: 19.0760, lon: 72.8777, country: 'India', ping: '7ms', color: '#ff7a45' },
  { name: 'Bengaluru Tech', lat: 12.9716, lon: 77.5946, country: 'India', ping: '9ms', color: '#ff7a45' },
  { name: 'Singapore Inbound', lat: 1.3521, lon: 103.8198, country: 'Singapore', ping: '31ms', color: '#38bdf8' },
  { name: 'Dubai Gateway', lat: 25.2048, lon: 55.2708, country: 'UAE', ping: '38ms', color: '#fbbf24' },
  { name: 'London Node', lat: 51.5074, lon: -0.1278, country: 'UK', ping: '108ms', color: '#a78bfa' },
  { name: 'New York Central', lat: 40.7128, lon: -74.0060, country: 'USA', ping: '162ms', color: '#34d399' },
  { name: 'San Francisco SF', lat: 37.7749, lon: -122.4194, country: 'USA', ping: '184ms', color: '#34d399' },
  { name: 'Tokyo Node', lat: 35.6762, lon: 139.6503, country: 'Japan', ping: '64ms', color: '#f43f5e' },
  { name: 'Sydney Outpost', lat: -33.8688, lon: 151.2093, country: 'Australia', ping: '142ms', color: '#2dd4bf' }
];

const TELEMETRY_ARCS: [number, number][] = [
  [0, 1], // Delhi <-> Mumbai
  [0, 2], // Delhi <-> Bengaluru
  [1, 4], // Mumbai <-> Dubai
  [0, 3], // Delhi <-> Singapore
  [4, 5], // Dubai <-> London
  [5, 6], // London <-> New York
  [6, 7], // New York <-> San Francisco
  [3, 8], // Singapore <-> Tokyo
  [3, 9]  // Singapore <-> Sydney
];

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function GlobeConsoleCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeRegion, setActiveRegion] = useState<'asia' | 'europe' | 'americas' | 'all'>('asia');
  const [autoRotate, setAutoRotate] = useState(true);

  // OrbitControls, Camera & Fly-to target references
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const autoRotateRef = useRef(true);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Smoothly fly camera to any lat/lon coordinate
  const flyToCoords = useCallback((lat: number, lon: number, distance = 6.0) => {
    const targetPos = latLonToVec3(lat, lon, distance);
    targetCamPosRef.current = targetPos;
  }, []);

  const setViewRegion = useCallback((region: 'asia' | 'europe' | 'americas' | 'all') => {
    setActiveRegion(region);
    if (region === 'asia') {
      flyToCoords(22.0, 78.0, 5.8); // Focuses on India & South Asia
    } else if (region === 'europe') {
      flyToCoords(48.0, 15.0, 5.8); // Europe & Middle East
    } else if (region === 'americas') {
      flyToCoords(39.0, -98.0, 5.8); // Americas
    } else {
      targetCamPosRef.current = new THREE.Vector3(0, 0, 7.8); // Full orbit view
    }
  }, [flyToCoords]);

  const zoomIn = useCallback(() => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    targetCamPosRef.current = null;
    const newDist = Math.max(4.2, cam.position.length() - 0.7);
    cam.position.setLength(newDist);
    ctrl.update();
  }, []);

  const zoomOut = useCallback(() => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    targetCamPosRef.current = null;
    const newDist = Math.min(10.0, cam.position.length() + 0.7);
    cam.position.setLength(newDist);
    ctrl.update();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 560;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    // Initial camera position centered on India (lat: 22, lon: 78)
    const initialCamPos = latLonToVec3(22.0, 78.0, 6.0);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.copy(initialCamPos);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // ── OrbitControls — native silky drag, inertia damping, pinch & scroll zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 4.0;
    controls.maxDistance = 10.0;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Cancel programmatic camera flight when user touches or drags
    controls.addEventListener('start', () => {
      targetCamPosRef.current = null;
    });

    // Lighting (Warm sunlight + Ambient + Cool blue atmosphere rim)
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.7);
    sunLight.position.set(6, 4, 5);
    scene.add(sunLight);
    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    blueRimLight.position.set(-6, -2, -4);
    scene.add(blueRimLight);

    // Stars Background
    const starCount = 900;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i]     = (Math.random() - 0.5) * 80;
      starCoords[i + 1] = (Math.random() - 0.5) * 80;
      starCoords[i + 2] = -15 - Math.random() * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.14, transparent: true, opacity: 0.75 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── Earth Globe Group ──────────────────────────────────────────────────
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    const globeRadius = 2.45;

    // Load NASA Satellite Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      '/earth-texture.jpg',
      () => { renderer.render(scene, camera); },
      undefined,
      (err) => { console.error('Failed to load earth texture', err); }
    );
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    // Clean Earth Sphere Mesh
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.68,
      metalness: 0.06
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmosphere Glow Layer
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.025, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.24, 0.65, 1.0, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // ── Glowing Orange & Green Node Dots on the 3D Earth ───────────────────
    const DOT_NODES = [
      { name: 'Delhi',         lat: 28.6139, lon:  77.2090, color: 0xe8572a, pulse: true,  tag: 'HQ' },
      { name: 'Mumbai',        lat: 19.0760, lon:  72.8777, color: 0xe8572a, pulse: false },
      { name: 'Bengaluru',     lat: 12.9716, lon:  77.5946, color: 0xe8572a, pulse: false },
      { name: 'Singapore',     lat:  1.3521, lon: 103.8198, color: 0xe8572a, pulse: false },
      { name: 'New York',      lat: 40.7128, lon: -74.0060, color: 0x10b981, pulse: true  },
      { name: 'London',        lat: 51.5074, lon:  -0.1278, color: 0x10b981, pulse: false },
      { name: 'San Francisco', lat: 37.7749, lon:-122.4194, color: 0x10b981, pulse: false }
    ];

    const pulsingAuras: THREE.Mesh[] = [];

    // Helper: Create stylish Canvas Sprite label for cities
    const createCityLabel = (text: string, colorHex: string, badge?: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(6, 9, 19, 0.78)';
        if (ctx.roundRect) {
          ctx.roundRect(8, 8, 240, 48, 8);
        } else {
          ctx.rect(8, 8, 240, 48);
        }
        ctx.fill();
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 22, 32);

        if (badge) {
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = colorHex;
          ctx.textAlign = 'right';
          ctx.fillText(badge, 232, 32);
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthTest: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.68, 0.17, 1);
      return sprite;
    };

    DOT_NODES.forEach((node) => {
      const pos = latLonToVec3(node.lat, node.lon, globeRadius);
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      nodeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());

      // Inner solid glowing dot (orange or green)
      const dotGeo = new THREE.CircleGeometry(0.055, 32);
      const dotMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.z = 0.018;
      nodeGroup.add(dotMesh);

      // Outer soft aura halo ring
      const auraGeo = new THREE.RingGeometry(0.055, 0.11, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.position.z = 0.016;
      nodeGroup.add(auraMesh);

      if (node.pulse) {
        pulsingAuras.push(auraMesh);
      }

      earthGroup.add(nodeGroup);

      // Add floating city label
      const hexStr = node.color === 0xe8572a ? '#e8572a' : '#10b981';
      const label = createCityLabel(node.name, hexStr, node.tag);
      label.position.copy(pos.clone().normalize().multiplyScalar(globeRadius + 0.14));
      earthGroup.add(label);
    });

    // ── Connecting Telemetry Lines Between the Dots (Orange & Green) ───────
    // Using true great-circle geodesic curves with parabolic altitude
    // GUARANTEED never to dip inside the Earth!
    interface ArcTrack {
      p1: THREE.Vector3;
      p2: THREE.Vector3;
      maxAlt: number;
      packet: THREE.Mesh;
      speed: number;
      progress: number;
    }

    const arcTracks: ArcTrack[] = [];
    const packetGeo = new THREE.SphereGeometry(0.038, 12, 12);

    const NODE_CONNECTIONS: { from: number; to: number; color: number }[] = [
      { from: 0, to: 4, color: 0xf59e0b }, // Delhi (Orange) <-> New York (Green) — direct intercontinental bridge!
      { from: 0, to: 5, color: 0xf59e0b }, // Delhi (Orange) <-> London (Green)
      { from: 5, to: 4, color: 0x10b981 }, // London (Green) <-> New York (Green)
      { from: 4, to: 6, color: 0x10b981 }, // New York (Green) <-> San Francisco (Green)
      { from: 0, to: 1, color: 0xe8572a }, // Delhi (Orange) <-> Mumbai (Orange)
      { from: 0, to: 2, color: 0xe8572a }, // Delhi (Orange) <-> Bengaluru (Orange)
      { from: 0, to: 3, color: 0xe8572a }  // Delhi (Orange) <-> Singapore (Orange)
    ];

    NODE_CONNECTIONS.forEach((conn, i) => {
      const nodeA = DOT_NODES[conn.from];
      const nodeB = DOT_NODES[conn.to];
      if (!nodeA || !nodeB) return;

      const p1 = latLonToVec3(nodeA.lat, nodeA.lon, globeRadius);
      const p2 = latLonToVec3(nodeB.lat, nodeB.lon, globeRadius);
      const chordDist = p1.distanceTo(p2);
      // High parabolic arc: elevation scales gracefully with distance
      const maxAlt = Math.max(0.42, chordDist * 0.35);

      const points: THREE.Vector3[] = [];
      const steps = 60;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        // Direction along the great-circle arc
        const dir = new THREE.Vector3().lerpVectors(p1, p2, t).normalize();
        // Parabolic altitude above surface: strictly > 0 for all internal points
        const alt = Math.sin(t * Math.PI) * maxAlt;
        points.push(dir.multiplyScalar(globeRadius + alt));
      }

      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: conn.color,
        transparent: true,
        opacity: 0.82
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      earthGroup.add(arcLine);

      // Traveling glowing light packet
      const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      earthGroup.add(packetMesh);

      arcTracks.push({
        p1,
        p2,
        maxAlt,
        packet: packetMesh,
        speed: 0.0055 + (i % 3) * 0.0025,
        progress: (i * 0.18) % 1
      });
    });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let pulsePhase = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera programmatic flight when user selects region/city
      if (targetCamPosRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.06);
        controls.target.set(0, 0, 0);
        if (camera.position.distanceTo(targetCamPosRef.current) < 0.05) {
          targetCamPosRef.current = null;
        }
      }

      // Update OrbitControls (enables autoRotate and inertia damping)
      controls.autoRotate = autoRotateRef.current;
      controls.update();

      // Soft breathing aura on the pulse dots (green & orange aura)
      pulsePhase += 0.04;
      const auraScale = 1 + Math.sin(pulsePhase) * 0.24;
      const auraOpacity = 0.45 + Math.sin(pulsePhase) * 0.25;
      pulsingAuras.forEach((aura) => {
        aura.scale.set(auraScale, auraScale, 1);
        (aura.material as THREE.MeshBasicMaterial).opacity = Math.max(0.2, auraOpacity);
      });

      // Advance light packets along great-circle arcs
      arcTracks.forEach((track) => {
        track.progress = (track.progress + track.speed) % 1;
        const dir = new THREE.Vector3().lerpVectors(track.p1, track.p2, track.progress).normalize();
        const alt = Math.sin(track.progress * Math.PI) * track.maxAlt;
        track.packet.position.copy(dir.multiplyScalar(globeRadius + alt));
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      controlsRef.current = null;
      cameraRef.current = null;

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-[#060913] shadow-2xl select-none">
      
      {/* Top Console Command Header */}
      <div className="absolute top-4 inset-x-5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Status Pill */}
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto">
          {/* Green pulse dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          {/* Orange dot */}
          <span className="w-2.5 h-2.5 rounded-full bg-[#e8572a] shadow-xs shadow-orange-500/60" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-slate-200 uppercase">
            3D SATELLITE GLOBE
          </span>
        </div>

        {/* Region Presets & Orbit Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg pointer-events-auto">
          <button
            onClick={() => setViewRegion('asia')}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all",
              activeRegion === 'asia'
                ? "bg-[#e8572a] text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            🇮🇳 India &amp; Asia
          </button>
          <button
            onClick={() => setViewRegion('europe')}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all",
              activeRegion === 'europe'
                ? "bg-[#e8572a] text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            🇪🇺 Europe / ME
          </button>
          <button
            onClick={() => setViewRegion('americas')}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all",
              activeRegion === 'americas'
                ? "bg-[#e8572a] text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            🇺🇸 Americas
          </button>
          <button
            onClick={() => setViewRegion('all')}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all",
              activeRegion === 'all'
                ? "bg-[#e8572a] text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            )}
          >
            🌐 Orbit
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition-all flex items-center gap-1",
              autoRotate ? "text-sky-400 bg-sky-500/10" : "text-slate-400 bg-white/5"
            )}
          >
            <Compass className={cn("w-3 h-3", autoRotate && "animate-spin")} style={{ animationDuration: '6s' }} />
            <span>{autoRotate ? 'SPIN ON' : 'PAUSED'}</span>
          </button>

          {/* Zoom In / Out */}
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-[520px] sm:h-[620px] cursor-grab active:cursor-grabbing"
      />

      {/* Drag & Zoom Hint Overlay */}
      <div className="absolute bottom-14 right-5 z-20 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10.5px] font-mono text-slate-400">
        <span>Click &amp; drag to rotate 3D Earth</span>
        <span className="text-slate-600">&bull;</span>
        <span>Scroll to zoom</span>
        <span className="text-slate-600">&bull;</span>
        <span>Pinch on mobile</span>
      </div>

      {/* Bottom Telemetry Status Bar */}
      <div className="absolute bottom-0 inset-x-0 z-20 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300 border-t border-white/10 bg-black/85 backdrop-blur-md px-5 py-3 shadow-2xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8572a] shadow-xs shadow-orange-500/60" />
            Global Signal Coverage:
          </span>
          <div className="flex items-center gap-2 text-slate-400">
            {TELEMETRY_HUBS.slice(0, 6).map((h) => (
              <button
                key={h.name}
                onClick={() => flyToCoords(h.lat, h.lon, 5.6)}
                className="hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded text-slate-400 hover:bg-white/5"
              >
                {h.name.split(' ')[0]} <span className="text-sky-400 text-[9.5px]">({h.ping})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            100% Inbound Signal Coverage &bull; Zero Packet Loss
          </span>
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export default function LiveCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'activity' | 'integrations' | 'nba'>('overview');
  const [selectedLead, setSelectedLead] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickWidgetOpen, setQuickWidgetOpen] = useState(false);
  const [queryInput, setQueryInput] = useState('Show me all hot leads that haven’t booked a meeting');
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryResultReady, setQueryResultReady] = useState(true);

  const handleRunCommand = () => {
    setQueryRunning(true);
    setTimeout(() => {
      setQueryRunning(false);
      setQueryResultReady(true);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#111827] font-sans antialiased selection:bg-[#e8572a] selection:text-white overflow-x-hidden">
      
      {/* ── TOP ANNOUNCEMENT BAR ─────────────────────────────────────── */}
      <aside aria-label="Announcement" className="relative z-[210] flex h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap bg-[#0c0e14] px-4 text-[12.5px] font-medium text-white">
        <span className="font-semibold text-[#e8572a]">Command Center:</span>
        <span className="overflow-hidden text-ellipsis">
          Live Autonomous Revenue Telemetry &amp; 3D Globe Mesh Console Active →
        </span>
        <Link href="/register" className="ml-1 underline decoration-[#e8572a] hover:text-[#e8572a] font-semibold">
          Deploy Free
        </Link>
      </aside>

      {/* ── STICKY NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[200] h-[72px] border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
          
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <img src="/images/op-logo-arc.png" alt="Operator" className="h-6 w-6 object-contain" />
            <span className="text-[18px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
              operator<span className="text-[#e8572a]">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 xl:gap-2 lg:flex text-[13px] font-medium text-slate-600">
            <Link href="/" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">Home</Link>
            <Link href="/enterprise-ai-deployment" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Enterprise Deployment
            </Link>
            <Link href="/ai-sales-agent-builder" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Agent Builder
            </Link>
            <Link href="/live-command-center" className="rounded-full px-3 py-1.5 font-semibold text-[#e8572a] bg-orange-50 border border-orange-200 transition-colors">
              Command Center
            </Link>
            <Link href="/autonomous-inbound-calling" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Inbound Calling
            </Link>
            <Link href="/call-scrubber-replay" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              Call Scrubber
            </Link>
            <a href="#faq" className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden items-center gap-3 lg:flex shrink-0">
            <Link href="/login" className="px-3 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#e8572a] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-[#e8572a]/20 hover:bg-[#d04920] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Open Command Center
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-6 py-5 lg:hidden space-y-3 shadow-lg">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Home</Link>
            <Link href="/enterprise-ai-deployment" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Enterprise Deployment</Link>
            <Link href="/ai-sales-agent-builder" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">AI Agent Builder</Link>
            <Link href="/live-command-center" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-[#e8572a]">Live Command Center</Link>
            <Link href="/autonomous-inbound-calling" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Autonomous Inbound Calling</Link>
            <Link href="/call-scrubber-replay" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">Call Scrubber &amp; Replay</Link>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" className="w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">Sign In</Link>
              <Link href="/register" className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#e8572a] rounded-full">Open Command Center</Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">

        {/* ── SECTION 1: HERO ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-transparent pb-16 pt-12 md:pb-24 md:pt-16">
          <div className="pointer-events-none absolute inset-0 z-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(16,24,40,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="pointer-events-none absolute inset-0 z-0" style={{
            background: 'radial-gradient(ellipse 60% 60% at 80% 25%, rgba(232,87,42,0.08), transparent 75%)'
          }} />

          <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 md:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">

              {/* Left Column */}
              <div className="flex flex-col items-start">
                <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  LIVE COMMAND CENTER &bull; PIPELINE TELEMETRY
                </span>

                <h1 className="text-[clamp(2.1rem,1.6rem+2.2vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0c0e14]">
                  Your AI Revenue Operation.{' '}
                  <span className="relative inline-block whitespace-nowrap">
                    One Command Center.
                    <svg viewBox="0 0 200 12" aria-hidden="true" className="absolute -bottom-2.5 left-0 h-[10px] w-full" preserveAspectRatio="none">
                      <path d="M3 7 C 50 3, 120 8.5, 197 4.5" stroke="#e8572a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                </h1>

                <p className="mt-6 max-w-[580px] text-[15.5px] sm:text-[16.5px] leading-relaxed text-slate-600">
                  Monitor your AI Sales Employee, inbound leads, mathematical qualification, scheduled Google Meets, and multi-channel revenue from a single operational console.
                </p>

                {/* Framework pill */}
                <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs font-semibold">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">1. MONITOR</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">2. UNDERSTAND</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">3. ACT</span>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8572a] px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-[#e8572a]/25 transition-all hover:bg-[#d04920] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <span>Explore the Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#pipeline-telemetry"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-[14px] font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-[0.98] shadow-xs"
                  >
                    <Sliders className="w-4 h-4 text-[#e8572a]" />
                    <span>See the Live Pipeline</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Visual Console Preview */}
              <div className="relative">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0c0e14] text-white flex items-center justify-center shadow-xs">
                        <Terminal className="w-4 h-4 text-[#e8572a]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Operator Telemetry v2.4</h4>
                        <p className="text-[10px] font-mono text-slate-400">Live Active Node &bull; Tenant Isolation</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      100% OPERATIONAL
                    </span>
                  </div>

                  {/* 4 Mini KPI Chips */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-mono text-[10px] text-slate-400 uppercase">Live Pipeline Value</span>
                      <p className="text-lg font-bold text-slate-900">₹28,40,000</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                      <span className="font-mono text-[10px] text-rose-500 uppercase font-semibold">Hot Leads (Score &ge; 70)</span>
                      <p className="text-lg font-bold text-rose-700">12 Active</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                      <span className="font-mono text-[10px] text-purple-600 uppercase font-semibold">Meetings Booked</span>
                      <p className="text-lg font-bold text-purple-800">19 Set</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="font-mono text-[10px] text-emerald-600 uppercase font-semibold">Autonomous Won</span>
                      <p className="text-lg font-bold text-emerald-800">₹14,80,000</p>
                    </div>
                  </div>

                  {/* Mini pipeline stages */}
                  <div className="p-3.5 rounded-2xl bg-[#0c0e14] text-white space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>PIPELINE TELEMETRY</span>
                      <span className="text-[#e8572a]">47 LEADS TRACKED</span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto py-1 text-[10px] font-mono">
                      {['NEW', 'CONTACTED', 'QUALIFYING', 'QUALIFIED', 'HOT', 'MEETING', 'WON'].map((stg, i) => (
                        <div key={i} className="flex items-center gap-1 shrink-0">
                          <span className={cn(
                            "px-2 py-0.5 rounded border",
                            i === 4 ? "bg-rose-500/20 text-rose-300 border-rose-500/40" :
                            i === 6 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" :
                            "bg-white/5 text-slate-300 border-white/10"
                          )}>
                            {stg}
                          </span>
                          {i < 6 && <span className="text-slate-600">&rarr;</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latest Activity Snippet */}
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-slate-800">Google Meet finalized</span>
                      <span className="text-slate-400 text-[11px]">&bull; Vikram Mehta (Apex Corp)</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      MEETING_BOOKED
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 2: 3D GLOBE / REVENUE NETWORK CONSOLE ─────────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] py-16 md:py-24 relative overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              {/* Rail Node */}
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  3D GLOBE CONSOLE
                </span>
              </div>

              <div className="max-w-3xl space-y-3 mb-10">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  PIPELINE TELEMETRY &amp; 3D GLOBE CONSOLE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Global Multi-Channel Inbound Signal Mesh
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  Real-time visualization of inbound channel traffic, qualification handoffs, and revenue events routed across your organization&apos;s active workspace.
                </p>
              </div>

              {/* 3D Globe Canvas Visual */}
              <GlobeConsoleCanvas />

              {/* Globe Telemetry Signal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-[#e8572a]/40 transition-all">
                  <span className="font-mono text-[11px] text-[#e8572a] uppercase font-bold">Inbound Channel Signals</span>
                  <p className="text-sm font-bold text-slate-900">Website &bull; WhatsApp &bull; Gmail API</p>
                  <p className="text-xs text-slate-500">Zero packet loss. Verified HMAC ingestion.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-500/40 transition-all">
                  <span className="font-mono text-[11px] text-emerald-600 uppercase font-bold">Autonomous Routing Speed</span>
                  <p className="text-sm font-bold text-slate-900">&lt; 5s End-to-End Processing</p>
                  <p className="text-xs text-slate-500">RAG knowledge inference &amp; qualification.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-purple-500/40 transition-all">
                  <span className="font-mono text-[11px] text-purple-600 uppercase font-bold">Tenant Isolation Layer</span>
                  <p className="text-sm font-bold text-slate-900">100% PostgreSQL Row Scoped</p>
                  <p className="text-xs text-slate-500">Encrypted JWT tokens &amp; Redis keyspaces.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 3: 8 CORE KPIS (OVERVIEW) ─────────────────────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  KPIS &amp; METRICS
                </span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  REAL-TIME PIPELINE METRICS
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Know What Is Happening Across Your Revenue Pipeline
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  Every inbound prospect, qualification score, calendar booking, and attributed deal is synthesized into core actionable KPIs.
                </p>
              </div>

              {/* 8 KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {KPIS.map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">{kpi.label}</span>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", kpi.bg, kpi.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-extrabold text-[#0c0e14] tracking-tight">{kpi.value}</p>
                        <p className="text-[11.5px] font-mono text-emerald-600 font-semibold mt-1">{kpi.change}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 4: LIVE PIPELINE TELEMETRY ────────────────────────── */}
        <section id="pipeline-telemetry" className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  PIPELINE TELEMETRY
                </span>
              </div>

              <div className="max-w-3xl space-y-3 mb-12">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  FULL REVENUE LIFECYCLE
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Watch Every Lead Move Through the Pipeline
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  The Command Center delivers granular visibility across every state. Note: A HOT status never automatically assumes a booking — only prospect confirmation transitions a lead to MEETING_BOOKED.
                </p>
              </div>

              {/* Main Stages Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PIPELINE_STAGES.map((stg, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-[#e8572a]/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={cn("px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border", stg.color)}>
                        {stg.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400">{stg.count} leads</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{stg.desc}</p>
                  </div>
                ))}
              </div>

              {/* Optional & Human-in-the-loop states */}
              <div className="mt-6 p-6 rounded-2xl bg-[#0c0e14] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1.5">
                  <span className="text-[#e8572a] font-mono text-xs font-bold uppercase tracking-wider">
                    HUMAN REVIEW &amp; NURTURE CHANNELS
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold">Edge-case safety &amp; automated multi-touch recovery.</h4>
                  <p className="text-slate-400 text-xs">
                    When edge cases arise, the AI automatically shifts to <span className="text-amber-400 font-mono">HUMAN_REVIEW</span> and pauses. Dormant leads enter <span className="text-cyan-400 font-mono">NURTURE</span> and re-qualify upon reply.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                    3 In Review
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                    12 In Nurture
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 5: AI ACTIVITY STREAM & HOT LEADS (DUAL PANEL) ──── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  ACTIVITY &amp; OPPORTUNITIES
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Col (7): Live AI Sales Employee Activity Feed */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" />
                      ACTIVITY STREAM
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e14]">
                      See What Your AI Sales Employee Is Doing
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Streaming telemetric record: Event &rarr; AI Action &rarr; Autonomous Outcome.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
                    {ACTIVITY_FEED.map((act, i) => (
                      <div key={i} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            act.type === 'meeting' ? 'bg-purple-50 text-purple-700' :
                            act.type === 'hot' ? 'bg-rose-50 text-rose-700' :
                            act.type === 'review' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {act.type === 'meeting' ? <Calendar className="w-4 h-4" /> :
                             act.type === 'hot' ? <Flame className="w-4 h-4" /> :
                             act.type === 'review' ? <AlertCircle className="w-4 h-4" /> :
                             <Bot className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-[#0c0e14]">{act.title}</h5>
                              <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{act.detail}</p>
                            <span className="inline-block mt-1 font-mono text-[10.5px] font-semibold text-slate-500">
                              {act.lead} &bull; Score: <span className="text-[#e8572a]">{act.score}/100</span>
                            </span>
                          </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Col (5): Hot Leads & Next Best Action Spotlight */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" />
                      HOT LEADS (SCORE &ge; 70)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e14]">
                      Opportunities Requiring Attention
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Filtered high-intent accounts with calculated Next Best Action.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {HOT_LEADS.map((lead, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedLead(i)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer space-y-2",
                          selectedLead === i
                            ? "border-[#e8572a] bg-orange-50/20 shadow-md ring-1 ring-[#e8572a]/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#0c0e14]">{lead.name}</h4>
                            <p className="text-[11px] text-slate-500 font-mono">{lead.company}</p>
                          </div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Score {lead.score}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-100">
                          <span>Budget: <strong>{lead.budget}</strong></span>
                          <span>Timeline: <strong>{lead.timeline}</strong></span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 truncate mr-2">
                            <span className="text-[#e8572a] font-bold">NBA:</span> {lead.nba}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prominent Next Best Action Action Card */}
                  <div className="p-5 rounded-2xl bg-[#0c0e14] text-white border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#e8572a] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Next Best Action Engine
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Deterministic Rule</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Lead: <strong className="text-white">{HOT_LEADS[selectedLead].name}</strong> ({HOT_LEADS[selectedLead].company})
                    </p>
                    <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                      &bull; Action: {HOT_LEADS[selectedLead].nba}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Link
                        href="/register"
                        className="flex-1 py-2 rounded-xl bg-[#e8572a] hover:bg-[#d04920] text-center text-xs font-bold uppercase tracking-wider font-mono text-white transition-all shadow-sm"
                      >
                        Execute Action
                      </Link>
                      <Link
                        href="/login"
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 transition-all font-mono"
                      >
                        View Lead
                      </Link>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 6: NATURAL LANGUAGE AI COMMAND CENTER ───────────── */}
        <section className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  NATURAL LANGUAGE OPERATOR
                </span>
              </div>

              <div className="max-w-3xl space-y-3 mb-10">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  ASK YOUR REVENUE OPERATION
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14]">
                  Ask Your Revenue Operation What Matters
                </h2>
                <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                  Query pipeline states, dormant accounts, upcoming meetings, and lead signals in natural plain English using our deterministic command interpreter.
                </p>
              </div>

              {/* Interactive Natural Language Command Box */}
              <div className="max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-5 bg-[#0c0e14] text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-[#e8572a]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                      AI REVENUE COMMAND CONSOLE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    PARSER READY
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Command input */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-xs">&gt;</span>
                      <input
                        type="text"
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-hidden focus:border-[#e8572a] focus:ring-1 focus:ring-[#e8572a]"
                        placeholder="Type command: e.g. Show me hot leads from today..."
                      />
                    </div>
                    <button
                      onClick={handleRunCommand}
                      disabled={queryRunning}
                      className="px-6 py-3 rounded-xl bg-[#e8572a] hover:bg-[#d04920] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      {queryRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{queryRunning ? 'Analyzing...' : 'Execute'}</span>
                    </button>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-slate-400">Quick Commands:</span>
                    {[
                      'Show me all hot leads that haven’t booked a meeting',
                      'Which leads require human review?',
                      'List meetings booked for this week',
                      'Follow-up queue for dormant 72h prospects'
                    ].map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQueryInput(sug);
                          handleRunCommand();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10.5px] transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>

                  {/* Result Panel */}
                  {queryResultReady && (
                    <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Parsed Match: 3 Hot Leads Awaiting Booking
                        </span>
                        <span className="text-[11px] text-slate-400">Telemetry Query Time: 12ms</span>
                      </div>
                      
                      <div className="divide-y divide-slate-200/80 bg-white rounded-xl border border-slate-200">
                        {HOT_LEADS.slice(0, 3).map((lead, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#0c0e14]">{lead.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]"> ({lead.company}) &bull; Budget: {lead.budget}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[10px] font-bold">Score {lead.score}</span>
                              <Link
                                href="/register"
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#e8572a] hover:text-white font-mono text-[10px] font-semibold transition-colors"
                              >
                                Trigger Slot
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 7: INTEGRATION HEALTH & SYSTEM RESILIENCE ─────────── */}
        <section className="border-b border-slate-200/60 bg-white/75 backdrop-blur-[2px] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  INTEGRATIONS &amp; RESILIENCE
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Left 6: Integrations Health */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" />
                      STACK HEALTH MONITOR
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e14]">
                      Know When Your Revenue Stack Needs Attention
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Real-time handshake tracking across all channel APIs and webhook endpoints.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {INTEGRATIONS_STATUS.map((int, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <h5 className="font-bold text-[#0c0e14]">{int.name}</h5>
                          <p className="text-[11px] text-slate-500 font-mono">{int.type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] text-slate-400">{int.latency}</span>
                          <span className={cn("px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border", int.statusColor)}>
                            {int.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 6: Architecture Resilience Matrix */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" />
                      INFRASTRUCTURE WATCHDOG
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0c0e14]">
                      Zero Data Loss Architectural Guarantee
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Automatic recovery circuits engineered into every inbound webhook and token.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>API &amp; Webhook Retries</span>
                        <span className="text-emerald-600">500ms &rarr; 1s &rarr; 2s + Jitter</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Transient 429 or 5xx failures are retried automatically before moving to Dead Letter Queue.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>Google OAuth Recovery</span>
                        <span className="text-indigo-600">Token Auto-Refresh</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Silent refresh keeps calendar syncing active. Unresolvable auth prompts RECONNECT_REQUIRED.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>Idempotency &amp; Sanitization</span>
                        <span className="text-[#e8572a]">Event ID Deduplication</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Re-sent webhooks from forms or Meta are detected and ignored, preventing duplicate follow-ups.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>Redis Rate Limiter</span>
                        <span className="text-blue-600">60 req/min/IP</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Protects qualification endpoints from spam or bot flooding while legitimate leads pass instantly.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 8: FAQ ACCORDION ──────────────────────────────────── */}
        <section id="faq" className="border-b border-slate-200/60 bg-[#f7f8fb]/80 backdrop-blur-[2px] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative pl-8 sm:pl-16 md:pl-28 lg:pl-36 xl:pl-48 border-l border-[#e8572a]/60">
              
              <div className="flex items-center gap-2.5 mb-8 -ml-8 sm:-ml-16 md:-ml-28 lg:-ml-36 xl:-ml-48 -translate-x-[3.5px]">
                <span className="w-2 h-2 rounded-full bg-[#e8572a] ring-2 ring-white shadow-2xs shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
                  FAQ
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
                
                {/* Left col */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#e8572a]">
                      <span className="h-px w-5 bg-[#e8572a]" />
                      FREQUENTLY ASKED QUESTIONS
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[#0c0e14] leading-[1.18]">
                      Command Center Architecture &amp; Operations
                    </h2>
                    <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                      Detailed answers regarding real-time telemetry, lead qualification triggers, Next Best Action logic, and data privacy.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0c0e14] text-white border border-slate-800 shadow-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Telemetry Engineering Support
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Need custom pipeline webhooks or dedicated data warehousing export pipelines?
                    </p>
                    <a
                      href="mailto:engineering@operator.ai"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#e8572a] hover:underline font-mono"
                    >
                      <span>engineering@operator.ai</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Right col: Accordion */}
                <div className="lg:col-span-7 divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
                  {FAQ_ITEMS.map((faq, i) => {
                    const isOpen = activeFaq === i;
                    return (
                      <div key={i} className="py-4 sm:py-5 transition-colors group">
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : i)}
                          className="w-full text-left flex items-start justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3.5">
                            <span className="font-mono text-xs font-bold text-slate-400 pt-0.5 select-none shrink-0 group-hover:text-[#e8572a] transition-colors">
                              0{i + 1}
                            </span>
                            <span className={cn(
                              "text-[14px] sm:text-[15px] font-semibold transition-colors leading-snug",
                              isOpen ? "text-[#e8572a]" : "text-slate-900 group-hover:text-slate-700"
                            )}>
                              {faq.q}
                            </span>
                          </div>

                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5",
                            isOpen
                              ? "bg-[#e8572a] border-[#e8572a] text-white"
                              : "border-slate-300 text-slate-500 group-hover:border-slate-400 bg-white"
                          )}>
                            {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="pt-3 pl-8 sm:pl-9 pr-4 text-[13px] sm:text-[13.5px] text-slate-600 leading-relaxed space-y-2 animate-in fade-in-50 duration-200">
                            <p>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 9: FINAL CTA ──────────────────────────────────────── */}
        <section className="bg-white/80 py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] bg-[#0c0e14] px-6 py-16 text-center md:px-16 md:py-20 shadow-2xl">
              <div className="pointer-events-none absolute inset-0" style={{
                background: 'radial-gradient(ellipse 65% 55% at 50% 20%, rgba(232,87,42,0.22), transparent 75%)'
              }} aria-hidden="true" />

              <div className="relative z-10 flex w-full flex-col items-center">
                <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#e8572a]">
                  <span className="h-px w-5 bg-[#e8572a]" />
                  MISSION CONTROL FOR YOUR REVENUE PIPELINE
                </span>

                <h2 className="mt-4 max-w-[760px] text-[24px] sm:text-[30px] md:text-[36px] font-bold leading-[1.15] tracking-[-0.025em] text-white">
                  Take Control of Your AI Revenue Operation
                </h2>

                <p className="mt-4 max-w-[620px] text-[14px] sm:text-[15.5px] leading-relaxed text-slate-300">
                  Let your AI Sales Employee operate autonomously while your leadership team maintains real-time visibility into pipeline, activity, meetings, and closed revenue.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8572a] px-7 py-3.5 text-[14px] font-bold uppercase tracking-wider font-mono text-white transition-all hover:bg-[#d04920] shadow-lg shadow-[#e8572a]/30 active:scale-[0.98]"
                  >
                    Explore the Command Center &rarr;
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-semibold font-mono text-white transition-all hover:bg-white/15"
                  >
                    Book Enterprise Demo
                  </Link>
                </div>

                <p className="mt-6 font-mono text-[11px] text-slate-400">
                  AI Revenue Operator &bull; Your 24/7 AI Sales Employee
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── EXACT FOOTER (MATCHING PAGE.TSX & USER SCREENSHOT) ────────── */}
      <footer className="relative z-30 bg-white border-t border-slate-200 text-[#0c0e14]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-12">
          
          {/* Main 6 Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-6 xl:gap-8">
            
            {/* Col 1: Brand & Socials */}
            <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2">
                <img
                  src="/images/op-logo-arc.png"
                  alt="Operator"
                  className="h-5 w-5 object-contain shrink-0"
                />
                <span className="text-[17px] font-bold leading-none tracking-[-0.04em] text-[#0c0e14]">
                  operator<span className="text-[#e8572a]">.</span>
                </span>
              </div>
              
              <p className="text-[13px] text-slate-600 leading-relaxed max-w-[260px]">
                Voice AI agents for enterprise customer calls. Built for Indian conversations — 30+ languages, Hinglish native.
              </p>
              
              <div className="pt-1 space-y-2 text-[13px] font-semibold text-slate-700">
                <div className="flex items-center gap-4">
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">LinkedIn</a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">X</a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">Instagram</a>
                </div>
                <div>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#e8572a] transition-colors">Facebook</a>
                </div>
              </div>
            </div>

            {/* Col 2: PRODUCT */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                PRODUCT
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Enterprise Deployment', href: '/enterprise-ai-deployment' },
                  { label: 'Platform overview', href: '#how-it-works' },
                  { label: 'AI Sales Agent Builder', href: '/ai-sales-agent-builder' },
                  { label: 'Knowledge Base', href: '#how-it-works' },
                  { label: 'Autonomous Inbound Calling', href: '/autonomous-inbound-calling' },
                  { label: 'Outbound Campaigns', href: '#playbooks' },
                  { label: 'Call Scrubber & Replay', href: '/call-scrubber-replay' },
                  { label: 'APIs & Webhooks', href: '#how-it-works' },
                  { label: 'Languages & Voices', href: '#scrubber' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: USE CASES */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                USE CASES
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Autonomous Revenue Operator', href: '#how-it-works' },
                  { label: 'Sales & Lead Qualification', href: '#demo' },
                  { label: '0–100 Mathematical Scoring', href: '#demo' },
                  { label: 'Google Meet Instant Booking', href: '#demo' },
                  { label: 'Multi-Touch WhatsApp Sequences', href: '#playbooks' },
                  { label: 'After-Hours Pipeline Capture', href: '#how-it-works' },
                  { label: 'High-Ticket Budget Discovery', href: '#demo' },
                  { label: 'Instant Human Rep Escalation', href: '#how-it-works' },
                  { label: 'Feedback & CSAT Quality', href: '#scrubber' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: INDUSTRIES */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                INDUSTRIES
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'BFSI & NBFC', href: '#playbooks' },
                  { label: 'Digital Marketing Agencies', href: '#playbooks' },
                  { label: 'Luxury Real Estate & Builders', href: '#playbooks' },
                  { label: 'High-Ticket Consulting & SaaS', href: '#playbooks' },
                  { label: 'Healthcare & Specialized Clinics', href: '#playbooks' },
                  { label: 'EdTech & Executive Coaching', href: '#playbooks' },
                  { label: 'High-AOV Luxury D2C', href: '#playbooks' },
                  { label: 'Commercial Solar & Energy', href: '#playbooks' },
                  { label: 'Automotive & Dealerships', href: '#playbooks' },
                  { label: 'Hospitality & Travel', href: '#playbooks' },
                  { label: 'Contact Centres & BPO', href: '#playbooks' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5: RESOURCES */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'Documentation', href: '#faq' },
                  { label: 'Case Studies', href: '#case-studies' },
                  { label: 'Integrations', href: '#how-it-works' },
                  { label: 'ROI Calculator', href: '#pricing' },
                  { label: 'The Film & Insights', href: '#film' },
                  { label: 'FAQ', href: '#faq' },
                  { label: 'Trust Center', href: '#security' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 6: COMPANY */}
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
                COMPANY
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                {[
                  { label: 'About', href: '#hero' },
                  { label: 'Press & Media', href: '#case-studies' },
                  { label: 'Careers', href: 'mailto:careers@operator.ai' },
                  { label: 'Contact Sales', href: 'tel:+911140566600' },
                  { label: 'Sign in', href: '/login' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="group flex items-center text-slate-700 hover:text-[#e8572a] font-medium transition-colors">
                      <span className="text-slate-400 group-hover:text-[#e8572a] font-bold mr-1.5 select-none transition-colors">•</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Compliance & Trust Bar */}
          <div className="border-t border-slate-200 mt-14 pt-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <p className="text-[11px] sm:text-[11.5px] font-mono text-slate-600 tracking-wide leading-relaxed">
                DND / NCPR scrubbing &middot; Consent logging &middot; Calling-window enforcement &middot; Call recordings &amp; audit trails &middot; DPDP-era consent design &middot; SOC 2 ready &middot; GDPR ready &middot; HIPAA ready
              </p>
              <a 
                href="#security" 
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#e8572a] hover:underline whitespace-nowrap self-start lg:self-auto"
              >
                Visit the Trust Center &rarr;
              </a>
            </div>
          </div>

          {/* Copyright & Legal Links Bar */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-[12px] text-slate-600">
              <div className="font-mono text-[11.5px] text-slate-600 leading-relaxed">
                &copy; 2026 AI Revenue Technologies Pvt. Ltd. &middot; New Delhi, India &middot; <a href="mailto:engineering@operator.ai" className="hover:text-slate-900 transition-colors font-semibold">engineering@operator.ai</a>
              </div>
              
              <div className="flex flex-col items-start lg:items-end gap-1.5 text-[12px] text-slate-600">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Privacy Policy</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Data Processing Addendum</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Subprocessors</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Incident Response</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Terms of Service</a>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Refund Policy</a>
                  <span className="text-slate-400">&middot;</span>
                  <a href="#security" className="hover:text-[#e8572a] font-medium transition-colors">Trust Center</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* ── FLOATING MAYA LIVE DEMO WIDGET (MATCHING PAGE.TSX) ────────── */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end select-none">
        {quickWidgetOpen && (
          <div className="mb-3 w-[310px] rounded-3xl bg-[#0c0e14] text-white p-5 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#e8572a] to-amber-500 flex items-center justify-center text-xl shadow-md">
                    👩
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0e14]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Maya</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-[#e8572a] border border-orange-500/30">AI Rep</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">Online &bull; Sub-5s response</p>
                </div>
              </div>

              <button
                onClick={() => setQuickWidgetOpen(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Namaste! I&apos;m Operator&apos;s AI Sales Employee. Test my qualification &amp; meeting booking live:
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <Link
                href="/register"
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#e8572a] hover:bg-[#d04920] text-white font-bold flex items-center justify-between transition-colors shadow-md shadow-[#e8572a]/20 cursor-pointer"
              >
                <span>Deploy Maya for Your Agency</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Collapsed Pill Button */}
        <button
          onClick={() => setQuickWidgetOpen(!quickWidgetOpen)}
          className={cn(
            "group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-[#0c0e14] text-white border border-slate-700/80 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer",
            quickWidgetOpen && "ring-2 ring-[#e8572a]"
          )}
          aria-label="Maya AI Demo Widget"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e8572a] to-amber-500 flex items-center justify-center text-base shadow-sm">
              👩
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c0e14]" />
          </div>

          <div className="text-left font-mono">
            <span className="block text-[11px] font-bold text-white leading-none">Maya</span>
            <span className="block text-[9px] text-[#e8572a] font-semibold">Talk to AI</span>
          </div>
        </button>
      </div>

    </div>
  );
}
