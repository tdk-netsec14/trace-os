import React from 'react';

export default function CommitTimeline() {
  const commits = [
    { hash: 'a1b2c3d', msg: 'Refactor session validation middleware', time: '2 hours ago', author: 'You' },
    { hash: '4f5e6d7', msg: 'Update JWT refresh token logic', time: 'Yesterday', author: 'You' },
    { hash: '8a9b0c1', msg: 'Fix auth controller edge case', time: 'Yesterday', author: 'You' }
  ];

  return (
    <div className="card w-full">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface" style={{ fontSize: '18px' }}>commit</span>
          <span className="text-headline-sm text-on-surface">Commit Timeline</span>
        </div>
      </div>
      <div className="card-body pt-2">
        <div className="relative pl-4 border-l border-border/50 space-y-4">
          {commits.map((c, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-surface-high border-2 border-primary"></div>
              <div className="flex flex-col">
                <span className="text-body-md text-on-surface font-medium">{c.msg}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-code-sm font-mono text-primary-light">{c.hash}</span>
                  <span className="text-body-xs text-text-muted">• {c.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}