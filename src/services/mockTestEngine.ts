import { MockQuestion, MockTest, TestAttempt, SyllabusTopic } from '../types';
import {
  BankQuestionItem,
  TestBlueprint,
  QuestionDifficulty,
} from '../types/questionBank';

export interface AnswerSubmission {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

export interface TopicPerformanceStat {
  topicId: string;
  topicTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  marksAwarded: number;
  negativePenalty: number;
}

export interface DifficultyPerformanceStat {
  difficulty: QuestionDifficulty | string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
}

export interface TestEvaluationResult {
  attempt: TestAttempt;
  weakTopicIds: string[];
  feedbackNotes: string[];
  topicBreakdown: TopicPerformanceStat[];
  difficultyBreakdown: DifficultyPerformanceStat[];
  negativeMarksLost: number;
  totalTimeSpentSeconds: number;
  averageTimePerQuestionSeconds: number;
}

/**
 * Assembles a Mock Test deterministically from an authorized Test Blueprint
 */
export function assembleTestFromBlueprint(
  blueprint: TestBlueprint,
  availableQuestions: BankQuestionItem[],
  topics: SyllabusTopic[] = []
): { test: MockTest; shortageWarning?: string; shortage?: boolean; warnings?: string[] } {
  // Filter questions matching exam track and selected subjects/topics
  let candidates = availableQuestions.filter(
    (q) => q.validationStatus === 'approved' && q.publicationStatus === 'published'
  );

  if (blueprint.examTrack) {
    candidates = candidates.filter((q) => q.examTrack === blueprint.examTrack);
  }

  if (blueprint.subjectIds && blueprint.subjectIds.length > 0) {
    candidates = candidates.filter((q) => blueprint.subjectIds.includes(q.subjectId));
  }

  if (blueprint.topicIds && blueprint.topicIds.length > 0) {
    candidates = candidates.filter((q) => blueprint.topicIds.includes(q.topicId));
  }

  if (blueprint.questionTypes && blueprint.questionTypes.length > 0) {
    candidates = candidates.filter((q) => blueprint.questionTypes.includes(q.questionType));
  }

  let shortageWarning: string | undefined;
  if (candidates.length < blueprint.questionCount) {
    shortageWarning = `The approved question bank has only ${candidates.length} matching questions (requested ${blueprint.questionCount}). Test size adjusted to ${candidates.length}.`;
  }

  // Shuffle candidates if requested
  const shuffledCandidates = blueprint.shuffleQuestions
    ? [...candidates].sort(() => Math.random() - 0.5)
    : [...candidates];

  // Select questions based on difficulty distribution where possible
  const totalToPick = Math.min(blueprint.questionCount, candidates.length);
  const selectedBankQuestions: BankQuestionItem[] = [];

  const targetEasy = Math.round((blueprint.difficultyDistribution.easy / 100) * totalToPick);
  const targetMod = Math.round((blueprint.difficultyDistribution.moderate / 100) * totalToPick);
  const targetDiff = Math.round((blueprint.difficultyDistribution.difficult / 100) * totalToPick);
  const targetVeryDiff = Math.round((blueprint.difficultyDistribution.very_difficult / 100) * totalToPick);
  const targetTricky = Math.round((blueprint.difficultyDistribution.exam_tricky / 100) * totalToPick);

  const buckets: Record<string, BankQuestionItem[]> = {
    easy: shuffledCandidates.filter((q) => q.difficulty === 'easy'),
    moderate: shuffledCandidates.filter((q) => q.difficulty === 'moderate'),
    difficult: shuffledCandidates.filter((q) => q.difficulty === 'difficult'),
    very_difficult: shuffledCandidates.filter((q) => q.difficulty === 'very_difficult'),
    exam_tricky: shuffledCandidates.filter((q) => q.difficulty === 'exam_tricky'),
  };

  const pickFromBucket = (diff: string, count: number) => {
    const bucket = buckets[diff] || [];
    for (let i = 0; i < count && bucket.length > 0; i++) {
      if (selectedBankQuestions.length >= totalToPick) break;
      const q = bucket.pop()!;
      if (!selectedBankQuestions.some((s) => s.id === q.id)) {
        selectedBankQuestions.push(q);
      }
    }
  };

  pickFromBucket('easy', targetEasy);
  pickFromBucket('moderate', targetMod);
  pickFromBucket('difficult', targetDiff);
  pickFromBucket('very_difficult', targetVeryDiff);
  pickFromBucket('exam_tricky', targetTricky);

  // Fill remainder from any available shuffled candidate
  for (const q of shuffledCandidates) {
    if (selectedBankQuestions.length >= totalToPick) break;
    if (!selectedBankQuestions.some((s) => s.id === q.id)) {
      selectedBankQuestions.push(q);
    }
  }

  // Ensure strict exact size matching totalToPick
  const finalQuestions = selectedBankQuestions.slice(0, totalToPick);

  // Convert to MockQuestion structure
  const testQuestions: MockQuestion[] = finalQuestions.map((bq) => ({
    id: bq.id,
    testId: blueprint.id,
    subjectId: bq.subjectId,
    topicId: bq.topicId,
    subtopicId: bq.subtopicId,
    track: bq.examTrack,
    questionText: bq.questionText,
    questionTextTelugu: bq.questionTextTelugu,
    options: blueprint.shuffleOptions
      ? [...bq.options].sort(() => Math.random() - 0.5)
      : bq.options,
    correctOptionId: typeof bq.correctAnswer === 'string' ? bq.correctAnswer : bq.correctAnswer[0] || 'opt-1',
    explanation: bq.explanation,
    explanationTelugu: bq.explanationTelugu,
    difficulty: bq.difficulty === 'very_difficult' || bq.difficulty === 'exam_tricky' ? 'hard' : bq.difficulty === 'easy' ? 'easy' : 'moderate',
    marks: bq.marks || blueprint.marksPerQuestion,
    negativeMarks: bq.negativeMarks !== undefined ? bq.negativeMarks : blueprint.negativeMarks,
  }));

  const mockTest: MockTest = {
    id: `test-${blueprint.id}-${Date.now().toString(36)}`,
    title: blueprint.title,
    description: blueprint.description,
    track: blueprint.examTrack,
    isCustom: true,
    durationMinutes: blueprint.durationMinutes,
    totalMarks: testQuestions.reduce((acc, q) => acc + (q.marks || blueprint.marksPerQuestion), 0),
    marksPerQuestion: blueprint.marksPerQuestion,
    negativeMarks: blueprint.negativeMarks,
    questions: testQuestions,
    createdAt: new Date().toISOString(),
  };

  return {
    test: mockTest,
    shortageWarning,
    shortage: !!shortageWarning,
    warnings: shortageWarning ? [shortageWarning] : [],
  };
}

/**
 * Creates a focused retry session containing only incorrect questions from an attempt
 */
export function createRetryTestForIncorrect(
  param1: TestAttempt | MockTest,
  param2: TestAttempt | MockTest
): MockTest | null {
  const attempt = ('answers' in param1 ? param1 : param2) as TestAttempt;
  const originalTest = ('questions' in param1 ? param1 : param2) as MockTest;

  if (!attempt || !originalTest) return null;

  const incorrectQuestionIds = Object.entries(attempt.answers || {})
    .filter(([_, ans]) => !ans.isCorrect && ans.selectedOptionId !== undefined)
    .map(([qId]) => qId);

  const retryQuestions = (originalTest.questions || []).filter((q) =>
    incorrectQuestionIds.includes(q.id)
  );

  if (retryQuestions.length === 0) return null;

  return {
    id: `retry-${Date.now().toString(36)}`,
    title: `Retry Incorrect Questions: ${originalTest.title}`,
    description: `Targeted correction session focusing on ${retryQuestions.length} missed questions.`,
    track: originalTest.track,
    isCustom: true,
    durationMinutes: Math.max(5, Math.round(retryQuestions.length * 1.5)),
    totalMarks: retryQuestions.reduce((acc, q) => acc + q.marks, 0),
    marksPerQuestion: originalTest.marksPerQuestion,
    negativeMarks: originalTest.negativeMarks,
    questions: retryQuestions,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate scores and evaluate a mock test attempt with deep analytical breakdowns
 */
export function evaluateTestAttempt(
  test: MockTest,
  submissions: Record<string, AnswerSubmission>,
  startedAt: string,
  completedAt: string = new Date().toISOString(),
  topics: SyllabusTopic[] = []
): TestEvaluationResult {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let markedForReviewCount = 0;
  let totalTimeSpent = 0;
  let negativeMarksLost = 0;
  const weakTopicSet = new Set<string>();
  const feedbackNotes: string[] = [];

  const answersRecord: TestAttempt['answers'] = {};

  // Groupings for topic breakdown & difficulty breakdown
  const topicMap: Record<
    string,
    {
      topicId: string;
      topicTitle: string;
      total: number;
      correct: number;
      incorrect: number;
      unanswered: number;
      marksAwarded: number;
      negativePenalty: number;
    }
  > = {};

  const diffMap: Record<
    string,
    { total: number; correct: number; incorrect: number }
  > = {
    easy: { total: 0, correct: 0, incorrect: 0 },
    moderate: { total: 0, correct: 0, incorrect: 0 },
    hard: { total: 0, correct: 0, incorrect: 0 },
  };

  test.questions.forEach((q: MockQuestion) => {
    const submission = submissions[q.id];
    const selectedOption = submission?.selectedOptionId;
    const timeSpent = submission?.timeSpentSeconds || 0;
    const isMarked = submission?.isMarkedForReview || false;

    totalTimeSpent += timeSpent;
    if (isMarked) markedForReviewCount++;

    const tId = q.topicId || 'general-topic';
    if (!topicMap[tId]) {
      const topicObj = topics.find((t) => t.id === tId);
      topicMap[tId] = {
        topicId: tId,
        topicTitle: topicObj?.title || 'General Examination Topic',
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        marksAwarded: 0,
        negativePenalty: 0,
      };
    }
    topicMap[tId].total++;

    const diffKey = q.difficulty || 'moderate';
    if (diffMap[diffKey]) {
      diffMap[diffKey].total++;
    }

    if (!selectedOption) {
      unansweredCount++;
      topicMap[tId].unanswered++;
      answersRecord[q.id] = {
        selectedOptionId: undefined,
        isCorrect: false,
        isMarkedForReview: isMarked,
        timeSpentSeconds: timeSpent,
      };
    } else if (selectedOption === q.correctOptionId) {
      correctCount++;
      const qMarks = q.marks || test.marksPerQuestion;
      score += qMarks;
      topicMap[tId].correct++;
      topicMap[tId].marksAwarded += qMarks;
      if (diffMap[diffKey]) diffMap[diffKey].correct++;

      answersRecord[q.id] = {
        selectedOptionId: selectedOption,
        isCorrect: true,
        isMarkedForReview: isMarked,
        timeSpentSeconds: timeSpent,
      };
    } else {
      incorrectCount++;
      const qNeg = q.negativeMarks !== undefined ? q.negativeMarks : test.negativeMarks;
      score -= qNeg;
      negativeMarksLost += qNeg;
      topicMap[tId].incorrect++;
      topicMap[tId].negativePenalty += qNeg;
      if (diffMap[diffKey]) diffMap[diffKey].incorrect++;

      if (q.topicId) {
        weakTopicSet.add(q.topicId);
      }

      answersRecord[q.id] = {
        selectedOptionId: selectedOption,
        isCorrect: false,
        isMarkedForReview: isMarked,
        timeSpentSeconds: timeSpent,
      };
    }
  });

  const totalAnswered = correctCount + incorrectCount;
  const accuracy = totalAnswered > 0 ? Number(((correctCount / totalAnswered) * 100).toFixed(1)) : 0;
  const roundedScore = Number(Math.max(0, score).toFixed(2));
  const avgTimePerQuestion = test.questions.length > 0 ? Math.round(totalTimeSpent / test.questions.length) : 0;

  // Automated insights
  if (accuracy >= 80) {
    feedbackNotes.push('Excellent performance! Strong command over core concepts.');
  } else if (accuracy >= 60) {
    feedbackNotes.push('Solid attempt. Review incorrect questions to eliminate negative marking penalty.');
  } else {
    feedbackNotes.push('Substantial revision recommended. Focus on weak topics identified below.');
  }

  if (incorrectCount > 0) {
    feedbackNotes.push(`Negative penalty deducted: -${negativeMarksLost.toFixed(2)} marks (${incorrectCount} wrong answers).`);
  }

  // Format topic performance breakdown
  const topicBreakdown: TopicPerformanceStat[] = Object.values(topicMap).map((t) => {
    const answered = t.correct + t.incorrect;
    const acc = answered > 0 ? Math.round((t.correct / answered) * 100) : 0;
    return {
      topicId: t.topicId,
      topicTitle: t.topicTitle,
      totalQuestions: t.total,
      correctCount: t.correct,
      incorrectCount: t.incorrect,
      unansweredCount: t.unanswered,
      accuracy: acc,
      marksAwarded: Number(t.marksAwarded.toFixed(2)),
      negativePenalty: Number(t.negativePenalty.toFixed(2)),
    };
  });

  // Format difficulty breakdown
  const difficultyBreakdown: DifficultyPerformanceStat[] = Object.entries(diffMap).map(
    ([diff, val]) => {
      const answered = val.correct + val.incorrect;
      const acc = answered > 0 ? Math.round((val.correct / answered) * 100) : 0;
      return {
        difficulty: diff,
        totalQuestions: val.total,
        correctCount: val.correct,
        incorrectCount: val.incorrect,
        accuracy: acc,
      };
    }
  );

  const attempt: TestAttempt = {
    id: `attempt-${Date.now()}`,
    testId: test.id,
    testTitle: test.title,
    track: test.track,
    startedAt,
    completedAt,
    timeSpentSeconds: totalTimeSpent,
    score: roundedScore,
    totalPossibleMarks: test.totalMarks,
    accuracy,
    correctCount,
    incorrectCount,
    unansweredCount,
    markedForReviewCount,
    answers: answersRecord,
    suggestedRevisionTopicIds: Array.from(weakTopicSet),
  };

  return {
    attempt,
    weakTopicIds: Array.from(weakTopicSet),
    feedbackNotes,
    topicBreakdown,
    difficultyBreakdown,
    negativeMarksLost: Number(negativeMarksLost.toFixed(2)),
    totalTimeSpentSeconds: totalTimeSpent,
    averageTimePerQuestionSeconds: avgTimePerQuestion,
  };
}
