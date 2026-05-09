import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all rounded-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-[#FF5F15] hover:bg-[#e04f0f] text-white shadow-[0_0_20px_rgba(255,95,21,0.3)] hover:shadow-[0_0_25px_rgba(255,95,21,0.5)]",
      secondary: "bg-[#2BD45A] hover:bg-[#24b54d] text-black shadow-[0_0_20px_rgba(43,212,90,0.3)]",
      outline: "bg-transparent border-2 border-zinc-700 hover:border-[#FF5F15] text-zinc-300 hover:text-white",
      ghost: "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base"
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
