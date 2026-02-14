import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>}
      <input className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-african-blue focus:ring-2 focus:ring-african-blue/20 outline-none transition-all ${error ? 'border-african-red' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-african-red">{error}</p>}
    </div>;
}