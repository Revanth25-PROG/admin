import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Award,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Play,
  FileText,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExamTrack } from '../../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    tasks,
    topics,
    subjects,
    resources,
    mockTests,
    calendarEvents,
    revisions,
    semesterInfo,
    toggleTaskCompletion,
    isUsingSupabase,
  } = useStudyVerse();

  const [trackFilter, setTrackFilter] = useState<'all' | ExamTrack>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter tasks for the selected date
  const filteredTasks = tasks.filter((t) => {
    const matchesDate = t.date === selectedDate;
    const matchesTrack = trackFilter === 'all' || t.track === trackFilter;
    return matchesDate && matchesTrack;
  });

  const completedTasksToday = filteredTasks.filter((t) => t.isCompleted);
  const pendingTasksToday = filteredTasks.filter((t) => !t.isCompleted);

  // Calculate study hours today
  const minutesCompletedToday = tasks
    .filter((t) => t.date === selectedDate && t.isCompleted)
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const hoursCompletedToday = Number((minutesCompletedToday / 60).toFixed(1));

  // Calculate track progress
  const prelimsTopics = topics.filter((t) => t.track === 'appsc-prelims');
  const prelimsCompleted = prelimsTopics.filter((t) => t.status === 'completed').length;
  const prelimsProgress = prelimsTopics.length > 0 ? Math.round((prelimsCompleted / prelimsTopics.length) * 100) : 0;

  const mainsTopics = topics.filter((t) => t.track === 'appsc-mains');
  const mainsCompleted = mainsTopics.filter((t) => t.status === 'completed').length;
  const mainsProgress = mainsTopics.length > 0 ? Math.round((mainsCompleted / mainsTopics.length) * 100) : 0;

  const semesterTopics = topics.filter((t) => t.track === 'semester');
  const semCompleted = semesterTopics.filter((t) => t.status === 'completed').length;
  const semProgress = semesterTopics.length > 0 ? Math.round((semCompleted / semesterTopics.length) * 100) : 0;

  // Weak topics detection from revisions & low progress
  const weakTopics = topics.filter((t) => t.status === 'needs_revision' || (t.priority === 'high' && t.progressPercent < 50)).slice(0, 4);

  // Upcoming exams
  const upcomingDeadlines = calendarEvents
    .filter((e) => e.date >= selectedDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // First pending task for Continue Studying action
  const nextStudyTask = pendingTasksToday[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, {profile.name || 'Scholar'}
            </h1>
            <Badge variant="blue">Sprint Active</Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            Targeting <span className="text-blue-300 font-semibold">{profile.targetExam}</span> with {profile.dailyGoalHours}h daily goal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {nextStudyTask && (
            <Button
              variant="primary"
              size="md"
              icon={<Play size={16} />}
              onClick={() => navigate('/timetable')}
            >
              Continue Studying
            </Button>
          )}

          {mockTests.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              icon={<Award size={16} />}
              onClick={() => navigate('/mock-tests')}
            >
              Start Mock Test
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row: 4 key stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Study Hours */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Today's Study Time</span>
            <Clock size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {hoursCompletedToday} <span className="text-sm font-normal text-slate-400">/ {profile.dailyGoalHours} hrs</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={hoursCompletedToday}
                max={profile.dailyGoalHours}
                color="blue"
                size="sm"
                showPercent={false}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 flex items-center justify-between">
            <span>Weekly Total: 28.5 hrs</span>
            <span className="text-emerald-400 font-medium">On Track</span>
          </div>
        </Card>

        {/* APPSC Prelims Progress */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>APPSC Prelims Syllabus</span>
            <Award size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {prelimsProgress}%
            </div>
            <div className="mt-3">
              <ProgressBar
                value={prelimsProgress}
                color="blue"
                size="sm"
                showPercent={false}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-2">
            {prelimsCompleted} of {prelimsTopics.length} topics mastered
          </div>
        </Card>

        {/* APPSC Mains Progress */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>APPSC Mains Syllabus</span>
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {mainsProgress}%
            </div>
            <div className="mt-3">
              <ProgressBar
                value={mainsProgress}
                color="violet"
                size="sm"
                showPercent={false}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-2">
            {mainsCompleted} of {mainsTopics.length} topics covered
          </div>
        </Card>

        {/* Semester Progress */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="truncate max-w-[170px]">{semesterInfo.semesterName || 'Semester'} Progress</span>
            <GraduationCap size={16} className="text-teal-400 shrink-0" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {semProgress}%
            </div>
            <div className="mt-3">
              <ProgressBar
                value={semProgress}
                color="teal"
                size="sm"
                showPercent={false}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-300 mt-2">
            {semCompleted} of {semesterTopics.length} units completed
          </div>
        </Card>
      </div>

      {/* Main Grid: Today's Tasks & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Study Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <CardTitle>Today's Study Agenda</CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {completedTasksToday.length}/{filteredTasks.length} Done
                </span>
              </div>

              {/* Date & Track Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />

                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Tracks</option>
                  <option value="appsc-prelims">APPSC Prelims</option>
                  <option value="appsc-mains">APPSC Mains</option>
                  <option value="semester">Semester</option>
                </select>
              </div>
            </div>

            {/* Tasks List */}
            <div className="mt-4 space-y-2.5">
              {filteredTasks.length === 0 ? (
                <EmptyState
                  icon={<Calendar size={24} />}
                  title="No Tasks Scheduled for This Date"
                  description="Use the Smart Day Allocator in Timetable or add a Quick Task to populate your schedule."
                  actionLabel="Go to Timetable Allocator"
                  onAction={() => navigate('/timetable')}
                />
              ) : (
                filteredTasks.map((task) => {
                  const subject = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                        task.isCompleted
                          ? 'bg-slate-900/40 border-slate-800/40 opacity-70'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 size={20} className="text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-medium ${
                                task.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.isRevision && (
                              <Badge variant="amber">Spaced Rev</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                            <TrackBadge track={task.track} />
                            {subject && (
                              <span className="text-slate-400 truncate max-w-[150px]">
                                • {subject.name}
                              </span>
                            )}
                            <span>• {task.durationMinutes} mins</span>
                            {task.startTime && <span>• {task.startTime}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/timetable')}
                          className="text-[11px] px-2"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Quick Access to Recent Notes & PDFs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Recent Notes & Verified Resources</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                  onClick={() => navigate('/resources')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {resources.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  onClick={() => navigate('/resources')}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400">
                      <FileText size={18} />
                    </span>
                    <TrackBadge track={res.track} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {res.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mt-2">
                    <span>{res.type.toUpperCase()}</span>
                    <span>{res.language === 'te' ? 'Telugu' : 'English'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Weak Topics, Deadlines & Revisions */}
        <div className="space-y-4">
          {/* Upcoming Exams & Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Milestones</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight size={12} />}
                onClick={() => navigate('/calendar')}
              >
                Calendar
              </Button>
            </CardHeader>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No upcoming milestones</p>
              ) : (
                upcomingDeadlines.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{evt.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Calendar size={12} />
                        <span>{evt.date}</span>
                        <TrackBadge track={evt.track} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Attention Widget: Weak Subjects & Revision Queue */}
          <Card className="border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <CardTitle className="text-sm">Attention & Revisions</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/revisions')}
              >
                Revise All
              </Button>
            </CardHeader>

            <div className="space-y-2">
              {weakTopics.length === 0 ? (
                <p className="text-xs text-emerald-400 py-2">
                  All active topics are healthy and above 50% completion.
                </p>
              ) : (
                weakTopics.map((wt) => (
                  <div
                    key={wt.id}
                    onClick={() => navigate(`/topics/${wt.id}`)}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between text-xs group"
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                        {wt.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{wt.estimatedHours} hrs • {wt.difficulty}</div>
                    </div>
                    <Badge variant="amber">Needs Rev</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Available Mock Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Mock Test Readiness</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/mock-tests')}
              >
                All Tests
              </Button>
            </CardHeader>

            <div className="space-y-3">
              {mockTests.slice(0, 2).map((test) => (
                <div
                  key={test.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                      {test.title}
                    </h5>
                    <Badge variant="blue">{test.durationMinutes}m</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{test.questions.length} Questions</span>
                    <span>Negative: -{test.negativeMarks}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/mock-tests?testId=${test.id}`)}
                    className="w-full text-xs"
                  >
                    Take Test
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
