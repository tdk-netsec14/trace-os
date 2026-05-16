// Activity list item for the sidebar webview.
import React from 'react';

export function ActivityItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0' }}>
      <span>{label}</span>
      <span className="muted">{value}</span>
    </div>
  );
}
