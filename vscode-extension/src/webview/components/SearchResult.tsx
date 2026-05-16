// Search result row for semantic activity search in the sidebar.
import React from 'react';

export function SearchResult({ title, subtitle, score }: { title: string; subtitle: string; score: number }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <strong>{title}</strong>
        <span className="muted">{Math.round(score * 100)}%</span>
      </div>
      <div className="muted" style={{ marginTop: '6px' }}>
        {subtitle}
      </div>
    </div>
  );
}
