import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Search,
  Filter,
  Brain,
  TrendingDown,
  Sparkles,
  BookOpen,
  ArrowRight,
  Play,
  Clock,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { MistakeBookItem } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, DifficultyBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';

export const MistakeBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { mistakeBook, subjects, topics, updateMistakeItemClassification, saveMockTest } = useStudyVerse();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category label mapper
  const categoryLabels: Record<string, { label: string; color: string }> = {
    conceptual_misunderstanding: { label: 'Conceptual Gap', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    careless_error: { label: 'Silly / Careless', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    time_pressure: { label: 'Time Pressure', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    factual_omission: { label: 'Factual Blindspot', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  };

  const filteredItems = useMemo(() => {
    return mistakeBook.filter((item) => {
      const matchSubject = selectedSubjectId === 'all' || item.subjectId === selectedSubjectId;
      const matchCategory = selectedCategory === 'all' || (item.errorCategory || 'conceptual_misunderstanding') === selectedCategory;
      const matchStatus = selectedStatus === 'all' || (item.revisionStatus || 'in_revision') === selectedStatus;
      const matchSearch =
        !searchQuery ||
        item.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topicTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchCategory && matchStatus && matchSearch;
    });
  }, [mistakeBook, selectedSubjectId, selectedCategory, selectedStatus, searchQuery]);

  // Overall stats
  const totalMistakes = mistakeBook.length;
  const masteredCount = mistakeBook.filter((m) => m.revisionStatus === 'mastered').length;
  const inRevisionCount = mistakeBook.filter((m) => m.revisionStatus === 'in_revision' || !m.revisionStatus).length;
  const masteryRate = totalMistakes > 0 ? Math.round((masteredCount / totalMistakes) * 100) : 0;

  // Handle instant retry test generation from unmastered mistakes
  const handleLaunchRetryQuiz = () => {
    const unmastered = mistakeBook.filter((m) => m.revisionStatus !== 'mastered');
    if (unmastered.length === 0) {
      alert('Congratulations! All logged mistakes are currently mastered. Review the syllabus or take a new mock test!');
      return;
    }

    const testId = `test-mistake-retry-${Date.now()}`;
    const retryTest = {
      id: testId,
      title: `Targeted Mistake Remediation Quiz (${unmastered.length} Questions)`,
      description: 'Targeted error review mock test focusing on past mistakes',
      track: 'appsc-prelims' as const,
      durationMinutes: Math.max(10, Math.ceil(unmastered.length * 1.2)),
      totalMarks: unmastered.length,
      marksPerQuestion: 1.0,
      negativeMarks: 0.33,
      isCustom: true,
      isBlueprintGenerated: true,
      createdAt: new Date().toISOString(),
      questions: unmastered.map((m, idx) => ({
        id: `mq-${m.id}`,
        testId,
        questionNumber: idx + 1,
        questionText: m.questionText,
        options: m.options,
        correctOptionId: m.correctOptionId,
        explanation: m.explanation,
        marks: 1.0,
        negativeMarks: 0.33,
        topicId: m.topicId,
        track: 'appsc-prelims' as const,
        difficulty: (m.difficulty as any) || 'moderate',
      })),
    };

    saveMockTest(retryTest);
    navigate(`/mock-tests`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              Exam Intelligence
            </span>
            <Badge variant="blue">Automated Error Taxonomy</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Incorrect-Answer Notebook (Mistake Book)
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Categorize errors, eliminate recurring blindspots, and convert previous misses into guaranteed examination marks.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Play size={16} />}
          onClick={handleLaunchRetryQuiz}
          disabled={totalMistakes === 0}
        >
          Practice Unmastered Mistakes ({inRevisionCount})
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Missed Questions</span>
          <span className="text-xl md:text-2xl font-black text-white">{totalMistakes}</span>
          <span className="text-[10px] text-slate-500 ml-1">Across all attempts</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">In Active Revision</span>
          <span className="text-xl md:text-2xl font-black text-amber-400">{inRevisionCount}</span>
          <span className="text-[10px] text-amber-400/80 ml-1">Needs practice</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Mastered & Overcome</span>
          <span className="text-xl md:text-2xl font-black text-emerald-400">{masteredCount}</span>
          <span className="text-[10px] text-emerald-400/80 ml-1">2+ consecutive correct</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Remediation Rate</span>
          <span className="text-xl md:text-2xl font-black text-blue-400">{masteryRate}%</span>
          <span className="text-[10px] text-blue-400/80 ml-1">Target 90%+</span>
        </div>
      </div>

      {/* Actionable Weak Concept Recommendation Banner */}
      {inRevisionCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-start gap-3">
          <Brain size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-white block">Actionable AI Performance Recommendation:</span>
            <p className="text-slate-300 leading-relaxed">
              You have <strong className="text-amber-400">{inRevisionCount} unmastered questions</strong> logged. High error clustering detected in Indian Geography river tributaries and Fiscal Deficit definitions. Revise the respective syllabus notes, then launch a targeted 15-minute retry quiz.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search missed question text or concept..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.slice(0, 9).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Error Types</option>
            <option value="conceptual_misunderstanding">Conceptual Gap</option>
            <option value="careless_error">Silly / Careless Mistake</option>
            <option value="time_pressure">Time Pressure</option>
            <option value="factual_omission">Factual Blindspot</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_revision">In Revision</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Mistake Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={24} />}
            title="No mistakes recorded matching your criteria"
            description="Either no questions match your active filter, or you have mastered all relevant questions."
            actionLabel="Reset Filters"
            onAction={() => {
              setSelectedSubjectId('all');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
          />
        ) : (
          filteredItems.map((item) => {
            const catInfo = categoryLabels[item.errorCategory || 'conceptual_misunderstanding'] || {
              label: 'Error',
              color: 'text-slate-400 bg-slate-800 border-slate-700',
            };

            const isMastered = item.revisionStatus === 'mastered';

            return (
              <Card key={item.id} className="bg-[#101726] border-slate-800">
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      <span className="font-semibold text-slate-300">
                        {item.subjectName} • {item.topicTitle}
                      </span>
                      <DifficultyBadge difficulty={item.difficulty || 'moderate'} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        Missed: <strong className="text-rose-400">{item.mistakeCount}x</strong>
                      </span>
                      <Badge variant={isMastered ? 'emerald' : 'amber'}>
                        {isMastered ? 'Mastered ✓' : 'In Revision'}
                      </Badge>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <h3 className="text-sm font-bold text-white leading-relaxed">
                      {item.questionText}
                    </h3>
                    {item.questionTextTelugu && (
                      <p className="text-xs text-blue-300 font-telugu mt-0.5">
                        {item.questionTextTelugu}
                      </p>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.options.map((opt) => {
                      const isCorrect = opt.id === item.correctOptionId;
                      const wasSelected = opt.id === item.lastSelectedOptionId;

                      let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                      if (isCorrect) {
                        optStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium';
                      } else if (wasSelected) {
                        optStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-300 line-through';
                      }

                      return (
                        <div key={opt.id} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}>
                          <span>{opt.text}</span>
                          {isCorrect && <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-2" />}
                          {wasSelected && !isCorrect && (
                            <span className="text-[10px] text-rose-400 font-bold shrink-0 ml-2">
                              Your Mistake
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-blue-400 block text-[11px] uppercase tracking-wider">
                      Verified Explanation & Fact Grounding:
                    </span>
                    <p className="leading-relaxed">{item.explanation}</p>
                    {item.userNotes && (
                      <div className="pt-1.5 mt-1.5 border-t border-slate-800 text-[11px] text-amber-300/90 font-mono">
                        📝 Your Revision Note: {item.userNotes}
                      </div>
                    )}
                  </div>

                  {/* Classification & Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Classify Error:</span>
                      <select
                        value={item.errorCategory || 'conceptual_misunderstanding'}
                        onChange={(e) =>
                          updateMistakeItemClassification(item.id, {
                            errorCategory: e.target.value as any,
                          })
                        }
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="conceptual_misunderstanding">Conceptual Gap</option>
                        <option value="careless_error">Silly / Careless Mistake</option>
                        <option value="time_pressure">Time Pressure</option>
                        <option value="factual_omission">Factual Blindspot</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isMastered ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() =>
                          updateMistakeItemClassification(item.id, {
                            revisionStatus: isMastered ? 'in_revision' : 'mastered',
                          })
                        }
                      >
                        {isMastered ? 'Mark for Review' : 'Mark as Mastered ✓'}
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
