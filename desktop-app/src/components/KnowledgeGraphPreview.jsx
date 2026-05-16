import React from 'react';
import { Link } from 'react-router-dom';

export default function KnowledgeGraphPreview() {
  return (
    <div className="card w-full inner-glow relative overflow-hidden group">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #7C3AED 2px, transparent 2px)',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="card-header flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-light" style={{ fontSize: '18px' }}>hub</span>
          <span className="text-headline-sm text-on-surface">Knowledge Graph</span>
        </div>
      </div>

      <div className="card-body relative z-10 space-y-3">
        <p className="text-body-sm text-text-secondary">
          Explore semantic relationships between 145 files and 12 recent decisions in your workspace.
        </p>
        <Link to="/graph" className="btn-secondary w-full justify-center group-hover:border-primary/50 group-hover:bg-surface-high transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
          Open Graph Explorer
        </Link>
      </div>
    </div>
  );
}