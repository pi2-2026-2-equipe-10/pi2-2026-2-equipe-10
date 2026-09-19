import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Aguarde...' : children}
    </button>
  );
};
