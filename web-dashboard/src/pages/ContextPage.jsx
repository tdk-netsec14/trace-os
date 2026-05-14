// Context Resume page — the HERO feature.
import React, { useCallback, useEffect, useState } from 'react';
import { getContext, getActivities } from '../services/api';
import { SkeletonParagraph } from '../components/LoadingSkeleton';

function formatRelativeTime(ts) {
  if (!ts) return '';
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getBasename(fp) {
  return fp ? fp.split(/[/\\]/).pop() || fp : '';
}

export default function ContextPage() {
  const [filePath, setFilePath] = useState('');
  const [ctxData, setCtxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const acts = await getActivities(100);
        const seen = new Set();
        const files = [];
        for (const a of acts) {
          if (a.filePath && !seen.has(a.filePath)) {
            seen.add(a.filePath);
            files.push({ path: a.filePath, time: a.createdAt });
            if (files.length >= 12) break;
          }
        }
        setRecentFiles(files);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const resumeCtx = useCallback(async (path) => {
    const t = path || filePath;
    if (!t.trim()) return;
    setLoading(true);
    setCtxData(null);
    try {
      setCtxData(await getContext(t.trim()));
    } catch {
      setCtxData({ error: true });
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  const handleCopy = async () => {
    if (ctxData?.context) {
      await navigator.clipboard.writeText(ctxData.context);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectFile = (p) => { setFilePath(p); setShowRecent(false); resumeCtx(p); };

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Context Resume</h1>
        <p className="text-body-sm text-text-secondary mt-1">Recover your working context — powered by local AI</p>
      </div>

      {/* File Input */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: '18px' }}>draft</span>
              <input type="text" className="input pl-10" placeholder="Enter file path or select recent..." value={filePath}
                onChange={(e) => setFilePath(e.target.value)} onFocus={() => setShowRecent(true)}
                onKeyDown={(e) => e.key === 'Enter' && resumeCtx()} />
              {showRecent && recentFiles.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-high border border-border rounded-lg shadow-float z-20 max-h-60 overflow-y-auto">
                  <div className="px-3 py-2 text-label-caps text-text-muted border-b border-border">RECENT FILES</div>
                  {recentFiles.map((f) => (
                    <button key={f.path} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-mid transition-colors duration-fast"
                      onClick={() => selectFile(f.path)}>
                      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '16px' }}>draft</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm text-on-surface truncate">{getBasename(f.path)}</div>
                        <div className="text-code-sm font-mono text-text-muted truncate">{f.path}</div>
                      </div>
                      <span className="text-code-sm font-mono text-text-muted">{formatRelativeTime(f.time)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => resumeCtx()} className="btn-primary whitespace-nowrap" disabled={!filePath.trim() || loading}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
              Resume Context
            </button>
          </div>
        </div>
      </div>
      {showRecent && <div className="fixed inset-0 z-10" onClick={() => setShowRecent(false)} />}

      {/* Loading */}
      {loading && (
        <div className="card"><div className="card-header flex items-center gap-2">
          <span className="material-symbols-outlined text-primary animate-pulse-slow" style={{ fontSize: '20px' }}>psychology</span>
          <span className="text-headline-sm text-on-surface">Recovering context...</span>
        </div><div className="card-body"><SkeletonParagraph lines={6} /></div></div>
      )}

      {/* Result */}
      {ctxData && !ctxData.error && !loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="card inner-glow">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>auto_awesome</span>
                <span className="text-headline-sm text-on-surface">Context Brief</span>
                {ctxData.cached && <span className="chip text-[10px]">cached</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => resumeCtx()} className="btn-ghost text-body-sm"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>Refresh</button>
                <button onClick={handleCopy} className="btn-secondary text-body-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{copied ? 'check' : 'content_copy'}</span>{copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="card-body">
              <pre className="text-body-md text-on-surface whitespace-pre-wrap leading-relaxed font-inter">{ctxData.context}</pre>
              {ctxData.generatedAt && <div className="mt-4 pt-3 border-t border-border text-code-sm font-mono text-text-muted">Generated {formatRelativeTime(ctxData.generatedAt)}</div>}
            </div>
          </div>
          {ctxData.relatedFiles?.length > 0 && (
            <div className="card"><div className="card-header flex items-center gap-2">
              <span className="material-symbols-outlined text-accent" style={{ fontSize: '18px' }}>folder_open</span>
              <span className="text-headline-sm text-on-surface">Related Files</span>
              <span className="text-code-sm font-mono text-text-muted ml-auto">{ctxData.relatedFiles.length}</span>
            </div><div className="card-body p-0">
              {ctxData.relatedFiles.map((f) => (
                <button key={f} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-mid/50 transition-colors border-b border-border last:border-0" onClick={() => selectFile(f)}>
                  <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '16px' }}>draft</span>
                  <span className="text-code-md font-mono text-on-surface truncate">{f}</span>
                  <span className="material-symbols-outlined text-text-muted ml-auto" style={{ fontSize: '14px' }}>arrow_forward</span>
                </button>
              ))}
            </div></div>
          )}
          {ctxData.relatedDecisions?.length > 0 && (
            <div className="card"><div className="card-header flex items-center gap-2">
              <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>history_edu</span>
              <span className="text-headline-sm text-on-surface">Related Decisions</span>
            </div><div className="card-body space-y-3">
              {ctxData.relatedDecisions.map((d) => (
                <div key={d.id} className="py-2 border-b border-border last:border-0">
                  <div className="text-body-md text-on-surface font-medium">{d.title}</div>
                  <div className="text-body-sm text-text-secondary mt-1">{d.description}</div>
                </div>
              ))}
            </div></div>
          )}
        </div>
      )}

      {ctxData?.error && !loading && (
        <div className="card animate-fade-in"><div className="card-body text-center py-8">
          <span className="material-symbols-outlined text-error mb-2 block" style={{ fontSize: '32px' }}>error</span>
          <p className="text-body-md text-text-secondary">Failed to resume context. Check local server and Ollama.</p>
        </div></div>
      )}

      {!ctxData && !loading && (
        <div className="card"><div className="card-body text-center py-12">
          <span className="material-symbols-outlined text-text-muted mb-3 block" style={{ fontSize: '40px' }}>psychology</span>
          <p className="text-body-lg text-on-surface mb-1">Where were you?</p>
          <p className="text-body-sm text-text-secondary max-w-md mx-auto">Select a file to recover your working context.</p>
        </div></div>
      )}
    </div>
  );
}
