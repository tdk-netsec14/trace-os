// Context summary card for the sidebar webview.
import React from 'react';

export function ContextCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="title">{title}</div>
      {children}
    </div>
  );
}
