import React from 'react';
import { CheckIcon } from 'lucide-react';
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}
export function Checkbox({
  label,
  className = '',
  ...props
}: CheckboxProps) {
  return <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only peer" {...props} />
        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-african-green peer-checked:border-african-green transition-all flex items-center justify-center">
          <CheckIcon className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>;
}