import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  Layers,
  BookOpen,
  Target,
  Zap,
  Brain,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  HelpCircle,
  Bookmark,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldAlert,
  Flame,
  Printer,
  ChevronRight,
  GitCompare,
} from 'lucide-react';

import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';

import {
  calculateOverallSummary,
  calculateSubjectIntelligence,
  calculateTopicDeepAnalytics,
  calculateTimeEfficiency,
  calculateReadinessIndicator,
  generatePersonalizedRecommendations,
  compareTwoAttempts,
} from '../../services/analyticsEngine';

import {
  MistakeErrorCategory,
  MistakeRevisionStatus,
  MistakeBookItem,
  TopicAnalyticsDetail,
  MockTest,
  MockQuestion,
} from '../../types';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    topics,
    subjects,
    testAttempts,
    revisions,
    profile,
    bankQuestions,
    mockTests,
    mistakeBook,
    saveMistakeBookItem,
    deleteMistakeBookItem,
    updateMistakeItemClassification,
    saveMockTest,
  } = useStudyVerse();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subjects' | 'topics' | 'mistakes' | 'efficiency' | 'readiness' | 'comparison'
  >('overview');

  // Filter state for Executive Dashboard & Trends
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [trackFilter, setTrackFilter] = useState<'all' | 'appsc-prelims' | 'appsc-mains' | 'semester'>('all');

  // Subject Intelligence selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || 'sub-pre-group-1'
  );

  // Topic Drilldown Modal state
  const [selectedTopicDetail, setSelectedTopicDetail] = useState<TopicAnalyticsDetail | null>(null);

  // Mistake Book state
  const [mistakeCategoryFilter, setMistakeCategoryFilter] = useState<string>('all');
  const [mistakeStatusFilter, setMistakeStatusFilter] = useState<string>('all');
  const [mistakeSubjectFilter, setMistakeSubjectFilter] = useState<string>('all');
  const [mistakeSearchQuery, setMistakeSearchQuery] = useState<string>('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  // Side-by-Side Attempt Comparison state
  const [compareAttemptAId, setCompareAttemptAId] = useState<string>(
    testAttempts[0]?.id || ''
  );
  const [compareAttemptBId, setCompareAttemptBId] = useState<string>(
    testAttempts[1]?.id || testAttempts[0]?.id || ''
  );

  // -------------------------------------------------------------------------
  // FILTERED ATTEMPTS (Used by Overview & Trends)
  // -------------------------------------------------------------------------
  const filteredAttempts = useMemo(() => {
    let result = [...testAttempts];

    // Filter by track
    if (trackFilter !== 'all') {
      result = result.filter((a) => a.track === trackFilter);
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date().getTime();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      result = result.filter((a) => {
        const d = new Date(a.completedAt || a.startedAt).getTime();
        return d >= cutoff;
      });
    }

    return result.sort(
      (a, b) => new Date(a.completedAt || a.startedAt).getTime() - new Date(b.completedAt || b.startedAt).getTime()
    );
  }, [testAttempts, trackFilter, timeRange]);

  // Overall Performance Summary Calculation
  const overallSummary = useMemo(() => {
    return calculateOverallSummary(filteredAttempts, mockTests, topics, subjects, tasks);
  }, [filteredAttempts, mockTests, topics, subjects, tasks]);

  // Subject Intelligence Calculation
  const subjectIntelligence = useMemo(() => {
    return calculateSubjectIntelligence(
      selectedSubjectId,
      testAttempts,
      mockTests,
      topics,
      bankQuestions,
      subjects
    );
  }, [selectedSubjectId, testAttempts, mockTests, topics, bankQuestions, subjects]);

  // Topic Deep Analytics Matrix Calculation
  const topicDeepAnalytics = useMemo(() => {
    return calculateTopicDeepAnalytics(topics, testAttempts, mockTests, subjects);
  }, [topics, testAttempts, mockTests, subjects]);

  // Time Management & Efficiency Calculation
  const timeEfficiency = useMemo(() => {
    return calculateTimeEfficiency(filteredAttempts, mockTests);
  }, [filteredAttempts, mockTests]);

  // Readiness Indicator Calculation
  const readinessIndicator = useMemo(() => {
    return calculateReadinessIndicator(testAttempts, topics, subjects, 100);
  }, [testAttempts, topics, subjects]);

  // Personalized Study Recommendations
  const personalizedRecommendations = useMemo(() => {
    return generatePersonalizedRecommendations(testAttempts, topics, subjects, mockTests, mistakeBook);
  }, [testAttempts, topics, subjects, mockTests, mistakeBook]);

  // Side-by-Side Comparison Calculation
  const comparisonResult = useMemo(() => {
    const attA = testAttempts.find((a) => a.id === compareAttemptAId);
    const attB = testAttempts.find((a) => a.id === compareAttemptBId);
    if (!attA || !attB) return null;
    return compareTwoAttempts(attA, attB, mockTests, topics);
  }, [compareAttemptAId, compareAttemptBId, testAttempts, mockTests, topics]);

  // -------------------------------------------------------------------------
  // CHART DATASETS
  // -------------------------------------------------------------------------
  const scoreProgressionData = useMemo(() => {
    return filteredAttempts.map((att, idx) => ({
      index: idx + 1,
      name: `Mock #${idx + 1}`,
      title: att.testTitle,
      date: (att.completedAt || att.startedAt).split('T')[0],
      score: Number(att.score.toFixed(2)),
      maxScore: att.totalPossibleMarks,
      accuracy: att.accuracy,
    }));
  }, [filteredAttempts]);

  const accuracyTrendData = useMemo(() => {
    return filteredAttempts.map((att, idx) => ({
      name: `T${idx + 1}`,
      title: att.testTitle,
      accuracy: att.accuracy,
      correct: att.correctCount,
      incorrect: att.incorrectCount,
      unanswered: att.unansweredCount,
    }));
  }, [filteredAttempts]);

  const responseTimeTrendData = useMemo(() => {
    return filteredAttempts.map((att, idx) => {
      const qAttempted = (att.correctCount || 0) + (att.incorrectCount || 0);
      const avgSeconds = qAttempted > 0 ? Math.round(att.timeSpentSeconds / qAttempted) : 0;
      return {
        name: `T${idx + 1}`,
        title: att.testTitle,
        avgSeconds,
        targetPace: 60, // APPSC standard pace: 60s per question
      };
    });
  }, [filteredAttempts]);

  // Filtered Mistake Book Items
  const filteredMistakes = useMemo(() => {
    return (mistakeBook || []).filter((item) => {
      if (mistakeCategoryFilter !== 'all' && item.errorCategory !== mistakeCategoryFilter) return false;
      if (mistakeStatusFilter !== 'all' && item.revisionStatus !== mistakeStatusFilter) return false;
      if (mistakeSubjectFilter !== 'all' && item.subjectId !== mistakeSubjectFilter) return false;

      if (mistakeSearchQuery.trim()) {
        const q = mistakeSearchQuery.toLowerCase();
        const matchText = item.questionText.toLowerCase().includes(q);
        const matchTel = item.questionTextTelugu?.toLowerCase().includes(q) || false;
        const matchConcept = item.topicTitle.toLowerCase().includes(q);
        if (!matchText && !matchTel && !matchConcept) return false;
      }

      return true;
    });
  }, [mistakeBook, mistakeCategoryFilter, mistakeStatusFilter, mistakeSubjectFilter, mistakeSearchQuery]);

  // -------------------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------------------
  const handleLaunchMistakePractice = () => {
    if (filteredMistakes.length === 0) {
      alert('No mistake questions available matching the current filter.');
      return;
    }

    const practiceQuestions: MockQuestion[] = filteredMistakes.map((m, idx) => ({
      id: `prac-${m.questionId}-${idx}`,
      track: (topics.find((t) => t.id === m.topicId)?.track || 'appsc-prelims') as any,
      subjectId: m.subjectId,
      topicId: m.topicId,
      questionText: m.questionText,
      questionTextTelugu: m.questionTextTelugu,
      options: m.options,
      correctOptionId: m.correctOptionId,
      explanation: m.explanation,
      explanationTelugu: m.explanationTelugu,
      difficulty: (m.difficulty === 'hard' || m.difficulty === 'moderate' || m.difficulty === 'easy') ? m.difficulty : 'moderate',
      marks: 1,
      negativeMarks: 0.33,
    }));

    const mistakeTest: MockTest = {
      id: `mistake-practice-${Date.now()}`,
      title: `Targeted Mistake Practice: ${filteredMistakes.length} Missed Questions`,
      description: 'Custom remedial session automatically assembled from your Mistake Book records.',
      track: practiceQuestions[0]?.track || 'appsc-prelims',
      isCustom: true,
      durationMinutes: Math.max(5, Math.ceil(practiceQuestions.length * 1.2)),
      totalMarks: practiceQuestions.length,
      marksPerQuestion: 1,
      negativeMarks: 0.33,
      questions: practiceQuestions,
      createdAt: new Date().toISOString(),
    };

    saveMockTest(mistakeTest);
    navigate('/mock-tests');
  };

  const handleExportFullReport = () => {
    const report = {
      student: profile.name,
      targetExam: profile.targetExam,
      exportDate: new Date().toISOString(),
      overallPerformance: overallSummary,
      readinessPrediction: readinessIndicator,
      recommendations: personalizedRecommendations,
      timeEfficiency,
      mistakeBookCount: mistakeBook?.length || 0,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyVerse_Comprehensive_Analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Performance Intelligence Engine
                <Badge variant="teal" size="sm">
                  Pro Analytics v2
                </Badge>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Data-driven exam readiness, 100-mock series tracking, mistake pattern forensics & adaptive study guidance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer size={14} />}
            onClick={handlePrintReport}
            className="text-slate-300 border-slate-700 hover:bg-slate-800 text-xs"
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportFullReport}
            className="text-xs bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            Export Full Dossier
          </Button>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'overview', label: 'Executive Dashboard', icon: <TrendingUp size={15} /> },
          { id: 'subjects', label: 'Subject Intelligence (100-Mock Series)', icon: <BookOpen size={15} /> },
          { id: 'topics', label: 'Topic Performance Matrix', icon: <Layers size={15} /> },
          { id: 'mistakes', label: `Mistake Book (${mistakeBook?.length || 0})`, icon: <ShieldAlert size={15} /> },
          { id: 'efficiency', label: 'Time Management', icon: <Clock size={15} /> },
          { id: 'readiness', label: 'Exam Readiness & Prediction', icon: <Target size={15} /> },
          { id: 'comparison', label: 'Attempt Forensics & Compare', icon: <GitCompare size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE DASHBOARD & TREND ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Controls Bar: Time Range & Exam Track Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Filter size={13} /> Track:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'All Tracks' },
                  { id: 'appsc-prelims', label: 'Prelims' },
                  { id: 'appsc-mains', label: 'Mains' },
                  { id: 'semester', label: 'Semester' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTrackFilter(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      trackFilter === item.id
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Calendar size={13} /> Time Window:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: '7d', label: 'Past 7 Days' },
                  { id: '30d', label: 'Past 30 Days' },
                  { id: '90d', label: 'Past 90 Days' },
                  { id: 'all', label: 'All History' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTimeRange(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeRange === item.id
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <Card className="bg-slate-900/80 border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Tests Attempted</span>
                <CheckCircle2 size={16} className="text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {overallSummary.totalTestsAttempted}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {overallSummary.totalTestsCompleted} completed fully
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Overall Accuracy</span>
                <Target size={16} className="text-teal-400" />
              </div>
              <div className="text-2xl font-black text-teal-400">
                {overallSummary.overallAccuracy}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {overallSummary.improvementSinceFirst >= 0 ? (
                  <span className="text-emerald-400 flex items-center font-bold">
                    <ArrowUpRight size={12} /> +{overallSummary.improvementSinceFirst}%
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center font-bold">
                    <ArrowDownRight size={12} /> {overallSummary.improvementSinceFirst}%
                  </span>
                )}
                <span>since start</span>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Avg Question Score</span>
                <Award size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {overallSummary.overallAverageScore}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Peak: <span className="text-emerald-400 font-bold">{overallSummary.highestScore}</span>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Questions Solved</span>
                <Zap size={16} className="text-violet-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {overallSummary.totalQuestionsAttempted}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                <span className="text-emerald-400 font-bold">{overallSummary.totalCorrect}</span> correct •{' '}
                <span className="text-rose-400 font-bold">{overallSummary.totalIncorrect}</span> wrong
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Avg Response Time</span>
                <Clock size={16} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300">
                {overallSummary.avgTimePerQuestionSeconds}s
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Target: <span className="text-slate-300 font-medium">60s / Q</span>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Syllabus Coverage</span>
                <Brain size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300">
                {overallSummary.syllabusCoveragePercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tested & active topics
              </div>
            </Card>
          </div>

          {/* Interactive Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Sequential Mock Test Score Progression */}
            <Card className="bg-slate-900/90 border-slate-800 p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm md:text-base font-bold text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-400" />
                    <span>Score Progression Across Mock Tests</span>
                  </div>
                  <Badge variant="blue" size="sm">
                    {scoreProgressionData.length} Tests Logged
                  </Badge>
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Actual recorded scores with negative marking accounted for.
                </p>
              </CardHeader>

              <div className="h-64 w-full">
                {scoreProgressionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreProgressionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        activeDot={{ r: 6 }}
                        name="Actual Score"
                      />
                      <Line
                        type="monotone"
                        dataKey="maxScore"
                        stroke="#64748b"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        name="Possible Marks"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    No mock test attempts recorded yet in this window.
                  </div>
                )}
              </div>
            </Card>

            {/* Chart 2: Accuracy & Answer Breakdown */}
            <Card className="bg-slate-900/90 border-slate-800 p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm md:text-base font-bold text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-teal-400" />
                    <span>Accuracy & Question Breakdown</span>
                  </div>
                  <Badge variant="teal" size="sm">
                    {overallSummary.overallAccuracy}% Overall
                  </Badge>
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Correct vs Incorrect vs Unanswered counts per test attempt.
                </p>
              </CardHeader>

              <div className="h-64 w-full">
                {accuracyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accuracyTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="correct" fill="#10b981" name="Correct" stackId="a" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="incorrect" fill="#f43f5e" name="Incorrect" stackId="a" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="unanswered" fill="#64748b" name="Unanswered" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    No attempts logged for answer breakdown.
                  </div>
                )}
              </div>
            </Card>

            {/* Chart 3: Response Time Forensics */}
            <Card className="bg-slate-900/90 border-slate-800 p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm md:text-base font-bold text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-cyan-400" />
                    <span>Average Response Time vs Target Pace</span>
                  </div>
                  <Badge variant="slate" size="sm" className="text-cyan-400 border-cyan-500/30">
                    60s Benchmark
                  </Badge>
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Track pacing speed against standard APPSC Prelims exam duration.
                </p>
              </CardHeader>

              <div className="h-60 w-full">
                {responseTimeTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={responseTimeTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgSeconds"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorTime)"
                        name="Avg Seconds / Q"
                      />
                      <Line
                        type="monotone"
                        dataKey="targetPace"
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                        name="Target 60s Pace"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    No time tracking logs available.
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Action & Personal Best Card */}
            <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <h3 className="text-sm md:text-base font-bold text-white">
                      Exam Benchmark & Personal Best
                    </h3>
                  </div>
                  {overallSummary.personalBest && (
                    <Badge variant="amber" size="sm">
                      Top Performance
                    </Badge>
                  )}
                </div>

                <div className="py-4 space-y-3">
                  {overallSummary.personalBest ? (
                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="text-xs text-slate-400 font-medium">Record High Attempt</div>
                      <div className="text-base font-bold text-white leading-tight">
                        {overallSummary.personalBest.testTitle}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-emerald-400 font-bold">
                          Score: {overallSummary.personalBest.score}
                        </span>
                        <span className="text-slate-400">
                          Recorded: {overallSummary.personalBest.date}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-3">
                      Complete your first mock test to establish a personal best.
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1.5">
                    <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Brain size={14} /> Adaptive Focus Needed:
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {personalizedRecommendations.top3Weaknesses?.[0]
                        ? `Prioritize revision on: ${personalizedRecommendations.top3Weaknesses[0].topicTitle} (Accuracy: ${personalizedRecommendations.top3Weaknesses[0].accuracy}%).`
                        : 'Maintain current cadence across upcoming scheduled mock blueprints.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('subjects')}
                  className="w-full text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                >
                  View Subject Intelligence →
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('mistakes')}
                  className="w-full text-xs bg-indigo-600 hover:bg-indigo-500"
                >
                  Forensic Mistake Book →
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Test History Table */}
          <Card className="bg-slate-900/90 border-slate-800 p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm md:text-base font-bold text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-slate-400" />
                  <span>Recent Test Attempts & Telemetry</span>
                </div>
                <span className="text-xs text-slate-400">
                  Showing {overallSummary.recentAttempts.length} logged records
                </span>
              </CardTitle>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Test Title & Track</th>
                    <th className="py-3 px-3">Date Completed</th>
                    <th className="py-3 px-3">Score Achieved</th>
                    <th className="py-3 px-3">Accuracy</th>
                    <th className="py-3 px-3">Breakdown (C/W/U)</th>
                    <th className="py-3 px-3">Time Spent</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {overallSummary.recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-xs">
                          {attempt.testTitle}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {attempt.track}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {(attempt.completedAt || attempt.startedAt).replace('T', ' ').slice(0, 16)}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {attempt.score.toFixed(2)} / {attempt.totalPossibleMarks}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            attempt.accuracy >= 75
                              ? 'text-emerald-400'
                              : attempt.accuracy >= 50
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {attempt.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="text-emerald-400 font-medium">{attempt.correctCount}</span> /{' '}
                        <span className="text-rose-400 font-medium">{attempt.incorrectCount}</span> /{' '}
                        <span className="text-slate-400">{attempt.unansweredCount}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCompareAttemptAId(attempt.id);
                            setActiveTab('comparison');
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Compare →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBJECT PERFORMANCE INTELLIGENCE & 100-MOCK SERIES TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Subject Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
            {subjects.map((s) => {
              const isSelected = s.id === selectedSubjectId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: s.color || '#3b82f6' }}
                    />
                    <span>{s.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Subject Intelligence Hero Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject Profile & 100-Mock Series Tracker */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm" className="uppercase tracking-wider">
                      {subjectIntelligence.track}
                    </Badge>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        subjectIntelligence.preparednessStatus === 'exam_ready'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : subjectIntelligence.preparednessStatus === 'moderate_progress'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {subjectIntelligence.preparednessStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                    {subjectIntelligence.subjectName}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-teal-400">
                    {subjectIntelligence.averageAccuracy}%
                  </div>
                  <div className="text-xs text-slate-400">Subject Accuracy</div>
                </div>
              </div>

              {/* 100-Mock-Test Series Progress Engine */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-amber-400 animate-pulse" />
                    <span className="font-bold text-white">100-Mock-Test Series Progress</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {subjectIntelligence.testsCompletedOutOf100} / 100 Tests Completed
                  </span>
                </div>

                <ProgressBar
                  value={subjectIntelligence.testsCompletedOutOf100}
                  color={subjectIntelligence.testsCompletedOutOf100 >= 50 ? 'emerald' : 'blue'}
                  size="md"
                  showPercent={false}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target: 100 Full & Sectional Mocks</span>
                  <span>{100 - subjectIntelligence.testsCompletedOutOf100} Tests Remaining</span>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Question Bank Depth</div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {subjectIntelligence.availableQuestionsCount}
                  </div>
                  <div className="text-[10px] text-slate-500">Available verified Qs</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Syllabus Coverage</div>
                  <div className="text-lg font-black text-teal-400 mt-0.5">
                    {subjectIntelligence.topicCoveragePercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">Practiced syllabus</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Average Score</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    {subjectIntelligence.averageMarks}
                  </div>
                  <div className="text-[10px] text-slate-500">Peak: {subjectIntelligence.highestScore}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Pacing Speed</div>
                  <div className="text-lg font-black text-cyan-400 mt-0.5">
                    {subjectIntelligence.averageTimePerQuestionSeconds}s
                  </div>
                  <div className="text-[10px] text-slate-500">Per question average</div>
                </div>
              </div>
            </Card>

            {/* Recommendations & Weakness Alert */}
            <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span>Subject Improvement Action Plan</span>
                </h3>

                <div className="py-3 space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Strongest Topics:</span>
                    {subjectIntelligence.strongTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subjectIntelligence.strongTopics.map((st, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px]"
                          >
                            {st.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No topic has reached 75% accuracy threshold yet.</p>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-slate-400 font-medium">Critical Weak Areas:</span>
                    {subjectIntelligence.weakTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subjectIntelligence.weakTopics.map((wt, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/40 text-[11px]"
                          >
                            {wt.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No recurring weaknesses identified.</p>
                    )}
                  </div>

                  {subjectIntelligence.frequentlyIncorrectConcepts.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1 mt-2">
                      <span className="text-slate-300 font-semibold block">Frequently Missed Concepts:</span>
                      <ul className="list-disc list-inside text-rose-300 space-y-0.5">
                        {subjectIntelligence.frequentlyIncorrectConcepts.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {subjectIntelligence.recommendedNextActions.map((action, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <ChevronRight size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TOPIC & SUBTOPIC PERFORMANCE MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                <span>Color-Coded Topic Performance Matrix</span>
              </h2>
              <p className="text-xs text-slate-400">
                Minimum 5 attempts required before a topic is diagnosed as Strong or Weak.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Strong (≥75%)
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Improving
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Needs Practice
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Weak (&lt;50%)
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Unattempted
              </span>
            </div>
          </div>

          {/* Topic Cards Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {topicDeepAnalytics.map((topicDetail) => {
              const borderClass =
                topicDetail.classification === 'strong'
                  ? 'border-emerald-500/40 hover:border-emerald-500'
                  : topicDetail.classification === 'improving'
                  ? 'border-blue-500/40 hover:border-blue-500'
                  : topicDetail.classification === 'weak'
                  ? 'border-rose-500/40 hover:border-rose-500'
                  : topicDetail.classification === 'needs_practice'
                  ? 'border-amber-500/40 hover:border-amber-500'
                  : 'border-slate-800 hover:border-slate-700';

              const badgeVariant =
                topicDetail.classification === 'strong'
                  ? 'emerald'
                  : topicDetail.classification === 'improving'
                  ? 'blue'
                  : topicDetail.classification === 'weak'
                  ? 'danger'
                  : topicDetail.classification === 'needs_practice'
                  ? 'amber'
                  : 'outline';

              return (
                <div
                  key={topicDetail.topicId}
                  onClick={() => setSelectedTopicDetail(topicDetail)}
                  className={`p-4 rounded-2xl bg-slate-900/80 border ${borderClass} transition-all cursor-pointer hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                        {topicDetail.subjectName}
                      </span>
                      <Badge variant={badgeVariant as any} size="sm">
                        {topicDetail.classification.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {topicDetail.topicTitle}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Accuracy:</span>
                      <span
                        className={`font-bold ${
                          topicDetail.accuracy >= 75
                            ? 'text-emerald-400'
                            : topicDetail.accuracy >= 50
                            ? 'text-amber-400'
                            : topicDetail.questionsAttempted > 0
                            ? 'text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {topicDetail.questionsAttempted > 0 ? `${topicDetail.accuracy}%` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Attempted: {topicDetail.questionsAttempted} Qs</span>
                      <span>Avg: {topicDetail.avgResponseTimeSeconds}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topic Detail Drill-down Modal */}
          {selectedTopicDetail && (
            <Modal
              isOpen={!!selectedTopicDetail}
              onClose={() => setSelectedTopicDetail(null)}
              title={selectedTopicDetail.topicTitle}
              maxWidth="lg"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <span>Subject: <strong className="text-white">{selectedTopicDetail.subjectName}</strong></span>
                  <Badge
                    variant={
                      selectedTopicDetail.classification === 'strong'
                        ? 'emerald'
                        : selectedTopicDetail.classification === 'weak'
                        ? 'rose'
                        : 'amber'
                    }
                    size="sm"
                  >
                    Status: {selectedTopicDetail.classification.toUpperCase()}
                  </Badge>
                </div>

                {/* Accuracy by Difficulty */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Performance by Difficulty Level
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-400">Easy Questions</span>
                        <span className="text-white font-bold">{selectedTopicDetail.difficultyAccuracy.easy}%</span>
                      </div>
                      <ProgressBar value={selectedTopicDetail.difficultyAccuracy.easy} color="emerald" size="sm" showPercent={false} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-400">Moderate Questions</span>
                        <span className="text-white font-bold">{selectedTopicDetail.difficultyAccuracy.moderate}%</span>
                      </div>
                      <ProgressBar value={selectedTopicDetail.difficultyAccuracy.moderate} color="amber" size="sm" showPercent={false} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-rose-400">Hard Questions</span>
                        <span className="text-white font-bold">{selectedTopicDetail.difficultyAccuracy.hard}%</span>
                      </div>
                      <ProgressBar value={selectedTopicDetail.difficultyAccuracy.hard} color="rose" size="sm" showPercent={false} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTopicDetail(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedTopicDetail(null);
                      navigate('/mock-tests');
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-500 font-bold"
                  >
                    Generate Test for this Topic →
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MISTAKE BOOK & ERROR PATTERN FORENSICS */}
      {/* ========================================================================= */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-rose-950/20 p-4 rounded-2xl border border-rose-900/30">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-400" />
                <span>Forensic Mistake Book & Error Patterns</span>
              </h2>
              <p className="text-xs text-slate-400">
                Persistent record of all missed questions. Auto-mastered when answered correctly twice sequentially.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles size={14} />}
              onClick={handleLaunchMistakePractice}
              className="text-xs bg-rose-600 hover:bg-rose-500 font-bold shadow-lg shadow-rose-600/30"
            >
              Practice {filteredMistakes.length} Mistake Questions →
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search missed questions or concepts..."
                value={mistakeSearchQuery}
                onChange={(e) => setMistakeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={mistakeCategoryFilter}
                onChange={(e) => setMistakeCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="all">All Error Causes</option>
                <option value="knowledge_gap">Knowledge Gap</option>
                <option value="conceptual_misunderstanding">Conceptual Gap</option>
                <option value="careless_error">Careless Error</option>
                <option value="time_pressure">Time Pressure</option>
                <option value="misreading_question">Misread Question</option>
              </select>

              <select
                value={mistakeStatusFilter}
                onChange={(e) => setMistakeStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="in_revision">In Revision</option>
                <option value="mastered">Mastered (2x Correct)</option>
              </select>
            </div>
          </div>

          {/* Mistake Items List */}
          <div className="space-y-4">
            {filteredMistakes.length > 0 ? (
              filteredMistakes.map((item) => (
                <Card
                  key={item.id}
                  className={`p-5 transition-all ${
                    item.revisionStatus === 'mastered'
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="blue" size="sm">
                          {item.subjectName}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.topicTitle}
                        </span>
                        <Badge
                          variant={
                            item.revisionStatus === 'mastered'
                              ? 'emerald'
                              : item.revisionStatus === 'in_revision'
                              ? 'amber'
                              : 'rose'
                          }
                          size="sm"
                        >
                          {item.revisionStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {item.consecutiveCorrectCount > 0 && (
                          <span className="text-[11px] text-emerald-400 font-bold">
                            ({item.consecutiveCorrectCount}/2 Consecutive Correct)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          saveMistakeBookItem({ ...item, isBookmarked: !item.isBookmarked })
                        }
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.isBookmarked
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'text-slate-400 hover:text-slate-200 border-slate-800'
                        }`}
                        title="Bookmark for rapid review"
                      >
                        <Bookmark size={14} fill={item.isBookmarked ? 'currentColor' : 'none'} />
                      </button>

                      <button
                        onClick={() => deleteMistakeBookItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Remove from mistake book"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question Text (Bilingual) */}
                  <div className="py-3 space-y-2">
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {item.questionText}
                    </p>
                    {item.questionTextTelugu && (
                      <p className="text-xs text-teal-300 font-sans leading-relaxed">
                        {item.questionTextTelugu}
                      </p>
                    )}
                  </div>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2">
                    {item.options.map((opt) => {
                      const isCorrect = opt.id === item.correctOptionId;
                      const wasSelectedWrong = opt.id === item.lastSelectedOptionId && !isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                              : wasSelectedWrong
                              ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 line-through'
                              : 'bg-slate-800/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isCorrect && <CheckCircle size={14} className="text-emerald-400" />}
                          {wasSelectedWrong && <XCircle size={14} className="text-rose-400" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Verified Curriculum Explanation */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 mt-2 space-y-1">
                    <span className="font-bold text-teal-400 block">Explanation:</span>
                    <p>{item.explanation}</p>
                    {item.explanationTelugu && (
                      <p className="text-slate-400 font-sans mt-1">{item.explanationTelugu}</p>
                    )}
                  </div>

                  {/* Classification & Notes Controls */}
                  <div className="pt-3 border-t border-slate-800/80 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Error Cause:</span>
                      <select
                        value={item.errorCategory}
                        onChange={(e) =>
                          updateMistakeItemClassification(item.id, {
                            errorCategory: e.target.value as MistakeErrorCategory,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                      >
                        <option value="unclassified">Unclassified</option>
                        <option value="knowledge_gap">Knowledge Gap</option>
                        <option value="conceptual_misunderstanding">Conceptual Misunderstanding</option>
                        <option value="careless_error">Careless Error</option>
                        <option value="time_pressure">Time Pressure</option>
                        <option value="misreading_question">Misread Question</option>
                      </select>
                    </div>

                    <div className="flex-1 max-w-md">
                      {editingNotesId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add personal note..."
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] py-1"
                            onClick={() => {
                              updateMistakeItemClassification(item.id, { userNotes: noteDraft });
                              setEditingNotesId(null);
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(item.id);
                            setNoteDraft(item.userNotes || '');
                          }}
                          className="text-slate-400 hover:text-slate-200 cursor-pointer italic truncate"
                        >
                          {item.userNotes ? `Note: "${item.userNotes}"` : '+ Add reflection note...'}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No mistakes match your filter criteria. Keep up the high accuracy!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TIME MANAGEMENT & EFFICIENCY */}
      {/* ========================================================================= */}
      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900 p-5 border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Time Efficiency Score</span>
              <div className="text-3xl font-black text-cyan-400 mt-1">
                {timeEfficiency.timeEfficiencyScore} / 100
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Derived from pacing consistency and avoidance of bottlenecks.
              </p>
            </Card>

            <Card className="bg-slate-900 p-5 border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Correct vs Incorrect Pacing</span>
              <div className="text-base font-bold text-white mt-1">
                Correct: <span className="text-emerald-400">{timeEfficiency.averageTimeCorrectSeconds}s</span> • Incorrect:{' '}
                <span className="text-rose-400">{timeEfficiency.averageTimeIncorrectSeconds}s</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Indicates whether hesitation correlates with incorrect answers.
              </p>
            </Card>

            <Card className="bg-slate-900 p-5 border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Pacing Bottlenecks</span>
              <div className="text-base font-bold text-amber-400 mt-1">
                {timeEfficiency.slowResponsesCount} Slow (&gt;90s) • {timeEfficiency.rapidGuessCount} Rapid Guesses (&lt;20s)
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Rapid guesses answered incorrectly flag rushed attempts.
              </p>
            </Card>
          </div>

          {/* Strategy Guidelines Card */}
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span>APPSC Group 2 Prelims Time Budgeting Guide (150 Mins / 150 Qs)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">Phase 1: First Sweep (0 - 60 min)</span>
                <p>Answer direct factual and straightforward questions in 30-40 seconds. Skip doubtful questions.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-blue-400">Phase 2: Analytical & Mental Ability (60 - 120 min)</span>
                <p>Allocate 60-80 seconds for numerical reasoning, spatial puzzles, and multi-statement polity questions.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400">Phase 3: Review & Doubtful (120 - 150 min)</span>
                <p>Re-evaluate marked-for-review questions. Avoid blind guesses to prevent -0.33 negative marks penalty.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: EXAM READINESS & SCORE PREDICTION */}
      {/* ========================================================================= */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  Calibrated Readiness Score
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl md:text-5xl font-black text-white">
                    {readinessIndicator.readinessScore}
                  </span>
                  <span className="text-slate-500 font-semibold text-lg">/ 100</span>
                  <Badge variant="teal" size="sm" className="ml-2 font-bold">
                    {readinessIndicator.readinessLevel}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-right">
                <span className="text-xs text-slate-400 font-medium">Predicted Prelims Score Band</span>
                <div className="text-xl md:text-2xl font-black text-amber-400 mt-0.5">
                  {readinessIndicator.predictedScoreRange.label}
                </div>
              </div>
            </div>

            {/* 3 Pillars Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Pillar 1: Syllabus Coverage (30%)</span>
                  <span className="text-purple-400 font-bold">{readinessIndicator.syllabusCoverageWeight} / 30</span>
                </div>
                <ProgressBar value={(readinessIndicator.syllabusCoverageWeight / 30) * 100} color="violet" size="sm" showPercent={false} />
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Pillar 2: Tested Accuracy (50%)</span>
                  <span className="text-teal-400 font-bold">{readinessIndicator.accuracyWeight} / 50</span>
                </div>
                <ProgressBar value={(readinessIndicator.accuracyWeight / 50) * 100} color="teal" size="sm" showPercent={false} />
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Pillar 3: Score Consistency (20%)</span>
                  <span className="text-blue-400 font-bold">{readinessIndicator.consistencyWeight} / 20</span>
                </div>
                <ProgressBar value={(readinessIndicator.consistencyWeight / 20) * 100} color="blue" size="sm" showPercent={false} />
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              {readinessIndicator.explanation}
            </p>
          </Card>

          {/* Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Verified Strengths to Preserve</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {personalizedRecommendations.strongPoints.map((sp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{sp}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" />
                <span>Top Revision Priorities</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {personalizedRecommendations.top3Weaknesses.map((wt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">{wt.topicTitle}</strong> (Accuracy: {wt.accuracy}%)
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: HISTORICAL TEST FORENSICS & SIDE-BY-SIDE ATTEMPT COMPARISON */}
      {/* ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <GitCompare size={18} className="text-blue-400" />
              <span>Side-by-Side Test Attempt Comparison</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Select Baseline Attempt (Attempt A):
                </label>
                <select
                  value={compareAttemptAId}
                  onChange={(e) => setCompareAttemptAId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {testAttempts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.testTitle} ({a.completedAt ? a.completedAt.split('T')[0] : a.startedAt.split('T')[0]}) - Score: {a.score.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Select Comparison Attempt (Attempt B):
                </label>
                <select
                  value={compareAttemptBId}
                  onChange={(e) => setCompareAttemptBId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {testAttempts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.testTitle} ({a.completedAt ? a.completedAt.split('T')[0] : a.startedAt.split('T')[0]}) - Score: {a.score.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Results Card */}
            {comparisonResult && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                    <span className="text-xs text-slate-400">Score Delta</span>
                    <div
                      className={`text-xl font-black mt-1 ${
                        comparisonResult.scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {comparisonResult.scoreDelta >= 0 ? `+${comparisonResult.scoreDelta}` : comparisonResult.scoreDelta}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                    <span className="text-xs text-slate-400">Accuracy Delta</span>
                    <div
                      className={`text-xl font-black mt-1 ${
                        comparisonResult.accuracyDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {comparisonResult.accuracyDelta >= 0
                        ? `+${comparisonResult.accuracyDelta}%`
                        : `${comparisonResult.accuracyDelta}%`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                    <span className="text-xs text-slate-400">Time Delta</span>
                    <div className="text-xl font-black text-cyan-400 mt-1">
                      {comparisonResult.timeDeltaSeconds > 0
                        ? `+${Math.round(comparisonResult.timeDeltaSeconds / 60)}m`
                        : `${Math.round(comparisonResult.timeDeltaSeconds / 60)}m`}
                    </div>
                  </div>
                </div>

                {/* Topic by Topic Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Topic Title</th>
                        <th className="py-2.5 px-3">Attempt A (Score)</th>
                        <th className="py-2.5 px-3">Attempt B (Score)</th>
                        <th className="py-2.5 px-3 text-right">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {comparisonResult.topicComparison.map((tc, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2 px-3 text-white font-medium">{tc.topicTitle}</td>
                          <td className="py-2 px-3 text-slate-300">{tc.attemptAScore.toFixed(2)}</td>
                          <td className="py-2 px-3 text-slate-300">{tc.attemptBScore.toFixed(2)}</td>
                          <td
                            className={`py-2 px-3 text-right font-bold ${
                              tc.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tc.delta >= 0 ? `+${tc.delta.toFixed(2)}` : tc.delta.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
