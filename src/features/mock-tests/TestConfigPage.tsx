import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  Play,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TestBlueprint, QuestionDifficulty } from '../../types/questionBank';

export const TestConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, topics, bankQuestions, testBlueprints, saveTestBlueprint, saveMockTest } = useStudyVerse();

  const [title, setTitle] = useState('Custom APPSC Practice Drill');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || 'sub-appsc-1');
  const [questionCount, setQuestionCount] = useState(30);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [negativeMarks, setNegativeMarks] = useState(0.33);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('moderate');
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  // Available topics for selected subject
  const availableTopics = useMemo(() => {
    return topics.filter((t) => t.subjectId === selectedSubjectId);
  }, [topics, selectedSubjectId]);

  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');

  const handleLaunchCustomTest = (e: React.FormEvent) => {
    e.preventDefault();

    // Assemble questions
    let candidateQuestions = bankQuestions.filter(
      (q) => q.subjectId === selectedSubjectId
    );

    if (selectedTopicId !== 'all') {
      candidateQuestions = candidateQuestions.filter((q) => q.topicId === selectedTopicId);
    }

    if (candidateQuestions.length === 0) {
      candidateQuestions = bankQuestions;
    }

    const testId = `test-custom-${Date.now()}`;
    const selectedQList = candidateQuestions.slice(0, questionCount).map((bq, idx) => ({
      id: `cq-${testId}-${idx}`,
      testId,
      questionNumber: idx + 1,
      questionText: bq.questionText,
      questionTextTelugu: bq.questionTextTelugu,
      options: bq.options,
      correctOptionId: typeof bq.correctAnswer === 'string' ? bq.correctAnswer : 'opt-1',
      explanation: bq.explanation,
      marks: 1.0,
      negativeMarks,
      topicId: bq.topicId,
      track: 'appsc-prelims' as const,
      difficulty: 'moderate' as const,
    }));

    saveMockTest({
      id: testId,
      title: title.trim(),
      description: `Custom mock test configured for ${title.trim()}`,
      track: 'appsc-prelims',
      durationMinutes,
      totalMarks: selectedQList.length,
      marksPerQuestion: 1.0,
      negativeMarks,
      subjectId: selectedSubjectId,
      isCustom: true,
      isBlueprintGenerated: true,
      createdAt: new Date().toISOString(),
      questions: selectedQList,
    });

    navigate(`/exam/${testId}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/mock-tests')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Mock Test Library</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Blueprint Studio
          </span>
          <Badge variant="emerald">Configurable Engine</Badge>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
          Test Configuration & Assembler
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Configure duration, negative marking, subject weights, and question quotas to generate on-demand custom examination sets.
        </p>
      </div>

      <form onSubmit={handleLaunchCustomTest} className="space-y-6">
        <Card className="bg-[#101726] border-slate-800 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-blue-400" />
              <CardTitle className="text-sm">Exam Parameters & Subject Target</CardTitle>
            </div>
          </CardHeader>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Test Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Subject (9 APPSC Subjects)</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTopicId('all');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {subjects.slice(0, 9).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Curriculum Topic Scope</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Topics (Full Subject Scope)</option>
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Questions Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => {
                    const cnt = Number(e.target.value);
                    setQuestionCount(cnt);
                    setDurationMinutes(cnt); // 1 min per question default
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={15}>15 Questions (Micro-Quiz)</option>
                  <option value={30}>30 Questions (Official Subject Section)</option>
                  <option value={50}>50 Questions (Mega Sectional)</option>
                  <option value={150}>150 Questions (Full Screening Simulation)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Negative Marking Penalty</label>
                <select
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={0.33}>-0.33 Marks (Official APPSC Standard)</option>
                  <option value={0.25}>-0.25 Marks (Standard Objective)</option>
                  <option value={0}>No Negative Marking (Practice Mode)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Difficulty Distribution</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="easy">Easy (Foundational & Definitions)</option>
                  <option value="moderate">Moderate (Standard Examination)</option>
                  <option value="difficult">Difficult (Assertion-Reason & Tricky)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Language Presentation</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="en">English Medium</option>
                  <option value="te">Telugu Medium (Bilingual Support)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/mock-tests')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Play size={16} />}
            >
              Assemble & Start Examination
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
