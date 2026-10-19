import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'interactive';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#111827]/80 border border-slate-800/80 shadow-lg shadow-black/20',
    glass: 'bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 shadow-xl shadow-black/30',
    subtle: 'bg-[#0f172a]/40 border border-slate-800/40',
    interactive:
      'bg-[#131d2e] border border-slate-800/90 shadow-md hover:border-blue-500/50 hover:shadow-blue-500/10 cursor-pointer',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-slate-700'
    : '';

  return (
    <div
      className={`rounded-xl p-5 text-slate-100 ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`font-semibold text-slate-100 text-base md:text-lg tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs md:text-sm text-slate-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);
