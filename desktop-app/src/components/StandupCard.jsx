// Standup summary card for the desktop dashboard.
import React from 'react';

export default function StandupCard({ text = '' }) {
  return <div className="rounded-xl border border-border bg-surface p-4 whitespace-pre-wrap">{text}</div>;
}
