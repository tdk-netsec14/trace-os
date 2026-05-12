// Standup modal — displays AI-generated standup with copy-to-clipboard.
import React, { useState } from 'react';

export default function StandupModal({ isOpen, onClose, standupData, isLoading }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (standupData?.standup) {
      await navigator.clipboard.writeText(standupData.standup);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="modal-surface w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>summarize</span>
              <h2 className="text-headline-sm text-on-surface">Daily Standup</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="btn-secondary text-body-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={onClose} className="btn-ghost">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ) : standupData?.standup ? (
              <pre className="text-code-md font-mono text-on-surface whitespace-pre-wrap leading-relaxed">
                {standupData.standup}
              </pre>
            ) : (
              <div className="text-body-md text-text-secondary text-center py-8">
                Failed to generate standup. Make sure the local server and Ollama are running.
              </div>
            )}
          </div>

          {/* Footer */}
          {standupData && (
            <div className="px-5 py-3 border-t border-border flex items-center gap-4 text-code-sm font-mono text-text-muted">
              <span>{standupData.activityCount || 0} activities analyzed</span>
              <span>·</span>
              <span>Last {Math.round(((standupData.periodEnd - standupData.periodStart) / 3600000) || 24)}h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
