import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  BookOpen,
  Award,
  GraduationCap,
  FileText,
  Settings,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const items = [
    { to: '/', label: 'Home', icon: <LayoutDashboard size={18} /> },
    { to: '/timetable', label: 'Schedule', icon: <CalendarClock size={18} /> },
    { to: '/plans', label: 'Plans', icon: <BookOpen size={18} /> },
    { to: '/appsc', label: 'APPSC', icon: <Award size={18} /> },
    { to: '/semester', label: 'Semester', icon: <GraduationCap size={18} /> },
    { to: '/resources', label: 'Notes', icon: <FileText size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d131f]/95 backdrop-blur-lg border-t border-slate-800 flex justify-around py-2 px-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <span>{item.icon}</span>
          <span className="mt-0.5">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
