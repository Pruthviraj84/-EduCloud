import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-slate-900/80 border text-slate-100 placeholder-slate-500 rounded-lg py-2.5 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
