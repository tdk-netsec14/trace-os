// Dashboard page — command center with activity feed, focus session, decisions, and insight cards.
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
  if (!startedAt) return '0m';
  const diff = Date.now() - startedAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
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
    <div className="page-enter max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface">Dashboard</h1>
          <p className="text-body-sm text-text-secondary mt-1">Your development command center</p>
        </div>
        <button onClick={onGenerateStandup} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>summarize</span>
          Generate Standup
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] mb-6">
        <div className="space-y-6">
          <SmartSuggestions activities={activities} decisions={recentDecisions} />

          <div className="card inner-glow">
            <div className="card-header flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-light" style={{ fontSize: '18px' }}>timer</span>
              <span className="text-headline-sm text-on-surface">Focus Session</span>
              {activeFocus && <span className="status-dot online ml-auto" />}
            </div>
            <div className="card-body">
              {activeFocus ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-label-caps text-text-muted mb-1">CURRENT TASK</div>
                    <div className="text-body-lg text-on-surface font-medium">{activeFocus.taskName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-label-caps text-text-muted mb-0.5">ELAPSED</div>
                      <div className="text-headline-md text-accent-light font-mono timer-pulse">{elapsed}</div>
                    </div>
                    <div>
                      <div className="text-label-caps text-text-muted mb-0.5">FILES</div>
                      <div className="text-headline-md text-on-surface">{activeFocus.filesTouched?.length || 0}</div>
                    </div>
                  </div>
                  <button onClick={handleEndFocus} className="btn-secondary w-full mt-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>stop</span>
                    End Focus Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-body-sm text-text-secondary">No active session. Start one to track deep work.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Task name..."
                      value={focusTaskName}
                      onChange={(e) => setFocusTaskName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartFocus()}
                    />
                    <button onClick={handleStartFocus} className="btn-primary whitespace-nowrap">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span>
                      Start
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent" style={{ fontSize: '18px' }}>timeline</span>
                <span className="text-headline-sm text-on-surface">Live Activity</span>
              </div>
              <span className="text-code-sm font-mono text-text-muted">{activities.length} events</span>
            </div>
            <div className="card-body p-0">
              <ActivityFeed items={activities.slice(0, 10)} compact />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CommitTimeline />

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>history_edu</span>
                <span className="text-headline-sm text-on-surface">Recent Decisions</span>
              </div>
              <Link to="/decisions" className="text-code-sm font-mono text-primary-light hover:text-primary transition-colors">
                View all →
              </Link>
            </div>
            <div className="card-body space-y-2">
              {recentDecisions.length === 0 ? (
                <p className="text-body-sm text-text-muted">No decisions logged yet.</p>
              ) : (
                recentDecisions.map((d) => (
                  <div key={d.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-body-md text-on-surface font-medium truncate">{d.title}</div>
                      <div className="text-body-sm text-text-secondary truncate">{d.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <KnowledgeGraphPreview />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] mb-6">
        <FileInsights />

        <div className="card flex flex-col justify-center text-center p-6 bg-surface-low border border-border/50">
          <span className="material-symbols-outlined text-text-muted mb-2 mx-auto" style={{ fontSize: '32px' }}>search</span>
          <h3 className="text-headline-sm text-on-surface mb-2">Find anything instantly</h3>
          <p className="text-body-sm text-text-secondary mb-4">Search across decisions, activities, and code semantics.</p>
          <Link to="/search" className="btn-secondary mx-auto">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
            Semantic Search <kbd className="ml-2 px-1.5 py-0.5 rounded bg-surface-mid text-text-muted text-[10px] border border-border font-mono">⌘K</kbd>
          </Link>
        </div>
      </div>
    </div>
  );
}
