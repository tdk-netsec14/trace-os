// Activity feed component with type icons, file paths, and relative timestamps.
import React from 'react';

const TYPE_CONFIG = {
  file_open: { icon: 'draft', color: 'text-accent' },
  file_save: { icon: 'save', color: 'text-success' },
  file_close: { icon: 'close', color: 'text-text-muted' },
  terminal_command: { icon: 'terminal', color: 'text-tertiary' },
  git_commit: { icon: 'commit', color: 'text-primary-light' },
  focus_start: { icon: 'timer', color: 'text-accent-light' },
  focus_end: { icon: 'timer_off', color: 'text-text-secondary' },
  decision_logged: { icon: 'history_edu', color: 'text-warning' },
};

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getBasename(filePath) {
  if (!filePath) return '';
  return filePath.split(/[/\\]/).pop() || filePath;
}

function renderPath(filePath, compact) {
  if (!filePath) return null;
  const parts = filePath.split(/[/\\]/);
  const file = parts.pop();
  const dir = parts.slice(-2).join('/'); // Show last two directories for clean context
  if (compact) {
    return <span className="text-code-sm font-mono text-on-surface font-medium">{file}</span>;
  }
  return (
    <span className="text-code-sm font-mono text-text-muted/70 truncate" title={filePath}>
      {dir ? `${dir}/` : ''}
      <span className="text-on-surface font-semibold">{file}</span>
    </span>
  );
}

export default function ActivityFeed({ items = [], compact = false }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-body-sm text-text-muted">
        No recent activity
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {items.map((item) => {
        const config = TYPE_CONFIG[item.type] || { icon: 'circle', color: 'text-text-muted' };
        return (
          <div
            key={item.id}
            className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-surface-mid/40 transition-colors duration-fast group"
          >
            <div className={`w-6 h-6 rounded-md bg-surface-mid group-hover:bg-surface-high flex items-center justify-center transition-colors border border-border/30`}>
              <span
                className={`material-symbols-outlined ${config.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                style={{ fontSize: '13px' }}
              >
                {config.icon}
              </span>
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-surface-low border border-border/40 text-text-secondary tracking-wider">
                {item.type.replace(/_/g, ' ')}
              </span>
              {item.filePath && (
                <>
                  <span className="text-text-muted/50 text-[10px]">→</span>
                  {renderPath(item.filePath, compact)}
                </>
              )}
              {!item.filePath && item.content && (
                <span className="text-body-sm text-text-secondary/90 truncate font-mono bg-surface-low/30 px-1.5 py-0.5 rounded border border-border/30">
                  {item.content.slice(0, 80)}
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono text-text-muted whitespace-nowrap bg-surface-low/40 px-1.5 py-0.5 rounded border border-border/20">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
