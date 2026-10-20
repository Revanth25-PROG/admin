import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  ArrowLeft,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  CheckSquare,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, DifficultyBadge, StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { calculateSubjectTargetStats } from '../../services/questionBankEngine';

export const SubjectDetailPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { subjects, topics, subtopics, bankQuestions, mockTests, testAttempts } = useStudyVerse();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');

  const subject = useMemo(() => {
    return subjects.find((s) => s.id === subjectId) || subjects[0];
  }, [subjects, subjectId]);

  const subjectTopics = useMemo(() => {
    if (!subject) return [];
    return topics.filter((t) => t.subjectId === subject.id);
  }, [topics, subject]);

  const stats = useMemo(() => {
    if (!subject) return null;
    return calculateSubjectTargetStats(subject.id, subjectTopics, bankQuestions);
  }, [subject, subjectTopics, bankQuestions]);

  const subjectTests = useMemo(() => {
    if (!subject) return [];
    return mockTests.filter(
      (m) =>
        m.subjectId === subject.id ||
        (m.title && m.title.toLowerCase().includes(subject.name.toLowerCase()))
    );
  }, [mockTests, subject]);

  const filteredTopics = useMemo(() => {
    return subjectTopics.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.titleTelugu && t.titleTelugu.includes(searchQuery));
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [subjectTopics, searchQuery, statusFilter]);

  if (!subject) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Subject Not Found"
          description="The requested subject could not be located in the syllabus database."
          actionLabel="Back to Syllabus"
          onAction={() => navigate('/syllabus')}
        />
      </div>
    );
  }

  const completedTopicsCount = subjectTopics.filter((t) => t.status === 'completed').length;
  const progressPercent = subjectTopics.length > 0
    ? Math.round((completedTopicsCount / subjectTopics.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={() => navigate('/syllabus')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Syllabus Explorer</span>
        </button>
        <span>/</span>
        <span className="text-slate-200 font-medium truncate">{subject.name}</span>
      </div>

      {/* Hero Subject Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#101726] to-slate-900 border border-slate-800 p-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: subject.color || '#3b82f6' }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {subject.paper || 'APPSC Group-II Core'}
              </span>
              <Badge variant="blue">Official Marks: {subject.officialMarks || 30}M</Badge>
              <Badge variant="emerald">Priority: {subject.priority?.toUpperCase() || 'HIGH'}</Badge>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {subject.name}
            </h1>
            {subject.nameTelugu && (
              <p className="text-sm font-semibold text-blue-300/90 font-telugu">
                {subject.nameTelugu}
              </p>
            )}
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              {subject.description || 'Comprehensive curriculum topics and examination mock testing.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<Play size={16} />}
              onClick={() => navigate(`/mock-tests`)}
            >
              Start Subject Mock
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<BarChart3 size={16} />}
              onClick={() => navigate(`/analytics`)}
            >
              Analytics
            </Button>
          </div>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Curriculum Topics</span>
            <span className="text-lg font-bold text-white">{subjectTopics.length}</span>
            <span className="text-[10px] text-emerald-400 ml-1.5 font-medium">({completedTopicsCount} completed)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Target Question Bank</span>
            <span className="text-lg font-bold text-white">
              {stats?.approvedCount || 0} / {stats?.targetCount || subjectTopics.length * 500}
            </span>
            <span className="text-[10px] text-blue-400 ml-1.5 font-medium">
              ({stats?.coveragePercent || 0}% coverage)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Mock Sets Inventory</span>
            <span className="text-lg font-bold text-white">
              {subjectTests.length} <span className="text-slate-500 text-xs font-normal">/ 200 Target</span>
            </span>
            <span className="text-[10px] text-teal-400 ml-1.5 font-medium">Sectional & Mixed</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Study Hours Goal</span>
            <span className="text-lg font-bold text-white">{subject.targetHours || 45} hrs</span>
            <span className="text-[10px] text-amber-400 ml-1.5 font-medium">Exam Standard</span>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-[#101726]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-200">Subject Syllabus Completion</span>
          <span className="font-bold text-blue-400">{progressPercent}%</span>
        </div>
        <ProgressBar value={progressPercent} size="sm" />
      </Card>

      {/* Topic Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics by title or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Topics ({subjectTopics.length})</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="No topics match your filter"
            description="Try modifying your search term or filter selection."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        ) : (
          filteredTopics.map((topic) => {
            const topicSubtopics = subtopics.filter((st) => st.topicId === topic.id);
            const topicQuestions = bankQuestions.filter((q) => q.topicId === topic.id);

            return (
              <div
                key={topic.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Topic #{topic.topicNumber || 1}
                      </span>
                      <StatusBadge status={topic.status} />
                      <DifficultyBadge difficulty={topic.difficulty || 'moderate'} />
                      <span className="text-[11px] text-slate-400">
                        {topicQuestions.length} Questions in Bank
                      </span>
                      {topic.isSharedWithMains && (
                        <Badge variant="violet">Mains Shared</Badge>
                      )}
                    </div>

                    <Link
                      to={`/topics/${topic.id}`}
                      className="text-sm font-bold text-white hover:text-blue-400 transition-colors block"
                    >
                      {topic.title}
                    </Link>

                    {topic.titleTelugu && (
                      <p className="text-xs text-slate-400 font-telugu">
                        {topic.titleTelugu}
                      </p>
                    )}

                    {topicSubtopics.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 flex-wrap">
                        <Layers size={12} className="text-slate-500" />
                        <span>Subtopics:</span>
                        {topicSubtopics.map((st) => (
                          <span
                            key={st.id}
                            className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]"
                          >
                            {st.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ChevronRight size={14} />}
                      onClick={() => navigate(`/topics/${topic.id}`)}
                    >
                      Study Topic
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Play size={14} />}
                      onClick={() => navigate(`/mock-tests`)}
                    >
                      Practice
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
