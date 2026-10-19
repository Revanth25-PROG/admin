import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { ExamTrack } from '../../types';

export const AppLayout: React.FC = () => {
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const { subjects, saveTask } = useStudyVerse();

  const [title, setTitle] = useState('');
  const [track, setTrack] = useState<ExamTrack>('appsc-prelims');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRevision, setIsRevision] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredSubjects = subjects.filter((s) => s.track === track);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    saveTask({
      id: `task-manual-${Date.now()}`,
      topicId: 'custom-topic',
      subjectId: subjectId || (filteredSubjects[0]?.id ?? 'sub-general'),
      track,
      title: title.trim(),
      date,
      durationMinutes: duration,
      isRevision,
      isCompleted: false,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setIsQuickTaskOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
      <Header onOpenQuickTask={() => setIsQuickTaskOpen(true)} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-12 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <BottomNav />

      {/* Quick Task Creation Modal */}
      <Modal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        title="Add Quick Study Task"
        description="Schedule an ad-hoc study task or revision session directly to your timetable."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read Modern History Ch 4 or Solve OS Deadlock numericals"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preparation Track
              </label>
              <select
                value={track}
                onChange={(e) => {
                  const newTrack = e.target.value as ExamTrack;
                  setTrack(newTrack);
                  const matching = subjects.filter((s) => s.track === newTrack);
                  if (matching[0]) setSubjectId(matching[0].id);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="appsc-prelims">APPSC Prelims</option>
                <option value="appsc-mains">APPSC Mains</option>
                <option value="semester">B.Tech Semester</option>
                <option value="general">General / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value="">General Subject</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="360"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRevisionCheckbox"
              checked={isRevision}
              onChange={(e) => setIsRevision(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isRevisionCheckbox" className="text-xs text-slate-300 cursor-pointer">
              Mark as Spaced Revision Session
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes or Key Objectives (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on previous year questions and formula derivations"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsQuickTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save to Timetable
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
