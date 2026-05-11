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
    <aside className="fixed left-0 top-0 bottom-0 w-sidebar flex flex-col bg-surface border-r border-border/80 z-40 shadow-elevated">
      {/* App Title */}
      <div className="px-5 py-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>bolt</span>
          </div>
          <div>
            <div className="text-headline-sm font-semibold tracking-tight text-on-surface leading-none">Trace OS</div>
            <div className="text-[10px] font-mono text-text-muted/65 mt-1">v1.0.0 · local</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="text-[10px] font-bold tracking-[0.1em] text-text-muted/60 px-3 pb-1 uppercase">{section.label}</div>
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
                  <span className="material-symbols-outlined text-text-muted group-hover:text-on-surface transition-colors" style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-text-muted/70 bg-surface-lowest px-1.5 py-0.5 rounded border border-border/40 ml-auto opacity-70">{item.shortcut}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border/60 space-y-1 bg-surface-low/50">
        <NavLink
          to="/settings"
          className={`nav-pill ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: '18px' }}>settings</span>
          <span>Settings</span>
        </NavLink>
        <button
          onClick={onCommandPalette}
          className="nav-pill w-full text-left group"
          title="Command Palette (Ctrl+K)"
        >
          <span className="material-symbols-outlined text-text-muted group-hover:text-on-surface transition-colors" style={{ fontSize: '18px' }}>terminal</span>
          <span className="flex-1">Command</span>
          <kbd className="text-[10px] font-mono text-text-muted/70 bg-surface-lowest px-1.5 py-0.5 rounded border border-border/45 group-hover:border-border-active transition-colors">Ctrl K</kbd>
        </button>
      </div>
    </aside>
  );
}
