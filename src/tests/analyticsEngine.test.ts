import { describe, it, expect } from 'vitest';
import {
  calculateOverallSummary,
  calculateSubjectIntelligence,
  calculateTopicDeepAnalytics,
  calculateTimeEfficiency,
  calculateReadinessIndicator,
  generatePersonalizedRecommendations,
  syncMistakeBookFromAttempt,
  compareTwoAttempts,
} from '../services/analyticsEngine';
import {
  MockTest,
  TestAttempt,
  SyllabusTopic,
  Subject,
  MistakeBookItem,
} from '../types';

describe('Analytics Engine Unit Tests', () => {
  const dummySubjects: Subject[] = [
    {
      id: 'sub-polity',
      track: 'appsc-prelims',
      name: 'Indian Polity and Governance',
      color: '#3b82f6',
      priority: 'high',
      targetHours: 50,
    },
    {
      id: 'sub-history',
      track: 'appsc-prelims',
      name: 'Indian History and Culture',
      color: '#10b981',
      priority: 'high',
      targetHours: 50,
    },
  ];

  const dummyTopics: SyllabusTopic[] = [
    {
      id: 'top-pol-1',
      subjectId: 'sub-polity',
      track: 'appsc-prelims',
      title: 'Preamble and Constitutional Philosophy',
      estimatedHours: 4,
      difficulty: 'moderate',
      priority: 'high',
      status: 'completed',
      progressPercent: 100,
    },
    {
      id: 'top-pol-2',
      subjectId: 'sub-polity',
      track: 'appsc-prelims',
      title: 'Fundamental Rights and Writs',
      estimatedHours: 6,
      difficulty: 'hard',
      priority: 'high',
      status: 'in_progress',
      progressPercent: 60,
    },
    {
      id: 'top-hist-1',
      subjectId: 'sub-history',
      track: 'appsc-prelims',
      title: 'Indus Valley Civilization',
      estimatedHours: 5,
      difficulty: 'easy',
      priority: 'medium',
      status: 'not_started',
      progressPercent: 0,
    },
  ];

  const dummyMockTest: MockTest = {
    id: 'test-1',
    title: 'Polity Comprehensive Mock 1',
    description: 'Polity test description',
    track: 'appsc-prelims',
    subjectId: 'sub-polity',
    isCustom: false,
    durationMinutes: 10,
    totalMarks: 3,
    marksPerQuestion: 1,
    negativeMarks: 0.33,
    createdAt: '2026-10-17T00:00:00Z',
    questions: [
      {
        id: 'q-1',
        track: 'appsc-prelims',
        subjectId: 'sub-polity',
        topicId: 'top-pol-1',
        questionText: 'Which amendment added Secular to the Preamble?',
        options: [
          { id: 'opt-a', text: '42nd Amendment' },
          { id: 'opt-b', text: '44th Amendment' },
        ],
        correctOptionId: 'opt-a',
        explanation: '42nd Amendment 1976',
        difficulty: 'easy',
        marks: 1,
        negativeMarks: 0.33,
      },
      {
        id: 'q-2',
        track: 'appsc-prelims',
        subjectId: 'sub-polity',
        topicId: 'top-pol-2',
        questionText: 'Under which article are writ petitions filed in Supreme Court?',
        options: [
          { id: 'opt-c', text: 'Article 32' },
          { id: 'opt-d', text: 'Article 226' },
        ],
        correctOptionId: 'opt-c',
        explanation: 'Article 32 for SC, 226 for HC',
        difficulty: 'moderate',
        marks: 1,
        negativeMarks: 0.33,
      },
      {
        id: 'q-3',
        track: 'appsc-prelims',
        subjectId: 'sub-polity',
        topicId: 'top-pol-2',
        questionText: 'Which article guarantees protection against arrest and detention?',
        options: [
          { id: 'opt-e', text: 'Article 22' },
          { id: 'opt-f', text: 'Article 20' },
        ],
        correctOptionId: 'opt-e',
        explanation: 'Article 22',
        difficulty: 'hard',
        marks: 1,
        negativeMarks: 0.33,
      },
    ],
  };

  const attempt1: TestAttempt = {
    id: 'att-1',
    testId: 'test-1',
    testTitle: 'Polity Comprehensive Mock 1',
    track: 'appsc-prelims',
    startedAt: '2026-10-17T10:00:00Z',
    completedAt: '2026-10-17T10:05:00Z',
    timeSpentSeconds: 300,
    score: 1.67, // 2 correct (+2) - 1 wrong (-0.33) = 1.67
    totalPossibleMarks: 3,
    accuracy: 67,
    correctCount: 2,
    incorrectCount: 1,
    unansweredCount: 0,
    markedForReviewCount: 0,
    answers: {
      'q-1': { selectedOptionId: 'opt-a', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 30 },
      'q-2': { selectedOptionId: 'opt-c', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 45 },
      'q-3': { selectedOptionId: 'opt-f', isCorrect: false, isMarkedForReview: false, timeSpentSeconds: 100 }, // wrong, slow (>90s)
    },
    suggestedRevisionTopicIds: ['top-pol-2'],
  };

  const attempt2: TestAttempt = {
    id: 'att-2',
    testId: 'test-1',
    testTitle: 'Polity Comprehensive Mock 1 (Retake)',
    track: 'appsc-prelims',
    startedAt: '2026-10-18T10:00:00Z',
    completedAt: '2026-10-18T10:03:00Z',
    timeSpentSeconds: 180,
    score: 3.0, // 3 correct (+3)
    totalPossibleMarks: 3,
    accuracy: 100,
    correctCount: 3,
    incorrectCount: 0,
    unansweredCount: 0,
    markedForReviewCount: 0,
    answers: {
      'q-1': { selectedOptionId: 'opt-a', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 20 },
      'q-2': { selectedOptionId: 'opt-c', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 30 },
      'q-3': { selectedOptionId: 'opt-e', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 40 }, // corrected
    },
    suggestedRevisionTopicIds: [],
  };

  describe('1. calculateOverallSummary', () => {
    it('returns empty fallback metrics when no attempts exist', () => {
      const summary = calculateOverallSummary([], [dummyMockTest], dummyTopics, dummySubjects);
      expect(summary.totalTestsAttempted).toBe(0);
      expect(summary.overallAccuracy).toBe(0);
      expect(summary.personalBest).toBeNull();
    });

    it('calculates aggregated metrics accurately across attempts', () => {
      const summary = calculateOverallSummary([attempt1, attempt2], [dummyMockTest], dummyTopics, dummySubjects);
      expect(summary.totalTestsAttempted).toBe(2);
      expect(summary.totalTestsCompleted).toBe(2);
      expect(summary.totalQuestionsAttempted).toBe(6);
      expect(summary.totalCorrect).toBe(5);
      expect(summary.totalIncorrect).toBe(1);
      expect(summary.overallAccuracy).toBe(83); // 5/6 = 83%
      expect(summary.highestScore).toBe(3.0);
      expect(summary.improvementSinceFirst).toBe(1.33); // 3.0 - 1.67 = 1.33
    });
  });

  describe('2. calculateSubjectIntelligence', () => {
    it('isolates attempts belonging to the specific subject and calculates 100-mock progress', () => {
      const intel = calculateSubjectIntelligence(
        'sub-polity',
        [attempt1, attempt2],
        [dummyMockTest],
        dummyTopics,
        [],
        dummySubjects
      );

      expect(intel.subjectId).toBe('sub-polity');
      expect(intel.testsCompletedOutOf100).toBe(2);
      expect(intel.averageAccuracy).toBeGreaterThan(0);
      expect(intel.preparednessStatus).toBeDefined();
    });
  });

  describe('3. calculateTopicDeepAnalytics & Sample Size Discipline', () => {
    it('classifies topic with < 5 questions attempted as needs_practice regardless of high early accuracy', () => {
      const topicAnalytics = calculateTopicDeepAnalytics(
        dummyTopics,
        [attempt1],
        [dummyMockTest],
        dummySubjects
      );

      const topPol1 = topicAnalytics.find((t) => t.topicId === 'top-pol-1');
      expect(topPol1).toBeDefined();
      expect(topPol1?.questionsAttempted).toBe(1);
      expect(topPol1?.accuracy).toBe(100);
      // Sample size < 5 questions must be classified as 'needs_practice' to prevent false confidence
      expect(topPol1?.classification).toBe('needs_practice');
    });

    it('classifies topic as strong when sample size >= 5 and accuracy >= 75%', () => {
      // Build 5 attempts where q-1 is answered correctly each time
      const fiveAttempts: TestAttempt[] = [1, 2, 3, 4, 5].map((i) => ({
        ...attempt1,
        id: `att-${i}`,
        completedAt: `2026-10-1${i}T10:00:00Z`,
        answers: {
          'q-1': { selectedOptionId: 'opt-a', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 25 },
        },
      }));

      const topicAnalytics = calculateTopicDeepAnalytics(
        dummyTopics,
        fiveAttempts,
        [dummyMockTest],
        dummySubjects
      );

      const topPol1 = topicAnalytics.find((t) => t.topicId === 'top-pol-1');
      expect(topPol1?.questionsAttempted).toBe(5);
      expect(topPol1?.accuracy).toBe(100);
      expect(topPol1?.classification).toBe('strong');
    });
  });

  describe('4. calculateTimeEfficiency', () => {
    it('identifies slow responses (>90s) and computes time efficiency score', () => {
      const efficiency = calculateTimeEfficiency([attempt1], [dummyMockTest]);
      expect(efficiency.slowResponsesCount).toBe(1); // q-3 was 100s
      expect(efficiency.averageTimeCorrectSeconds).toBeGreaterThan(0);
      expect(efficiency.averageTimeIncorrectSeconds).toBeGreaterThan(0);
      expect(efficiency.timeEfficiencyScore).toBeGreaterThanOrEqual(0);
      expect(efficiency.timeEfficiencyScore).toBeLessThanOrEqual(100);
    });

    it('identifies rapid guesses (<20s and incorrect)', () => {
      const rushedAttempt: TestAttempt = {
        ...attempt1,
        id: 'att-rush',
        answers: {
          'q-1': { selectedOptionId: 'opt-b', isCorrect: false, isMarkedForReview: false, timeSpentSeconds: 12 }, // < 20s and wrong
        },
      };

      const efficiency = calculateTimeEfficiency([rushedAttempt], [dummyMockTest]);
      expect(efficiency.rapidGuessCount).toBe(1);
    });
  });

  describe('5. calculateReadinessIndicator', () => {
    it('computes 3-pillar balanced readiness score and score predictions', () => {
      const readiness = calculateReadinessIndicator([attempt1, attempt2], dummyTopics, dummySubjects);
      expect(readiness.readinessScore).toBeGreaterThanOrEqual(10);
      expect(readiness.readinessScore).toBeLessThanOrEqual(100);
      expect(readiness.syllabusCoverageWeight).toBeLessThanOrEqual(30);
      expect(readiness.accuracyWeight).toBeLessThanOrEqual(50);
      expect(readiness.consistencyWeight).toBeLessThanOrEqual(20);
      expect(readiness.predictedScoreRange.min).toBeLessThan(readiness.predictedScoreRange.max);
    });
  });

  describe('6. syncMistakeBookFromAttempt & Auto-Mastery', () => {
    it('adds incorrect question to mistake book with pending_review status', () => {
      const initialMistakes: MistakeBookItem[] = [];
      const updated = syncMistakeBookFromAttempt(
        initialMistakes,
        attempt1,
        [dummyMockTest],
        dummyTopics,
        dummySubjects
      );

      expect(updated.length).toBe(1);
      expect(updated[0].questionId).toBe('q-3');
      expect(updated[0].mistakeCount).toBe(1);
      expect(updated[0].consecutiveCorrectCount).toBe(0);
      expect(updated[0].revisionStatus).toBe('pending_review');
    });

    it('increments consecutiveCorrectCount on first correct re-attempt (in_revision)', () => {
      const initialMistakes: MistakeBookItem[] = [
        {
          id: 'm-1',
          questionId: 'q-3',
          questionText: 'Protection against arrest',
          options: [],
          correctOptionId: 'opt-e',
          explanation: 'Article 22',
          subjectId: 'sub-polity',
          subjectName: 'Polity',
          topicId: 'top-pol-2',
          topicTitle: 'Fundamental Rights',
          difficulty: 'hard',
          mistakeCount: 1,
          consecutiveCorrectCount: 0,
          firstMistakeDate: '2026-10-17',
          lastMistakeDate: '2026-10-17',
          lastAttemptDate: '2026-10-17',
          mostRecentResult: 'incorrect',
          revisionStatus: 'pending_review',
          errorCategory: 'knowledge_gap',
        },
      ];

      // In attempt2, q-3 was answered correctly!
      const afterFirstCorrect = syncMistakeBookFromAttempt(
        initialMistakes,
        attempt2,
        [dummyMockTest],
        dummyTopics,
        dummySubjects
      );

      expect(afterFirstCorrect[0].consecutiveCorrectCount).toBe(1);
      expect(afterFirstCorrect[0].mostRecentResult).toBe('correct');
      expect(afterFirstCorrect[0].revisionStatus).toBe('in_revision');
    });

    it('transitions to mastered when question is answered correctly 2 consecutive times', () => {
      const initialMistakes: MistakeBookItem[] = [
        {
          id: 'm-1',
          questionId: 'q-3',
          questionText: 'Protection against arrest',
          options: [],
          correctOptionId: 'opt-e',
          explanation: 'Article 22',
          subjectId: 'sub-polity',
          subjectName: 'Polity',
          topicId: 'top-pol-2',
          topicTitle: 'Fundamental Rights',
          difficulty: 'hard',
          mistakeCount: 1,
          consecutiveCorrectCount: 1, // Already has 1 correct
          firstMistakeDate: '2026-10-17',
          lastMistakeDate: '2026-10-17',
          lastAttemptDate: '2026-10-18',
          mostRecentResult: 'correct',
          revisionStatus: 'in_revision',
          errorCategory: 'knowledge_gap',
        },
      ];

      // Attempt 3 where q-3 is answered correctly again!
      const attempt3: TestAttempt = {
        ...attempt2,
        id: 'att-3',
        completedAt: '2026-10-19T10:00:00Z',
      };

      const afterSecondCorrect = syncMistakeBookFromAttempt(
        initialMistakes,
        attempt3,
        [dummyMockTest],
        dummyTopics,
        dummySubjects
      );

      expect(afterSecondCorrect[0].consecutiveCorrectCount).toBe(2);
      expect(afterSecondCorrect[0].revisionStatus).toBe('mastered');
    });
  });

  describe('7. compareTwoAttempts', () => {
    it('computes accurate score delta, accuracy delta, time delta, and topic deltas', () => {
      const comparison = compareTwoAttempts(attempt1, attempt2, [dummyMockTest], dummyTopics);
      expect(comparison.scoreDelta).toBe(1.33); // 3.0 - 1.67 = 1.33
      expect(comparison.accuracyDelta).toBe(33); // 100% - 67% = 33%
      expect(comparison.timeDeltaSeconds).toBe(-120); // 180s - 300s = -120s
      expect(comparison.topicComparison.length).toBeGreaterThan(0);
    });
  });
});
