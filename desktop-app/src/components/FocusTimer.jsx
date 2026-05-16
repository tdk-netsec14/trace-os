// Focus timer component for the desktop app.
import React from 'react';

export default function FocusTimer({ seconds = 0 }) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  return <div className="text-2xl font-mono">{`${hours}:${minutes}:${remainder}`}</div>;
}
