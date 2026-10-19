import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ListTodo,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Layers,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrackBadge, PriorityBadge, DifficultyBadge, StatusBadge, Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ExamTrack, TopicStatus } from '../../types';

export const SyllabusPage: React.FC = () => {
  const navigate = useNavigate();
  const { topics, subjects, updateTopicStatus, addTaskFromTopic } = useStudyVerse();

  // Active view mode: 'sem_style' | 'prelims_groups' | 'all_matrix'
  const [viewMode, setViewMode] = useState<'sem_style' | 'prelims_groups' | 'all_matrix'>('sem_style');
  const [semTrackFilter, setSemTrackFilter] = useState<'all_appsc' | 'appsc-prelims' | 'appsc-mains' | 'semester'>('all_appsc');
  const [selectedSemSubId, setSelectedSemSubId] = useState<string>('sub-pre-group-1');

  // Active Prelims subject group selected
  const [selectedPrelimsGroup, setSelectedPrelimsGroup] = useState<string>('sub-pre-group-1');

  // Expanded groups in accordion
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'sub-pre-group-1': true,
    'sub-pre-group-2': false,
    'sub-pre-group-3': false,
    'sub-pre-group-4': false,
    'sub-pre-group-5': false,
  });

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'all' | ExamTrack>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TopicStatus>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // 5 Prelims Groups
  const prelimsGroups = subjects.filter((s) => s.track === 'appsc-prelims');

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.titleTelugu && t.titleTelugu.includes(searchQuery)) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrack = trackFilter === 'all' || t.track === trackFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || t.subjectId === subjectFilter;

    return matchesSearch && matchesTrack && matchesStatus && matchesSubject;
  });

  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'completed').length;
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Prelims statistics
  const prelimsTopics = topics.filter((t) => t.track === 'appsc-prelims');
  const prelimsCompletedCount = prelimsTopics.filter((t) => t.status === 'completed').length;
  const prelimsProgress =
    prelimsTopics.length > 0
      ? Math.round((prelimsCompletedCount / prelimsTopics.length) * 100)
      : 0;

  // Subjects and topics for Semester-style view
  const appscAndSemSubjects = subjects.filter((s) => {
    if (semTrackFilter === 'all_appsc') return s.track === 'appsc-prelims' || s.track === 'appsc-mains';
    return s.track === semTrackFilter;
  });

  const activeSemSub =
    appscAndSemSubjects.find((s) => s.id === selectedSemSubId) ||
    appscAndSemSubjects[0] ||
    subjects[0];

  const activeSemTopics = topics.filter((t) => t.subjectId === activeSemSub?.id);
  const completedSemTopics = activeSemTopics.filter((t) => t.status === 'completed').length;
  const semSubProgress =
    activeSemTopics.length > 0
      ? Math.round((completedSemTopics / activeSemTopics.length) * 100)
      : 0;

  const handleQuickAddToday = (topicId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addTaskFromTopic(topicId);
    showToast(`Added "${title.substring(0, 30)}..." to Today's Plan!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-blue-400 text-sm animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Universal Syllabus & Topic Architecture
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Structured hierarchy: APPSC Group 2 → Prelims → Subject Group → Topic → Subtopics → Digital Reference Workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Prelims (150 Topics)</span>
            <span className="text-lg font-bold text-emerald-400">{prelimsProgress}%</span>
          </div>
          <div className="w-24">
            <ProgressBar value={prelimsProgress} color="emerald" size="sm" showPercent={false} />
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setViewMode('sem_style')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'sem_style'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap size={14} />
            <span>Semester-Style Subject & Units (Prelims + Mains)</span>
          </button>
          <button
            onClick={() => setViewMode('prelims_groups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'prelims_groups'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>5 Prelims Subject Groups (150 Topics)</span>
          </button>
          <button
            onClick={() => setViewMode('all_matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'all_matrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search size={14} />
            <span>All Tracks Matrix ({topics.length} Topics)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden lg:block pr-2">
          Click any topic to open its 6-Tab Digital Workspace
        </span>
      </div>

      {/* ==================================================== */}
      {/* VIEW MODE 1: SEMESTER-STYLE SUBJECT & UNITS VIEW     */}
      {/* ==================================================== */}
      {viewMode === 'sem_style' && (
        <div className="space-y-6">
          {/* Track Filter Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1">Filter Track:</span>
              <button
                onClick={() => setSemTrackFilter('all_appsc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  semTrackFilter === 'all_appsc'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Combined APPSC (Prelims + Mains)
              </button>
              <button
                onClick={() => setSemTrackFilter('appsc-prelims')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  semTrackFilter === 'appsc-prelims'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                APPSC Prelims (5 Groups)
              </button>
              <button
                onClick={() => setSemTrackFilter('appsc-mains')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  semTrackFilter === 'appsc-mains'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                APPSC Mains (Papers 1 & 2)
              </button>
              <button
                onClick={() => setSemTrackFilter('semester')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  semTrackFilter === 'semester'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Semester Prep (M.Tech)
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {appscAndSemSubjects.length} Subjects Active
            </span>
          </div>

          {/* Subjects Navigation Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
            {appscAndSemSubjects.map((sub) => {
              const isSelected = activeSemSub?.id === sub.id;
              const subTopicsCount = topics.filter((t) => t.subjectId === sub.id).length;
              const isPrelims = sub.track === 'appsc-prelims';
              const isMains = sub.track === 'appsc-mains';

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSemSubId(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? isPrelims
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-400/40'
                        : isMains
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30 border border-violet-400/40'
                        : 'bg-teal-600 text-white shadow-md shadow-teal-900/30 border border-teal-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>{sub.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isPrelims
                        ? 'bg-blue-500/10 text-blue-400'
                        : isMains
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'bg-teal-500/10 text-teal-400'
                    }`}
                  >
                    {isPrelims ? 'Prelims' : isMains ? 'Mains' : 'Semester'} • {subTopicsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Subject Card */}
          {activeSemSub && (
            <Card className="bg-[#101726] border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">{activeSemSub.name}</h2>
                    {activeSemSub.nameTelugu && (
                      <span className="text-sm text-blue-400 font-medium">
                        ({activeSemSub.nameTelugu})
                      </span>
                    )}
                    <Badge
                      variant={
                        activeSemSub.track === 'appsc-prelims'
                          ? 'blue'
                          : activeSemSub.track === 'appsc-mains'
                          ? 'violet'
                          : 'teal'
                      }
                    >
                      {activeSemSub.track === 'appsc-prelims'
                        ? 'Prelims'
                        : activeSemSub.track === 'appsc-mains'
                        ? 'Mains'
                        : 'Semester'}
                    </Badge>
                    {activeSemSub.paper && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 border border-violet-700/40">
                        {activeSemSub.paper}
                      </span>
                    )}
                    <PriorityBadge priority={activeSemSub.priority} />
                    <span className="text-xs text-slate-400 font-mono">
                      Target: {activeSemSub.targetHours || 40} Hours
                    </span>
                  </div>
                  {activeSemSub.description && (
                    <p className="text-xs text-slate-400 mt-1">{activeSemSub.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-blue-300 border-blue-500/40 hover:bg-blue-500/10"
                    icon={<ExternalLink size={13} />}
                    onClick={() => {
                      if (activeSemSub.track === 'semester') {
                        navigate('/semester');
                      } else {
                        navigate('/appsc');
                      }
                    }}
                  >
                    Open Workspace Hub
                  </Button>
                </div>
              </div>

              {/* Completion Bar */}
              <div className="pt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">
                    Syllabus Covered: <strong>{completedSemTopics} of {activeSemTopics.length} Units / Topics</strong>
                  </span>
                  <span className="text-blue-400 font-bold">{semSubProgress}%</span>
                </div>
                <ProgressBar
                  value={semSubProgress}
                  color={
                    activeSemSub.track === 'appsc-prelims'
                      ? 'blue'
                      : activeSemSub.track === 'appsc-mains'
                      ? 'violet'
                      : 'teal'
                  }
                  size="sm"
                  showPercent={false}
                />
              </div>
            </Card>
          )}

          {/* Unit / Topic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSemTopics.map((topic, idx) => {
              const isCompleted = topic.status === 'completed';

              return (
                <div
                  key={topic.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          {topic.topicNumber ? `#${topic.topicNumber}` : idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                            {topic.title}
                          </h4>
                          {topic.titleTelugu && (
                            <p className="text-xs text-blue-400/90 font-medium mt-0.5">
                              {topic.titleTelugu}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={topic.status} />
                    </div>

                    {topic.description && (
                      <p className="text-xs text-slate-400 line-clamp-3 pl-8">
                        {topic.description}
                      </p>
                    )}

                    {topic.isSharedWithMains && (
                      <div className="pl-8">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/50 border border-violet-800/40 text-[10px] text-violet-300 font-medium">
                          <Sparkles size={10} /> Overlaps with Mains Paper 1/2
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={topic.difficulty} />
                      <span className="text-slate-400">{topic.estimatedHours} hrs</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={topic.status}
                        onChange={(e) => updateTopicStatus(topic.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="needs_revision">Needs Revision</option>
                      </select>

                      <button
                        onClick={(e) => handleQuickAddToday(topic.id, topic.title, e)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium cursor-pointer"
                        title="Add to Daily Study Plan"
                      >
                        + Today
                      </button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                        icon={<ExternalLink size={12} />}
                        onClick={() => navigate(`/topics/${topic.id}`)}
                      >
                        Workspace
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW MODE 2: 5 PRELIMS SUBJECT GROUPS (150 TOPICS)  */}
      {/* ==================================================== */}
      {viewMode === 'prelims_groups' && (
        <div className="space-y-6">
          {/* 5 Subject Group Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {prelimsGroups.map((group, index) => {
              const groupTopics = topics.filter((t) => t.subjectId === group.id);
              const completedCount = groupTopics.filter((t) => t.status === 'completed').length;
              const pct = groupTopics.length > 0 ? Math.round((completedCount / groupTopics.length) * 100) : 0;
              const isSelected = selectedPrelimsGroup === group.id;

              return (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedPrelimsGroup(group.id);
                    setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-wider">
                        Group {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {completedCount}/{groupTopics.length || 30}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {group.name}
                    </h3>
                    {group.nameTelugu && (
                      <p className="text-[11px] text-blue-300 font-medium truncate">
                        {group.nameTelugu}
                      </p>
                    )}
                  </div>

                  <div className="pt-1">
                    <ProgressBar value={pct} color="blue" size="sm" showPercent={false} />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>30 Topics</span>
                      <span className="font-semibold text-slate-300">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Accordion for Subject Groups */}
          <div className="space-y-4">
            {prelimsGroups.map((group, groupIdx) => {
              const isExpanded = !!expandedGroups[group.id];
              const groupTopics = topics
                .filter((t) => t.subjectId === group.id)
                .sort((a, b) => (a.topicNumber || 0) - (b.topicNumber || 0));
              const completedCount = groupTopics.filter((t) => t.status === 'completed').length;
              const pct = groupTopics.length > 0 ? Math.round((completedCount / groupTopics.length) * 100) : 0;

              return (
                <div
                  key={group.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md"
                >
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroupExpand(group.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl font-bold font-mono text-sm shrink-0">
                        0{groupIdx + 1}
                      </div>

                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-bold text-white">
                            {group.name}
                          </h2>
                          <Badge variant="blue" size="sm">
                            30 Numbered Topics
                          </Badge>
                          <Badge variant="emerald" size="sm" className="gap-1">
                            <ShieldCheck size={11} /> Verified Notification 37/2026
                          </Badge>
                        </div>
                        {group.nameTelugu && (
                          <p className="text-xs text-blue-400 font-medium">{group.nameTelugu}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-slate-400">
                          {completedCount} of {groupTopics.length} completed
                        </span>
                        <div className="w-24 mt-1">
                          <ProgressBar value={pct} color="emerald" size="sm" showPercent={false} />
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* 30 Topics Grid (When expanded) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/60 bg-slate-950/40 space-y-2.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3">
                        {groupTopics.map((topic) => {
                          const isCompleted = topic.status === 'completed';

                          return (
                            <div
                              key={topic.id}
                              onClick={() => navigate(`/topics/${topic.id}`)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                                isCompleted
                                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80 hover:opacity-100'
                                  : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/60 hover:bg-slate-850 shadow-sm'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTopicStatus(
                                      topic.id,
                                      isCompleted ? 'in_progress' : 'completed',
                                      isCompleted ? 50 : 100
                                    );
                                  }}
                                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2
                                      size={18}
                                      className="text-emerald-400 fill-emerald-500/20"
                                    />
                                  ) : (
                                    <Circle size={18} />
                                  )}
                                </button>

                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded shrink-0">
                                      #{topic.topicNumber}
                                    </span>
                                    <h4
                                      className={`text-xs font-semibold group-hover:text-blue-300 transition-colors truncate ${
                                        isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                                      }`}
                                    >
                                      {topic.title}
                                    </h4>
                                  </div>

                                  {topic.titleTelugu && (
                                    <p className="text-[11px] text-blue-400/90 font-medium truncate">
                                      {topic.titleTelugu}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap pt-0.5">
                                    <span>Est: {topic.estimatedHours}h</span>
                                    <DifficultyBadge difficulty={topic.difficulty} />
                                    <StatusBadge status={topic.status} />
                                    {topic.isSharedWithMains && (
                                      <span className="text-violet-400 font-medium">
                                        • Prelims + Mains
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => handleQuickAddToday(topic.id, topic.title, e)}
                                  className="p-1.5 h-auto text-[10px] text-slate-400 hover:text-blue-400"
                                  title="Add to Today's Plan"
                                >
                                  <Calendar size={13} />
                                </Button>
                                <ChevronRight
                                  size={16}
                                  className="text-slate-500 group-hover:text-blue-400 transition-colors"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW MODE 2: ALL TRACKS MATRIX & SEARCH TABLE       */}
      {/* ==================================================== */}
      {viewMode === 'all_matrix' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="bg-[#101726]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics, Telugu keywords..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Track Filter */}
              <div>
                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Exam Tracks</option>
                  <option value="appsc-prelims">APPSC Prelims</option>
                  <option value="appsc-mains">APPSC Mains</option>
                  <option value="semester">M.Tech / B.Tech Semester</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="needs_revision">Needs Revision</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredTopics.length} of {topics.length} topics
            </span>
            <span>Click any topic row to open its complete digital study workspace</span>
          </div>

          <div className="space-y-2">
            {filteredTopics.map((topic) => {
              const subject = subjects.find((s) => s.id === topic.subjectId);
              const isCompleted = topic.status === 'completed';

              return (
                <div
                  key={topic.id}
                  onClick={() => navigate(`/topics/${topic.id}`)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-slate-900/40 border-slate-800/40 opacity-75 hover:opacity-100'
                      : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTopicStatus(
                          topic.id,
                          isCompleted ? 'in_progress' : 'completed',
                          isCompleted ? 50 : 100
                        );
                      }}
                      className="mt-0.5 md:mt-0 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          size={20}
                          className="text-emerald-400 fill-emerald-500/20"
                        />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {topic.topicNumber && (
                          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                            #{topic.topicNumber}
                          </span>
                        )}
                        <h4
                          className={`text-sm font-semibold hover:text-blue-300 transition-colors ${
                            isCompleted ? 'text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {topic.title}
                        </h4>
                        {topic.titleTelugu && (
                          <span className="text-xs text-blue-400 font-medium">
                            {topic.titleTelugu}
                          </span>
                        )}
                        {topic.isSharedWithMains && (
                          <Badge variant="violet" size="sm">
                            <LinkIcon size={10} className="mr-0.5" /> Shared Prelims & Mains
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <TrackBadge track={topic.track} />
                        {subject && <span className="text-slate-400">• {subject.name}</span>}
                        <span>• Est: {topic.estimatedHours} hrs</span>
                        <DifficultyBadge difficulty={topic.difficulty} />
                        <PriorityBadge priority={topic.priority} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleQuickAddToday(topic.id, topic.title, e)}
                      className="text-xs gap-1 border-slate-700 text-slate-300 hover:text-white"
                    >
                      <Calendar size={12} /> + Today
                    </Button>

                    <div className="w-16">
                      <ProgressBar
                        value={topic.progressPercent}
                        color={isCompleted ? 'emerald' : 'blue'}
                        size="sm"
                        showPercent={false}
                      />
                    </div>

                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
