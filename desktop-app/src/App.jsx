// App shell with sidebar layout, command palette, and standup modal.
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import StandupModal from './components/StandupModal';
import DashboardPage from './pages/DashboardPage';
import ContextPage from './pages/ContextPage';
import FocusPage from './pages/FocusPage';
import SearchPage from './pages/SearchPage';
import GraphPage from './pages/GraphPage';
import DecisionsPage from './pages/DecisionsPage';
import SettingsPage from './pages/SettingsPage';
import { generateStandup } from './services/api';

export default function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [standupOpen, setStandupOpen] = useState(false);
  const [standupData, setStandupData] = useState(null);
  const [standupLoading, setStandupLoading] = useState(false);

  // Global keyboard shortcut: Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerateStandup = useCallback(async () => {
    setStandupOpen(true);
    setStandupLoading(true);
    setStandupData(null);
    try {
      const data = await generateStandup(24);
      setStandupData(data);
    } catch (err) {
      console.error('Standup generation failed:', err);
      setStandupData(null);
    } finally {
      setStandupLoading(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base text-on-surface font-inter">
        <Sidebar onCommandPalette={() => setCommandPaletteOpen(true)} />

        {/* Main content area — offset by sidebar width */}
        <main className="ml-sidebar min-h-screen">
          <div className="p-6 max-w-container mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage onGenerateStandup={handleGenerateStandup} />} />
              <Route path="/context" element={<ContextPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/decisions" element={<DecisionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>

        {/* Overlays */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onStandup={handleGenerateStandup}
        />
        <StandupModal
          isOpen={standupOpen}
          onClose={() => setStandupOpen(false)}
          standupData={standupData}
          isLoading={standupLoading}
        />
      </div>
    </BrowserRouter>
  );
}
