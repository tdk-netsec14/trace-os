// Standup view for generating a concise daily update from recent activity.
import React, { useEffect, useState } from 'react';
import { ContextCard } from '../components/ContextCard';

type Props = {
  lastMessage: { command: string; data?: any } | null;
  vscode: { postMessage: (message: unknown) => void };
};

export function StandupView({ lastMessage, vscode }: Props) {
  const [standup, setStandup] = useState('');
  const [activityCount, setActivityCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lastMessage?.command === 'standupResult') {
      setLoading(false);
      setStandup(lastMessage.data?.standup || '');
      setActivityCount(lastMessage.data?.activityCount || 0);
    }
  }, [lastMessage]);

  return (
    <div className="shell">
      <ContextCard title="Standup">
        <button
          className="button"
          onClick={() => {
            setLoading(true);
            vscode.postMessage({ command: 'fetchStandup', data: { hoursBack: 24 } });
          }}
        >
          {loading ? 'Reviewing your last 24 hours...' : 'Generate Standup'}
        </button>
        <button
          className="button secondary"
          style={{ marginLeft: '8px' }}
          onClick={() => vscode.postMessage({ command: 'copyToClipboard', data: { text: standup } })}
          disabled={!standup}
        >
          Copy to Clipboard
        </button>
        {standup ? <pre style={{ whiteSpace: 'pre-wrap', marginTop: '12px' }}>{standup}</pre> : <p className="muted">Generate a standup from the last 24 hours.</p>}
        <p className="muted">Based on {activityCount} activities from the last 24 hours.</p>
      </ContextCard>
    </div>
  );
}
