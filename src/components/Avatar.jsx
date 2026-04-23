import React from 'react';
import { User } from 'lucide-react';
import { cleanImageUrl } from '../utils/imageUrl';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const initials = getInitials(name);
  const safeSrc = cleanImageUrl(src, name);

  return (
    <div className={`relative flex-shrink-0 rounded-full ${size.includes('w-') ? size : (sizeClasses[size] || sizeClasses.md)} ${className}`}>
      <div className="w-full h-full rounded-full overflow-hidden bg-secondary border border-white/10 flex items-center justify-center">
        {(safeSrc && !imgError) ? (
          <img
            src={safeSrc}
            alt={name || 'User'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : name ? (
          <span className="font-bold text-white/70 tracking-tighter">
            {initials}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-white/20" />
        )}
      </div>
    </div>
  );
};

export default Avatar;
