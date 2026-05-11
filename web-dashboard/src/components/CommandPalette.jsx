// Command Palette — Ctrl+K activated overlay.
// Level 2 surface, centered, backdrop blur 12px. Keyboard navigable.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStandup } from '../services/api';

const COMMANDS = [
  { id: 'search', icon: 'search', label: 'Search', description: 'Semantic search across all activity', route: '/search' },
  { id: 'context', icon: 'psychology', label: 'Resume Context', description: 'Recover working context for a file', route: '/context' },
  { id: 'focus-start', icon: 'timer', label: 'Start Focus Session', description: 'Begin a deep work session', route: '/focus' },
  { id: 'standup', icon: 'summarize', label: 'Generate Standup', description: 'AI summary of recent work', action: 'standup' },
  { id: 'decision', icon: 'history_edu', label: 'Log Decision', description: 'Record an architectural decision', route: '/decisions' },
  { id: 'graph', icon: 'hub', label: 'Knowledge Graph', description: 'Visualize file relationships', route: '/graph' },
  { id: 'settings', icon: 'settings', label: 'Settings', description: 'Server status and configuration', route: '/settings' },
];

export default function CommandPalette({ isOpen, onClose, onStandup }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const executeCommand = (cmd) => {
    onClose();
    if (cmd.route) {
      navigate(cmd.route);
    } else if (cmd.action === 'standup' && onStandup) {
      onStandup();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      executeCommand(filtered[activeIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-50" onClick={onClose}>
        <div
          className="modal-surface w-full max-w-lg mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '20px' }}>search</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-body-md text-on-surface placeholder:text-text-muted outline-none"
              placeholder="Type a command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="text-code-sm font-mono text-text-muted bg-surface-mid px-1.5 py-0.5 rounded border border-border text-[10px]">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-body-sm text-text-muted">
                No commands found
              </div>
            ) : (
              filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-fast
                    ${i === activeIndex ? 'bg-surface-mid text-on-surface' : 'text-text-secondary hover:bg-surface-mid/50'}`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{cmd.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-md font-medium">{cmd.label}</div>
                    <div className="text-code-sm font-mono text-text-muted truncate">{cmd.description}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-code-sm font-mono text-text-muted">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
