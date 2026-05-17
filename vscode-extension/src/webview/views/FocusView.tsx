// Focus view for tracking and ending active work sessions.
import React, { useEffect, useState } from 'react';
import { ContextCard } from '../components/ContextCard';

type Props = {
  lastMessage: { command: string; data?: any } | null;
  vscode: { postMessage: (message: unknown) => void };
};

export function FocusView({ lastMessage, vscode }: Props) {
  const [taskName, setTaskName] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    vscode.postMessage({ command: 'refreshFocus' });
    const timer = setInterval(() => vscode.postMessage({ command: 'refreshFocus' }), 10000);
    const clock = setInterval(() => setTick(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    if (lastMessage?.command === 'focusActiveResult') {
      setActiveSession(lastMessage.data?.session || null);
    }
    if (lastMessage?.command === 'focusSessionsResult') {
      setSessions(lastMessage.data?.sessions || []);
    }
    if (lastMessage?.command === 'focusStartResult') {
      setActiveSession(lastMessage.data?.session || null);
    }
    if (lastMessage?.command === 'focusEndResult') {
      setSummary(lastMessage.data?.session?.summary || '');
      setActiveSession(null);
    }
  }, [lastMessage]);

  const duration = activeSession ? formatDuration(Math.max(0, Math.floor((tick - activeSession.startedAt) / 1000))) : '00:00:00';

  return (
    <div className="shell">
      <ContextCard title={activeSession ? activeSession.taskName : 'Focus Session'}>
        {!activeSession ? (
          <>
            <input className="input" value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="Task name" />
            <button className="button" onClick={() => vscode.postMessage({ command: 'startFocus', data: { taskName } })} disabled={!taskName}>
              Start Focus Session
            </button>
          </>
        ) : (
          <>
            <p>Active for {duration}</p>
            <p className="muted">Files touched: {activeSession.filesTouched?.length || 0}</p>
            <button className="button" onClick={() => vscode.postMessage({ command: 'endFocus' })}>
              End Session
            </button>
          </>
        )}
        {summary && <p style={{ marginTop: '12px' }}>{summary}</p>}
      </ContextCard>

      <ContextCard title="Recent Sessions">
        {sessions.slice(0, 5).map((session) => (
          <div key={session.id} style={{ marginBottom: '8px' }}>
            <strong>{session.taskName}</strong>
            <div className="muted">{session.summary || 'No summary yet.'}</div>
          </div>
        ))}
      </ContextCard>
    </div>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
