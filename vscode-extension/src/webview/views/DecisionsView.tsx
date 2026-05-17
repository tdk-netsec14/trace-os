// Decisions view for logging and reviewing architecture decisions.
import React, { useEffect, useState } from 'react';
import { ContextCard } from '../components/ContextCard';

type Props = {
  lastMessage: { command: string; data?: any } | null;
  vscode: { postMessage: (message: unknown) => void };
};

export function DecisionsView({ lastMessage, vscode }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rationale, setRationale] = useState('');
  const [tags, setTags] = useState('');
  const [decisions, setDecisions] = useState<any[]>([]);

  useEffect(() => {
    vscode.postMessage({ command: 'refreshDecisions' });
  }, []);

  useEffect(() => {
    if (lastMessage?.command === 'decisionsResult') {
      setDecisions(lastMessage.data?.decisions || []);
    }
    if (lastMessage?.command === 'decisionLogged') {
      vscode.postMessage({ command: 'refreshDecisions' });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setRationale('');
      setTags('');
    }
    if (lastMessage?.command === 'decisionDeleted') {
      vscode.postMessage({ command: 'refreshDecisions' });
    }
  }, [lastMessage]);

  return (
    <div className="shell">
      <ContextCard title="Decisions">
        {!showForm ? (
          <button className="button" onClick={() => setShowForm(true)}>
            Log New Decision
          </button>
        ) : (
          <>
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
            <textarea className="textarea" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
            <textarea className="textarea" rows={3} value={rationale} onChange={(event) => setRationale(event.target.value)} placeholder="Rationale" />
            <input className="input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, comma separated" />
            <div className="row">
              <button
                className="button"
                onClick={() =>
                  vscode.postMessage({
                    command: 'logDecision',
                    data: {
                      title,
                      description,
                      rationale,
                      filesAffected: [],
                      tags
                    }
                  })
                }
                disabled={!title || !description}
              >
                Submit
              </button>
              <button className="button secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </ContextCard>

      {decisions.map((decision) => (
        <ContextCard key={decision.id} title={decision.title}>
          <p>{decision.description}</p>
          <div className="row">
            {(decision.tags || []).map((tag: string) => (
              <span key={tag} className="muted">#{tag}</span>
            ))}
          </div>
          <div className="row" style={{ marginTop: '8px' }}>
            <button className="button secondary" onClick={() => vscode.postMessage({ command: 'deleteDecision', data: { id: decision.id } })}>
              Delete
            </button>
          </div>
        </ContextCard>
      ))}
    </div>
  );
}
