// Dashboard page — command center with activity feed, focus session, decisions, standup.
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActivities, getActiveSession, getDecisions, startFocusSession, endFocusSession } from '../services/api';
import ActivityFeed from '../components/ActivityFeed';
import { SkeletonCard } from '../components/LoadingSkeleton';
import SmartSuggestions from '../components/SmartSuggestions';
import CommitTimeline from '../components/CommitTimeline';
import KnowledgeGraphPreview from '../components/KnowledgeGraphPreview';
import FileInsights from '../components/FileInsights';

function formatDuration(startedAt) {
  if (!startedAt) return '00:00';
  const diff = Date.now() - startedAt;
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n) => n.toString().padStart(2, '0');
  
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function DashboardPage({ onGenerateStandup }) {
  const [activities, setActivities] = useState([]);
  const [activeFocus, setActiveFocus] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusTaskName, setFocusTaskName] = useState('');
  const [elapsed, setElapsed] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [acts, session, decs] = await Promise.all([
        getActivities(30),
        getActiveSession(),
        getDecisions(3),
      ]);
      setActivities(acts);
      setActiveFocus(session);
      setRecentDecisions(decs);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Live elapsed timer for active focus session
  useEffect(() => {
    if (!activeFocus) {
      setElapsed('');
      return;
    }
    const tick = () => setElapsed(formatDuration(activeFocus.startedAt));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeFocus]);

  const handleStartFocus = async () => {
    if (!focusTaskName.trim()) return;
    try {
      const session = await startFocusSession(focusTaskName.trim());
      setActiveFocus(session);
      setFocusTaskName('');
    } catch (err) {
      console.error('Failed to start focus session:', err);
    }
  };

  const handleEndFocus = async () => {
    try {
      await endFocusSession();
      setActiveFocus(null);
      loadData();
    } catch (err) {
      console.error('Failed to end focus session:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <SkeletonCard lines={8} />
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-bold tracking-tight text-on-surface">Dashboard</h1>
          <p className="text-body-sm text-text-secondary mt-1">Your privacy-first development command center</p>
        </div>
        <button onClick={onGenerateStandup} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>summarize</span>
          Generate Standup
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Smart Suggestions */}
          <SmartSuggestions activities={activities} decisions={recentDecisions} />
          
          {/* Focus Session Card */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-light" style={{ fontSize: '18px' }}>timer</span>
              <span className="text-headline-sm text-on-surface font-semibold">Focus Session</span>
              {activeFocus && <span className="status-dot online ml-auto" />}
            </div>
            <div className="card-body">
              {activeFocus ? (
                <div className="space-y-4">
                  <div className="bg-surface-low/50 p-3 rounded-lg border border-border/40">
                    <div className="text-[10px] font-bold tracking-wider text-text-muted mb-1 uppercase">CURRENT TASK</div>
                    <div className="text-body-lg text-on-surface font-semibold">{activeFocus.taskName}</div>
                  </div>
                  <div className="flex items-center gap-8 px-1">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-text-muted mb-1 uppercase">ELAPSED</div>
                      <div className="text-headline-md text-accent-light font-mono font-bold timer-pulse">{elapsed}</div>
                    </div>
                    <div className="h-8 w-px bg-border/40"></div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-text-muted mb-1 uppercase">FILES TOUCHED</div>
                      <div className="text-headline-md text-on-surface font-mono font-bold">{activeFocus.filesTouched?.length || 0}</div>
                    </div>
                  </div>
                  <button onClick={handleEndFocus} className="btn-secondary w-full mt-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>stop</span>
                    End Focus Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-body-sm text-text-secondary">No active focus session. Start one to log deep work context.</p>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="What are you working on right now?"
                      value={focusTaskName}
                      onChange={(e) => setFocusTaskName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartFocus()}
                    />
                    <button onClick={handleStartFocus} className="btn-primary whitespace-nowrap">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span>
                      Start Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent" style={{ fontSize: '18px' }}>timeline</span>
                <span className="text-headline-sm text-on-surface font-semibold">Live Activity Log</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted bg-surface-low px-2 py-0.5 rounded border border-border/40">{activities.length} events</span>
            </div>
            <div className="card-body p-0 max-h-[420px] overflow-y-auto">
              <ActivityFeed items={activities.slice(0, 15)} compact />
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Commit Timeline */}
          <CommitTimeline />
          
          {/* Recent Decisions */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>history_edu</span>
                <span className="text-headline-sm text-on-surface font-semibold">Recent Decisions</span>
              </div>
              <Link to="/decisions" className="text-code-sm font-semibold text-primary-light hover:text-primary transition-colors flex items-center gap-1">
                View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            <div className="card-body p-0">
              {recentDecisions.length === 0 ? (
                <div className="p-5 text-center text-body-sm text-text-muted">No decisions logged yet.</div>
              ) : (
                <div className="divide-y divide-border/30">
                  {recentDecisions.map((d) => (
                    <div key={d.id} className="p-4 hover:bg-surface-mid/20 transition-colors group">
                      <div className="text-body-md text-on-surface font-semibold group-hover:text-primary-light transition-colors">{d.title}</div>
                      <div className="text-body-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">{d.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Knowledge Graph Preview */}
          <KnowledgeGraphPreview />

        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <FileInsights />
        
        {/* Semantic Search Quick Access */}
        <div className="card flex flex-col justify-center text-center p-8 bg-surface-dark border border-border/40 shadow-elevated">
          <div className="w-12 h-12 rounded-xl bg-surface-mid flex items-center justify-center mx-auto mb-3 border border-border/50">
            <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '24px' }}>search</span>
          </div>
          <h3 className="text-headline-sm font-semibold text-on-surface mb-1.5">Find anything instantly</h3>
          <p className="text-body-sm text-text-secondary mb-5 leading-relaxed max-w-xs mx-auto">Search across decisions, developer activities, and code semantics.</p>
          <Link to="/search" className="btn-secondary mx-auto">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
            Semantic Search <kbd className="ml-2 px-1.5 py-0.5 rounded bg-surface-lowest text-text-muted/90 text-[10px] border border-border/45 font-mono">⌘K</kbd>
          </Link>
        </div>
      </div>
      
    </div>
  );
}
