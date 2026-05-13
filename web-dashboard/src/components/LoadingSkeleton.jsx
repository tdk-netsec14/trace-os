// Reusable loading skeleton component matching Stitch surface colors.
import React from 'react';

export function SkeletonLine({ width = '100%', height = '14px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card p-4 space-y-3 ${className}`}>
      <SkeletonLine width="40%" height="16px" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={`${70 + Math.random() * 30}%`} />
      ))}
    </div>
  );
}

export function SkeletonParagraph({ lines = 4, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
