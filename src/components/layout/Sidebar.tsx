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
  PenTool,
  AlertOctagon,
  Newspaper,
  History,
  Database,
  Boxes,
  KeyRound,
  Sliders,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { tasks, revisions, mockTests, testAttempts } = useStudyVerse();

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTodayCount = tasks.filter((t) => t.date === todayStr && !t.isCompleted).length;
  const dueRevisionsCount = revisions.filter((r) => r.isDue || r.isOverdue).length;

  const sections: NavSection[] = [
    {
      title: 'Study Hub',
      items: [
        { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
        { to: '/appsc', label: 'APPSC Master Hub', icon: <Award size={17} /> },
        { to: '/syllabus', label: 'Syllabus Tracker', icon: <ListTodo size={17} /> },
        { to: '/plans', label: 'Study Plans', icon: <BookOpen size={17} /> },
        {
          to: '/timetable',
          label: 'Smart Timetable',
          icon: <CalendarClock size={17} />,
          badge: pendingTodayCount > 0 ? pendingTodayCount : undefined,
        },
        { to: '/semester', label: 'Semester Prep', icon: <GraduationCap size={17} /> },
      ],
    },
    {
      title: 'Mock & Practice',
      items: [
        {
          to: '/mock-tests',
          label: 'Mock Test Centre',
          icon: <CheckSquare size={17} />,
          badge: mockTests.length > 0 ? `${mockTests.length} tests` : undefined,
        },
        { to: '/mock-tests/configure', label: 'Blueprint Studio', icon: <Sliders size={17} /> },
        { to: '/mains', label: 'Mains Practice Lab', icon: <PenTool size={17} /> },
        { to: '/current-affairs', label: 'Current Affairs Daily', icon: <Newspaper size={17} /> },
        {
          to: '/revisions',
          label: 'Revision Queue',
          icon: <RefreshCw size={17} />,
          badge: dueRevisionsCount > 0 ? `${dueRevisionsCount} due` : undefined,
        },
      ],
    },
    {
      title: 'Intelligence & Review',
      items: [
        { to: '/analytics', label: 'Analytics Studio', icon: <BarChart3 size={17} /> },
        { to: '/mistakes', label: 'Mistake Notebook', icon: <AlertOctagon size={17} /> },
        {
          to: '/history',
          label: 'Attempt History',
          icon: <History size={17} />,
          badge: testAttempts.length > 0 ? testAttempts.length : undefined,
        },
        { to: '/resources', label: 'Notes & PDF Reader', icon: <FileText size={17} /> },
      ],
    },
    {
      title: 'Admin & System',
      items: [
        { to: '/admin/question-bank', label: 'Question Bank Studio', icon: <Database size={17} /> },
        { to: '/admin/inventory', label: 'Mock Inventory', icon: <Boxes size={17} /> },
        { to: '/calendar', label: 'Calendar & Deadlines', icon: <Calendar size={17} /> },
        { to: '/settings', label: 'Settings & Sync', icon: <Settings size={17} /> },
        { to: '/login', label: 'Account / Switch Role', icon: <KeyRound size={17} /> },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0d131f] border-r border-slate-800/80 min-h-[calc(100vh-57px)] p-3 select-none">
      {/* Scrollable Navigation Sections */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              {section.title}
            </div>

            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
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
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="pt-3 mt-2 border-t border-slate-800/70">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium">Daily Goal</span>
            <span className="text-blue-400 font-bold">4.5 / 6.5 hrs</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
              style={{ width: '69%' }}
            />
          </div>
          <p className="text-[9px] text-slate-500 mt-1.5">
            APPSC Studyverse Exam Engine v2.4
          </p>
        </div>
      </div>
    </aside>
  );
};
