import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  Award,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Bookmark,
  Plus,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Check,
  RefreshCw,
  Pause,
  ArrowRight,
  FileText,
  Layers,
  ShieldCheck,
  Eye,
  BarChart2,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Sliders,
  Flag,
  FileSpreadsheet,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import {
  MockTest,
  MockQuestion,
  TestAttempt,
  Subject,
  SyllabusTopic,
} from '../../types';
import {
  BankQuestionItem,
  GenerationJob,
  TestBlueprint,
  QuestionDifficulty,
  QuestionType,
  ValidationStatus,
} from '../../types/questionBank';
import {
  evaluateTestAttempt,
  assembleTestFromBlueprint,
  createRetryTestForIncorrect,
  AnswerSubmission,
} from '../../services/mockTestEngine';
import {
  calculateTopicTargetStats,
  calculateSubjectTargetStats,
  generateQuestionBatch,
  validateQuestion,
  exportQuestionsToJson,
  exportQuestionsToCsv,
  parseQuestionsFromJson,
  getSampleCsvTemplate,
} from '../../services/questionBankEngine';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Badge, DifficultyBadge, StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const EXAM_RECOVERY_KEY = 'STUDYVERSE_ACTIVE_EXAM_ATTEMPT';

export const MockTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    mockTests,
    testAttempts,
    topics,
    subjects,
    bankQuestions,
    generationJobs,
    testBlueprints,
    saveMockTest,
    saveTestAttempt,
    saveRevisionItem,
    saveBankQuestion,
    saveBankQuestions,
    deleteBankQuestion,
    bulkApproveQuestions,
    bulkRejectQuestions,
    saveGenerationJob,
    updateGenerationJob,
    saveTestBlueprint,
    deleteTestBlueprint,
    updateTopicQuestionTarget,
  } = useStudyVerse();

  // Navigation tab: 'tests' | 'bank' | 'generation' | 'blueprints'
  const [activeTab, setActiveTab] = useState<'tests' | 'bank' | 'generation' | 'blueprints'>('tests');

  // ----------------------------------------------------
  // EXAM RUNNER & ROOM STATE
  // ----------------------------------------------------
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissions, setSubmissions] = useState<Record<string, AnswerSubmission>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testStartTime, setTestStartTime] = useState<string>('');
  const [questionTimeTracking, setQuestionTimeTracking] = useState<Record<string, number>>({});

  // Result / Review State
  const [lastAttempt, setLastAttempt] = useState<TestAttempt | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // ----------------------------------------------------
  // QUESTION BANK STATE
  // ----------------------------------------------------
  const [bankSubjectFilter, setBankSubjectFilter] = useState<string>('all');
  const [bankTopicFilter, setBankTopicFilter] = useState<string>('all');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState<string>('all');
  const [bankTypeFilter, setBankTypeFilter] = useState<string>('all');
  const [bankStatusFilter, setBankStatusFilter] = useState<string>('all');
  const [bankSearchQuery, setBankSearchQuery] = useState<string>('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Add Question Modal State
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [newQSubjectId, setNewQSubjectId] = useState<string>('');
  const [newQTopicId, setNewQTopicId] = useState<string>('');
  const [newQText, setNewQText] = useState<string>('');
  const [newQTextTelugu, setNewQTextTelugu] = useState<string>('');
  const [newQType, setNewQType] = useState<QuestionType>('single_correct');
  const [newQDifficulty, setNewQDifficulty] = useState<QuestionDifficulty>('moderate');
  const [newQOpt1, setNewQOpt1] = useState('');
  const [newQOpt2, setNewQOpt2] = useState('');
  const [newQOpt3, setNewQOpt3] = useState('');
  const [newQOpt4, setNewQOpt4] = useState('');
  const [newQCorrectOpt, setNewQCorrectOpt] = useState('opt-1');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQExplanationTelugu, setNewQExplanationTelugu] = useState('');
  const [newQSourceRef, setNewQSourceRef] = useState('');

  // ----------------------------------------------------
  // AI GENERATION JOB STATE
  // ----------------------------------------------------
  const [genSubjectId, setGenSubjectId] = useState<string>(subjects[0]?.id || '');
  const [genTopicId, setGenTopicId] = useState<string>('');
  const [genBatchSize, setGenBatchSize] = useState<number>(15);
  const [genDifficultyMix, setGenDifficultyMix] = useState<QuestionDifficulty>('moderate');
  const [isStartingJob, setIsStartingJob] = useState(false);

  // ----------------------------------------------------
  // TEST BLUEPRINT ASSEMBLER STATE
  // ----------------------------------------------------
  const [isCreateBlueprintOpen, setIsCreateBlueprintOpen] = useState(false);
  const [bpTitle, setBpTitle] = useState('');
  const [bpDescription, setBpDescription] = useState('');
  const [bpTrack, setBpTrack] = useState<'appsc-prelims' | 'appsc-mains' | 'semester'>('appsc-prelims');
  const [bpQuestionCount, setBpQuestionCount] = useState(50);
  const [bpDurationMinutes, setBpDurationMinutes] = useState(50);
  const [bpMarksPerQuestion, setBpMarksPerQuestion] = useState(1.0);
  const [bpNegativeMarks, setBpNegativeMarks] = useState(0.33);
  const [bpSelectedSubjects, setBpSelectedSubjects] = useState<string[]>([]);

  // ----------------------------------------------------
  // TOPIC QUESTION TARGET MODAL
  // ----------------------------------------------------
  const [editingTargetTopic, setEditingTargetTopic] = useState<SyllabusTopic | null>(null);
  const [newTargetValue, setNewTargetValue] = useState<number>(500);

  // ----------------------------------------------------
  // PERSISTENCE & AUTOSAVE EFFECT FOR EXAM ROOM
  // ----------------------------------------------------
  // Restore running exam from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EXAM_RECOVERY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.activeTest && parsed.isTestRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - parsed.savedAt) / 1000);
          const remaining = Math.max(0, parsed.secondsRemaining - elapsed);
          setActiveTest(parsed.activeTest);
          setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          setSubmissions(parsed.submissions || {});
          setTestStartTime(parsed.testStartTime || new Date().toISOString());
          setSecondsRemaining(remaining);
          setIsTestRunning(remaining > 0);
        }
      }
    } catch (e) {
      console.warn('Failed to recover exam attempt', e);
    }
  }, []);

  // Save current exam progress periodically
  useEffect(() => {
    if (isTestRunning && activeTest) {
      const stateToSave = {
        activeTest,
        currentQuestionIndex,
        submissions,
        secondsRemaining,
        testStartTime,
        isTestRunning,
        savedAt: Date.now(),
      };
      localStorage.setItem(EXAM_RECOVERY_KEY, JSON.stringify(stateToSave));
    } else {
      localStorage.removeItem(EXAM_RECOVERY_KEY);
    }
  }, [isTestRunning, activeTest, currentQuestionIndex, submissions, secondsRemaining, testStartTime]);

  // Exam timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTestRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });

        // Track time spent on current question
        if (activeTest && activeTest.questions[currentQuestionIndex]) {
          const qId = activeTest.questions[currentQuestionIndex].id;
          setQuestionTimeTracking((prev) => ({
            ...prev,
            [qId]: (prev[qId] || 0) + 1,
          }));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestRunning, secondsRemaining, currentQuestionIndex, activeTest]);

  // ----------------------------------------------------
  // TEST CONTROL HANDLERS
  // ----------------------------------------------------
  const handleStartTest = (test: MockTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(test.durationMinutes * 60);
    setIsTestRunning(true);
    setTestStartTime(new Date().toISOString());
    setIsReviewMode(false);
    setLastAttempt(null);
    setQuestionTimeTracking({});

    // Initialize blank submissions
    const initial: Record<string, AnswerSubmission> = {};
    test.questions.forEach((q) => {
      initial[q.id] = {
        questionId: q.id,
        selectedOptionId: undefined,
        isMarkedForReview: false,
        timeSpentSeconds: 0,
      };
    });
    setSubmissions(initial);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSubmissions((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        selectedOptionId: optionId,
        timeSpentSeconds: (prev[questionId]?.timeSpentSeconds || 0) + (questionTimeTracking[questionId] || 0),
      },
    }));
  };

  const handleClearResponse = (questionId: string) => {
    setSubmissions((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: undefined,
      },
    }));
  };

  const handleToggleMarkForReview = (questionId: string) => {
    setSubmissions((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isMarkedForReview: !prev[questionId]?.isMarkedForReview,
      },
    }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;
    setIsTestRunning(false);

    // Merge tracked time
    const finalSubmissions: Record<string, AnswerSubmission> = {};
    Object.keys(submissions).forEach((qId) => {
      finalSubmissions[qId] = {
        ...submissions[qId],
        timeSpentSeconds: (submissions[qId]?.timeSpentSeconds || 0) + (questionTimeTracking[qId] || 0),
      };
    });

    const completedAt = new Date().toISOString();
    const { attempt } = evaluateTestAttempt(activeTest, finalSubmissions, testStartTime, completedAt, topics);
    saveTestAttempt(attempt);
    setLastAttempt(attempt);
    setIsReviewMode(true);
    localStorage.removeItem(EXAM_RECOVERY_KEY);
  };

  // ----------------------------------------------------
  // BLUEPRINT ASSEMBLY HANDLER
  // ----------------------------------------------------
  const handleLaunchBlueprint = (blueprint: TestBlueprint) => {
    const { test, warnings, shortage } = assembleTestFromBlueprint(
      blueprint,
      bankQuestions,
      topics
    );

    if (shortage) {
      alert(`Note: Assembled with available questions (${test.questions.length}/${blueprint.questionCount}). Please generate more questions to reach full blueprint size.`);
    }

    saveMockTest(test);
    handleStartTest(test);
  };

  // ----------------------------------------------------
  // RETRY INCORRECT QUESTIONS
  // ----------------------------------------------------
  const handleRetryIncorrect = () => {
    if (!lastAttempt || !activeTest) return;
    const retryTest = createRetryTestForIncorrect(activeTest, lastAttempt);
    if (!retryTest) {
      alert('Congratulations! You scored 100% correct. No incorrect questions to retry.');
      return;
    }
    saveMockTest(retryTest);
    handleStartTest(retryTest);
  };

  // ----------------------------------------------------
  // AI GENERATION JOB DISPATCHER
  // ----------------------------------------------------
  const handleTriggerGenerationJob = () => {
    if (!genSubjectId) {
      alert('Please select a subject.');
      return;
    }

    const targetTopic = topics.find((t) => t.id === genTopicId) || topics.find((t) => t.subjectId === genSubjectId);
    if (!targetTopic) {
      alert('Please select a topic.');
      return;
    }

    setIsStartingJob(true);

    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      title: `Batch gen for ${targetTopic.title}`,
      examTrack: targetTopic.track,
      subjectId: genSubjectId,
      topicId: targetTopic.id,
      batchSize: genBatchSize,
      targetQuestions: genBatchSize,
      targetQuestionCount: genBatchSize,
      generatedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      status: 'running',
      progressPercent: 20,
      difficultyMix: {
        easy: 20,
        moderate: 45,
        difficult: 25,
        very_difficult: 10,
        exam_tricky: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveGenerationJob(newJob);

    // Run generation pipeline asynchronously
    setTimeout(() => {
      const generated = generateQuestionBatch(
        genSubjectId,
        targetTopic.id,
        targetTopic.title,
        genBatchSize,
        genDifficultyMix
      );

      // Validate & detect duplicates
      const validatedList: BankQuestionItem[] = [];
      let dupCount = 0;

      generated.forEach((q) => {
        const val = validateQuestion(q, bankQuestions);
        if (!val.isDuplicate) {
          validatedList.push({
            ...q,
            validationStatus: val.isValid ? 'approved' : 'pending_review',
            publicationStatus: val.isValid ? 'published' : 'draft',
          });
        } else {
          dupCount++;
        }
      });

      saveBankQuestions(validatedList);

      updateGenerationJob(newJob.id, {
        status: 'completed',
        progressPercent: 100,
        generatedCount: generated.length,
        approvedCount: validatedList.filter((q) => q.validationStatus === 'approved').length,
        rejectedCount: dupCount,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setIsStartingJob(false);
      alert(`Batch generation complete! Generated ${validatedList.length} verified questions for "${targetTopic.title}". (${dupCount} duplicate fingerprints prevented)`);
    }, 1200);
  };

  // ----------------------------------------------------
  // QUESTION BANK FILTERS & SELECTION
  // ----------------------------------------------------
  const filteredBankQuestions = useMemo(() => {
    return bankQuestions.filter((q) => {
      if (bankSubjectFilter !== 'all' && q.subjectId !== bankSubjectFilter) return false;
      if (bankTopicFilter !== 'all' && q.topicId !== bankTopicFilter) return false;
      if (bankDifficultyFilter !== 'all' && q.difficulty !== bankDifficultyFilter) return false;
      if (bankTypeFilter !== 'all' && q.questionType !== bankTypeFilter) return false;
      if (bankStatusFilter !== 'all' && q.validationStatus !== bankStatusFilter) return false;

      if (bankSearchQuery.trim()) {
        const query = bankSearchQuery.toLowerCase();
        const matchText = q.questionText.toLowerCase().includes(query);
        const matchTel = q.questionTextTelugu?.toLowerCase().includes(query) || false;
        const matchSource = q.sourceReference?.toLowerCase().includes(query) || false;
        if (!matchText && !matchTel && !matchSource) return false;
      }

      return true;
    });
  }, [
    bankQuestions,
    bankSubjectFilter,
    bankTopicFilter,
    bankDifficultyFilter,
    bankTypeFilter,
    bankStatusFilter,
    bankSearchQuery,
  ]);

  const toggleSelectAllVisible = () => {
    if (selectedQuestionIds.size === filteredBankQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredBankQuestions.map((q) => q.id)));
    }
  };

  const toggleSelectQuestion = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuestionIds(next);
  };

  // ----------------------------------------------------
  // CSV / JSON IMPORT / EXPORT
  // ----------------------------------------------------
  const handleExportJson = () => {
    const jsonStr = exportQuestionsToJson(filteredBankQuestions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyVerse_QuestionBank_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvStr = exportQuestionsToCsv(filteredBankQuestions);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyVerse_QuestionBank_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { questions } = parseQuestionsFromJson(text);
        if (questions && questions.length > 0) {
          saveBankQuestions(questions);
          alert(`Successfully imported ${questions.length} questions into the Question Bank!`);
        } else {
          alert('No valid questions found in file.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // ADD QUESTION HANDLER
  // ----------------------------------------------------
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQOpt1.trim() || !newQOpt2.trim()) return;

    const targetSub = subjects.find((s) => s.id === newQSubjectId) || subjects[0];
    const targetTop = topics.find((t) => t.id === newQTopicId) || topics[0];

    const options = [
      { id: 'opt-1', text: newQOpt1 },
      { id: 'opt-2', text: newQOpt2 },
      ...(newQOpt3.trim() ? [{ id: 'opt-3', text: newQOpt3 }] : []),
      ...(newQOpt4.trim() ? [{ id: 'opt-4', text: newQOpt4 }] : []),
    ];

    const newQuestion: BankQuestionItem = {
      id: `bq-${Date.now()}`,
      examTrack: targetTop.track,
      subjectId: targetSub.id,
      topicId: targetTop.id,
      questionType: newQType,
      questionText: newQText.trim(),
      questionTextTelugu: newQTextTelugu.trim() || undefined,
      options,
      correctAnswer: newQCorrectOpt,
      explanation: newQExplanation.trim() || 'Standard curriculum explanation.',
      explanationTelugu: newQExplanationTelugu.trim() || undefined,
      difficulty: newQDifficulty,
      language: 'en',
      marks: 1.0,
      negativeMarks: targetTop.track === 'semester' ? 0.0 : 0.33,
      sourceType: 'standard_book',
      sourceReference: newQSourceRef.trim() || 'Verified Syllabus Reference',
      validationStatus: 'approved',
      publicationStatus: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBankQuestion(newQuestion);
    setIsAddQuestionModalOpen(false);
    setNewQText('');
    setNewQTextTelugu('');
    setNewQOpt1('');
    setNewQOpt2('');
    setNewQOpt3('');
    setNewQOpt4('');
    setNewQExplanation('');
    setNewQExplanationTelugu('');
    setNewQSourceRef('');
  };

  // ----------------------------------------------------
  // TEST BLUEPRINT SAVE HANDLER
  // ----------------------------------------------------
  const handleSaveBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpTitle.trim()) return;

    const newBp: TestBlueprint = {
      id: `bp-${Date.now()}`,
      title: bpTitle.trim(),
      description: bpDescription.trim() || 'Custom configurable examination blueprint.',
      examTrack: bpTrack,
      mode: bpTrack === 'appsc-prelims' ? 'full_simulation' : 'subject_mock',
      subjectIds: bpSelectedSubjects.length > 0 ? bpSelectedSubjects : [subjects[0]?.id || ''],
      topicIds: [],
      questionCount: bpQuestionCount,
      durationMinutes: bpDurationMinutes,
      marksPerQuestion: bpMarksPerQuestion,
      negativeMarks: bpNegativeMarks,
      difficultyDistribution: {
        easy: 20,
        moderate: 40,
        difficult: 30,
        very_difficult: 10,
        exam_tricky: 0,
      },
      questionTypes: ['single_correct', 'statement_based', 'assertion_reason'],
      shuffleQuestions: true,
      shuffleOptions: true,
      allowReviewAnswers: true,
      createdAt: new Date().toISOString(),
    };

    saveTestBlueprint(newBp);
    setIsCreateBlueprintOpen(false);
    setBpTitle('');
    setBpDescription('');
    setBpSelectedSubjects([]);
  };

  // ====================================================
  // RENDER VIEW: LIVE EXAMINATION ROOM
  // ====================================================
  if (isTestRunning && activeTest) {
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    const currentSub = submissions[currentQuestion.id];
    const minutesLeft = Math.floor(secondsRemaining / 60);
    const secsLeft = secondsRemaining % 60;
    const isTimeUrgent = secondsRemaining < 300; // < 5 mins

    // Palette Counts
    const answeredCount = Object.values(submissions).filter((s) => s.selectedOptionId).length;
    const reviewCount = Object.values(submissions).filter((s) => s.isMarkedForReview).length;
    const unansweredCount = activeTest.questions.length - answeredCount;

    return (
      <div className="fixed inset-0 z-50 bg-[#090d16] text-slate-100 flex flex-col overflow-hidden select-none">
        {/* Examination Header Bar */}
        <header className="px-6 py-3 bg-[#0d1322] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white tracking-wide truncate max-w-[280px] sm:max-w-md">
                {activeTest.title}
              </h2>
              <span className="text-[11px] text-slate-400">
                Question {currentQuestionIndex + 1} of {activeTest.questions.length} • Marks: +{activeTest.marksPerQuestion} / -{activeTest.negativeMarks}
              </span>
            </div>
          </div>

          {/* Center Timer Countdown */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border font-mono font-bold text-sm md:text-base tracking-wider ${
              isTimeUrgent
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-teal-300'
            }`}
          >
            <Clock size={16} />
            <span>
              {String(minutesLeft).padStart(2, '0')}:{String(secsLeft).padStart(2, '0')}
            </span>
          </div>

          {/* Submit Test Button */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to finish and submit this test?')) {
                handleSubmitTest();
              }
            }}
            className="font-bold text-xs"
          >
            Submit Test
          </Button>
        </header>

        {/* Exam Body (2 Columns: Question Area + Question Palette) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Question Display & Response Area */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6 max-w-4xl">
              {/* Question Number & Status Chips */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
                    Q{currentQuestionIndex + 1}
                  </span>
                  <DifficultyBadge difficulty={currentQuestion.difficulty} />
                  {currentSub?.isMarkedForReview && (
                    <Badge variant="violet" size="sm">
                      Marked for Review
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    icon={<Flag size={12} />}
                    onClick={() => handleToggleMarkForReview(currentQuestion.id)}
                  >
                    {currentSub?.isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
                  </Button>

                  {currentSub?.selectedOptionId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-400 hover:text-rose-400"
                      onClick={() => handleClearResponse(currentQuestion.id)}
                    >
                      Clear Choice
                    </Button>
                  )}
                </div>
              </div>

              {/* Question Statement (English + Telugu) */}
              <div className="space-y-3">
                <p className="text-base md:text-lg font-semibold text-slate-100 leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                {currentQuestion.questionTextTelugu && (
                  <p className="text-sm md:text-base text-teal-300 leading-relaxed font-sans">
                    {currentQuestion.questionTextTelugu}
                  </p>
                )}
              </div>

              {/* Options Radio List */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = currentSub?.selectedOptionId === opt.id;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={`p-4 rounded-xl border text-sm cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {letter}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div>{opt.text}</div>
                        {opt.textTelugu && (
                          <div className="text-xs text-teal-400 font-sans">{opt.textTelugu}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Question Navigation Controls */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<ChevronLeft size={16} />}
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>

              <div className="text-xs text-slate-400 font-medium">
                {answeredCount} answered • {unansweredCount} remaining
              </div>

              {currentQuestionIndex < activeTest.questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-2"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                >
                  Save & Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  onClick={() => {
                    if (window.confirm('Ready to submit your examination?')) {
                      handleSubmitTest();
                    }
                  }}
                >
                  Finish Test <CheckCircle2 size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </main>

          {/* Right Question Palette Sidebar */}
          <aside className="w-full lg:w-80 bg-[#0d1322] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-5 shrink-0">
            {/* Status Legend */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question Status Palette
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                  <span className="text-slate-300">Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300">Marked Review ({reviewCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full ring-2 ring-blue-500 bg-transparent"></span>
                  <span className="text-slate-300">Current Question</span>
                </div>
              </div>
            </div>

            {/* Question Quick Jump Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Jump to Question
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {activeTest.questions.map((q, idx) => {
                  const sub = submissions[q.id];
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = !!sub?.selectedOptionId;
                  const isReview = !!sub?.isMarkedForReview;

                  let bg = 'bg-slate-800 text-slate-300 hover:bg-slate-700';
                  if (isAnswered) bg = 'bg-emerald-600 text-white font-bold';
                  if (isReview) bg = 'bg-amber-600 text-white font-bold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${bg} ${
                        isCurrent ? 'ring-2 ring-white scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER VIEW: DEEP RESULT ANALYSIS & REVIEW REPORT
  // ====================================================
  if (isReviewMode && lastAttempt && activeTest) {
    const isPassing = lastAttempt.score >= (activeTest.totalMarks * 0.4);

    return (
      <div className="space-y-6">
        {/* Result Header Banner */}
        <div
          className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
            isPassing
              ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border-emerald-800/40'
              : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border-rose-800/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Examination Result: {lastAttempt.testTitle}
              </h1>
              <Badge variant={isPassing ? 'emerald' : 'rose'}>
                {isPassing ? 'PASSED' : 'NEEDS PRACTICE'}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-slate-300">
              Deterministic Scoring Formula Applied: Score = (Correct × Marks) − (Incorrect × NegativeMarks)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={handleRetryIncorrect}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              Retry Incorrect Questions ({lastAttempt.incorrectCount})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsReviewMode(false);
                setActiveTest(null);
              }}
            >
              Back to Test Centre
            </Button>
          </div>
        </div>

        {/* Scorecard Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Final Score</span>
            <strong className="text-xl md:text-2xl text-teal-400 block mt-1">
              {lastAttempt.score.toFixed(2)}
            </strong>
            <span className="text-[11px] text-slate-500">out of {lastAttempt.totalPossibleMarks} Marks</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
            <strong className="text-xl md:text-2xl text-blue-400 block mt-1">
              {lastAttempt.accuracy.toFixed(1)}%
            </strong>
            <span className="text-[11px] text-slate-500">Correct / Attempted</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Correct</span>
            <strong className="text-xl md:text-2xl text-emerald-400 block mt-1">
              {lastAttempt.correctCount}
            </strong>
            <span className="text-[11px] text-slate-500">+{lastAttempt.correctCount * activeTest.marksPerQuestion} Marks</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Incorrect</span>
            <strong className="text-xl md:text-2xl text-rose-400 block mt-1">
              {lastAttempt.incorrectCount}
            </strong>
            <span className="text-[11px] text-slate-500">
              -{((lastAttempt.incorrectCount) * (activeTest.negativeMarks || 0.33)).toFixed(2)} Negative Penalty
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Time Spent</span>
            <strong className="text-xl md:text-2xl text-slate-200 block mt-1">
              {Math.floor(lastAttempt.timeSpentSeconds / 60)}m {lastAttempt.timeSpentSeconds % 60}s
            </strong>
            <span className="text-[11px] text-slate-500">{activeTest.durationMinutes} min limit</span>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare size={18} className="text-blue-400" />
              <span>Full Question Review & Explanations</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {activeTest.questions.length} Questions Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {activeTest.questions.map((q, idx) => {
              const attemptAns = lastAttempt.answers[q.id];
              const isCorrect = attemptAns?.isCorrect;
              const isSkipped = !attemptAns?.selectedOptionId;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 shadow-lg ${
                    isCorrect
                      ? 'bg-slate-900/90 border-emerald-900/40'
                      : isSkipped
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-900/90 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                        Q{idx + 1}
                      </span>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 size={14} /> Correct (+{q.marks}M)
                        </span>
                      ) : isSkipped ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                          Unanswered (0M)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg">
                          <XCircle size={14} /> Incorrect (-{q.negativeMarks}M)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="space-y-1.5">
                    <p className="text-sm md:text-base font-semibold text-slate-100 leading-relaxed">
                      {q.questionText}
                    </p>
                    {q.questionTextTelugu && (
                      <p className="text-xs md:text-sm text-teal-300 font-sans">
                        {q.questionTextTelugu}
                      </p>
                    )}
                  </div>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => {
                      const isChosen = attemptAns?.selectedOptionId === opt.id;
                      const isActualCorrect = q.correctOptionId === opt.id;

                      let optClass = 'bg-slate-950/60 border-slate-800 text-slate-300';
                      if (isActualCorrect) {
                        optClass = 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isChosen && !isActualCorrect) {
                        optClass = 'bg-rose-950/50 border-rose-500/80 text-rose-200 font-semibold ring-1 ring-rose-500/30';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${optClass}`}
                        >
                          <div>
                            <div>{opt.text}</div>
                            {opt.textTelugu && <div className="text-[11px] opacity-80 mt-0.5">{opt.textTelugu}</div>}
                          </div>

                          {isActualCorrect ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          ) : isChosen ? (
                            <XCircle size={16} className="text-rose-400 shrink-0" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs space-y-1.5">
                    <span className="font-bold text-blue-400 block">Explanation & Conceptual Reference:</span>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                    {q.explanationTelugu && (
                      <p className="text-teal-300 leading-relaxed font-sans mt-1">
                        {q.explanationTelugu}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN VIEW: TABS DASHBOARD
  // ====================================================
  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Advanced Mock Test & Assessment Engine
            </h1>
            <Badge variant="blue">Production Grade</Badge>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
              500-Target Bank • Deterministic Scoring (-0.33)
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            Syllabus-grounded question bank with 9-subject registry, batch generation pipelines, exam room with autosave, and retry analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Sliders size={14} />}
            onClick={() => setActiveTab('blueprints')}
          >
            Blueprint Builder
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={() => setActiveTab('generation')}
          >
            Batch Generator
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs
        tabs={[
          { id: 'tests', label: 'Test Centre & Active Exams', count: mockTests.length },
          { id: 'bank', label: '500-Target Question Bank', count: bankQuestions.length },
          { id: 'generation', label: 'Batch Generation & Jobs', count: generationJobs.length },
          { id: 'blueprints', label: 'Blueprint Assembler', count: testBlueprints.length },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {/* ==================================================== */}
      {/* TAB 1: TEST CENTRE & ACTIVE EXAMS                   */}
      {/* ==================================================== */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {/* Active Mock Tests Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare size={18} className="text-blue-400" />
                <span>Ready-to-Take Mock Examinations</span>
              </h3>
              <span className="text-xs text-slate-400">{mockTests.length} Tests Ready</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTests.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="blue">{t.track.toUpperCase()}</Badge>
                      <span className="text-xs font-mono text-slate-400">
                        {t.durationMinutes} Mins
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {t.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span><strong>{t.questions.length}</strong> Questions</span>
                      <span>•</span>
                      <span><strong>{t.totalMarks}</strong> Marks</span>
                      <span>•</span>
                      <span>-{t.negativeMarks} Negative</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {t.isCustom ? 'Custom Test' : 'Official Syllabus'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/exam/${t.id}`)}
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs"
                      >
                        Exam Room
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Play size={14} />}
                        onClick={() => handleStartTest(t)}
                        className="font-bold text-xs"
                      >
                        Start Test
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Attempts History */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span>Exam Attempt History & Performance</span>
            </h3>

            {testAttempts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No past exam attempts yet. Start an exam above!</p>
            ) : (
              <div className="space-y-2">
                {testAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{att.testTitle}</h4>
                        <Badge variant="blue" size="sm">{att.track.toUpperCase()}</Badge>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        Taken on {new Date(att.completedAt).toLocaleDateString()} at {new Date(att.completedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Score</span>
                        <strong className="text-teal-400 text-sm font-bold">
                          {att.score.toFixed(2)} / {att.totalPossibleMarks}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Accuracy</span>
                        <strong className="text-blue-400 text-sm font-bold">
                          {att.accuracy.toFixed(1)}%
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-emerald-400 font-bold">+{att.correctCount}</span>
                        <span>/</span>
                        <span className="text-rose-400 font-bold">-{att.incorrectCount}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const test = mockTests.find((t) => t.id === att.testId) || mockTests[0];
                          setActiveTest(test);
                          setLastAttempt(att);
                          setIsReviewMode(true);
                        }}
                      >
                        View Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: 500-TARGET QUESTION BANK & 9-SUBJECT REGISTRY */}
      {/* ==================================================== */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* 9-Subject Target Coverage Registry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-teal-400" />
                <span>9-Subject Question Bank Registry (500 Target / Topic)</span>
              </h3>
              <span className="text-xs text-slate-400">Target: 500 questions per topic</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {subjects.slice(0, 9).map((sub) => {
                const subTopics = topics.filter((t) => t.subjectId === sub.id);
                const stats = calculateSubjectTargetStats(sub, subTopics, bankQuestions);

                return (
                  <div
                    key={sub.id}
                    onClick={() => setBankSubjectFilter(sub.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      bankSubjectFilter === sub.id
                        ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {sub.name}
                      </span>
                      <Badge variant="slate" size="sm">{subTopics.length} Topics</Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Approved: <strong className="text-teal-400">{stats.approvedCount}</strong></span>
                      <span>Target: <strong className="text-slate-200">{stats.targetCount}</strong></span>
                      <span className="font-bold text-blue-400">{stats.coveragePercent}%</span>
                    </div>

                    <ProgressBar value={stats.coveragePercent} color="teal" size="sm" showPercent={false} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Bank Action Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={bankSearchQuery}
                onChange={(e) => setBankSearchQuery(e.target.value)}
                placeholder="Search questions, keywords..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
              <select
                value={bankSubjectFilter}
                onChange={(e) => setBankSubjectFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={bankDifficultyFilter}
                onChange={(e) => setBankDifficultyFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
                <option value="very_difficult">Very Difficult</option>
                <option value="exam_tricky">Exam Tricky</option>
              </select>

              <select
                value={bankStatusFilter}
                onChange={(e) => setBankStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending_review">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<Download size={13} />}
                onClick={handleExportCsv}
                title="Export CSV"
              >
                CSV
              </Button>

              <Button
                size="sm"
                variant="outline"
                icon={<Download size={13} />}
                onClick={handleExportJson}
                title="Export JSON"
              >
                JSON
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 text-xs font-semibold">
                  <Upload size={13} /> Import JSON
                </span>
              </label>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                icon={<Plus size={14} />}
                onClick={() => setIsAddQuestionModalOpen(true)}
              >
                Add Question
              </Button>
            </div>
          </div>

          {/* Bulk Action Toolbar if items selected */}
          {selectedQuestionIds.size > 0 && (
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between text-xs">
              <span className="text-blue-300 font-semibold">
                {selectedQuestionIds.size} Question{selectedQuestionIds.size > 1 ? 's' : ''} Selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  icon={<Check size={13} />}
                  onClick={() => {
                    bulkApproveQuestions(Array.from(selectedQuestionIds));
                    setSelectedQuestionIds(new Set());
                  }}
                >
                  Bulk Approve
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  className="text-xs"
                  icon={<XCircle size={13} />}
                  onClick={() => {
                    bulkRejectQuestions(Array.from(selectedQuestionIds));
                    setSelectedQuestionIds(new Set());
                  }}
                >
                  Bulk Reject
                </Button>
              </div>
            </div>
          )}

          {/* Questions Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.size > 0 && selectedQuestionIds.size === filteredBankQuestions.length}
                        onChange={toggleSelectAllVisible}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600"
                      />
                    </th>
                    <th className="p-3">Question Statement</th>
                    <th className="p-3 w-32">Subject / Topic</th>
                    <th className="p-3 w-24">Type</th>
                    <th className="p-3 w-24">Difficulty</th>
                    <th className="p-3 w-28">Validation</th>
                    <th className="p-3 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBankQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500">
                        No questions matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBankQuestions.map((q) => {
                      const isSelected = selectedQuestionIds.has(q.id);
                      const subName = subjects.find((s) => s.id === q.subjectId)?.name || 'Subject';

                      return (
                        <tr
                          key={q.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-blue-950/20' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectQuestion(q.id)}
                              className="rounded bg-slate-900 border-slate-700 text-blue-600"
                            />
                          </td>
                          <td className="p-3 max-w-md">
                            <div className="font-medium text-slate-100 line-clamp-2">
                              {q.questionText}
                            </div>
                            {q.questionTextTelugu && (
                              <div className="text-[11px] text-teal-400 line-clamp-1 mt-0.5">
                                {q.questionTextTelugu}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 mt-1">
                              Source: {q.sourceReference || 'Standard Reference'}
                            </div>
                          </td>
                          <td className="p-3 text-slate-300">
                            <div className="truncate max-w-[120px] font-semibold">{subName}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                              {q.topicId}
                            </div>
                          </td>
                          <td className="p-3 text-slate-400 capitalize">
                            {q.questionType.replace('_', ' ')}
                          </td>
                          <td className="p-3">
                            <DifficultyBadge difficulty={q.difficulty} />
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                q.validationStatus === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : q.validationStatus === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {q.validationStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteBankQuestion(q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: AI / BATCH GENERATION & JOB MONITOR          */}
      {/* ==================================================== */}
      {activeTab === 'generation' && (
        <div className="space-y-6">
          {/* Generation Trigger Card */}
          <Card className="bg-[#101726] border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <span>Trigger Syllabus-Grounded Question Batch</span>
              </CardTitle>
              <span className="text-xs text-slate-400">10–25 questions per job with duplicate fingerprinting</span>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Subject *</label>
                <select
                  value={genSubjectId}
                  onChange={(e) => {
                    setGenSubjectId(e.target.value);
                    const firstTopic = topics.find((t) => t.subjectId === e.target.value);
                    if (firstTopic) setGenTopicId(firstTopic.id);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Syllabus Topic *</label>
                <select
                  value={genTopicId}
                  onChange={(e) => setGenTopicId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {topics
                    .filter((t) => !genSubjectId || t.subjectId === genSubjectId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Batch Size & Difficulty</label>
                <div className="flex gap-2">
                  <select
                    value={genBatchSize}
                    onChange={(e) => setGenBatchSize(Number(e.target.value))}
                    className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                  </select>

                  <select
                    value={genDifficultyMix}
                    onChange={(e) => setGenDifficultyMix(e.target.value as any)}
                    className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult</option>
                    <option value="very_difficult">Hard Exam</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Grounding Source: Telugu Akademi, AP Reorganisation Act 2014, NCERT & SAHE Syllabus.
              </span>

              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 font-bold"
                icon={<Sparkles size={14} />}
                disabled={isStartingJob}
                onClick={handleTriggerGenerationJob}
              >
                {isStartingJob ? 'Generating Batch...' : 'Generate Question Batch'}
              </Button>
            </div>
          </Card>

          {/* Generation Jobs Monitor */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw size={18} className="text-teal-400" />
              <span>Generation Jobs Progress Monitor</span>
            </h3>

            <div className="space-y-3">
              {generationJobs.map((job) => {
                const subName = subjects.find((s) => s.id === job.subjectId)?.name || 'Subject';
                const topName = topics.find((t) => t.id === job.topicId)?.title || 'Topic';

                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{topName}</h4>
                          <Badge variant="blue" size="sm">{(job.examTrack || 'appsc').toUpperCase()}</Badge>
                        </div>
                        <span className="text-[11px] text-slate-400">{subName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            job.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : job.status === 'running'
                              ? 'bg-blue-500/10 text-blue-400 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {job.status}
                        </span>

                        <span className="text-slate-400 font-mono">
                          {job.approvedCount} approved / {job.batchSize} target
                        </span>
                      </div>
                    </div>

                    <ProgressBar
                      value={job.progressPercent !== undefined ? job.progressPercent : (job.status === 'completed' ? 100 : 50)}
                      color="teal"
                      size="sm"
                      showPercent={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: BLUEPRINT TEST ASSEMBLER                     */}
      {/* ==================================================== */}
      {activeTab === 'blueprints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-blue-400" />
                <span>Examination Blueprints & Simulator Rules</span>
              </h3>
              <p className="text-xs text-slate-400">
                Assemble realistic mock tests from verified question banks using strict difficulty quotas and negative marking.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setIsCreateBlueprintOpen(true)}
            >
              New Blueprint
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="blue">{bp.examTrack.toUpperCase()}</Badge>
                    <span className="text-xs font-mono text-slate-400">
                      {bp.durationMinutes} Mins
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white line-clamp-2">{bp.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{bp.description}</p>
                  </div>

                  {/* Difficulty Distribution Pill */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="text-slate-400 font-medium">Difficulty Distribution:</div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400">Easy {bp.difficultyDistribution.easy}%</span>
                      <span>•</span>
                      <span className="text-blue-400">Mod {bp.difficultyDistribution.moderate}%</span>
                      <span>•</span>
                      <span className="text-amber-400">Diff {bp.difficultyDistribution.difficult}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    <span>{bp.questionCount} Questions</span> •{' '}
                    <span>{bp.marksPerQuestion} Marks</span> •{' '}
                    <span className="text-rose-400">-{bp.negativeMarks} Neg</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => deleteTestBlueprint(bp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                    title="Delete Blueprint"
                  >
                    <Trash2 size={13} />
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 font-bold text-xs"
                    icon={<Play size={14} />}
                    onClick={() => handleLaunchBlueprint(bp)}
                  >
                    Assemble & Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD BANK QUESTION                             */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title="Add Question to Question Bank"
        description="Enter question text, options, bilingual translation, and source reference."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveNewQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Subject *</label>
              <select
                value={newQSubjectId}
                onChange={(e) => {
                  setNewQSubjectId(e.target.value);
                  const firstT = topics.find((t) => t.subjectId === e.target.value);
                  if (firstT) setNewQTopicId(firstT.id);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Topic *</label>
              <select
                value={newQTopicId}
                onChange={(e) => setNewQTopicId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {topics
                  .filter((t) => !newQSubjectId || t.subjectId === newQSubjectId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Question Statement (English) *</label>
            <textarea
              required
              rows={2}
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              placeholder="Enter question statement..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Question Statement (Telugu Translation)</label>
            <textarea
              rows={2}
              value={newQTextTelugu}
              onChange={(e) => setNewQTextTelugu(e.target.value)}
              placeholder="ప్రశ్న తెలుగు అనువాదం..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-0.5">Option A *</label>
              <input
                type="text"
                required
                value={newQOpt1}
                onChange={(e) => setNewQOpt1(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Option B *</label>
              <input
                type="text"
                required
                value={newQOpt2}
                onChange={(e) => setNewQOpt2(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Option C</label>
              <input
                type="text"
                value={newQOpt3}
                onChange={(e) => setNewQOpt3(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">Option D</label>
              <input
                type="text"
                value={newQOpt4}
                onChange={(e) => setNewQOpt4(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Correct Answer</label>
              <select
                value={newQCorrectOpt}
                onChange={(e) => setNewQCorrectOpt(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              >
                <option value="opt-1">Option A</option>
                <option value="opt-2">Option B</option>
                <option value="opt-3">Option C</option>
                <option value="opt-4">Option D</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Difficulty</label>
              <select
                value={newQDifficulty}
                onChange={(e) => setNewQDifficulty(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
                <option value="very_difficult">Very Difficult</option>
                <option value="exam_tricky">Exam Tricky</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Source Reference</label>
              <input
                type="text"
                value={newQSourceRef}
                onChange={(e) => setNewQSourceRef(e.target.value)}
                placeholder="e.g. Telugu Akademi History"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Detailed Explanation (English)</label>
            <textarea
              rows={2}
              value={newQExplanation}
              onChange={(e) => setNewQExplanation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL: CREATE TEST BLUEPRINT                         */}
      {/* ==================================================== */}
      <Modal
        isOpen={isCreateBlueprintOpen}
        onClose={() => setIsCreateBlueprintOpen(false)}
        title="Create New Examination Blueprint"
        description="Configure duration, negative marking, and target subject quotas."
      >
        <form onSubmit={handleSaveBlueprint} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Blueprint Title *</label>
            <input
              type="text"
              required
              value={bpTitle}
              onChange={(e) => setBpTitle(e.target.value)}
              placeholder="e.g. APPSC Group 2 Prelims Grand Mock 1"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Exam Track</label>
              <select
                value={bpTrack}
                onChange={(e) => setBpTrack(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              >
                <option value="appsc-prelims">APPSC Group 2 Prelims</option>
                <option value="appsc-mains">APPSC Group 2 Mains</option>
                <option value="semester">Semester M.Tech</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Question Count</label>
              <input
                type="number"
                min={5}
                max={150}
                value={bpQuestionCount}
                onChange={(e) => setBpQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Duration (Mins)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={bpDurationMinutes}
                onChange={(e) => setBpDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Marks / Question</label>
              <input
                type="number"
                step="0.5"
                value={bpMarksPerQuestion}
                onChange={(e) => setBpMarksPerQuestion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Negative Marks</label>
              <input
                type="number"
                step="0.01"
                value={bpNegativeMarks}
                onChange={(e) => setBpNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Description</label>
            <textarea
              rows={2}
              value={bpDescription}
              onChange={(e) => setBpDescription(e.target.value)}
              placeholder="Exam instructions and syllabus coverage..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateBlueprintOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Blueprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
