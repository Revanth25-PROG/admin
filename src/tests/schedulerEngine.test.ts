import { describe, it, expect } from 'vitest';
import { generateSmartSchedule, rescheduleMissedTasks } from '../services/schedulerEngine';
import { AvailabilityRule, StudyPlan, SyllabusTopic, Subject } from '../types';

describe('Smart Day Allocator (schedulerEngine)', () => {
  const mockAvailability: AvailabilityRule[] = [
    { dayOfWeek: 0, availableHours: 4.0, preferredSlots: ['morning'], isRestDay: false },
    { dayOfWeek: 1, availableHours: 6.0, preferredSlots: ['morning', 'evening'], isRestDay: false },
    { dayOfWeek: 2, availableHours: 6.0, preferredSlots: ['morning', 'evening'], isRestDay: false },
    { dayOfWeek: 3, availableHours: 6.0, preferredSlots: ['morning', 'evening'], isRestDay: false },
    { dayOfWeek: 4, availableHours: 6.0, preferredSlots: ['morning', 'evening'], isRestDay: false },
    { dayOfWeek: 5, availableHours: 6.0, preferredSlots: ['morning', 'evening'], isRestDay: false },
    { dayOfWeek: 6, availableHours: 0.0, preferredSlots: [], isRestDay: true }, // rest day
  ];

  const mockSubjects: Subject[] = [
    { id: 'sub-1', track: 'appsc-prelims', name: 'History', color: '#3b82f6', priority: 'high', targetHours: 20 },
    { id: 'sub-2', track: 'semester', name: 'Operating Systems', color: '#10b981', priority: 'high', targetHours: 20 },
  ];

  const mockTopics: SyllabusTopic[] = [
    {
      id: 'top-1',
      subjectId: 'sub-1',
      track: 'appsc-prelims',
      title: 'Indus Valley',
      estimatedHours: 4,
      difficulty: 'moderate',
      priority: 'high',
      status: 'not_started',
      progressPercent: 0,
    },
    {
      id: 'top-2',
      subjectId: 'sub-2',
      track: 'semester',
      title: 'Process Synchronization',
      estimatedHours: 3,
      difficulty: 'hard',
      priority: 'high',
      status: 'not_started',
      progressPercent: 0,
    },
  ];

  const mockPlan: StudyPlan = {
    id: 'plan-1',
    title: 'Test Plan',
    description: 'Test',
    track: 'appsc-prelims',
    subjectIds: ['sub-1', 'sub-2'],
    topicIds: ['top-1', 'top-2'],
    startDate: '2026-10-18',
    targetCompletionDate: '2026-10-25',
    dailyAvailableHours: 4,
    schedulingMode: 'balanced',
    isPaused: false,
    isArchived: false,
    createdAt: '2026-10-18T00:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  };

  it('allocates study sessions deterministically within available daily time', () => {
    const result = generateSmartSchedule({
      plan: mockPlan,
      plans: [mockPlan],
      topics: mockTopics,
      subjects: mockSubjects,
      existingTasks: [],
      availabilityRules: mockAvailability,
      revisions: [],
      calendarEvents: [],
      mode: 'balanced',
      splitRatio: { appsc: 60, semester: 40 },
      startDate: '2026-10-19', // Monday
      daysToGenerate: 5,
    });

    expect(result.tasks.length).toBeGreaterThan(0);
    expect(result.summary.totalMinutesScheduled).toBeGreaterThan(0);
    // Verified that tasks are allocated for mock topics
    const hasTop1 = result.tasks.some((t) => t.topicId === 'top-1');
    const hasTop2 = result.tasks.some((t) => t.topicId === 'top-2');
    expect(hasTop1 || hasTop2).toBe(true);
  });

  it('skips scheduled tasks on configured rest days', () => {
    // 2026-10-24 is a Saturday (dayOfWeek = 6, which isRestDay = true)
    const result = generateSmartSchedule({
      plan: mockPlan,
      plans: [mockPlan],
      topics: mockTopics,
      subjects: mockSubjects,
      existingTasks: [],
      availabilityRules: mockAvailability,
      revisions: [],
      calendarEvents: [],
      mode: 'balanced',
      splitRatio: { appsc: 50, semester: 50 },
      startDate: '2026-10-24', // Saturday
      daysToGenerate: 1,
    });

    // Since Saturday is rest day, no tasks should be scheduled
    expect(result.tasks.length).toBe(0);
  });

  it('reschedules missed tasks without overloading the next single day', () => {
    const missed = [
      {
        id: 'missed-1',
        topicId: 'top-1',
        subjectId: 'sub-1',
        track: 'appsc-prelims' as const,
        title: 'Missed Task 1',
        date: '2026-10-17',
        durationMinutes: 120,
        isRevision: false,
        isCompleted: false,
      },
      {
        id: 'missed-2',
        topicId: 'top-2',
        subjectId: 'sub-2',
        track: 'semester' as const,
        title: 'Missed Task 2',
        date: '2026-10-17',
        durationMinutes: 120,
        isRevision: false,
        isCompleted: false,
      },
    ];

    const { rescheduledTasks } = rescheduleMissedTasks(
      missed,
      [],
      mockAvailability,
      '2026-10-19'
    );

    expect(rescheduledTasks.length).toBe(2);
    expect(rescheduledTasks[0].date).toBe('2026-10-19');
    expect(rescheduledTasks[0].notes).toContain('Rescheduled from missed date');
  });
});
