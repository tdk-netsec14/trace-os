// Decision card used in the desktop decisions page.
import React from 'react';

export default function DecisionCard({ decision, onDelete }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <strong>{decision.title}</strong>
        <button className="rounded-lg border border-border px-3 py-1 text-sm" onClick={() => onDelete(decision.id)}>
          Delete
        </button>
      </div>
      <p className="mt-2 text-sm text-textSecondary">{decision.description}</p>
    </div>
  );
}
