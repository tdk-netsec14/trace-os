import React from 'react';
import { useNavigate } from 'react-router-dom';

function getBasename(filePath) {
  return filePath ? filePath.split(/[/\\]/).pop() || filePath : '';
}

function buildSuggestions(activities = [], decisions = []) {
  const recentActivity = activities.find((item) => item?.filePath || item?.content) || null;
  const recentDecision = decisions[0] || null;

  const suggestions = [];

  if (recentActivity?.filePath) {
    suggestions.push({
      text: `Resume context for ${getBasename(recentActivity.filePath)}`,
      icon: 'psychology',
      route: '/context'
    });
  }

  if (recentDecision?.title) {
    suggestions.push({
      text: `Review decision: ${recentDecision.title}`,
      icon: 'history_edu',
      route: '/decisions'
    });
  }

  if (recentActivity?.content) {
    suggestions.push({
      text: `Search around: ${recentActivity.content.slice(0, 60)}`,
      icon: 'search',
      route: '/search'
    });
  }

  const fallbackSuggestions = [
    { text: 'Open Context Resume to recover your latest work', icon: 'draft', route: '/context' },
    { text: 'Search across recent activity and decisions', icon: 'search', route: '/search' },
    { text: 'Review your latest decisions', icon: 'history_edu', route: '/decisions' }
  ];

  while (suggestions.length < 3) {
    suggestions.push(fallbackSuggestions[suggestions.length]);
  }

  return suggestions.slice(0, 3);
}

export default function SmartSuggestions({ activities = [], decisions = [] }) {
  const navigate = useNavigate();
  const suggestions = buildSuggestions(activities, decisions);

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.route) {
      navigate(suggestion.route);
    }
  };

  return (
    <div className="card w-full">
      <div className="card-header flex items-center gap-2">
        <span className="material-symbols-outlined text-accent" style={{ fontSize: '18px' }}>lightbulb</span>
        <span className="text-headline-sm text-on-surface">Smart Suggestions</span>
      </div>
      <div className="card-body pt-2 space-y-2">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(s)}
            className="w-full text-left px-3 py-2 rounded-md bg-surface-mid hover:bg-surface-high border border-border/50 hover:border-primary/40 transition-colors group flex items-start gap-3"
          >
            <span className="material-symbols-outlined text-text-muted group-hover:text-accent mt-0.5" style={{ fontSize: '16px' }}>{s.icon}</span>
            <span className="text-body-sm text-on-surface group-hover:text-primary-light transition-colors">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}