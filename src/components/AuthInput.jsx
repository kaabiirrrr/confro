import React from 'react';

const AuthInput = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    name,
    error,
    required = false,
    icon: Icon,
    rightElement
}) => {
    return (
        <div className="w-full mb-4">
            {label && (
                <label className="block text-sm font-medium text-white/70 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`
            w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 
            focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all
            ${Icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error ? 'border-red-500/50' : ''}
          `}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 ml-1 text-xs text-red-400 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AuthInput;
