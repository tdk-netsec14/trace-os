import React from 'react';

export default function FileInsights() {
  return (
    <div className="card w-full">
      <div className="card-header flex items-center gap-2">
        <span className="material-symbols-outlined text-info" style={{ fontSize: '18px' }}>analytics</span>
        <span className="text-headline-sm text-on-surface">File Relationship Insights</span>
      </div>
      <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 rounded bg-surface-mid border border-border/50">
          <div className="text-label-caps text-text-muted mb-2">HOTTEST FILES</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-body-sm">
              <span className="font-mono text-primary-light">auth.controller.ts</span>
              <span className="text-text-muted">14 edits</span>
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="font-mono text-primary-light">jwt.js</span>
              <span className="text-text-muted">9 edits</span>
            </div>
          </div>
        </div>
        <div className="p-3 rounded bg-surface-mid border border-border/50">
          <div className="text-label-caps text-text-muted mb-2">RECENTLY DELETED</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-body-sm">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '14px' }}>delete</span>
              <span className="font-mono text-text-secondary line-through">old-auth-middleware.ts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
