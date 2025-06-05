import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'danger' | 'default';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const colorClasses = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ color = 'default', fullWidth = false, children, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`font-semibold rounded px-4 py-2 shadow transition ${colorClasses[color]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

export default Button;
