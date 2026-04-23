import React from 'react';
import InfinityLoader from '../common/InfinityLoader';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  isLoading = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  disabled,
  type = 'button',
  ...props 
}) => {
  const showSpinner = isLoading || loading;
  const baseStyles = "flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-full";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-accent text-black dark:text-white hover:opacity-90 transition-transform active:scale-95 shadow-lg",
    secondary: "bg-transparent text-white border border-white/20 hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    success: "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20",
    ghost: "text-white/70 hover:text-white hover:bg-white/10"
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={showSpinner || disabled}
      {...props}
    >
      {showSpinner ? (
        <InfinityLoader size={20} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};

export default Button;
