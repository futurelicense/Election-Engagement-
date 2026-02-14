import React from 'react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export function Select({
  label,
  options,
  className = '',
  ...props
}: SelectProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>}
      <select className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-african-blue focus:ring-2 focus:ring-african-blue/20 outline-none transition-all bg-white ${className}`} {...props}>
        {options.map(option => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
      </select>
    </div>;
}