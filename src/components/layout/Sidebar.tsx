import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  Award,
  GraduationCap,
  ListTodo,
  FileText,
  CheckSquare,
  RefreshCw,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { tasks, revisions } = useStudyVerse();

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTodayCount = tasks.filter((t) => t.date === todayStr && !t.isCompleted).length;
  const dueRevisionsCount = revisions.filter((r) => r.isDue || r.isOverdue).length;

  const navItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/plans', label: 'My Study Plans', icon: <BookOpen size={18} /> },
    {
      to: '/timetable',
      label: 'Smart Timetable',
      icon: <CalendarClock size={18} />,
      badge: pendingTodayCount > 0 ? pendingTodayCount : undefined,
    },
    { to: '/appsc', label: 'APPSC Preparation', icon: <Award size={18} /> },
    { to: '/semester', label: 'Semester Prep', icon: <GraduationCap size={18} /> },
    { to: '/syllabus', label: 'Syllabus Tracker', icon: <ListTodo size={18} /> },
    { to: '/resources', label: 'Notes & PDFs', icon: <FileText size={18} /> },
    { to: '/mock-tests', label: 'Mock Test Centre', icon: <CheckSquare size={18} /> },
    {
      to: '/revisions',
      label: 'Revision Centre',
      icon: <RefreshCw size={18} />,
      badge: dueRevisionsCount > 0 ? `${dueRevisionsCount} due` : undefined,
    },
    { to: '/calendar', label: 'Calendar & Deadlines', icon: <Calendar size={18} /> },
    { to: '/analytics', label: 'Analytics & Reports', icon: <BarChart3 size={18} /> },
    { to: '/settings', label: 'Settings & Data', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0d131f] border-r border-slate-800/80 min-h-[calc(100vh-57px)] p-4 select-none">
      {/* Navigation section */}
      <div className="flex-1 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-3 py-1 mb-1">
          Study Command
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/25 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="pt-4 border-t border-slate-800/70">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">Daily Goal</span>
            <span className="text-blue-400 font-bold">4.5 / 6.5 hrs</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: '69%' }} />
          </div>
          <p className="text-[10px] text-slate-300 mt-2">
            Deterministic Day Allocator active
          </p>
        </div>
      </div>
    </aside>
  );
};
