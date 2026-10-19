import { describe, it, expect } from 'vitest';
import { evaluateTestAttempt } from '../services/mockTestEngine';
import { MockTest } from '../types';

describe('Mock Test Engine (evaluateTestAttempt)', () => {
  const mockTest: MockTest = {
    id: 'test-1',
    title: 'Polity Quiz',
    description: 'Test polity',
    track: 'appsc-prelims',
    isCustom: false,
    durationMinutes: 10,
    totalMarks: 3,
    marksPerQuestion: 1,
    negativeMarks: 0.33,
    createdAt: '2026-10-18T00:00:00Z',
    questions: [
      {
        id: 'q-1',
        track: 'appsc-prelims',
        topicId: 'top-polity-1',
        questionText: 'Preamble Article question?',
        options: [
          { id: 'opt-a', text: 'Option A' },
          { id: 'opt-b', text: 'Option B' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'Option A is correct.',
        difficulty: 'easy',
        marks: 1,
        negativeMarks: 0.33,
      },
      {
        id: 'q-2',
        track: 'appsc-prelims',
        topicId: 'top-polity-2',
        questionText: 'Fundamental Rights question?',
        options: [
          { id: 'opt-c', text: 'Option C' },
          { id: 'opt-d', text: 'Option D' },
        ],
        correctOptionId: 'opt-c',
        explanation: 'Option C is correct.',
        difficulty: 'moderate',
        marks: 1,
        negativeMarks: 0.33,
      },
      {
        id: 'q-3',
        track: 'appsc-prelims',
        topicId: 'top-polity-3',
        questionText: 'DPSP question?',
        options: [
          { id: 'opt-e', text: 'Option E' },
          { id: 'opt-f', text: 'Option F' },
        ],
        correctOptionId: 'opt-e',
        explanation: 'Option E is correct.',
        difficulty: 'hard',
        marks: 1,
        negativeMarks: 0.33,
      },
    ],
  };

  it('calculates score correctly with correct answers and negative marking', () => {
    const submissions = {
      'q-1': { questionId: 'q-1', selectedOptionId: 'opt-a', isMarkedForReview: false, timeSpentSeconds: 30 }, // correct (+1)
      'q-2': { questionId: 'q-2', selectedOptionId: 'opt-d', isMarkedForReview: false, timeSpentSeconds: 40 }, // incorrect (-0.33)
      // q-3 unanswered (0)
    };

    const { attempt, weakTopicIds } = evaluateTestAttempt(
      mockTest,
      submissions,
      '2026-10-18T10:00:00Z',
      '2026-10-18T10:05:00Z'
    );

    expect(attempt.correctCount).toBe(1);
    expect(attempt.incorrectCount).toBe(1);
    expect(attempt.unansweredCount).toBe(1);
    expect(attempt.score).toBe(0.67); // 1 - 0.33 = 0.67
    expect(attempt.accuracy).toBe(50); // 1 / 2 = 50%
    expect(weakTopicIds).toContain('top-polity-2');
  });

  it('handles 100% correct answers with accurate score and feedback', () => {
    const submissions = {
      'q-1': { questionId: 'q-1', selectedOptionId: 'opt-a', isMarkedForReview: false, timeSpentSeconds: 20 },
      'q-2': { questionId: 'q-2', selectedOptionId: 'opt-c', isMarkedForReview: false, timeSpentSeconds: 25 },
      'q-3': { questionId: 'q-3', selectedOptionId: 'opt-e', isMarkedForReview: false, timeSpentSeconds: 30 },
    };

    const { attempt, weakTopicIds, feedbackNotes } = evaluateTestAttempt(
      mockTest,
      submissions,
      '2026-10-18T10:00:00Z',
      '2026-10-18T10:03:00Z'
    );

    expect(attempt.score).toBe(3);
    expect(attempt.accuracy).toBe(100);
    expect(weakTopicIds.length).toBe(0);
    expect(feedbackNotes[0]).toContain('Excellent performance');
  });
});
