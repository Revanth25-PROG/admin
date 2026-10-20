import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { TestAttempt } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const TestHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { testAttempts, mockTests } = useStudyVerse();

  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'all' | 'appsc-prelims' | 'appsc-mains' | 'semester'>('all');

  const filteredAttempts = useMemo(() => {
    return testAttempts.filter((att) => {
      const matchTrack = trackFilter === 'all' || att.track === trackFilter;
      const matchSearch =
        !searchQuery ||
        att.testTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTrack && matchSearch;
    });
  }, [testAttempts, trackFilter, searchQuery]);

  // Overall totals
  const totalAttempted = testAttempts.length;
  const avgScore = totalAttempted > 0
    ? (testAttempts.reduce((acc, a) => acc + a.score, 0) / totalAttempted).toFixed(1)
    : '0';
  const avgAccuracy = totalAttempted > 0
    ? Math.round(testAttempts.reduce((acc, a) => acc + a.accuracy, 0) / totalAttempted)
    : 0;
  const bestScore = totalAttempted > 0
    ? Math.max(...testAttempts.map((a) => a.score)).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Examination Records
            </span>
            <Badge variant="emerald">{totalAttempted} Completed Sessions</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Test Attempt History & Scores
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Audit your past examination attempts, inspect answer evaluations, and track your score progression over time.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Play size={16} />}
          onClick={() => navigate('/mock-tests')}
        >
          Take New Test
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Tests Taken</span>
          <span className="text-xl md:text-2xl font-black text-white">{totalAttempted}</span>
          <span className="text-[10px] text-blue-400 ml-1">Across all tracks</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Average Score</span>
          <span className="text-xl md:text-2xl font-black text-emerald-400">{avgScore}</span>
          <span className="text-[10px] text-slate-500 ml-1">Marks</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Average Accuracy</span>
          <span className="text-xl md:text-2xl font-black text-blue-400">{avgAccuracy}%</span>
          <span className="text-[10px] text-slate-500 ml-1">Correct / Attempted</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Personal Best</span>
          <span className="text-xl md:text-2xl font-black text-amber-400">{bestScore}</span>
          <span className="text-[10px] text-amber-400/80 ml-1">Peak Marks</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed tests by title..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Tracks</option>
            <option value="appsc-prelims">APPSC Prelims</option>
            <option value="appsc-mains">APPSC Mains</option>
            <option value="semester">Semester M.Tech</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-3">
        {filteredAttempts.length === 0 ? (
          <EmptyState
            icon={<Award size={24} />}
            title="No test attempts recorded yet"
            description="Take your first mock test or practice quiz from the Mock Test Centre to record your scores."
            actionLabel="Launch a Mock Test"
            onAction={() => navigate('/mock-tests')}
          />
        ) : (
          filteredAttempts.map((attempt) => {
            const formattedDate = attempt.completedAt
              ? new Date(attempt.completedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Completed';

            const timeMins = Math.round((attempt.timeSpentSeconds || 0) / 60);

            return (
              <Card key={attempt.id} className="bg-[#101726] border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {attempt.track.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar size={12} /> {formattedDate}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={12} /> {timeMins} min
                      </span>
                    </div>

                    <h2 className="text-sm md:text-base font-bold text-white">
                      {attempt.testTitle}
                    </h2>

                    {/* Breakdown counts */}
                    <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> {attempt.correctCount} Correct
                      </span>
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle size={13} /> {attempt.incorrectCount} Incorrect
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        {attempt.unansweredCount} Unanswered
                      </span>
                    </div>
                  </div>

                  {/* Score & Action Pill */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Score Obtained</div>
                      <div className="text-lg font-black text-emerald-400 font-mono">
                        {attempt.score.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          / {attempt.totalPossibleMarks}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-blue-400">
                        {attempt.accuracy.toFixed(1)}% Accuracy
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => navigate(`/mock-tests`)}
                      >
                        Review Test
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
