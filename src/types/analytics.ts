import { ExamTrack, Difficulty, TestAttempt, MockQuestion, SyllabusTopic, Subject } from './index';
import { QuestionDifficulty } from './questionBank';

export type MistakeErrorCategory =
  | 'knowledge_gap'
  | 'conceptual_misunderstanding'
  | 'similar_facts_confusion'
  | 'misread_question'
  | 'incorrect_elimination'
  | 'time_pressure'
  | 'careless_error'
  | 'repeatedly_forgotten'
  | 'unclassified';

export type MistakeRevisionStatus =
  | 'pending_review'
  | 'in_revision'
  | 'mastered';

export interface MistakeBookItem {
  id: string;
  questionId: string;
  questionText: string;
  questionTextTelugu?: string;
  options: { id: string; text: string; textTelugu?: string }[];
  correctOptionId: string;
  explanation: string;
  explanationTelugu?: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicTitle: string;
  subtopicId?: string;
  difficulty: Difficulty | QuestionDifficulty | string;
  mistakeCount: number;
  consecutiveCorrectCount: number;
  firstMistakeDate: string;
  lastMistakeDate: string;
  lastAttemptDate: string;
  mostRecentResult: 'correct' | 'incorrect';
  lastSelectedOptionId?: string;
  revisionStatus: MistakeRevisionStatus;
  errorCategory: MistakeErrorCategory;
  userNotes?: string;
  isBookmarked?: boolean;
}

export type TopicMatrixClassification =
  | 'strong'
  | 'improving'
  | 'needs_practice'
  | 'weak'
  | 'not_attempted';

export interface TopicAnalyticsDetail {
  topicId: string;
  topicTitle: string;
  topicTitleTelugu?: string;
  subjectId: string;
  subjectName: string;
  track: ExamTrack;
  questionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  avgScore: number;
  avgResponseTimeSeconds: number;
  difficultyAccuracy: {
    easy: number;
    moderate: number;
    hard: number;
  };
  attemptCountsByDifficulty: {
    easy: number;
    moderate: number;
    hard: number;
  };
  classification: TopicMatrixClassification;
  improvementTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  improvementDelta: number;
  frequentlyIncorrectConcepts: string[];
  bookmarkedQuestionsCount: number;
  lastPracticedDate?: string;
  recommendedRevisionPriority: 'high' | 'medium' | 'low';
}

export interface SubjectAnalyticsDetail {
  subjectId: string;
  subjectName: string;
  subjectNameTelugu?: string;
  track: ExamTrack;
  paper?: string;
  availableQuestionsCount: number;
  topicsTotal: number;
  topicsAttemptedCount: number;
  subtopicsAttemptedCount: number;
  testsCompletedOutOf100: number;
  averageMarks: number;
  averageAccuracy: number;
  highestScore: number;
  recentScore: number;
  improvementDelta: number;
  averageTimePerQuestionSeconds: number;
  topicCoveragePercent: number;
  strongTopics: { id: string; title: string; accuracy: number; attempts: number }[];
  weakTopics: { id: string; title: string; accuracy: number; attempts: number }[];
  frequentlyIncorrectConcepts: string[];
  unattemptedTopics: { id: string; title: string }[];
  recommendedNextActions: string[];
  preparednessStatus: 'exam_ready' | 'moderate_progress' | 'immediate_focus';
  mockSeriesProgress: {
    testIndex: number;
    mockTestId: string;
    title: string;
    score: number;
    accuracy: number;
    completedAt: string;
  }[];
}

export interface OverallPerformanceSummary {
  totalTestsAttempted: number;
  totalTestsCompleted: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  overallAccuracy: number;
  overallAverageScore: number;
  highestScore: number;
  lowestScore: number;
  avgTimePerQuestionSeconds: number;
  totalStudyAndTestTimeMinutes: number;
  syllabusCoveragePercent: number;
  performanceTrend: 'rising' | 'declining' | 'stable';
  personalBest: { score: number; testTitle: string; date: string } | null;
  improvementSinceFirst: number;
  firstAttemptDate?: string;
  recentAttempts: TestAttempt[];
}

export interface TimeEfficiencyAnalytics {
  avgTimePerQuestion: number;
  avgTimeCorrect: number;
  avgTimeIncorrect: number;
  averageTimeCorrectSeconds: number;
  averageTimeIncorrectSeconds: number;
  slowResponsesCount: number;
  rapidGuessCount: number;
  timeSpentOnDifficultSeconds: number;
  completionRateBeforeExpiry: number;
  timeEfficiencyScore: number;
  efficiencyPatterns: {
    title: string;
    description: string;
    type: 'warning' | 'info' | 'positive';
  }[];
  recommendations: string[];
}

export interface ReadinessIndicator {
  readinessScore: number; // 0 - 100
  readinessLevel:
    | 'Building Foundation'
    | 'Developing Proficiency'
    | 'Improving & Competitive'
    | 'Exam Ready & Consistent';
  predictedScoreRange: {
    min: number;
    max: number;
    label: string;
  };
  syllabusCoverageWeight: number;
  accuracyWeight: number;
  consistencyWeight: number;
  unattemptedHighPriorityAreas: string[];
  explanation: string;
}

export interface PersonalizedStudyRecommendation {
  strongPoints: string[];
  top3Weaknesses: {
    topicId: string;
    topicTitle: string;
    accuracy: number;
    attempts: number;
    advice: string;
  }[];
  top3WeakTopics?: {
    topicId: string;
    topicTitle: string;
    accuracy: number;
    attempts: number;
    advice: string;
  }[];
  topicsToRevise: {
    topicId: string;
    title: string;
    priority: 'high' | 'medium';
  }[];
  incorrectQuestionsToReviewCount: number;
  recommendedPracticeCount: number;
  recommendedDifficulty: 'easy' | 'moderate' | 'hard';
  suggestedNextMockTest: {
    id: string;
    title: string;
    reason: string;
  };
  measurableNextGoal: string;
  generatedNarrative: string;
}

export interface AttemptComparisonResult {
  attemptA: TestAttempt;
  attemptB: TestAttempt;
  scoreDelta: number;
  accuracyDelta: number;
  timeSpentDeltaSeconds: number;
  timeDeltaSeconds: number;
  correctDelta: number;
  incorrectDelta: number;
  topicComparisons: {
    topicId: string;
    topicTitle: string;
    accuracyA: number;
    accuracyB: number;
    accuracyDelta: number;
  }[];
  topicComparison: {
    topicId: string;
    topicTitle: string;
    attemptAScore: number;
    attemptBScore: number;
    delta: number;
  }[];
}
