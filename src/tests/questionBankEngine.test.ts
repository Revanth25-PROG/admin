import { describe, it, expect } from 'vitest';
import {
  calculateTopicTargetStats,
  calculateSubjectTargetStats,
  validateQuestion,
  generateQuestionFingerprint,
  generateQuestionBatch,
  exportQuestionsToPython,
  parseQuestionsFromPython,
  getSamplePythonTemplate,
  validateAndReportMockTestsJson,
} from '../services/questionBankEngine';
import {
  assembleTestFromBlueprint,
  createRetryTestForIncorrect,
  evaluateTestAttempt,
} from '../services/mockTestEngine';
import { BankQuestionItem, TestBlueprint } from '../types/questionBank';
import { SyllabusTopic, MockTest, TestAttempt } from '../types';

describe('Question Bank Engine & 500-Target Tracking', () => {
  const sampleTopic: SyllabusTopic = {
    id: 'top-test-1',
    subjectId: 'sub-test-1',
    track: 'appsc-prelims',
    title: 'Indus Valley Civilization',
    estimatedHours: 4,
    difficulty: 'moderate',
    priority: 'high',
    status: 'in_progress',
    progressPercent: 30,
    targetQuestionCount: 500,
  };

  const sampleQuestions: BankQuestionItem[] = [
    {
      id: 'bq-1',
      examTrack: 'appsc-prelims',
      subjectId: 'sub-test-1',
      topicId: 'top-test-1',
      questionType: 'single_correct',
      questionText: 'Which site is famous for the Great Bath in Indus Valley Civilization?',
      options: [
        { id: 'opt-1', text: 'Mohenjo-daro' },
        { id: 'opt-2', text: 'Harappa' },
        { id: 'opt-3', text: 'Lothal' },
        { id: 'opt-4', text: 'Kalibangan' },
      ],
      correctAnswer: 'opt-1',
      explanation: 'The Great Bath was excavated at Mohenjo-daro.',
      difficulty: 'easy',
      language: 'en',
      marks: 1.0,
      negativeMarks: 0.33,
      sourceType: 'standard_book',
      validationStatus: 'approved',
      publicationStatus: 'published',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
    },
    {
      id: 'bq-2',
      examTrack: 'appsc-prelims',
      subjectId: 'sub-test-1',
      topicId: 'top-test-1',
      questionType: 'single_correct',
      questionText: 'Which Indus Valley site has dockyard evidence?',
      options: [
        { id: 'opt-1', text: 'Lothal' },
        { id: 'opt-2', text: 'Ropar' },
      ],
      correctAnswer: 'opt-1',
      explanation: 'Lothal in Gujarat is the premier tidal dockyard.',
      difficulty: 'moderate',
      language: 'en',
      marks: 1.0,
      negativeMarks: 0.33,
      sourceType: 'standard_book',
      validationStatus: 'pending_review',
      publicationStatus: 'draft',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
    },
    {
      id: 'bq-3',
      examTrack: 'appsc-prelims',
      subjectId: 'sub-test-1',
      topicId: 'top-test-1',
      questionType: 'single_correct',
      questionText: 'Invalid question without explanation',
      options: [
        { id: 'opt-1', text: 'A' },
        { id: 'opt-2', text: 'B' },
      ],
      correctAnswer: 'opt-1',
      explanation: '',
      difficulty: 'difficult',
      language: 'en',
      marks: 1.0,
      negativeMarks: 0.33,
      sourceType: 'ai_generated',
      validationStatus: 'rejected',
      publicationStatus: 'draft',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
    },
  ];

  it('calculates topic 500-target metrics correctly', () => {
    const stats = calculateTopicTargetStats(sampleTopic, sampleQuestions);

    expect(stats.targetCount).toBe(500);
    expect(stats.approvedCount).toBe(1);
    expect(stats.pendingReviewCount).toBe(1);
    expect(stats.rejectedCount).toBe(1);
    expect(stats.remainingTarget).toBe(499); // 500 - 1 approved
    expect(stats.coveragePercent).toBe(0); // Math.round((1 / 500) * 100) = 0%
  });

  it('calculates subject aggregated coverage statistics correctly', () => {
    const stats = calculateSubjectTargetStats('sub-test-1', [sampleTopic], sampleQuestions);

    expect(stats.subjectId).toBe('sub-test-1');
    expect(stats.totalTarget).toBe(500);
    expect(stats.totalApproved).toBe(1);
    expect(stats.totalPending).toBe(1);
    expect(stats.totalRejected).toBe(1);
  });

  it('validates question quality and detects duplicate fingerprints', () => {
    const duplicateQuestion: BankQuestionItem = {
      ...sampleQuestions[0],
      id: 'bq-dup-99',
      questionText: 'Which site is famous for the Great Bath in Indus Valley Civilization?',
    };

    const validation = validateQuestion(duplicateQuestion, sampleQuestions);
    expect(validation.isDuplicate).toBe(true);
    expect(validation.duplicateQuestionId).toBe('bq-1');
  });

  it('generates a question batch grounded in syllabus topic with 10 questions', () => {
    const batch = generateQuestionBatch(
      'sub-test-1',
      'top-test-1',
      'Indus Valley Civilization',
      10,
      'moderate'
    );

    expect(batch.length).toBe(10);
    batch.forEach((q) => {
      expect(q.subjectId).toBe('sub-test-1');
      expect(q.topicId).toBe('top-test-1');
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswer).toBeDefined();
      expect(q.explanation.length).toBeGreaterThan(10);
    });
  });
});

describe('Blueprint Test Assembler & Retry Engine', () => {
  const sampleBank: BankQuestionItem[] = Array.from({ length: 30 }).map((_, i) => ({
    id: `bank-q-${i + 1}`,
    examTrack: 'appsc-prelims',
    subjectId: 'sub-test-1',
    topicId: `top-${(i % 3) + 1}`,
    questionType: 'single_correct',
    questionText: `Sample question statement #${i + 1}`,
    options: [
      { id: 'opt-1', text: 'Option 1' },
      { id: 'opt-2', text: 'Option 2' },
      { id: 'opt-3', text: 'Option 3' },
      { id: 'opt-4', text: 'Option 4' },
    ],
    correctAnswer: 'opt-1',
    explanation: `Explanation for question #${i + 1}`,
    difficulty: i < 6 ? 'easy' : i < 18 ? 'moderate' : 'difficult',
    language: 'en',
    marks: 1.0,
    negativeMarks: 0.33,
    sourceType: 'standard_book',
    validationStatus: 'approved',
    publicationStatus: 'published',
    createdAt: '2026-10-18T00:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  }));

  const sampleBlueprint: TestBlueprint = {
    id: 'bp-prelims-test',
    title: 'APPSC Group 2 Prelims Practice Simulation',
    description: 'Sectional test from question bank',
    examTrack: 'appsc-prelims',
    mode: 'subject_mock',
    subjectIds: ['sub-test-1'],
    topicIds: [],
    questionCount: 15,
    durationMinutes: 15,
    marksPerQuestion: 1.0,
    negativeMarks: 0.33,
    difficultyDistribution: {
      easy: 20,
      moderate: 50,
      difficult: 30,
      very_difficult: 0,
      exam_tricky: 0,
    },
    questionTypes: ['single_correct'],
    shuffleQuestions: true,
    shuffleOptions: true,
    allowReviewAnswers: true,
    createdAt: '2026-10-18T00:00:00Z',
  };

  it('assembles a test adhering to blueprint quota and negative marking', () => {
    const { test } = assembleTestFromBlueprint(sampleBlueprint, sampleBank);

    expect(test.title).toBe(sampleBlueprint.title);
    expect(test.questions.length).toBe(15);
    expect(test.durationMinutes).toBe(15);
    expect(test.marksPerQuestion).toBe(1.0);
    expect(test.negativeMarks).toBe(0.33);
    expect(test.totalMarks).toBe(15);
  });

  it('creates an instant retry test for missed/incorrect questions', () => {
    const { test } = assembleTestFromBlueprint(sampleBlueprint, sampleBank);

    // Simulate attempt where question 1 & 2 are wrong, question 3 is correct
    const mockAttempt: TestAttempt = {
      id: 'attempt-1',
      testId: test.id,
      testTitle: test.title,
      track: 'appsc-prelims',
      startedAt: '2026-10-18T10:00:00Z',
      completedAt: '2026-10-18T10:15:00Z',
      timeSpentSeconds: 600,
      score: 0.34,
      totalPossibleMarks: 15,
      accuracy: 33.3,
      correctCount: 1,
      incorrectCount: 2,
      unansweredCount: 12,
      markedForReviewCount: 0,
      answers: {
        [test.questions[0].id]: { selectedOptionId: 'opt-2', isCorrect: false, isMarkedForReview: false, timeSpentSeconds: 30 },
        [test.questions[1].id]: { selectedOptionId: 'opt-3', isCorrect: false, isMarkedForReview: false, timeSpentSeconds: 40 },
        [test.questions[2].id]: { selectedOptionId: 'opt-1', isCorrect: true, isMarkedForReview: false, timeSpentSeconds: 20 },
      },
      suggestedRevisionTopicIds: [],
    };

    const retryTest = createRetryTestForIncorrect(mockAttempt, test);

    expect(retryTest).not.toBeNull();
    expect(retryTest?.questions.length).toBe(2);
    expect(retryTest?.questions.map((q) => q.id)).toContain(test.questions[0].id);
    expect(retryTest?.questions.map((q) => q.id)).toContain(test.questions[1].id);
    expect(retryTest?.questions.map((q) => q.id)).not.toContain(test.questions[2].id);
  });

  it('exports and parses Python quiz list contracts accurately (Section 6 spec)', () => {
    const pythonSnippet = `quiz = [
    {
        "id": "HIST-MUG-0001",
        "q": "Mughal Empire founder evaru?",
        "options": [
            "A) Akbar",
            "B) Babur",
            "C) Humayun",
            "D) Shah Jahan"
        ],
        "ans": "B",
        "explanation": "Babur established Mughal rule in India after defeating Ibrahim Lodi at the First Battle of Panipat in 1526.",
        "subject": "Indian History",
        "topic": "Medieval Indian History",
        "subtopic": "Mughal Empire",
        "difficulty": "easy",
        "exam_stage": "prelims",
        "marks": 1,
        "negative_marks": 0.33,
        "source_reference": "Verified reference required",
        "tags": ["Babur", "First Battle of Panipat"]
    }
]`;

    const { questions, errors, duplicateCount } = parseQuestionsFromPython(pythonSnippet);

    expect(errors.length).toBe(0);
    expect(duplicateCount).toBe(0);
    expect(questions.length).toBe(1);

    const q = questions[0];
    expect(q.id).toBe('HIST-MUG-0001');
    expect(q.questionText).toBe('Mughal Empire founder evaru?');
    expect(q.options.length).toBe(4);
    expect(q.options[1].text).toBe('Babur');
    expect(q.correctAnswer).toBe('opt-2'); // B maps to opt-2
    expect(q.explanation).toContain('Babur established Mughal rule');
    expect(q.difficulty).toBe('easy');
    expect(q.marks).toBe(1);
    expect(q.negativeMarks).toBe(0.33);

    // Test Python Export round-trip
    const exportedPython = exportQuestionsToPython(questions);
    expect(exportedPython).toContain('quiz =');
    expect(exportedPython).toContain('"q": "Mughal Empire founder evaru?"');
    expect(exportedPython).toContain('"ans": "B"');

    // Test duplicate detection when importing again
    const reImport = parseQuestionsFromPython(pythonSnippet, undefined, undefined, questions);
    expect(reImport.duplicateCount).toBe(1);
  });

  it('validates Section 5 JSON format, detects missing fields, verifies 4 options, and audits duplicate questions', () => {
    const validJsonSample = `[
      {
        "id": "MUG001",
        "q": "Which Mughal emperor instituted the Mansabdari system?",
        "options": {
          "A": "Babur",
          "B": "Akbar",
          "C": "Jahangir",
          "D": "Shah Jahan"
        },
        "ans": "B",
        "explanation": "Akbar introduced the Mansabdari system in 1571 CE.",
        "subject": "Indian History",
        "topic": "Mughal Empire",
        "difficulty": "easy",
        "marks": 1,
        "negative_marks": 0.33
      },
      {
        "id": "GEO001",
        "q": "Which planet is known as the Earth's twin?",
        "options": {
          "A": "Mars",
          "B": "Venus",
          "C": "Mercury",
          "D": "Jupiter"
        },
        "ans": "B",
        "explanation": "Venus is often called Earth's twin because of similar size and density.",
        "subject": "Geography",
        "topic": "Solar System",
        "difficulty": "easy",
        "marks": 1,
        "negative_marks": 0.33
      }
    ]`;

    // Test valid report
    const validReport = validateAndReportMockTestsJson(validJsonSample);
    expect(validReport.isValid).toBe(true);
    expect(validReport.totalParsed).toBe(2);
    expect(validReport.validCount).toBe(2);
    expect(validReport.invalidCount).toBe(0);
    expect(validReport.uniqueIdsCount).toBe(2);
    expect(validReport.duplicateIds.length).toBe(0);
    expect(validReport.invalidOptionCounts.length).toBe(0);
    expect(validReport.invalidAnswerKeys.length).toBe(0);
    expect(validReport.missingFields.length).toBe(0);

    // Verify parsed question attributes
    const q1 = validReport.questions[0];
    expect(q1.id).toBe('MUG001');
    expect(q1.questionText).toContain('Mansabdari');
    expect(q1.options.length).toBe(4);
    expect(q1.correctAnswer).toBe('B');
    expect(q1.negativeMarks).toBe(0.33);

    // Test invalid JSON with duplicate ID, missing ans, and bad option count
    const invalidJsonSample = `[
      {
        "id": "ERR001",
        "q": "Invalid question with only 2 options and invalid ans",
        "options": {
          "A": "Option A",
          "B": "Option B"
        },
        "ans": "Z",
        "explanation": "Explanation here",
        "subject": "Indian History"
      },
      {
        "id": "ERR001",
        "q": "Duplicate ID with missing explanation",
        "options": {
          "A": "A",
          "B": "B",
          "C": "C",
          "D": "D"
        },
        "ans": "A",
        "subject": "Indian History"
      }
    ]`;

    const invalidReport = validateAndReportMockTestsJson(invalidJsonSample);
    expect(invalidReport.isValid).toBe(false);
    expect(invalidReport.duplicateIds).toContain('ERR001');
    expect(invalidReport.invalidOptionCounts.some(o => o.id === 'ERR001')).toBe(true);
    expect(invalidReport.invalidAnswerKeys.some(a => a.ans === 'Z')).toBe(true);
    expect(invalidReport.missingExplanations.some(e => e.id === 'ERR001')).toBe(true);
  });
});
