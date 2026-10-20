import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { evaluateTestAttempt, AnswerSubmission } from '../../services/mockTestEngine';

export const LiveExamPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { mockTests, topics, saveTestAttempt } = useStudyVerse();

  const activeTest = useMemo(() => {
    return mockTests.find((t) => t.id === testId) || mockTests[0];
  }, [mockTests, testId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState<Record<string, AnswerSubmission>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize or restore attempt
  useEffect(() => {
    if (activeTest) {
      setSecondsRemaining(activeTest.durationMinutes * 60);
      setCurrentIndex(0);
      setSubmissions({});
      setIsSubmitted(false);
    }
  }, [activeTest]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, secondsRemaining]);

  const currentQuestion = activeTest?.questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (!currentQuestion) return;
    setSubmissions((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOptionId: optId,
        isMarkedForReview: prev[currentQuestion.id]?.isMarkedForReview || false,
        timeSpentSeconds: (prev[currentQuestion.id]?.timeSpentSeconds || 0) + 1,
      },
    }));
  };

  const handleToggleReview = () => {
    if (!currentQuestion) return;
    setSubmissions((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOptionId: prev[currentQuestion.id]?.selectedOptionId,
        isMarkedForReview: !prev[currentQuestion.id]?.isMarkedForReview,
        timeSpentSeconds: prev[currentQuestion.id]?.timeSpentSeconds || 0,
      },
    }));
  };

  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    setSubmissions((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const handleSubmitExam = () => {
    if (!activeTest) return;
    const startTimeStr = new Date(Date.now() - (activeTest.durationMinutes * 60 - secondsRemaining) * 1000).toISOString();
    const evaluation = evaluateTestAttempt(activeTest, submissions, startTimeStr, new Date().toISOString(), topics);
    saveTestAttempt(evaluation.attempt);
    setIsSubmitted(true);
    alert(`Exam submitted successfully! Score: ${evaluation.attempt.score.toFixed(2)} / ${evaluation.attempt.totalPossibleMarks}`);
    navigate('/mock-tests');
  };

  if (!activeTest || !currentQuestion) {
    return (
      <div className="p-8 text-center text-white">
        <h2>Loading Examination Session...</h2>
      </div>
    );
  }

  const answeredCount = Object.keys(submissions).filter((k) => submissions[k]?.selectedOptionId).length;
  const markedReviewCount = Object.keys(submissions).filter((k) => submissions[k]?.isMarkedForReview).length;
  const unansweredCount = activeTest.questions.length - answeredCount;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col fixed inset-0 z-50 overflow-y-auto">
      {/* Distraction-Free Header */}
      <header className="px-6 py-3 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-md">
              {activeTest.title}
            </h1>
            <span className="text-[10px] text-slate-400">
              Question {currentIndex + 1} of {activeTest.questions.length} • APPSC Exam Mode
            </span>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700">
            <Clock size={16} className={secondsRemaining < 300 ? 'text-rose-400 animate-bounce' : 'text-amber-400'} />
            <span className={`font-mono text-sm font-bold ${secondsRemaining < 300 ? 'text-rose-400' : 'text-white'}`}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to finalize and submit this examination?')) {
                handleSubmitExam();
              }
            }}
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Exam Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left: Active Question Canvas (9 cols) */}
        <div className="lg:col-span-9 p-6 flex flex-col justify-between overflow-y-auto border-r border-slate-800">
          <div className="space-y-6 max-w-4xl">
            {/* Question Header Bar */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800 text-slate-400">
              <span className="font-bold text-blue-400 text-sm">
                Question #{currentIndex + 1}
              </span>
              <div className="flex items-center gap-3">
                <span>Marks: <strong className="text-emerald-400">+{activeTest.marksPerQuestion}</strong></span>
                <span>Negative: <strong className="text-rose-400">-{activeTest.negativeMarks}</strong></span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.questionText}
              </h2>
              {currentQuestion.questionTextTelugu && (
                <p className="text-sm text-blue-300 font-telugu leading-relaxed">
                  {currentQuestion.questionTextTelugu}
                </p>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = submissions[currentQuestion.id]?.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border text-sm flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-md shadow-blue-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {['A', 'B', 'C', 'D'][idx] || idx + 1}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Button
                variant={submissions[currentQuestion.id]?.isMarkedForReview ? 'secondary' : 'outline'}
                size="sm"
                icon={<Flag size={14} />}
                onClick={handleToggleReview}
              >
                {submissions[currentQuestion.id]?.isMarkedForReview ? 'Marked for Review ✓' : 'Mark for Review'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAnswer}
                disabled={!submissions[currentQuestion.id]?.selectedOptionId}
                className="text-slate-400 hover:text-white"
              >
                Clear Response
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                icon={<ArrowLeft size={14} />}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={currentIndex === activeTest.questions.length - 1}
                icon={<ArrowRight size={14} />}
                onClick={() => setCurrentIndex((prev) => Math.min(activeTest.questions.length - 1, prev + 1))}
              >
                Save & Next
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Question Navigation Palette (3 cols) */}
        <div className="lg:col-span-3 p-5 bg-[#0a0f18] overflow-y-auto space-y-5">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Review ({markedReviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-blue-400" />
              <span>Current Item</span>
            </div>
          </div>

          {/* Palette Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {activeTest.questions.map((q, idx) => {
                const sub = submissions[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(sub?.selectedOptionId);
                const isReview = Boolean(sub?.isMarkedForReview);

                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700';
                if (isReview) {
                  btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm';
                }

                if (isCurrent) {
                  btnStyle += ' ring-2 ring-white ring-offset-1 ring-offset-slate-950';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
