import React, { useEffect, useState } from 'react';
function ExtensionIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5.5v2" />
      <rect x="5" y="7.5" width="14" height="11" rx="2.5" />
      <path d="M10 12h4" />
      <path d="M12 10v4" />
    </svg>
  );
}

function DashboardWalkthrough() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const frames = window.setInterval(() => {
      setStep((current) => (current + 1) % 3);
    }, 2600);

    return () => window.clearInterval(frames);
  }, []);

  const steps = [
    {
      title: 'Dashboard overview',
      badge: 'Live activity',
      focus: 'Workspace pulse',
      detail: 'A quick scan of recent edits, decisions, and focus status shows exactly what changed while you were away.',
      metric: '148 events'
    },
    {
      title: 'Context resume',
      badge: 'Context Brief',
      focus: 'Resume where you left off',
      detail: 'Select a file and the app reconstructs the last meaningful state with related files and decisions.',
      metric: '3 related files'
    },
    {
      title: 'Focus session',
      badge: 'Deep work',
      focus: 'Timer + summary',
      detail: 'Start a focus session, track the work, and turn it into a standup-ready summary automatically.',
      metric: '24:18 elapsed'
    }
  ];

  const current = steps[step];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#071122] shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-white/20" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
          screen recording
        </span>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
          <div className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.24em] text-accent">
            {current.badge}
          </div>
          <h4 className="text-2xl font-semibold tracking-tight text-white">{current.title}</h4>
          <p className="text-sm leading-relaxed text-white/65">{current.detail}</p>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/35">What to notice</div>
            <div className="mt-2 text-sm text-white/80">{current.focus}</div>
          </div>
          <div className="flex items-center justify-between text-xs text-white/45">
            <span>Auto-advancing preview</span>
            <span>{current.metric}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1730] p-3 text-left text-white">
          {step === 0 && (
            <div className="space-y-3 animate-[fadeIn_600ms_ease]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-white/45">
                  <span>Live Activity</span>
                  <span className="text-accent">12s ago</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="rounded-xl bg-white/6 px-3 py-2 text-sm">Edited auth.controller.ts</div>
                  <div className="rounded-xl bg-white/6 px-3 py-2 text-sm">Logged decision: JWT rotation</div>
                  <div className="rounded-xl bg-white/6 px-3 py-2 text-sm">Started focus session: Stabilize auth flow</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-black/30 p-3 text-center">Activities<br /><span className="mt-1 block text-lg font-semibold text-white">148</span></div>
                <div className="rounded-xl bg-black/30 p-3 text-center">Decisions<br /><span className="mt-1 block text-lg font-semibold text-white">12</span></div>
                <div className="rounded-xl bg-black/30 p-3 text-center">Focus<br /><span className="mt-1 block text-lg font-semibold text-accent">02:14</span></div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3 animate-[fadeIn_600ms_ease]">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-accent">cached</span>
                  <span>/frontend/src/auth/login.jsx</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  You were wiring login-state persistence and validating the session middleware. The last step left off in the auth flow, and the next check is ensuring token refresh behavior stays consistent.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-white/55">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-white/35">Related file</div>
                  <div className="mt-1 font-mono text-white">session.js</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-white/35">Related decision</div>
                  <div className="mt-1 font-mono text-white">JWT rotation</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-[fadeIn_600ms_ease]">
              <div className="flex items-end justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/35">Current task</div>
                  <div className="mt-2 text-lg font-semibold text-white">Stabilize auth flow</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/35">Elapsed</div>
                  <div className="mt-2 font-mono text-2xl text-accent">24:18</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                Automatically captures touched files, then turns the session into a standup-ready summary.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight">Trace OS</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="#download" className="hover:text-white transition-colors">Download</a>
        </nav>
        <a href="#download" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
          Get Started
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 border border-accent/20">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        Now with workspace intelligence
      </div>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-gradient">
        Your engineering memory.
      </h1>
      <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
        Dev Productivity OS remembers your workflow, decisions, and context so you never lose momentum.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#download" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
          Download Desktop App
        </a>
        <a href="#download" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-surface-light hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L8.42 15.45c.288.246.686.3 1.02.138l12.44-6.08a1.5 1.5 0 0 0 .84-1.29V3.88a1.5 1.5 0 0 0-.43-1.09l.01-.01zM2.86 8.016l1.32 1.01-1.32 1.205V8.016zm18.8 13.397L16.72 23.79a1.494 1.494 0 0 1-1.705-.29l-9.46-8.63 4.12-3.128L21.66 12.3c.334-.162.732-.108 1.02.138l1.32 1.205v8.32a1.5 1.5 0 0 1-.43 1.09l.01-.01zM2.86 15.984l1.32-1.01 1.32 1.205v-2.205l2.42-2.207L16.72 17.5l-4.75 2.29-1.26-1.06a.999.999 0 0 0-1.276-.057L.327 21.05A1 1 0 0 0 .326 22.53l1.32-1.205v-5.34z"/></svg>
          Install VS Code Extension
        </a>
      </div>

      <div className="mt-20 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-600 rounded-[28px] blur opacity-20"></div>
        <div className="relative glass-panel p-2">
          <DashboardWalkthrough />
        </div>
      </div>
    </section>
  );
}

function PreviewFrame({ label, title, subtitle, children }) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-white/20" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className={`ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50`}>
          {label}
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">{subtitle}</p>
          <h4 className="text-2xl font-semibold tracking-tight text-white">{title}</h4>
          <div className="h-px w-14 bg-accent" />
          <div className="space-y-2 text-sm text-white/55">
            <p>Structured, local-first capture of the work you already do.</p>
            <p>Designed to keep context visible, searchable, and recoverable.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f1730] p-4 text-left text-white">
          {children}
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <PreviewFrame label="Desktop + Dashboard" title="Command center" subtitle="Live activity and guidance">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="text-white/40">Activities</div>
            <div className="mt-1 text-lg font-semibold text-white">148</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <div className="text-white/40">Decisions</div>
            <div className="mt-1 text-lg font-semibold text-white">12</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <div className="text-white/40">Focus</div>
            <div className="mt-1 text-lg font-semibold text-white">02:14</div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between text-xs text-white/45">
            <span>Smart Suggestions</span>
            <span className="text-accent">3 actionable items</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="rounded-xl bg-white/6 px-3 py-2 text-sm text-white/80">Resume context for auth.controller.ts</div>
            <div className="rounded-xl bg-white/6 px-3 py-2 text-sm text-white/80">Review decision: Session storage strategy</div>
            <div className="rounded-xl bg-white/6 px-3 py-2 text-sm text-white/80">Search around: login flow regression</div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function ContextPreview() {
  return (
    <PreviewFrame label="Context Resume" title="Recovered context brief" subtitle="What you were doing">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-accent">cached</span>
            <span>/frontend/src/auth/login.jsx</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            You were wiring login-state persistence and validating the session middleware. The last step left off in the auth flow, and the next check is ensuring token refresh behavior stays consistent.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/55">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="text-white/35">Related file</div>
            <div className="mt-1 font-mono text-white">session.js</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <div className="text-white/35">Related decision</div>
            <div className="mt-1 font-mono text-white">JWT rotation</div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function GraphPreview() {
  return (
    <PreviewFrame label="Knowledge Graph" title="System map" subtitle="File relationships">
      <div className="relative h-full min-h-[260px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.24),_transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 20% 25%, rgba(255,255,255,0.16) 0 2px, transparent 3px), radial-gradient(circle at 72% 30%, rgba(255,255,255,0.14) 0 2px, transparent 3px), radial-gradient(circle at 48% 72%, rgba(255,255,255,0.14) 0 2px, transparent 3px)', backgroundSize: '100% 100%' }} />
        <div className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute left-[18%] top-[22%] h-px w-20 rotate-12 bg-white/20" />
        <div className="absolute left-[58%] top-[28%] h-px w-24 -rotate-12 bg-white/20" />
        <div className="absolute left-[43%] top-[58%] h-px w-28 rotate-[-22deg] bg-white/20" />

        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="grid grid-cols-2 gap-3 text-xs text-white/80">
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-center break-words">auth.controller.ts</div>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-center break-words">session cache</div>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-center break-words">context brief</div>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-center break-words">decision log</div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function FocusPreview() {
  return (
    <PreviewFrame label="Focus Session" title="Deep work timer" subtitle="Session capture">
      <div className="space-y-3">
        <div className="flex items-end justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/35">Current task</div>
            <div className="mt-2 text-lg font-semibold text-white">Stabilize auth flow</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/35">Elapsed</div>
            <div className="mt-2 font-mono text-2xl text-accent">24:18</div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          Automatically captures touched files, then turns the session into a standup-ready summary.
        </div>
      </div>
    </PreviewFrame>
  );
}

function Feature({ title, description, reverse, children }) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center py-20 px-6 max-w-6xl mx-auto`}>
      <div className="flex-1 space-y-6">
        <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
        <p className="text-lg text-white/60 leading-relaxed">{description}</p>
      </div>
      <div className="flex-1 w-full relative">
        <div className="absolute -inset-4 bg-accent/5 rounded-3xl blur-xl"></div>
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Intelligence built for engineers.</h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">Stop digging through chat history and git logs. Trace OS automatically maps your work context so you can focus on building.</p>
      </div>


        <Feature 
        title="Live Dashboard" 
        description="See activities, decisions, and focus state together in one command center, so the app feels alive rather than static."
      >
        <DashboardPreview />
      </Feature>
      <Feature 
        title="Context Resume" 
        description="Recover the brief that matters most: what you were changing, where you paused, and what the next step should be."
        reverse
      >
        <ContextPreview />
      </Feature>
      <Feature 
        title="Decision Memory" 
        description="Log architectural decisions right from your IDE. Trace OS connects them to the files you edited, so your future self (and your team) always knows why something was built."
      >
        <GraphPreview />
      </Feature>
      <Feature 
        title="Focus Sessions" 
        description="Track deep work naturally. Start a session, and we'll automatically document the files touched and generate a standup-ready summary when you're done."
        reverse
      >
        <FocusPreview />
      </Feature>
    </section>
  );
}

function TrustSignals() {
  return (
    <section id="privacy" className="py-24 border-y border-white/10 bg-surface/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Private by default. Local forever.</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-white/10 text-accent">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h4 className="font-semibold text-lg">No Cloud Dependency</h4>
            <p className="text-white/60 text-sm">Everything runs locally. Your code, your history, and your decisions never leave your machine.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-white/10 text-accent">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4 className="font-semibold text-lg">Local AI Native</h4>
            <p className="text-white/60 text-sm">Powered by Ollama under the hood. Experience deep context intelligence with zero latency and zero API costs.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-white/10 text-accent">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <h4 className="font-semibold text-lg">Built for Engineers</h4>
            <p className="text-white/60 text-sm">We don't do flashy AI chat bubbles. Trace OS provides structured, technical insights right where you work.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Download() {
  return (
    <section id="download" className="py-32 px-6 text-center max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-6">Get your context back.</h2>
      <p className="text-xl text-white/60 mb-12">Available now for macOS, Windows, and Linux.</p>
      
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div className="glass-panel p-6 flex flex-col items-center gap-4 hover:border-accent/50 transition-colors group">
          <svg className="w-10 h-10 text-white/80 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <div>
            <h4 className="font-semibold text-lg">Desktop App</h4>
            <p className="text-sm text-white/50 mt-1">The command center.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center w-full mt-2">
            <button className="flex-1 py-2 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">macOS</button>
            <button className="flex-1 py-2 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">Windows</button>
            <button className="flex-1 py-2 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">Linux</button>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center gap-4 hover:border-accent/50 transition-colors group">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-lg">VS Code Extension</h4>
            <p className="text-sm text-white/50 mt-1">Context right in your IDE.</p>
          </div>
          <button className="w-full mt-auto py-2 px-4 rounded bg-accent hover:bg-accent/90 text-white font-medium transition-colors">
            View Marketplace
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
      <p>© 2026 Trace OS. Built for engineers.</p>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <TrustSignals />
        <Download />
      </main>
      <Footer />
    </div>
  );
}
