import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  highlight?: boolean; // Used to highlight important fields (like high-viz yellow or green)
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, highlight, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-[10px] mb-1 font-semibold tracking-wider uppercase ${highlight ? 'text-[#FF5F15]' : 'text-zinc-500'}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#0a0a0a] border ${
            error ? 'border-red-500' : highlight ? 'border-[#FF5F15]/30 focus:border-[#FF5F15]' : 'border-zinc-700 focus:border-[#FF5F15]'
          } rounded-lg p-2.5 text-xs text-white outline-none transition-all focus:ring-2 focus:ring-[#FF5F15]/20 ${className}`}
          {...props}
        />
        {error && <span className="text-red-500 text-[10px] mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
