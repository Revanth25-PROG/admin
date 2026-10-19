import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  subLabel?: string;
  showPercent?: boolean;
  color?: 'blue' | 'violet' | 'teal' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  subLabel,
  showPercent = true,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorGradients = {
    blue: 'from-blue-600 to-indigo-500 shadow-blue-500/20',
    violet: 'from-violet-600 to-purple-500 shadow-violet-500/20',
    teal: 'from-teal-500 to-emerald-400 shadow-teal-500/20',
    emerald: 'from-emerald-600 to-teal-500 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-400 shadow-amber-500/20',
    rose: 'from-rose-600 to-pink-500 shadow-rose-500/20',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent || subLabel) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-300">
          <div className="flex items-center gap-2">
            {label && <span className="text-slate-200">{label}</span>}
            {subLabel && <span className="text-slate-500 text-[11px]">{subLabel}</span>}
          </div>
          {showPercent && (
            <span className="text-slate-300 font-semibold">{percent}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40 ${sizeClasses[size]}`}>
        <div
          className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ease-out shadow-sm ${colorGradients[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
