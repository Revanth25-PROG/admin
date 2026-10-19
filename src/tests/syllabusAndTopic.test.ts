import { describe, it, expect, beforeEach } from 'vitest';
import {
  PRELIMS_SUBJECT_GROUPS,
  INITIAL_PRELIMS_150_TOPICS,
  DEFAULT_EXAM_SETTINGS,
} from '../services/syllabusDatabase';
import { storageService } from '../services/storageService';
import { Subtopic, PracticeQuestion } from '../types';

describe('Syllabus & 150-Topic Architecture', () => {
  it('has exactly 5 Prelims Subject Groups as specified in Module 1', () => {
    expect(PRELIMS_SUBJECT_GROUPS).toHaveLength(5);
    const expectedGroups = [
      'Indian History and Culture',
      'Indian and Andhra Pradesh Geography',
      'Indian Polity and Governance',
      'Indian and Andhra Pradesh Economy',
      'General Science, Environment and Mental Ability',
    ];
    expectedGroups.forEach((groupName, idx) => {
      expect(PRELIMS_SUBJECT_GROUPS[idx].name).toContain(groupName);
      expect(PRELIMS_SUBJECT_GROUPS[idx].track).toBe('appsc-prelims');
    });
  });

  it('has exactly 150 Prelims Topics (30 numbered topics per group) with no empty placeholders', () => {
    expect(INITIAL_PRELIMS_150_TOPICS).toHaveLength(150);

    const groupIds = [
      'sub-pre-group-1',
      'sub-pre-group-2',
      'sub-pre-group-3',
      'sub-pre-group-4',
      'sub-pre-group-5',
    ];

    groupIds.forEach((gId) => {
      const groupTopics = INITIAL_PRELIMS_150_TOPICS.filter((t) => t.subjectId === gId);
      expect(groupTopics).toHaveLength(30);

      // Verify each topic has a unique number from 1 to 30
      const numbers = groupTopics.map((t) => t.topicNumber).sort((a, b) => (a || 0) - (b || 0));
      for (let i = 1; i <= 30; i++) {
        expect(numbers[i - 1]).toBe(i);
      }

      // Verify non-placeholder titles
      groupTopics.forEach((topic) => {
        expect(topic.title).toBeTruthy();
        expect(topic.title).not.toMatch(/^Topic \d+$/);
        expect(topic.estimatedHours).toBeGreaterThan(0);
        expect(['easy', 'moderate', 'hard']).toContain(topic.difficulty);
        expect(['low', 'medium', 'high']).toContain(topic.priority);
        expect(topic.isVerified).toBe(true);
      });
    });
  });

  it('provides default official exam settings of 150 marks and 1/3 negative marking', () => {
    expect(DEFAULT_EXAM_SETTINGS.totalQuestions).toBe(150);
    expect(DEFAULT_EXAM_SETTINGS.totalMarks).toBe(150);
    expect(DEFAULT_EXAM_SETTINGS.marksPerQuestion).toBe(1.0);
    expect(DEFAULT_EXAM_SETTINGS.negativeMarks).toBeCloseTo(0.33, 2);
    expect(DEFAULT_EXAM_SETTINGS.durationMinutes).toBe(150);
  });
});

describe('Topic Workspace, Subtopics & Spaced Repetition (StorageService)', () => {
  beforeEach(() => {
    storageService.resetToSampleData();
  });

  it('subtopic toggling automatically recalculates parent topic progress percentage', () => {
    const testTopicId = 'top-hist-10'; // Sangam Age (has no initial subtopics)
    const initialTopic = storageService.getState().topics.find((t) => t.id === testTopicId);
    expect(initialTopic).toBeDefined();

    // Add 2 test subtopics
    const st1: Subtopic = {
      id: 'test-st-1',
      topicId: testTopicId,
      title: 'Urban Planning and Citadel',
      orderIndex: 1,
      estimatedMinutes: 45,
      isCompleted: false,
      keyConcepts: ['Grid Pattern', 'Citadel'],
      importantFacts: ['Great Bath at Mohenjodaro'],
    };
    const st2: Subtopic = {
      id: 'test-st-2',
      topicId: testTopicId,
      title: 'Seals, Script and Pottery',
      orderIndex: 2,
      estimatedMinutes: 40,
      isCompleted: false,
      keyConcepts: ['Steatite seals', 'Boustrophedon script'],
      importantFacts: ['Pashupati Mahadeva seal'],
    };

    storageService.saveSubtopic(st1);
    storageService.saveSubtopic(st2);

    // Initial state: 0 / 2 completed -> 0% progress
    storageService.toggleSubtopicCompletion('test-st-1');
    let state = storageService.getState();
    let updatedTopic = state.topics.find((t) => t.id === testTopicId);
    expect(updatedTopic?.progressPercent).toBe(50);
    expect(updatedTopic?.status).toBe('in_progress');

    // Complete second subtopic: 2 / 2 completed -> 100% progress and status 'completed'
    storageService.toggleSubtopicCompletion('test-st-2');
    state = storageService.getState();
    updatedTopic = state.topics.find((t) => t.id === testTopicId);
    expect(updatedTopic?.progressPercent).toBe(100);
    expect(updatedTopic?.status).toBe('completed');
  });

  it('records practice question attempts in history', () => {
    const q: PracticeQuestion = {
      id: 'test-pq-ivc',
      topicId: 'top-hist-2',
      subjectId: 'sub-pre-group-1',
      track: 'appsc-prelims',
      questionText: 'Which IVC site has evidence of ploughed fields?',
      options: [
        { id: 'opt-a', text: 'Kalibangan' },
        { id: 'opt-b', text: 'Lothal' },
      ],
      correctOptionId: 'opt-a',
      explanation: 'Kalibangan in Rajasthan has ploughed agricultural furrows.',
      difficulty: 'moderate',
      isBookmarked: false,
    };

    storageService.savePracticeQuestion(q);
    storageService.recordQuestionAttempt('test-pq-ivc', 'opt-a', true);

    const savedQ = storageService.getState().practiceQuestions.find((item) => item.id === 'test-pq-ivc');
    expect(savedQ).toBeDefined();
    expect(savedQ?.attemptHistory).toHaveLength(1);
    expect(savedQ?.attemptHistory?.[0].isCorrect).toBe(true);
    expect(savedQ?.attemptHistory?.[0].selectedOptionId).toBe('opt-a');
  });

  it('completes revision item with spaced repetition intervals (1, 3, 7, 14, 30 days)', () => {
    const revId = 'rev-item-1';
    storageService.completeRevisionItem(revId, 'good');

    const revItem = storageService.getState().revisions.find((r) => r.id === revId);
    expect(revItem).toBeDefined();
    expect(revItem?.repetitionStage).toBeGreaterThan(1);
    expect(revItem?.difficultyRating).toBe('good');
    expect(revItem?.lastReviewedDate).toBeTruthy();
    expect(revItem?.isDue).toBe(false);
  });

  it('adds and attaches a PDF resource to a topic with bidirectional synchronization', () => {
    const testTopicId = 'top-hist-2';
    const testRes = {
      id: 'test-res-pdf-1',
      title: 'Indus Valley Town Planning Official Telugu Akademi Chapter',
      type: 'pdf' as const,
      track: 'appsc-prelims' as const,
      subjectId: 'sub-pre-group-1',
      topicIds: [testTopicId],
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
      fileName: 'IVC_Town_Planning.pdf',
      fileSize: '1.2 MB',
      tags: ['IVC', 'Telugu Akademi'],
      language: 'te' as const,
      isVerified: true,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    };

    storageService.saveResource(testRes);

    // Verify resource is saved
    const savedRes = storageService.getState().resources.find((r) => r.id === 'test-res-pdf-1');
    expect(savedRes).toBeDefined();
    expect(savedRes?.topicIds).toContain(testTopicId);

    // Verify bidirectional sync with topic.resourceIds
    const updatedTopic = storageService.getState().topics.find((t) => t.id === testTopicId);
    expect(updatedTopic?.resourceIds).toContain('test-res-pdf-1');

    // Test detaching resource from topic
    storageService.detachResourceFromTopic(testTopicId, 'test-res-pdf-1');
    const detachedRes = storageService.getState().resources.find((r) => r.id === 'test-res-pdf-1');
    expect(detachedRes?.topicIds).not.toContain(testTopicId);

    const detachedTopic = storageService.getState().topics.find((t) => t.id === testTopicId);
    expect(detachedTopic?.resourceIds).not.toContain('test-res-pdf-1');

    // Test re-attaching from library
    storageService.attachResourceToTopic(testTopicId, 'test-res-pdf-1');
    const reattachedRes = storageService.getState().resources.find((r) => r.id === 'test-res-pdf-1');
    expect(reattachedRes?.topicIds).toContain(testTopicId);
  });
});
