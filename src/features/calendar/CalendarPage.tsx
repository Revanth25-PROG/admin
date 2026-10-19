import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Award,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { CalendarEvent, ExamTrack } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const CalendarPage: React.FC = () => {
  const { calendarEvents, saveCalendarEvent, deleteCalendarEvent } = useStudyVerse();

  const [activeView, setActiveView] = useState<'month' | 'agenda'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Modal State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<CalendarEvent['type']>('study_deadline');
  const [eventTrack, setEventTrack] = useState<ExamTrack>('appsc-prelims');
  const [eventColor, setEventColor] = useState('#3b82f6');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days in current month grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Create event handler
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle.trim(),
      description: eventDesc.trim() || undefined,
      date: eventDate,
      type: eventType,
      track: eventTrack,
      color: eventColor,
    };

    saveCalendarEvent(newEvt);
    setIsAddEventOpen(false);
    setEventTitle('');
    setEventDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Calendar & Deadlines
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Unified timeline of all preliminary milestones, university semester mids, and mock exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView('month')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeView === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setActiveView('agenda')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeView === 'agenda' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agenda List
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setIsAddEventOpen(true)}
          >
            Add Milestone
          </Button>
        </div>
      </div>

      {activeView === 'month' ? (
        /* MONTH CALENDAR VIEW */
        <Card className="bg-[#101726]">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} icon={<ChevronLeft size={16} />} />
              <h2 className="text-base md:text-lg font-bold text-white min-w-[160px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <Button variant="outline" size="sm" onClick={handleNextMonth} icon={<ChevronRight size={16} />} />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date().getMonth());
                setCurrentYear(new Date().getFullYear());
              }}
            >
              Current Month
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank filler days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[85px] rounded-lg bg-slate-950/30 border border-slate-900" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const eventsOnDay = calendarEvents.filter((e) => e.date === dateStr);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[85px] p-1.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>
                      {dayNum}
                    </span>
                    {isToday && <span className="text-[10px] text-blue-400 font-bold">TODAY</span>}
                  </div>

                  <div className="space-y-1 overflow-hidden my-1">
                    {eventsOnDay.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        style={{ borderLeftColor: evt.color || '#3b82f6' }}
                        className="text-[10px] p-1 rounded bg-slate-950/90 border-l-2 text-slate-200 truncate font-medium"
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {eventsOnDay.length > 2 && (
                      <span className="text-[9px] text-slate-500 block text-right font-medium">
                        +{eventsOnDay.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* AGENDA LIST VIEW */
        <div className="space-y-3">
          {calendarEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon size={28} />}
              title="No Milestones Scheduled"
              description="Add examination dates and assignment deadlines to track upcoming milestones."
              actionLabel="Add Milestone"
              onAction={() => setIsAddEventOpen(true)}
            />
          ) : (
            [...calendarEvents]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: evt.color || '#3b82f6' }}
                    >
                      <CalendarIcon size={18} />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{evt.title}</h4>
                      {evt.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{evt.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>Date: <strong>{evt.date}</strong></span>
                        {evt.endDate && <span>to {evt.endDate}</span>}
                        <TrackBadge track={evt.track} />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={14} className="text-rose-400" />}
                    onClick={() => deleteCalendarEvent(evt.id)}
                    className="p-2"
                  />
                </div>
              ))
          )}
        </div>
      )}

      {/* Modal: Add Calendar Event */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Add Exam Milestone or Study Deadline"
        description="Schedule exam dates, assignment deadlines, or mock test days."
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Milestone Title *</label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. APPSC Prelims Hall Ticket Release or OS Mid 1 Exam"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Track</label>
              <select
                value={eventTrack}
                onChange={(e) => setEventTrack(e.target.value as ExamTrack)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="appsc-prelims">APPSC Prelims</option>
                <option value="appsc-mains">APPSC Mains</option>
                <option value="semester">B.Tech Semester</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Milestone Category</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="exam_prelims">APPSC Prelims Exam</option>
                <option value="exam_mains">APPSC Mains Exam</option>
                <option value="exam_sem_mid">Semester Mid Exam</option>
                <option value="exam_sem_final">Semester Final University Exam</option>
                <option value="mock_test">Mock Test Milestone</option>
                <option value="study_deadline">General Deadline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Accent Color</label>
              <select
                value={eventColor}
                onChange={(e) => setEventColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="#3b82f6">Blue (APPSC Prelims)</option>
                <option value="#8b5cf6">Violet (APPSC Mains)</option>
                <option value="#14b8a6">Teal (Semester Exams)</option>
                <option value="#f43f5e">Rose (Crucial Deadline)</option>
                <option value="#f59e0b">Amber (Mock Exam)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="Important instructions, syllabus scope..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
