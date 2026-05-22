import { forwardRef } from 'react';

const Button = forwardRef(({ children, className = '', variant = 'primary', size = 'md', ...props }, ref) => {
  const base = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;