// STUDYVERSE Domain Models & Type Definitions

export type ExamTrack = 'appsc-prelims' | 'appsc-mains' | 'semester' | 'general';
export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'moderate' | 'hard';
export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
export type SchedulingMode = 'balanced' | 'deadline_focused' | 'revision_focused';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetExam: string;
  targetDate: string;
  dailyGoalHours: number;
  language: 'en' | 'te';
  theme: 'dark' | 'light';
  density: 'comfortable' | 'compact';
  studySplitRatio: {
    appsc: number; // percentage, e.g. 60
    semester: number; // percentage, e.g. 40
  };
}

export interface AvailabilityRule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  availableHours: number;
  preferredSlots: Array<'morning' | 'afternoon' | 'evening' | 'night'>;
  isRestDay: boolean;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  titleTelugu?: string;
  explanation?: string;
  keyConcepts: string[];
  importantFacts: string[];
  keyFacts?: string[];
  definitions?: string[];
  examples?: string[];
  examRelevance?: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: string;
  orderIndex: number;
  order?: number;
}

export interface ChatGPTLink {
  id: string;
  topicId: string;
  subtopicId?: string;
  subjectId?: string;
  track?: ExamTrack;
  title: string;
  url: string;
  promptSummary?: string;
  notes?: string;
  description?: string;
  language?: 'en' | 'te';
  tags?: string[];
  personalComments?: string;
  isBookmarked?: boolean;
  isCompleted?: boolean;
  createdAt: string;
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  subtopicId?: string;
  subjectId: string;
  track: ExamTrack;
  questionText: string;
  questionTextTelugu?: string;
  options: {
    id: string;
    text: string;
    textTelugu?: string;
  }[];
  correctOptionId: string;
  explanation: string;
  explanationTelugu?: string;
  difficulty: Difficulty;
  source?: string;
  personalNotes?: string;
  isBookmarked: boolean;
  attemptHistory?: {
    attemptedAt: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

export interface SyllabusTopic {
  id: string;
  subjectId: string;
  track: ExamTrack;
  paper?: string;
  topicNumber?: number; // 1 to 30 for study groups
  title: string;
  titleTelugu?: string;
  description?: string;
  learningObjectives?: string[];
  timeline?: string;
  importantPersonalities?: string[];
  keyEvents?: string[];
  causesAndConsequences?: string;
  examFacts?: string[];
  estimatedHours: number;
  difficulty: Difficulty;
  priority: Priority;
  status: TopicStatus;
  progressPercent: number;
  isVerified?: boolean;
  verificationSource?: string;
  isSharedWithMains?: boolean;
  sharedMainsTopicId?: string;
  relatedTopicIds?: string[];
  subtopicIds?: string[];
  revisionIntervalDays?: number[];
  lastStudiedAt?: string;
  completedAt?: string;
  resourceIds?: string[];
  chatgptLinkIds?: string[];
  practiceQuestionIds?: string[];
  personalNotes?: string;
  targetQuestionCount?: number; // Target question bank per topic, default 500
  // Progress telemetry
  conceptsLearned?: boolean;
  notesReviewed?: boolean;
  practiceCompleted?: boolean;
  revisionCompleted?: boolean;
}

export interface Subject {
  id: string;
  track: ExamTrack;
  paper?: string;
  code?: string;
  groupNumber?: number; // 1 to 5 for Prelims
  name: string;
  nameTelugu?: string;
  description?: string;
  color: string;
  priority: Priority;
  semesterId?: string;
  officialMarks?: number;
  targetWeightPercent?: number;
  targetHours: number;
}

export interface SemesterInfo {
  id: string;
  degreeName: string; // e.g. "M.Tech" or "B.Tech"
  academicYear: string; // e.g. "2026-2027"
  yearName: string; // e.g. "1st Year (SAHE M.Tech-24)"
  semesterName: string; // e.g. "1st Semester"
  branch: string; // e.g. "Artificial Intelligence & Data Science"
  internal1Date?: string;
  internal2Date?: string;
  mid1Date?: string;
  mid2Date?: string;
  labExamDate?: string;
  finalExamStartDate?: string;
  finalExamEndDate?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  track: ExamTrack;
  subjectIds: string[];
  topicIds: string[];
  startDate: string;
  targetCompletionDate: string;
  dailyAvailableHours: number;
  schedulingMode: SchedulingMode;
  isPaused: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  planId?: string;
  topicId: string;
  subtopicId?: string;
  subjectId: string;
  track: ExamTrack;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  durationMinutes: number;
  taskType?: 'learn' | 'practice' | 'revision' | 'mock_test';
  attachedResourceId?: string;
  attachedChatGPTLinkId?: string;
  isRevision: boolean;
  revisionCycle?: number;
  isCompleted: boolean;
  completedAt?: string;
  isOverdue?: boolean;
  notes?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'pdf' | 'notes' | 'link' | 'pyq' | 'mock_test_ref';
  track: ExamTrack;
  subjectId?: string;
  topicIds: string[];
  subtopicId?: string;
  description?: string;
  fileUrl?: string; // Data URI or cloud URL
  fileName?: string;
  fileSize?: string;
  fileSizeBytes?: number;
  content?: string; // Rich markdown text
  externalUrl?: string;
  tags: string[];
  language: 'en' | 'te';
  isVerified: boolean;
  sourceUrl?: string;
  publicationDate?: string;
  lastVerifiedDate?: string;
  isBookmarked: boolean;
  personalComments?: string;
  lastOpenedAt?: string;
  createdAt: string;
}

export interface MockQuestion {
  id: string;
  testId?: string;
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  track: ExamTrack;
  questionText: string;
  questionTextTelugu?: string;
  options: {
    id: string;
    text: string;
    textTelugu?: string;
  }[];
  correctOptionId: string;
  explanation: string;
  explanationTelugu?: string;
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  track: ExamTrack;
  paper?: string;
  subjectId?: string;
  isCustom: boolean;
  durationMinutes: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  questions: MockQuestion[];
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  track: ExamTrack;
  startedAt: string;
  completedAt: string;
  timeSpentSeconds: number;
  score: number;
  totalPossibleMarks: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  markedForReviewCount: number;
  answers: Record<string, {
    selectedOptionId?: string;
    isCorrect: boolean;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
  }>;
  suggestedRevisionTopicIds: string[];
}

export interface MainsAnswerPrompt {
  id: string;
  paper: string;
  subject: string;
  topicId?: string;
  questionText: string;
  wordLimit: number;
  marks: number;
  modelAnswer: string;
  rubric: {
    criterion: string;
    maxMarks: number;
    description: string;
  }[];
  userDraft?: string;
  userScoreSelf?: number;
  status: 'draft' | 'evaluated' | 'unattempted';
  lastUpdated?: string;
  referenceResourceIds?: string[];
}

export interface RevisionItem {
  id: string;
  topicId: string;
  subtopicId?: string;
  subjectId: string;
  track: ExamTrack;
  title: string;
  keyFacts?: string[];
  formulaeOrDefs?: string[];
  repetitionStage: number; // 1, 2, 3, 4, 5
  nextDueDate: string; // YYYY-MM-DD
  lastReviewedDate?: string;
  difficultyRating?: 'easy' | 'good' | 'hard';
  isDue: boolean;
  isOverdue: boolean;
  sourceQuestionId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  type: 'exam_prelims' | 'exam_mains' | 'exam_sem_mid' | 'exam_sem_final' | 'mock_test' | 'study_deadline' | 'custom';
  track: ExamTrack;
  color: string;
  isCompleted?: boolean;
}

export interface ExamSettings {
  examId: string;
  examName: string;
  totalQuestions: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  durationMinutes: number;
  subjectTargets: {
    subjectId: string;
    subjectName: string;
    officialMarks?: number;
    studyTargetWeightPercent: number;
    targetHours: number;
  }[];
}

export interface StudyVerseState {
  profile: UserProfile;
  availabilityRules: AvailabilityRule[];
  examSettings: ExamSettings;
  subjects: Subject[];
  topics: SyllabusTopic[];
  subtopics: Subtopic[];
  chatgptLinks: ChatGPTLink[];
  practiceQuestions: PracticeQuestion[];
  plans: StudyPlan[];
  tasks: StudyTask[];
  resources: ResourceItem[];
  mockTests: MockTest[];
  testAttempts: TestAttempt[];
  mainsPrompts: MainsAnswerPrompt[];
  revisions: RevisionItem[];
  calendarEvents: CalendarEvent[];
  semesterInfo: SemesterInfo;
  bankQuestions?: import('./questionBank').BankQuestionItem[];
  generationJobs?: import('./questionBank').GenerationJob[];
  testBlueprints?: import('./questionBank').TestBlueprint[];
  mistakeBook?: import('./analytics').MistakeBookItem[];
  isUsingSupabase: boolean;
  lastSyncedAt?: string;
}

export * from './questionBank';
export * from './analytics';
