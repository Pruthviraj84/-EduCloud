import React from 'react';

export const SkeletonLoader = ({ count = 3, className = 'h-24 w-full' }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800/60 rounded-xl border border-slate-800 ${className}`}
        />
      ))}
    </div>
  );
};
