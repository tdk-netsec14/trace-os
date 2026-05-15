// Semantic Search page — Raycast/Spotlight inspired. Keyboard-first.
import React, { useEffect, useRef, useState } from 'react';
import { search } from '../services/api';
import SearchBar from '../components/SearchBar';
import { SkeletonLine } from '../components/LoadingSkeleton';

const FILTERS = ['All', 'Files', 'Decisions', 'Commits', 'Commands'];
const TYPE_ICONS = {
  file_open: 'draft', file_save: 'save', file_close: 'close',
  terminal_command: 'terminal', git_commit: 'commit', decision: 'history_edu',
};

function formatRelativeTime(ts) {
  if (!ts) return '';
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const filtered = results.filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'Files') return String(r.type || '').startsWith('file_');
    if (filter === 'Decisions') return r.type === 'decision';
    if (filter === 'Commits') return r.type === 'git_commit';
    if (filter === 'Commands') return r.type === 'terminal_command';
    return true;
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        setResults(await search(query, 20));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Search</h1>
        <p className="text-body-sm text-text-secondary mt-1">Semantic search across all your activity and decisions</p>
      </div>

      <SearchBar ref={inputRef} value={query} onChange={setQuery} placeholder="Search everything..." autoFocus />

      {/* Filters */}
      <div className="flex gap-2 mt-4 mb-4">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-body-sm font-medium transition-all duration-fast
              ${filter === f ? 'bg-primary text-white' : 'bg-surface-mid border border-border text-text-secondary hover:text-on-surface hover:border-border-active'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2 mt-4">
          {[1,2,3,4].map((i) => <div key={i} className="card p-4"><SkeletonLine width={`${60+Math.random()*40}%`} /></div>)}
        </div>
      )}

      {/* Results */}
      {!loading && query.trim() && filtered.length > 0 && (
        <div className="space-y-1 mt-2">
          {filtered.map((r, i) => (
            <div key={`${r.type}-${i}`} className="card hover:border-border-active transition-colors duration-fast">
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="material-symbols-outlined text-text-secondary mt-0.5" style={{ fontSize: '18px' }}>
                  {TYPE_ICONS[r.type] || 'circle'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="chip text-[10px]">{r.type?.replace(/_/g, ' ')}</span>
                    {r.score != null && (
                      <span className="text-code-sm font-mono text-text-muted">{Math.round(r.score * 100)}% match</span>
                    )}
                  </div>
                  <div className="text-body-md text-on-surface">{r.content}</div>
                </div>
                {r.createdAt && (
                  <span className="text-code-sm font-mono text-text-muted whitespace-nowrap">{formatRelativeTime(r.createdAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query.trim() && filtered.length === 0 && (
        <div className="card mt-4"><div className="card-body text-center py-8">
          <span className="material-symbols-outlined text-text-muted mb-2 block" style={{ fontSize: '32px' }}>search_off</span>
          <p className="text-body-md text-text-secondary">No results for "{query}"</p>
        </div></div>
      )}

      {/* Empty state */}
      {!query.trim() && !loading && (
        <div className="card mt-4"><div className="card-body text-center py-12">
          <span className="material-symbols-outlined text-text-muted mb-3 block" style={{ fontSize: '40px' }}>search</span>
          <p className="text-body-lg text-on-surface mb-1">Search your codebase memory</p>
          <p className="text-body-sm text-text-secondary">Files, decisions, commits, and commands — all searchable.</p>
          <div className="mt-4 text-code-sm font-mono text-text-muted">
            Tip: Press <kbd className="bg-surface-mid px-1.5 py-0.5 rounded border border-border mx-1">Ctrl K</kbd> anywhere to open command palette
          </div>
        </div></div>
      )}
    </div>
  );
}
