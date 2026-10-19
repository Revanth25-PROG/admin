import { ExamTrack, Difficulty } from './index';

export type QuestionType =
  | 'single_correct'
  | 'multi_select'
  | 'assertion_reason'
  | 'statement_based'
  | 'match_following'
  | 'chronology'
  | 'true_false'
  | 'numerical'
  | 'case_based'
  | 'descriptive_mains';

export type QuestionDifficulty =
  | 'easy'
  | 'moderate'
  | 'difficult'
  | 'very_difficult'
  | 'exam_tricky';

export type ValidationStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export type QuestionSourceType =
  | 'pyq'
  | 'telugu_akademi'
  | 'standard_book'
  | 'official_notification'
  | 'notes_grounded'
  | 'ai_generated'
  | 'manual_entry';

export interface QuestionOption {
  id: string;
  text: string;
  textTelugu?: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface BankQuestionItem {
  id: string;
  examTrack: ExamTrack;
  subjectId: string;
  topicId: string;
  subtopicId?: string;
  syllabusVersion?: string;
  questionType: QuestionType;
  questionText: string;
  questionTextTelugu?: string;
  options: QuestionOption[];
  correctAnswer: string | string[]; // Option ID or array of IDs
  explanation: string;
  explanationTelugu?: string;
  difficulty: QuestionDifficulty;
  language: 'en' | 'te';
  marks: number;
  negativeMarks: number;
  sourceType?: QuestionSourceType;
  sourceReference?: string;
  sourceUrl?: string;
  sourcePage?: number | string;
  learningObjective?: string;
  keywords?: string[];
  questionFingerprint?: string;
  generatedBy?: string;
  generationBatchId?: string;
  validationStatus: ValidationStatus;
  publicationStatus: 'published' | 'draft' | 'archived';
  isBookmarked?: boolean;
  reviewNotes?: string;
  attemptCount?: number;
  correctAttemptCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicTargetStats {
  topicId: string;
  topicTitle: string;
  subjectId: string;
  targetCount: number; // default 500
  targetQuestionCount?: number;
  approvedCount: number;
  pendingCount: number;
  pendingReviewCount?: number;
  rejectedCount: number;
  remainingTarget: number;
  coveragePercent: number;
  attemptedCount: number;
  availableNewCount: number;
  totalBankCount?: number;
}

export interface GenerationJob {
  id: string;
  title?: string;
  examTrack?: ExamTrack;
  subjectId: string;
  topicId: string;
  subtopicId?: string;
  targetQuestions?: number;
  batchSize: number; // 10 to 25
  totalBatches?: number;
  completedBatches?: number;
  generatedQuestionsCount?: number;
  generatedCount?: number;
  approvedCount: number;
  rejectedCount?: number;
  targetQuestionCount?: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
  progressPercent?: number;
  aiProvider?: 'gemini' | 'openai' | 'anthropic' | 'offline_rule_engine';
  difficultyDistribution?: {
    easy: number;
    moderate: number;
    difficult: number;
    very_difficult: number;
    exam_tricky: number;
  };
  difficultyMix?: Record<string, number>;
  sourceResourceId?: string;
  sourceNotesSnippet?: string;
  errorMessage?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestBlueprint {
  id: string;
  title: string;
  description: string;
  examTrack: ExamTrack;
  mode:
    | 'topic_practice'
    | 'subtopic_practice'
    | 'subject_mock'
    | 'full_simulation'
    | 'pyq_practice'
    | 'wrong_retry'
    | 'bookmarked'
    | 'spaced_revision'
    | 'custom'
    | 'semester_model'
    | 'mains_descriptive';
  subjectIds: string[];
  topicIds: string[];
  questionCount: number;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  passingScore?: number;
  difficultyDistribution: {
    easy: number;
    moderate: number;
    difficult: number;
    very_difficult: number;
    exam_tricky: number;
  };
  questionTypes: QuestionType[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReviewAnswers: boolean;
  createdAt: string;
}

export interface QuestionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  duplicateQuestionId?: string;
}
