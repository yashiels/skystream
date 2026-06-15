'use client';

import {
  MessageSquare,
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  Wrench,
  Activity,
  Clock,
  BarChart3,
  Users,
  Building2,
  ArrowRight,
  AlertTriangle,
  BrainCircuit,
  Eye,
  Layers,
  GitMerge,
  MapPin,
  ChevronRight,
} from 'lucide-react';

// ─── Design tokens ───────────────────────────────────────────────
const C = {
  bg0: '#0a0a1a',
  bg1: '#111827',
  bg2: '#0f1729',
  bg3: '#162040',
  accent: '#00d4aa',
  accentDark: '#00b894',
  accentDim: 'rgba(0, 212, 170, 0.10)',
  accentBorder: 'rgba(0, 212, 170, 0.22)',
  text0: '#f9fafb',
  text1: '#9ca3af',
  text2: '#6b7280',
  border: 'rgba(255,255,255,0.07)',
  borderCard: 'rgba(255,255,255,0.05)',
};

// ─── Reusable style helpers ───────────────────────────────────────
const section = (bg = C.bg0) => ({
  background: bg,
  padding: 'clamp(4rem,8vw,6rem) clamp(1rem,4vw,1.5rem)',
});

const container = {
  maxWidth: '1100px',
  margin: '0 auto',
};

const badge = (color = C.accent, bg = C.accentDim, border = C.accentBorder) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.25rem 0.75rem',
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: '600',
  color,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});

const sectionLabel = {
  ...badge(),
  marginBottom: '1.25rem',
};

const sectionTitle = {
  fontSize: 'clamp(1.6rem,4vw,2.4rem)',
  fontWeight: '700',
  color: C.text0,
  lineHeight: 1.2,
  marginBottom: '1rem',
};

const sectionDesc = {
  fontSize: 'clamp(1rem,2vw,1.125rem)',
  color: C.text1,
  lineHeight: 1.7,
  maxWidth: '640px',
};

const card = (hover = false) => ({
  background: hover ? C.bg3 : C.bg2,
  border: `1px solid ${C.borderCard}`,
  borderRadius: '12px',
  padding: '1.75rem',
  transition: 'border-color 0.2s ease, background 0.2s ease',
});

const iconBox = (color = C.accent) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  background: `rgba(${hexToRgb(color)}, 0.12)`,
  color,
  marginBottom: '1rem',
  flexShrink: 0,
});

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.875rem 2rem',
  background: C.accent,
  color: '#0a0a1a',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '700',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background 0.2s ease, transform 0.15s ease',
  whiteSpace: 'nowrap',
};

const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.875rem 2rem',
  background: 'transparent',
  color: C.text0,
  border: `1px solid rgba(255,255,255,0.18)`,
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'border-color 0.2s ease, background 0.2s ease',
  whiteSpace: 'nowrap',
};

// ─── Provider data ────────────────────────────────────────────────
const CURRENT_PROVIDERS = [
  { name: 'CarTrack', status: 'live', label: 'Integrated' },
  { name: 'Ctrack', status: 'building', label: 'Validation next' },
];

const PLANNED_PROVIDERS = [
  'Tracker',
  'Netstar',
  'MiX by Powerfleet',
  'Matrix',
  'Webfleet',
  'Geotab',
  'Bidtrack',
  'Digicell',
  'GPS Tracking Solutions / Eqstra',
  'Lytx',
  'Gurtam / Wialon',
  'Autotrak',
  'Digital Matter',
  'Scania Fleet',
  'Pulsit / 86degrees / GalaxyMobile',
];

// ─── Pain-point cards ─────────────────────────────────────────────
const PAIN_POINTS = [
  {
    icon: MessageSquare,
    title: 'WhatsApp dispatch',
    body: 'Jobs get allocated over WhatsApp threads, voice notes, and group chats. There is no audit trail and no live view of who is where.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Excel billing',
    body: 'Trip distances, times, and tolls are manually captured from tracker exports into spreadsheets. Hours of reconciliation per week.',
  },
  {
    icon: Clock,
    title: 'Stale trackers go unnoticed',
    body: 'A vehicle stops reporting and nobody knows until a driver calls in. Your tracker portal does not flag this automatically.',
  },
  {
    icon: AlertTriangle,
    title: 'No exception management',
    body: 'Speeding, harsh braking, after-hours movement, and geofence breaches pile up in the portal. There is no daily operations briefing.',
  },
];

// ─── AI capabilities ──────────────────────────────────────────────
const AI_FEATURES = [
  {
    icon: Eye,
    title: 'Exception detection',
    body: 'Speeding, harsh braking, after-hours movement, geofence violations — surfaced automatically, not buried in reports.',
  },
  {
    icon: Activity,
    title: 'Anomaly detection',
    body: 'Unusual patterns in vehicle behaviour, trip duration, or stops flagged before they become incidents.',
  },
  {
    icon: MapPin,
    title: 'Route and job risk scoring',
    body: 'Each active trip scored against expected route, time, and stops. High-risk trips get operator attention first.',
  },
  {
    icon: Clock,
    title: 'Stale tracker detection',
    body: 'Vehicles that stop reporting are detected within minutes and surfaced as a priority action — not discovered by accident.',
  },
  {
    icon: BarChart3,
    title: 'Billing and trip reconciliation',
    body: 'Distance, duration, stops, and tolls automatically structured per trip for billing-ready export — no manual capture.',
  },
  {
    icon: BrainCircuit,
    title: '"What needs attention today?" briefing',
    body: 'A daily AI operations summary: which vehicles, trips, and exceptions need attention — generated each morning before the first shift.',
  },
];

// ─── SA-specific points ───────────────────────────────────────────
const SA_POINTS = [
  { icon: Truck, text: 'Mixed tracker fleets — different providers across the same depot' },
  { icon: Users, text: 'Subcontractor and owner-driver operations with no single tracker account' },
  { icon: Building2, text: 'Multi-depot operations managing vehicles across multiple sites' },
  { icon: MessageSquare, text: 'WhatsApp-heavy workflows that need structure without a rip-and-replace' },
  { icon: FileSpreadsheet, text: 'Excel billing that operators cannot yet abandon but need to automate' },
  { icon: GitMerge, text: 'No consistent trip history across providers for audit and dispute resolution' },
];

// ─── Page component ───────────────────────────────────────────────
export default function SkyLogLanding() {
  return (
    <div style={{ background: C.bg0 }}>
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          ...section(C.bg0),
          paddingTop: 'clamp(5rem,12vw,8rem)',
          paddingBottom: 'clamp(4rem,8vw,6rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '500px',
            background: `radial-gradient(ellipse at center, rgba(0,212,170,0.07) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ ...container, textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ ...sectionLabel, marginBottom: '2rem' }}>
            <Layers size={12} />
            AI fleet operations platform
          </div>

          {/* Brand */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem,9vw,5rem)',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: C.text0,
              margin: '0 0 1.25rem',
              lineHeight: 1.05,
            }}
          >
            Sky
            <span style={{ color: C.accent }}>Log</span>
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: 'clamp(1.1rem,3vw,1.5rem)',
              fontWeight: '500',
              color: C.text0,
              margin: '0 auto 1.25rem',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            AI fleet operations for South African logistics operators.
          </p>

          {/* Subcopy */}
          <p
            style={{
              fontSize: 'clamp(0.95rem,2vw,1.1rem)',
              color: C.text1,
              margin: '0 auto 2.75rem',
              maxWidth: '640px',
              lineHeight: 1.7,
            }}
          >
            Connect CarTrack, Ctrack, Netstar, Tracker, MiX and other fleet systems.
            SkyLog turns raw tracking data into live operations, exceptions, trip
            history, and billing-ready intelligence.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a href="mailto:pilot@skylog.co.za" style={btnPrimary}>
              Join the Pilot
              <ArrowRight size={18} />
            </a>
            <a href="mailto:pilot@skylog.co.za?subject=Walkthrough Request" style={btnSecondary}>
              Book a Walkthrough
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. PROBLEM ──────────────────────────────────────────── */}
      <section style={section(C.bg1)}>
        <div style={container}>
          {/* Heading */}
          <div style={{ marginBottom: '3rem', maxWidth: '680px' }}>
            <div style={sectionLabel}>
              <AlertTriangle size={12} />
              The problem
            </div>
            <h2 style={sectionTitle}>Your tracker is not your operations system</h2>
            <p style={sectionDesc}>
              CarTrack and Ctrack show dots on a map. They capture movement — they were never
              built to run logistics operations. Operators still manage jobs through WhatsApp,
              reconcile billing in Excel, and discover stale vehicles only when a driver calls in.
              SkyLog sits above the tracker and turns movement into action.
            </p>
          </div>

          {/* Pain point cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {PAIN_POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} style={card()}>
                <div style={iconBox('#f87171')}>
                  <Icon size={20} />
                </div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: C.text0,
                    marginBottom: '0.5rem',
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: C.text1, margin: 0, lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SOLUTION ─────────────────────────────────────────── */}
      <section style={section(C.bg0)}>
        <div style={container}>
          <div style={{ marginBottom: '3rem', maxWidth: '680px' }}>
            <div style={sectionLabel}>
              <Layers size={12} />
              The solution
            </div>
            <h2 style={sectionTitle}>One operations layer across every provider</h2>
            <p style={sectionDesc}>
              SkyLog normalises data from whichever tracker your vehicles are fitted with —
              today or in future — into a single operations view. You stop managing portals
              and start managing operations.
            </p>
          </div>

          {/* Current integrations */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: C.text2,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Current integrations
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {CURRENT_PROVIDERS.map(({ name, status, label }) => (
                <div
                  key={name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: status === 'live' ? C.accentDim : 'rgba(251,191,36,0.08)',
                    border: `1px solid ${status === 'live' ? C.accentBorder : 'rgba(251,191,36,0.2)'}`,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: status === 'live' ? C.accent : '#fbbf24',
                  }}
                >
                  {status === 'live' ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Wrench size={15} />
                  )}
                  {name}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      color: status === 'live' ? C.accent : '#fbbf24',
                      opacity: 0.8,
                    }}
                  >
                    — {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Planned integrations */}
          <div
            style={{
              ...card(),
              borderColor: C.border,
            }}
          >
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: C.text2,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              Planned integrations
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}
            >
              {PLANNED_PROVIDERS.map(name => (
                <span
                  key={name}
                  style={{
                    padding: '0.35rem 0.85rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: C.text1,
                    fontWeight: '500',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. AI OPERATIONS ────────────────────────────────────── */}
      <section style={section(C.bg1)}>
        <div style={container}>
          <div style={{ marginBottom: '3rem', maxWidth: '680px' }}>
            <div style={sectionLabel}>
              <BrainCircuit size={12} />
              AI operations
            </div>
            <h2 style={sectionTitle}>AI operations, not another map</h2>
            <p style={sectionDesc}>
              SkyLog applies AI to the operational layer — not to route vehicles autonomously,
              but to surface what an operator actually needs to know right now. Exceptions,
              anomalies, risk, billing reconciliation, and daily briefings.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {AI_FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ ...card(), display: 'flex', gap: '1rem' }}>
                <div
                  style={{
                    ...iconBox(C.accent),
                    marginBottom: 0,
                    marginTop: '0.1rem',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: C.text0,
                      marginBottom: '0.4rem',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: C.text1, margin: 0, lineHeight: 1.6 }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. BUILT FOR SA ─────────────────────────────────────── */}
      <section style={section(C.bg0)}>
        <div style={container}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'start',
            }}
          >
            {/* Left: heading */}
            <div>
              <div style={sectionLabel}>
                <MapPin size={12} />
                Built for SA
              </div>
              <h2 style={{ ...sectionTitle, maxWidth: '400px' }}>
                Built for South African operators
              </h2>
              <p style={{ ...sectionDesc, marginBottom: '1.5rem' }}>
                South African logistics has a distinct shape: mixed tracker fleets, subcontractors
                running on owner-driver agreements, multi-depot operations, and workflows that
                live in WhatsApp. SkyLog was designed around this reality, not imported from
                offshore.
              </p>
            </div>

            {/* Right: list */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {SA_POINTS.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    padding: '1rem 1.25rem',
                    background: C.bg2,
                    border: `1px solid ${C.borderCard}`,
                    borderRadius: '10px',
                  }}
                >
                  <Icon size={18} style={{ color: C.accent, marginTop: '0.1rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.925rem', color: C.text1, lineHeight: 1.5 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PILOT CTA ────────────────────────────────────────── */}
      <section
        style={{
          ...section(C.bg1),
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            ...container,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '300px',
              background: `radial-gradient(ellipse at center, rgba(0,212,170,0.06) 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div style={{ ...sectionLabel, marginBottom: '1.5rem' }}>
              <ChevronRight size={12} />
              Pilot programme — open now
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.8rem,5vw,3rem)',
                fontWeight: '800',
                color: C.text0,
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
                lineHeight: 1.15,
              }}
            >
              Connect your fleet tracker.
            </h2>

            <p
              style={{
                fontSize: 'clamp(1rem,2.5vw,1.2rem)',
                color: C.text1,
                margin: '0 auto 2.5rem',
                maxWidth: '560px',
                lineHeight: 1.6,
              }}
            >
              We&apos;ll show you which vehicles, trips, and exceptions need attention —
              across whichever tracker you run today.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a href="mailto:pilot@skylog.co.za" style={btnPrimary}>
                Join the Pilot
                <ArrowRight size={18} />
              </a>
              <a
                href="mailto:pilot@skylog.co.za?subject=Walkthrough Request"
                style={btnSecondary}
              >
                Book a Walkthrough
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
