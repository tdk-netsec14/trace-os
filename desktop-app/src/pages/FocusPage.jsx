// Focus Session page — immersive deep-work tracking.
import React, { useCallback, useEffect, useState } from 'react';
import { getActiveSession, startFocusSession, endFocusSession, getFocusSessions } from '../services/api';
import { SkeletonCard } from '../components/LoadingSkeleton';

function formatDuration(startedAt, endedAt) {
  const end = endedAt || Date.now();
  const diff = end - startedAt;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function FocusPage() {
  const [active, setActive] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskName, setTaskName] = useState('');
  const [elapsed, setElapsed] = useState('');
  const [endSummary, setEndSummary] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [session, history] = await Promise.all([getActiveSession(), getFocusSessions()]);
      setActive(session);
      setSessions(history.filter((s) => s.status === 'completed'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!active) { setElapsed(''); return; }
    const tick = () => setElapsed(formatDuration(active.startedAt));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [active]);

  const handleStart = async () => {
    if (!taskName.trim()) return;
    try {
      const s = await startFocusSession(taskName.trim());
      setActive(s);
      setTaskName('');
      setEndSummary(null);
    } catch (e) { console.error(e); }
  };

  const handleEnd = async () => {
    try {
      const s = await endFocusSession();
      setEndSummary(s);
      setActive(null);
      loadData();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="page-enter space-y-4"><SkeletonCard lines={4} /><SkeletonCard lines={3} /></div>;

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Focus Session</h1>
        <p className="text-body-sm text-text-secondary mt-1">Deep work tracking — stay in flow</p>
      </div>

      {/* Active Session */}
      {active ? (
        <div className="card inner-glow mb-6">
          <div className="card-header flex items-center gap-2">
            <span className="status-dot online" />
            <span className="text-label-caps text-accent-light">SESSION ACTIVE</span>
          </div>
          <div className="card-body">
            <div className="text-center py-6">
              <div className="text-headline-md text-on-surface mb-2">{active.taskName}</div>
              <div className="text-[48px] font-mono text-accent-light font-semibold leading-none timer-pulse">{elapsed}</div>
              <div className="text-code-sm font-mono text-text-muted mt-2">
                Started {formatTime(active.startedAt)} · {active.filesTouched?.length || 0} files touched
              </div>
            </div>
            <button onClick={handleEnd} className="btn-secondary w-full">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>stop</span>
              End Focus Session
            </button>
          </div>
        </div>
      ) : (
        <div className="card mb-6">
          <div className="card-body">
            {endSummary ? (
              <div className="mb-4 p-4 rounded-lg bg-surface-mid border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>check_circle</span>
                  <span className="text-headline-sm text-on-surface">Session Complete</span>
                </div>
                <div className="text-body-md text-on-surface mb-1">{endSummary.taskName}</div>
                <div className="text-body-sm text-text-secondary">{formatDuration(endSummary.startedAt, endSummary.endedAt)} · {endSummary.filesTouched?.length || 0} files</div>
                {endSummary.summary && <pre className="text-code-md font-mono text-text-secondary mt-3 whitespace-pre-wrap">{endSummary.summary}</pre>}
              </div>
            ) : null}
            <div className="text-body-sm text-text-secondary mb-3">Start a focus session to track your deep work.</div>
            <div className="flex gap-2">
              <input type="text" className="input flex-1" placeholder="What are you working on?" value={taskName}
                onChange={(e) => setTaskName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleStart()} />
              <button onClick={handleStart} className="btn-primary whitespace-nowrap">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '18px' }}>history</span>
            <span className="text-headline-sm text-on-surface">Session History</span>
            <span className="text-code-sm font-mono text-text-muted ml-auto">{sessions.length} sessions</span>
          </div>
          <div className="card-body p-0">
            {sessions.map((s) => (
              <div key={s.id} className="border-b border-border last:border-0">
                <button className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-mid/50 transition-colors duration-fast"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                  <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '16px' }}>timer</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-md text-on-surface font-medium">{s.taskName}</div>
                    <div className="text-code-sm font-mono text-text-muted">
                      {formatDate(s.startedAt)} · {formatDuration(s.startedAt, s.endedAt)} · {s.filesTouched?.length || 0} files
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-muted transition-transform" style={{ fontSize: '16px', transform: expanded === s.id ? 'rotate(180deg)' : '' }}>
                    expand_more
                  </span>
                </button>
                {expanded === s.id && s.summary && (
                  <div className="px-4 pb-3 pl-11 animate-fade-in">
                    <pre className="text-code-md font-mono text-text-secondary whitespace-pre-wrap">{s.summary}</pre>
                    {s.filesTouched?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.filesTouched.map((f) => <span key={f} className="chip">{f.split(/[/\\]/).pop()}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
