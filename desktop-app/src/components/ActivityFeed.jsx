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

export default function ActivityFeed({ items = [], compact = false }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-body-sm text-text-muted">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const config = TYPE_CONFIG[item.type] || { icon: 'circle', color: 'text-text-muted' };
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-mid/50 transition-colors duration-fast group"
          >
            <span
              className={`material-symbols-outlined ${config.color} opacity-70 group-hover:opacity-100 transition-opacity`}
              style={{ fontSize: '16px' }}
            >
              {config.icon}
            </span>

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-code-sm font-mono text-text-secondary">
                {item.type.replace(/_/g, ' ')}
              </span>
              {item.filePath && (
                <>
                  <span className="text-text-muted text-code-sm">→</span>
                  <span className="text-code-sm font-mono text-on-surface truncate" title={item.filePath}>
                    {compact ? getBasename(item.filePath) : item.filePath}
                  </span>
                </>
              )}
              {!item.filePath && item.content && (
                <span className="text-body-sm text-text-secondary truncate">
                  {item.content.slice(0, 80)}
                </span>
              )}
            </div>

            <span className="text-code-sm font-mono text-text-muted whitespace-nowrap">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
