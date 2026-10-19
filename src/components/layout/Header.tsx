import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Database, Plus, Bell, Flame, Globe, CheckCircle2 } from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Button } from '../ui/Button';
import { backendConfig, BackendConnectionConfig } from '../../services/backendConfig';

interface HeaderProps {
  onOpenQuickTask?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickTask }) => {
  const { profile, isUsingSupabase, calendarEvents } = useStudyVerse();
  const navigate = useNavigate();
  const [bConfig, setBConfig] = useState<BackendConnectionConfig>(backendConfig.getConfig());

  useEffect(() => {
    return backendConfig.subscribe((c) => setBConfig(c));
  }, []);

  // Find nearest major exam
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExams = calendarEvents
    .filter((e) => e.date >= todayStr && e.type.startsWith('exam'))
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextExam = upcomingExams[0];
  const daysToNextExam = nextExam
    ? Math.max(0, Math.ceil((new Date(nextExam.date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Determine badge presentation
  const getBadgeConfig = () => {
    if (bConfig.backendType === 'custom_api') {
      if (bConfig.isConnected) {
        return {
          label: 'REST Backend Synced',
          subLabel: bConfig.backendUrl.replace(/^https?:\/\//, ''),
          style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20',
          dot: 'bg-emerald-400 animate-pulse',
          icon: <Globe size={12} className="text-emerald-400" />,
        };
      }
      return {
        label: bConfig.backendUrl ? 'REST Backend (Configured)' : 'REST Backend (No URL)',
        subLabel: bConfig.backendUrl ? bConfig.backendUrl.replace(/^https?:\/\//, '') : 'Set link in Settings',
        style: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20',
        dot: 'bg-amber-400',
        icon: <Globe size={12} className="text-amber-400" />,
      };
    }
    if (bConfig.backendType === 'supabase' || isUsingSupabase) {
      return {
        label: 'Supabase Cloud Synced',
        subLabel: 'PostgreSQL',
        style: 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20',
        dot: 'bg-teal-400 animate-pulse',
        icon: <Database size={12} className="text-teal-400" />,
      };
    }
    return {
      label: 'Local Storage Mode',
      subLabel: 'Offline-First',
      style: 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20',
      dot: 'bg-blue-400',
      icon: <Database size={12} className="text-blue-400" />,
    };
  };

  const badge = getBadgeConfig();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Left: Branding & Track badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              STUDYVERSE
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              Exam OS
            </span>
          </div>
        </div>

        {/* Milestone countdown pill */}
        {nextExam && daysToNextExam !== null && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">{daysToNextExam}d</span>
            <span className="text-slate-400 truncate max-w-[160px]">to {nextExam.title}</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Sync Mode & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Streak indicator */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Flame size={14} className="text-amber-500 fill-amber-500" />
          <span>7 Days</span>
        </div>

        {/* Dynamic Backend status badge */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          title={`Click to configure backend connection settings. Current: ${badge.label} (${badge.subLabel})`}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${badge.style}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.icon}
          <span>{badge.label}</span>
        </button>

        {/* Quick add task button */}
        {onOpenQuickTask && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={onOpenQuickTask}
            className="hidden sm:inline-flex"
          >
            Quick Task
          </Button>
        )}

        {/* User profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-blue-400/30">
            {profile.name
              ? profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'ST'}
          </div>
          <span className="hidden xl:inline-block text-xs font-medium text-slate-300">
            {profile.name}
          </span>
        </div>
      </div>
    </header>
  );
};
