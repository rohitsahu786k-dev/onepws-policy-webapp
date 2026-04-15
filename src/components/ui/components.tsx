import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gradient';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(234,45,45,0.3)]',
    secondary: 'bg-card text-white border border-border hover:bg-black',
    outline: 'bg-transparent border border-border text-white hover:bg-card',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    gradient: 'bg-gradient-to-r from-primary to-black text-white hover:from-primary-hover hover:to-neutral-900 shadow-[0_0_15px_rgba(234,45,45,0.3)]',
  };

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-card border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary transition-colors',
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)} {...props}>
      {children}
    </div>
  );
}
