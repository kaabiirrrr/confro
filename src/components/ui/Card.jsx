import React from 'react';

const Card = ({ children, className = '', padding = 'p-5', ...props }) => {
  return (
    <div 
      className={`bg-transparent border border-white/10 rounded-2xl transition-all duration-200 ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
