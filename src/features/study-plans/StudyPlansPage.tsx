import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  Calendar,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Archive,
  Play,
  Pause,
  Download,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { StudyPlan, ExamTrack, SyllabusTopic, Priority, Difficulty, SchedulingMode } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, PriorityBadge, DifficultyBadge, StatusBadge, Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { generateSmartSchedule } from '../../services/schedulerEngine';

export const StudyPlansPage: React.FC = () => {
  const {
    plans,
    topics,
    subjects,
    tasks,
    availabilityRules,
    revisions,
    calendarEvents,
    profile,
    savePlan,
    deletePlan,
    duplicatePlan,
    saveTopic,
    deleteTopic,
    updateTopicStatus,
    addGeneratedTasks,
  } = useStudyVerse();

  const [activePlanId, setActivePlanId] = useState<string>(plans[0]?.id || '');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSchedule, setPreviewSchedule] = useState<any>(null);

  // Form states for Plan
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planTrack, setPlanTrack] = useState<ExamTrack>('appsc-prelims');
  const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [planTargetDate, setPlanTargetDate] = useState(
    new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  );
  const [planHours, setPlanHours] = useState(4.0);
  const [planMode, setPlanMode] = useState<SchedulingMode>('balanced');

  // Form states for Topic
  const [topicTitle, setTopicTitle] = useState('');
  const [topicTelugu, setTopicTelugu] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicSubjectId, setTopicSubjectId] = useState('');
  const [topicHours, setTopicHours] = useState(4.0);
  const [topicDiff, setTopicDiff] = useState<Difficulty>('moderate');
  const [topicPriority, setTopicPriority] = useState<Priority>('high');

  const selectedPlan = plans.find((p) => p.id === activePlanId) || plans[0];
  const planTopics = selectedPlan
    ? topics.filter((t) => selectedPlan.topicIds.includes(t.id))
    : [];

  const completedTopicsCount = planTopics.filter((t) => t.status === 'completed').length;
  const planProgress = planTopics.length > 0 ? Math.round((completedTopicsCount / planTopics.length) * 100) : 0;

  // Handlers for Plan CRUD
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    const newPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      title: planTitle.trim(),
      description: planDesc.trim(),
      track: planTrack,
      subjectIds: subjects.filter((s) => s.track === planTrack).map((s) => s.id),
      topicIds: [],
      startDate: planStartDate,
      targetCompletionDate: planTargetDate,
      dailyAvailableHours: planHours,
      schedulingMode: planMode,
      isPaused: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePlan(newPlan);
    setActivePlanId(newPlan.id);
    setIsCreatePlanOpen(false);
    setPlanTitle('');
    setPlanDesc('');
  };

  const handleOpenEdit = () => {
    if (!selectedPlan) return;
    setPlanTitle(selectedPlan.title);
    setPlanDesc(selectedPlan.description);
    setPlanTrack(selectedPlan.track);
    setPlanStartDate(selectedPlan.startDate);
    setPlanTargetDate(selectedPlan.targetCompletionDate);
    setPlanHours(selectedPlan.dailyAvailableHours);
    setPlanMode(selectedPlan.schedulingMode);
    setIsEditPlanOpen(true);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !planTitle.trim()) return;

    savePlan({
      ...selectedPlan,
      title: planTitle.trim(),
      description: planDesc.trim(),
      track: planTrack,
      startDate: planStartDate,
      targetCompletionDate: planTargetDate,
      dailyAvailableHours: planHours,
      schedulingMode: planMode,
      updatedAt: new Date().toISOString(),
    });

    setIsEditPlanOpen(false);
  };

  const handleTogglePause = () => {
    if (!selectedPlan) return;
    savePlan({
      ...selectedPlan,
      isPaused: !selectedPlan.isPaused,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicate = () => {
    if (!selectedPlan) return;
    const dup = duplicatePlan(selectedPlan.id);
    if (dup) setActivePlanId(dup.id);
  };

  const handleDeletePlan = () => {
    if (!selectedPlan) return;
    if (window.confirm(`Are you sure you want to delete "${selectedPlan.title}"?`)) {
      deletePlan(selectedPlan.id);
      const remaining = plans.filter((p) => p.id !== selectedPlan.id);
      if (remaining[0]) setActivePlanId(remaining[0].id);
    }
  };

  const handleExportPlan = () => {
    if (!selectedPlan) return;
    const planData = {
      plan: selectedPlan,
      topics: planTopics,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyverse-plan-${selectedPlan.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Topic CRUD
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !topicTitle.trim()) return;

    const newTopic: SyllabusTopic = {
      id: `top-${Date.now()}`,
      subjectId: topicSubjectId || subjects[0]?.id || 'sub-general',
      track: selectedPlan.track,
      title: topicTitle.trim(),
      titleTelugu: topicTelugu.trim() || undefined,
      description: topicDesc.trim() || undefined,
      estimatedHours: topicHours,
      difficulty: topicDiff,
      priority: topicPriority,
      status: 'not_started',
      progressPercent: 0,
      revisionIntervalDays: [1, 3, 7, 14, 30],
    };

    saveTopic(newTopic);

    // Link topic to current plan
    savePlan({
      ...selectedPlan,
      topicIds: [...selectedPlan.topicIds, newTopic.id],
      updatedAt: new Date().toISOString(),
    });

    setIsAddTopicOpen(false);
    setTopicTitle('');
    setTopicTelugu('');
    setTopicDesc('');
  };

  const handleRemoveTopicFromPlan = (topicId: string) => {
    if (!selectedPlan) return;
    savePlan({
      ...selectedPlan,
      topicIds: selectedPlan.topicIds.filter((id) => id !== topicId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Schedule Preview before applying
  const handlePreviewSchedule = () => {
    if (!selectedPlan) return;
    const result = generateSmartSchedule({
      plan: selectedPlan,
      plans,
      topics: planTopics,
      subjects,
      existingTasks: tasks,
      availabilityRules,
      revisions,
      calendarEvents,
      mode: selectedPlan.schedulingMode,
      splitRatio: profile.studySplitRatio,
      startDate: new Date().toISOString().split('T')[0],
      daysToGenerate: 14,
    });

    setPreviewSchedule(result);
    setIsPreviewOpen(true);
  };

  const handleApplyGeneratedSchedule = () => {
    if (!previewSchedule || !previewSchedule.tasks) return;
    addGeneratedTasks(previewSchedule.tasks);
    setIsPreviewOpen(false);
    alert(`Successfully applied ${previewSchedule.tasks.length} sessions to your timetable!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            My Study Plans
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Create, customize, and allocate target-oriented study plans with deterministic scheduling.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsCreatePlanOpen(true)}
        >
          Create Study Plan
        </Button>
      </div>

      {/* Plan Selector Pills */}
      {plans.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {plans.map((p) => {
            const isActive = selectedPlan?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlanId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-400/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <BookOpen size={14} />
                <span className="truncate max-w-[160px]">{p.title}</span>
                {p.isPaused && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">
                    Paused
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Plan Detail Card */}
      {selectedPlan ? (
        <div className="space-y-6">
          <Card className="bg-[#101726] border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg md:text-xl font-bold text-white">{selectedPlan.title}</h2>
                  <TrackBadge track={selectedPlan.track} />
                  <Badge variant={selectedPlan.schedulingMode === 'deadline_focused' ? 'amber' : 'blue'}>
                    {selectedPlan.schedulingMode.replace('_', ' ')}
                  </Badge>
                  {selectedPlan.isPaused && <Badge variant="amber">Paused</Badge>}
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">{selectedPlan.description}</p>
              </div>

              {/* Plan Actions Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={selectedPlan.isPaused ? <Play size={14} /> : <Pause size={14} />}
                  onClick={handleTogglePause}
                >
                  {selectedPlan.isPaused ? 'Resume Plan' : 'Pause Plan'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Sparkles size={14} />}
                  onClick={handlePreviewSchedule}
                >
                  Preview Schedule
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit2 size={14} />}
                  onClick={handleOpenEdit}
                >
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Copy size={14} />}
                  onClick={handleDuplicate}
                >
                  Duplicate
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download size={14} />}
                  onClick={handleExportPlan}
                >
                  Export
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={handleDeletePlan}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Plan Info Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block">Target Date</span>
                <span className="font-semibold text-slate-200">{selectedPlan.targetCompletionDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Daily Study Target</span>
                <span className="font-semibold text-blue-400">{selectedPlan.dailyAvailableHours} hrs/day</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Topics</span>
                <span className="font-semibold text-slate-200">{planTopics.length} topics</span>
              </div>
              <div>
                <span className="text-slate-400 block">Completion</span>
                <span className="font-semibold text-emerald-400">{planProgress}% ({completedTopicsCount}/{planTopics.length})</span>
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar value={planProgress} color="blue" size="sm" showPercent={false} />
            </div>
          </Card>

          {/* Topics in Plan Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Topics in this Plan</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {planTopics.length}
                </span>
              </h3>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => {
                  setTopicSubjectId(subjects.find((s) => s.track === selectedPlan.track)?.id || '');
                  setIsAddTopicOpen(true);
                }}
              >
                Add Topic to Plan
              </Button>
            </div>

            {planTopics.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={24} />}
                title="No Topics Attached to this Plan"
                description="Click 'Add Topic to Plan' to specify subjects, duration, difficulty, and priority."
                actionLabel="Add First Topic"
                onAction={() => setIsAddTopicOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {planTopics.map((topic) => {
                  const subject = subjects.find((s) => s.id === topic.subjectId);
                  return (
                    <div
                      key={topic.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100">{topic.title}</h4>
                            {topic.titleTelugu && (
                              <p className="text-xs text-blue-400 font-medium">{topic.titleTelugu}</p>
                            )}
                          </div>
                          <StatusBadge status={topic.status} />
                        </div>

                        {topic.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {topic.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {subject && <Badge variant="slate">{subject.name}</Badge>}
                            <DifficultyBadge difficulty={topic.difficulty} />
                            <PriorityBadge priority={topic.priority} />
                            <span className="text-slate-400">{topic.estimatedHours}h</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <select
                            value={topic.status}
                            onChange={(e) => updateTopicStatus(topic.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="needs_revision">Needs Revision</option>
                          </select>

                          <button
                            onClick={() => handleRemoveTopicFromPlan(topic.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors p-1"
                            title="Remove from plan"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No Study Plans Found"
          description="Create your first study plan for APPSC Group 2 or B.Tech semester exams to begin automated timetable scheduling."
          actionLabel="Create Plan"
          onAction={() => setIsCreatePlanOpen(true)}
        />
      )}

      {/* Modal: Create Study Plan */}
      <Modal
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        title="Create New Study Plan"
        description="Configure target exam, timeline, daily hours, and scheduling mode."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Plan Title *</label>
            <input
              type="text"
              required
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="e.g. APPSC Prelims Rapid Review or Sem 6 Final Prep"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={planDesc}
              onChange={(e) => setPlanDesc(e.target.value)}
              placeholder="Goals, target milestones, and key subject focus areas..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Exam Track</label>
              <select
                value={planTrack}
                onChange={(e) => setPlanTrack(e.target.value as ExamTrack)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="appsc-prelims">APPSC Group 2 Prelims</option>
                <option value="appsc-mains">APPSC Group 2 Mains</option>
                <option value="semester">B.Tech Semester Prep</option>
                <option value="general">General / Other Track</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Scheduling Engine Mode</label>
              <select
                value={planMode}
                onChange={(e) => setPlanMode(e.target.value as SchedulingMode)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="balanced">Balanced (Smooth load + rest)</option>
                <option value="deadline_focused">Deadline-Focused (Urgent first)</option>
                <option value="revision_focused">Revision-Focused (Spaced recall first)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={planStartDate}
                onChange={(e) => setPlanStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Completion</label>
              <input
                type="date"
                required
                value={planTargetDate}
                onChange={(e) => setPlanTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Daily Study Hours</label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={planHours}
                onChange={(e) => setPlanHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatePlanOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Study Plan */}
      <Modal
        isOpen={isEditPlanOpen}
        onClose={() => setIsEditPlanOpen(false)}
        title="Edit Study Plan"
        description="Modify target dates, daily availability, or scheduling parameters."
      >
        <form onSubmit={handleUpdatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Plan Title *</label>
            <input
              type="text"
              required
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={planDesc}
              onChange={(e) => setPlanDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Completion Date</label>
              <input
                type="date"
                required
                value={planTargetDate}
                onChange={(e) => setPlanTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Daily Available Hours</label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={planHours}
                onChange={(e) => setPlanHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditPlanOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Topic */}
      <Modal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        title="Add Topic to Plan"
        description="Add a curriculum topic, estimated duration, difficulty, and priority."
      >
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Topic Title (English) *</label>
            <input
              type="text"
              required
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="e.g. Fundamental Rights Article 14-32 or CPU Scheduling Algorithms"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Topic Title (Telugu - Optional)</label>
            <input
              type="text"
              value={topicTelugu}
              onChange={(e) => setTopicTelugu(e.target.value)}
              placeholder="e.g. ప్రాథమిక హక్కులు"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <select
                value={topicSubjectId}
                onChange={(e) => setTopicSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {subjects
                  .filter((s) => selectedPlan && s.track === selectedPlan.track)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                max="40"
                step="0.5"
                value={topicHours}
                onChange={(e) => setTopicHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
              <select
                value={topicDiff}
                onChange={(e) => setTopicDiff(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={topicPriority}
                onChange={(e) => setTopicPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Syllabus Details & References</label>
            <textarea
              rows={2}
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              placeholder="Key sub-topics, standard textbooks, or important cases/definitions..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTopicOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Preview before applying */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Schedule Generator Preview"
        description="Review the deterministic allocation of study sessions generated by the Smart Day Allocator."
        maxWidth="2xl"
      >
        {previewSchedule && (
          <div className="space-y-4">
            {/* Summary statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Total Sessions</span>
                <span className="text-base font-bold text-white">{previewSchedule.summary.totalTasksCreated}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Hours</span>
                <span className="text-base font-bold text-blue-400">
                  {(previewSchedule.summary.totalMinutesScheduled / 60).toFixed(1)} hrs
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Daily Average</span>
                <span className="text-base font-bold text-slate-200">
                  {previewSchedule.summary.averageDailyHours} hrs/day
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Revisions Included</span>
                <span className="text-base font-bold text-amber-400">
                  {(previewSchedule.summary.revisionMinutes / 60).toFixed(1)} hrs
                </span>
              </div>
            </div>

            {/* Conflicts Warning */}
            {previewSchedule.conflicts.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                  <AlertCircle size={14} />
                  <span>Workload & Deadline Conflicts Detected</span>
                </div>
                {previewSchedule.conflicts.map((c: any, idx: number) => (
                  <p key={idx} className="text-[11px] text-amber-300/90">• {c.reason}</p>
                ))}
              </div>
            )}

            {/* Proposed Tasks Preview List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {previewSchedule.tasks.map((task: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-slate-200">{task.title}</span>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{task.date}</span>
                      <span>• {task.durationMinutes}m</span>
                      {task.isRevision && <span className="text-amber-400 font-semibold">• Revision</span>}
                    </div>
                  </div>
                  <TrackBadge track={task.track} size="sm" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Reject & Edit Rules
              </Button>
              <Button variant="success" size="sm" onClick={handleApplyGeneratedSchedule}>
                Accept & Apply to Timetable
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
