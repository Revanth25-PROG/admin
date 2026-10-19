import React, { useState } from 'react';
import {
  CalendarClock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  AlertTriangle,
  MoveRight,
  Trash2,
  RotateCcw,
  Sliders,
  Calendar,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SchedulingMode } from '../../types';
import { generateSmartSchedule, rescheduleMissedTasks, addDays } from '../../services/schedulerEngine';

export const TimetablePage: React.FC = () => {
  const {
    tasks,
    topics,
    subjects,
    plans,
    availabilityRules,
    revisions,
    calendarEvents,
    profile,
    toggleTaskCompletion,
    deleteTask,
    moveTaskDate,
    addGeneratedTasks,
    saveTask,
  } = useStudyVerse();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>('balanced');
  const [daysHorizon, setDaysHorizon] = useState<number>(14);

  // Generator & Rollover Modal States
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorResult, setGeneratorResult] = useState<any>(null);
  const [moveTaskModal, setMoveTaskModal] = useState<{ isOpen: boolean; taskId: string; targetDate: string }>({
    isOpen: false,
    taskId: '',
    targetDate: addDays(todayStr, 1),
  });

  // Calculate missed/overdue tasks (tasks with date < today that are not completed)
  const overdueTasks = tasks.filter((t) => t.date < todayStr && !t.isCompleted);

  // Active date tasks
  const dailyTasks = tasks.filter((t) => t.date === selectedDate);
  const completedDaily = dailyTasks.filter((t) => t.isCompleted);
  const totalDailyMinutes = dailyTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  // Availability on this day
  const dateObj = new Date(selectedDate);
  const dayOfWeek = isNaN(dateObj.getDay()) ? 0 : dateObj.getDay();
  const rule = availabilityRules.find((r) => r.dayOfWeek === dayOfWeek) || {
    availableHours: 6.0,
    preferredSlots: ['morning', 'evening'],
    isRestDay: false,
  };
  const availableMinutes = Math.round(rule.availableHours * 60);
  const isOverCapacity = totalDailyMinutes > availableMinutes;

  // Day navigation
  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(todayStr);

  // Run Smart Day Allocator
  const handleRunGenerator = () => {
    const result = generateSmartSchedule({
      plans,
      topics,
      subjects,
      existingTasks: tasks,
      availabilityRules,
      revisions,
      calendarEvents,
      mode: schedulingMode,
      splitRatio: profile.studySplitRatio,
      startDate: selectedDate,
      daysToGenerate: daysHorizon,
    });
    setGeneratorResult(result);
    setIsGeneratorOpen(true);
  };

  const handleApplySchedule = () => {
    if (!generatorResult?.tasks) return;
    addGeneratedTasks(generatorResult.tasks);
    setIsGeneratorOpen(false);
    alert(`Added ${generatorResult.tasks.length} sessions to your schedule!`);
  };

  // Smart Rollover for Missed Tasks
  const handleSmartRollover = () => {
    if (overdueTasks.length === 0) return;
    const { rescheduledTasks } = rescheduleMissedTasks(
      overdueTasks,
      tasks.filter((t) => t.date >= todayStr),
      availabilityRules,
      todayStr
    );

    // Save moved tasks
    rescheduledTasks.forEach((t) => {
      saveTask(t);
    });

    alert(
      `Smart Rollover complete: ${rescheduledTasks.length} missed tasks redistributed evenly over upcoming days without overloading tomorrow.`
    );
  };

  const handleConfirmMoveTask = () => {
    if (!moveTaskModal.taskId || !moveTaskModal.targetDate) return;
    moveTaskDate(moveTaskModal.taskId, moveTaskModal.targetDate);
    setMoveTaskModal({ isOpen: false, taskId: '', targetDate: todayStr });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Scheduling Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Smart Timetable & Day Allocator
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Algorithmic schedule generator respecting your daily study windows, APPSC/Semester split, and revision curves.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {overdueTasks.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={handleSmartRollover}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            >
              Smart Rollover ({overdueTasks.length} Overdue)
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={handleRunGenerator}
          >
            Auto-Allocate Schedule
          </Button>
        </div>
      </div>

      {/* Overdue alert banner if any */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              You have <strong>{overdueTasks.length} incomplete tasks</strong> from previous days. Use "Smart Rollover" to safely redistribute them without cramming.
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSmartRollover} className="text-[11px] shrink-0">
            Reschedule Now
          </Button>
        </div>
      )}

      {/* Date Navigation & Availability Summary */}
      <Card className="bg-[#101726]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevDay} icon={<ChevronLeft size={16} />} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
            />
            <Button variant="outline" size="sm" onClick={handleNextDay} icon={<ChevronRight size={16} />} />
            <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs">
              Today
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Scheduled: </span>
              <strong className="text-white">{(totalDailyMinutes / 60).toFixed(1)} hrs</strong>
            </div>

            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Available: </span>
              <strong className="text-blue-400">{rule.availableHours} hrs</strong>
            </div>

            {rule.isRestDay ? (
              <Badge variant="amber">Rest Day</Badge>
            ) : isOverCapacity ? (
              <Badge variant="rose">Over Capacity (+{((totalDailyMinutes - availableMinutes) / 60).toFixed(1)}h)</Badge>
            ) : (
              <Badge variant="emerald">Within Budget</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Daily Schedule List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Sessions for {selectedDate}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {completedDaily.length}/{dailyTasks.length} Completed
            </span>
          </h2>
        </div>

        {dailyTasks.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={28} />}
            title="No Tasks for this Day"
            description="Use 'Auto-Allocate Schedule' or add a task to plan this day."
            actionLabel="Run Auto-Allocator"
            onAction={handleRunGenerator}
          />
        ) : (
          <div className="space-y-3">
            {dailyTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.isCompleted
                      ? 'bg-slate-900/40 border-slate-800/40 opacity-70'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 size={22} className="text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle size={22} />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            task.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isRevision && <Badge variant="amber">Revision Cycle {task.revisionCycle || 1}</Badge>}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                        <TrackBadge track={task.track} />
                        {subject && <span className="text-slate-400">• {subject.name}</span>}
                        <span>• {task.durationMinutes} minutes</span>
                        {task.startTime && <span>• Slot: {task.startTime}</span>}
                        {task.notes && (
                          <span className="text-slate-400 italic block sm:inline">
                            • "{task.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Move or Delete actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<MoveRight size={13} />}
                      onClick={() =>
                        setMoveTaskModal({
                          isOpen: true,
                          taskId: task.id,
                          targetDate: addDays(selectedDate, 1),
                        })
                      }
                      className="text-xs px-2.5 py-1"
                    >
                      Reschedule
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} className="text-rose-400" />}
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Smart Day Allocator Config & Preview */}
      <Modal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        title="Smart Day Allocator"
        description="Select scheduling algorithm mode and planning horizon to preview deterministic study allocations."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Scheduling Strategy Mode
              </label>
              <select
                value={schedulingMode}
                onChange={(e) => setSchedulingMode(e.target.value as SchedulingMode)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="balanced">1. Balanced (Equitable APPSC/Semester split)</option>
                <option value="deadline_focused">2. Deadline-Focused (Prioritize nearest exam milestones)</option>
                <option value="revision_focused">3. Revision-Focused (Prioritize due spaced repetitions)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Horizon Length (Days)
              </label>
              <select
                value={daysHorizon}
                onChange={(e) => setDaysHorizon(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value={7}>7 Days (1 Week Sprint)</option>
                <option value={14}>14 Days (2 Weeks Standard)</option>
                <option value={21}>21 Days (3 Weeks Extended)</option>
                <option value={30}>30 Days (1 Month Complete)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Configured Track Ratio:</span>
            <span className="font-semibold text-blue-400">
              {profile.studySplitRatio.appsc}% APPSC : {profile.studySplitRatio.semester}% Semester
            </span>
          </div>

          {generatorResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 block">Proposed Sessions</span>
                  <span className="text-lg font-bold text-white">{generatorResult.summary.totalTasksCreated}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Workload</span>
                  <span className="text-lg font-bold text-blue-400">
                    {(generatorResult.summary.totalMinutesScheduled / 60).toFixed(1)} hrs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Avg Daily Hours</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {generatorResult.summary.averageDailyHours} hrs
                  </span>
                </div>
              </div>

              {generatorResult.conflicts.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <div className="font-semibold text-amber-400 mb-1">Scheduling Conflicts Detected:</div>
                  {generatorResult.conflicts.map((c: any, i: number) => (
                    <div key={i} className="text-[11px] text-amber-300">• {c.reason}</div>
                  ))}
                </div>
              )}

              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {generatorResult.tasks.slice(0, 8).map((task: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex justify-between">
                    <span className="truncate pr-2 text-slate-200">{task.title}</span>
                    <span className="text-slate-400 shrink-0">{task.date} ({task.durationMinutes}m)</span>
                  </div>
                ))}
                {generatorResult.tasks.length > 8 && (
                  <p className="text-[11px] text-slate-500 text-center">
                    + {generatorResult.tasks.length - 8} more sessions planned
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsGeneratorOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleApplySchedule}>
              Apply Generated Timetable
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Move Single Task to Another Date */}
      <Modal
        isOpen={moveTaskModal.isOpen}
        onClose={() => setMoveTaskModal({ ...moveTaskModal, isOpen: false })}
        title="Reschedule Study Session"
        description="Select a new date to move this study task to."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select New Target Date *
            </label>
            <input
              type="date"
              value={moveTaskModal.targetDate}
              onChange={(e) => setMoveTaskModal({ ...moveTaskModal, targetDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMoveTaskModal({ ...moveTaskModal, isOpen: false })}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmMoveTask}>
              Confirm Move
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
