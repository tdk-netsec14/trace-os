// Sidebar navigation component matching Stitch "Obsidian Command" design.
// Fixed 240px sidebar with icon-led navigation and vertical pill active indicator.
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_SECTIONS = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/', icon: 'view_quilt', label: 'Dashboard' },
      { to: '/context', icon: 'psychology', label: 'Context Resume' },
      { to: '/focus', icon: 'timer', label: 'Focus Session' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/search', icon: 'search', label: 'Search', shortcut: '⌘K' },
      { to: '/graph', icon: 'hub', label: 'Knowledge Graph' },
      { to: '/decisions', icon: 'history_edu', label: 'Decision Log' },
    ],
  },
];

export default function Sidebar({ onCommandPalette }) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-sidebar flex flex-col bg-surface border-r border-border z-40">
      {/* App Title */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>bolt</span>
          </div>
          <div>
            <div className="text-headline-sm text-on-surface leading-none">Trace OS</div>
            <div className="text-code-sm font-mono text-text-muted mt-0.5">v1.0.0 · local</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="text-label-caps text-text-muted px-3 mb-1.5">{section.label}</div>
            {section.items.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`nav-pill ${isActive ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-code-sm font-mono text-text-muted opacity-60">{item.shortcut}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-border space-y-1">
        <NavLink
          to="/settings"
          className={`nav-pill ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
          <span>Settings</span>
        </NavLink>
        <button
          onClick={onCommandPalette}
          className="nav-pill w-full text-left"
          title="Command Palette (Ctrl+K)"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>terminal</span>
          <span className="flex-1">Command</span>
          <kbd className="text-code-sm font-mono text-text-muted bg-surface-mid px-1.5 py-0.5 rounded border border-border text-[10px]">Ctrl K</kbd>
        </button>
      </div>
    </aside>
  );
}
