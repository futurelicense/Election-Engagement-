import React from 'react';
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>}
      <textarea className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-african-blue focus:ring-2 focus:ring-african-blue/20 outline-none transition-all resize-none ${error ? 'border-african-red' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-african-red">{error}</p>}
    </div>;
}