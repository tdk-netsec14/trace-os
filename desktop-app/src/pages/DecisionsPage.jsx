// Decision Log page — engineering memory. Log, browse, delete decisions.
import React, { useCallback, useEffect, useState } from 'react';
import { getDecisions, createDecision, deleteDecision } from '../services/api';
import { SkeletonCard } from '../components/LoadingSkeleton';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rationale, setRationale] = useState('');
  const [tags, setTags] = useState('');
  const [filesAffected, setFilesAffected] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadDecisions = useCallback(async () => {
    try {
      setDecisions(await getDecisions(50));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDecisions(); }, [loadDecisions]);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await createDecision({
        title: title.trim(),
        description: description.trim(),
        rationale: rationale.trim(),
        filesAffected: filesAffected.split(',').map((f) => f.trim()).filter(Boolean),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setTitle(''); setDescription(''); setRationale(''); setTags(''); setFilesAffected('');
      setFormOpen(false);
      await loadDecisions();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDecision(id);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleCopy = async (d) => {
    const text = `## ${d.title}\n${d.description}\n${d.rationale ? `\nRationale: ${d.rationale}` : ''}`;
    await navigator.clipboard.writeText(text);
  };

  if (loading) return <div className="page-enter space-y-4"><SkeletonCard lines={2} /><SkeletonCard lines={4} /><SkeletonCard lines={3} /></div>;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface">Decision Log</h1>
          <p className="text-body-sm text-text-secondary mt-1">Engineering memory — record architectural decisions</p>
        </div>
        <button onClick={() => setFormOpen(!formOpen)} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{formOpen ? 'close' : 'add'}</span>
          {formOpen ? 'Cancel' : 'Log Decision'}
        </button>
      </div>

      {/* Create Form */}
      {formOpen && (
        <div className="card mb-6 animate-slide-in">
          <div className="card-header flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>edit_note</span>
            <span className="text-headline-sm text-on-surface">New Decision</span>
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="text-label-caps text-text-muted block mb-1">TITLE *</label>
              <input type="text" className="input" placeholder="e.g. Migrate from REST to tRPC" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-label-caps text-text-muted block mb-1">DESCRIPTION *</label>
              <textarea className="input min-h-[80px] resize-y" placeholder="What was decided?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-label-caps text-text-muted block mb-1">RATIONALE</label>
              <textarea className="input min-h-[60px] resize-y" placeholder="Why this approach?" value={rationale} onChange={(e) => setRationale(e.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-label-caps text-text-muted block mb-1">TAGS</label>
                <input type="text" className="input" placeholder="architecture, performance" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
              <div>
                <label className="text-label-caps text-text-muted block mb-1">FILES AFFECTED</label>
                <input type="text" className="input" placeholder="src/api.js, src/db.js" value={filesAffected} onChange={(e) => setFilesAffected(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleCreate} className="btn-primary" disabled={!title.trim() || !description.trim() || submitting}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                {submitting ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision List */}
      {decisions.length === 0 ? (
        <div className="card"><div className="card-body text-center py-12">
          <span className="material-symbols-outlined text-text-muted mb-3 block" style={{ fontSize: '40px' }}>history_edu</span>
          <p className="text-body-lg text-on-surface mb-1">No decisions recorded</p>
          <p className="text-body-sm text-text-secondary">Log architectural decisions to build your engineering memory.</p>
        </div></div>
      ) : (
        <div className="space-y-2">
          {decisions.map((d) => (
            <div key={d.id} className="card hover:border-border-active transition-colors duration-fast">
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-body-md text-on-surface font-semibold">{d.title}</div>
                    <div className="text-body-sm text-text-secondary mt-1">{d.description}</div>
                    {d.rationale && <div className="text-code-sm font-mono text-text-muted mt-2 italic">"{d.rationale}"</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleCopy(d)} className="btn-ghost p-1.5" title="Copy to Clipboard">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="btn-ghost p-1.5 text-error hover:text-error" title="Delete Decision">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  {d.tags?.length > 0 && d.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                  <span className="text-code-sm font-mono text-text-muted ml-auto">{formatDate(d.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
