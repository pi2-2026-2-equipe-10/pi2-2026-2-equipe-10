import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="input-group">
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" />}
        <input
          id={inputId}
          className="input-field"
          style={{ paddingLeft: Icon ? '2.75rem' : '1rem' }}
          {...props}
        />
      </div>
    </div>
  );
};
