// Settings page — server status, privacy, data management.
import React, { useEffect, useState } from 'react';
import { getHealth, clearAllData } from '../services/api';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    (async () => {
      try { setHealth(await getHealth()); }
      catch { setHealth(null); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all local data? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearAllData();
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to clear data');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="page-enter max-w-2xl">
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface">Settings</h1>
        <p className="text-body-sm text-text-secondary mt-1">System configuration and status</p>
      </div>

      {/* Server Status */}
      <div className="card mb-4">
        <div className="card-header flex items-center gap-2">
          <span className="material-symbols-outlined text-accent" style={{ fontSize: '18px' }}>dns</span>
          <span className="text-headline-sm text-on-surface">Server Status</span>
        </div>
        <div className="card-body space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-body-md text-text-secondary">Local Server</span>
            <div className="flex items-center gap-2">
              <span className={`status-dot ${health ? 'online' : 'offline'}`} />
              <span className="text-body-md text-on-surface">{health ? 'Running' : 'Offline'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-body-md text-text-secondary">Ollama</span>
            <div className="flex items-center gap-2">
              <span className={`status-dot ${health?.ollama ? 'online' : 'offline'}`} />
              <span className="text-body-md text-on-surface">{health?.ollama ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-body-md text-text-secondary">Model</span>
            <span className="text-code-md font-mono text-on-surface">{health?.model || 'llama3.2:3b'}</span>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="card mb-4">
        <div className="card-header flex items-center gap-2">
          <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>shield</span>
          <span className="text-headline-sm text-on-surface">Privacy</span>
        </div>
        <div className="card-body">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-success mt-0.5" style={{ fontSize: '16px' }}>check_circle</span>
            <div>
              <div className="text-body-md text-on-surface font-medium">100% Local</div>
              <div className="text-body-sm text-text-secondary mt-1">
                All data stays on your machine. No cloud sync, no telemetry, no external API calls.
                The dashboard connects only to localhost:3001.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>warning</span>
          <span className="text-headline-sm text-on-surface">Data Management</span>
        </div>
        <div className="card-body">
          <p className="text-body-sm text-text-secondary mb-4">
            Clear all locally stored activities, decisions, focus sessions, and cached contexts.
          </p>
          <button onClick={handleClear} className="btn-secondary text-error border-error/30 hover:bg-error/10" disabled={clearing}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete_forever</span>
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
