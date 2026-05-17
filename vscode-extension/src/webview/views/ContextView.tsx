// Context view for resuming where the developer left off.
import React, { useEffect, useState } from 'react';
import { ContextCard } from '../components/ContextCard';
import { ActivityItem } from '../components/ActivityItem';

type Props = {
  lastMessage: { command: string; data?: any } | null;
  vscode: { postMessage: (message: unknown) => void };
};

export function ContextView({ lastMessage, vscode }: Props) {
  const [filePath, setFilePath] = useState('');
  const [context, setContext] = useState('Analyzing your context...');
  const [relatedFiles, setRelatedFiles] = useState<string[]>([]);
  const [relatedDecisions, setRelatedDecisions] = useState<any[]>([]);
  const [lastActivity, setLastActivity] = useState<any>(null);

  useEffect(() => {
    if (lastMessage?.command === 'contextResult' || lastMessage?.command === 'contextUpdated') {
      const data = lastMessage.data || {};
      setFilePath(data.filePath || filePath);
      setContext(data.context || 'No context available yet.');
      setRelatedFiles(data.relatedFiles || []);
      setRelatedDecisions(data.relatedDecisions || []);
      setLastActivity(data.lastActivity || null);
    }
  }, [lastMessage]);

  return (
    <div className="shell">
      <ContextCard title={filePath ? filePath.split(/[/\\]/).pop() || 'Context' : 'Context'}>
        <p>{context}</p>
        {lastActivity && <p className="muted">Last activity: {Math.max(1, Math.round((Date.now() - lastActivity.created_at) / 60000))} minutes ago</p>}
        <div className="row" style={{ marginTop: '12px' }}>
          <button className="button" onClick={() => vscode.postMessage({ command: 'fetchContext', data: { filePath } })} disabled={!filePath}>
            Refresh
          </button>
        </div>
      </ContextCard>

      <ContextCard title="Related Files">
        {relatedFiles.length ? relatedFiles.map((item) => <ActivityItem key={item} label="File" value={item} />) : <p className="muted">Open a file to see related paths.</p>}
      </ContextCard>

      <ContextCard title="Related Decisions">
        {relatedDecisions.length
          ? relatedDecisions.map((decision) => <ActivityItem key={decision.id} label={decision.title} value={decision.rationale || decision.description || ''} />)
          : <p className="muted">No linked decisions yet.</p>}
      </ContextCard>
    </div>
  );
}
