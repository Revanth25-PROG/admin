import {
  AvailabilityRule,
  ExamTrack,
  SchedulingMode,
  StudyPlan,
  StudyTask,
  SyllabusTopic,
  Subject,
  RevisionItem,
  CalendarEvent,
} from '../types';

export interface ScheduleGeneratorInput {
  plan?: StudyPlan;
  plans: StudyPlan[];
  topics: SyllabusTopic[];
  subjects: Subject[];
  existingTasks: StudyTask[];
  availabilityRules: AvailabilityRule[];
  revisions: RevisionItem[];
  calendarEvents: CalendarEvent[];
  mode: SchedulingMode;
  splitRatio: { appsc: number; semester: number };
  startDate?: string; // YYYY-MM-DD, defaults to today
  daysToGenerate?: number; // defaults to 14 days
}

export interface ScheduleConflict {
  date: string;
  totalRequiredMinutes: number;
  availableMinutes: number;
  overflowMinutes: number;
  reason: string;
}

export interface GenerationResult {
  tasks: StudyTask[];
  conflicts: ScheduleConflict[];
  summary: {
    totalTasksCreated: number;
    totalMinutesScheduled: number;
    appscMinutes: number;
    semesterMinutes: number;
    revisionMinutes: number;
    averageDailyHours: number;
  };
}

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD into Date at local 00:00:00
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Add days to a date string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Deterministic Day Allocator Engine
 */
export function generateSmartSchedule(input: ScheduleGeneratorInput): GenerationResult {
  const todayStr = input.startDate || formatDate(new Date());
  const numDays = input.daysToGenerate || 14;
  const newTasks: StudyTask[] = [];
  const conflicts: ScheduleConflict[] = [];

  // Map availability rules by dayOfWeek (0-6)
  const ruleMap = new Map<number, AvailabilityRule>();
  input.availabilityRules.forEach((rule) => {
    ruleMap.set(rule.dayOfWeek, rule);
  });

  // Track map & Subject map for quick lookup
  const topicMap = new Map<string, SyllabusTopic>();
  input.topics.forEach((t) => topicMap.set(t.id, t));

  const subjectMap = new Map<string, Subject>();
  input.subjects.forEach((s) => subjectMap.set(s.id, s));

  // Determine which topics need scheduling
  const candidateTopics = input.topics.filter((t) => {
    if (t.status === 'completed') return false;
    // If a specific plan is passed, only topics in that plan
    if (input.plan) {
      return input.plan.topicIds.includes(t.id);
    }
    return true;
  });

  // Sort candidate topics according to scheduling mode
  const sortedTopics = [...candidateTopics].sort((a, b) => {
    if (input.mode === 'deadline_focused') {
      // Prioritize high priority, then hard difficulty
      const pOrder = { high: 0, medium: 1, low: 2 };
      const pDiff = pOrder[a.priority] - pOrder[b.priority];
      if (pDiff !== 0) return pDiff;

      const dOrder = { hard: 0, moderate: 1, easy: 2 };
      return dOrder[a.difficulty] - dOrder[b.difficulty];
    } else if (input.mode === 'revision_focused') {
      // Prioritize topics that need revision or have lowest progress
      if (a.status === 'needs_revision' && b.status !== 'needs_revision') return -1;
      if (b.status === 'needs_revision' && a.status !== 'needs_revision') return 1;
      return a.progressPercent - b.progressPercent;
    } else {
      // Balanced mode: prioritize high priority, then mix
      const pOrder = { high: 0, medium: 1, low: 2 };
      const pDiff = pOrder[a.priority] - pOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return (b.estimatedHours || 0) - (a.estimatedHours || 0);
    }
  });

  // Queue of remaining uncompleted topics
  let pendingTopics = [...sortedTopics];

  // Revisions due queue
  const dueRevisions = [...input.revisions].filter((r) => r.isDue || r.isOverdue);

  let appscMinutesTotal = 0;
  let semesterMinutesTotal = 0;
  let revisionMinutesTotal = 0;

  // Iterate day by day
  for (let i = 0; i < numDays; i++) {
    const currentDateStr = addDays(todayStr, i);
    const currentDateObj = parseDate(currentDateStr);
    const dayOfWeek = currentDateObj.getDay();

    const rule = ruleMap.get(dayOfWeek) || {
      dayOfWeek,
      availableHours: 6.0,
      preferredSlots: ['morning', 'evening'],
      isRestDay: false,
    };

    if (rule.isRestDay) {
      continue; // Skip rest day
    }

    const dailyAvailableMinutes = Math.round(rule.availableHours * 60);
    let remainingMinutesToday = dailyAvailableMinutes;

    // Check for existing tasks already scheduled for today
    const existingToday = input.existingTasks.filter((t) => t.date === currentDateStr);
    const existingMins = existingToday.reduce((sum, t) => sum + t.durationMinutes, 0);
    remainingMinutesToday = Math.max(0, remainingMinutesToday - existingMins);

    // 1. In Revision-focused or Balanced mode, allocate revision first if available
    if (dueRevisions.length > 0 && remainingMinutesToday >= 45) {
      const rev = dueRevisions.shift()!;
      const revDuration = 45; // 45 min revision session
      remainingMinutesToday -= revDuration;
      revisionMinutesTotal += revDuration;

      const sub = subjectMap.get(rev.subjectId);
      const isAppsc = rev.track.startsWith('appsc');
      if (isAppsc) appscMinutesTotal += revDuration;
      else semesterMinutesTotal += revDuration;

      newTasks.push({
        id: `task-gen-rev-${Date.now()}-${newTasks.length}`,
        topicId: rev.topicId,
        subjectId: rev.subjectId,
        track: rev.track,
        title: `Spaced Revision: ${rev.title}`,
        date: currentDateStr,
        startTime: rule.preferredSlots.includes('evening') ? '20:00' : '07:00',
        durationMinutes: revDuration,
        isRevision: true,
        revisionCycle: rev.repetitionStage,
        isCompleted: false,
        notes: `Scheduled via Smart Day Allocator (${input.mode} mode). Stage ${rev.repetitionStage}`,
      });
    }

    // 2. Allocate regular study topics according to split ratio
    // Target ratio: appsc vs semester
    const targetAppscRatio = input.splitRatio.appsc / (input.splitRatio.appsc + input.splitRatio.semester);

    while (remainingMinutesToday >= 60 && pendingTopics.length > 0) {
      // Determine which track should get this session
      const currentAppscRatio =
        appscMinutesTotal + semesterMinutesTotal === 0
          ? 0.5
          : appscMinutesTotal / (appscMinutesTotal + semesterMinutesTotal);

      const preferAppsc = currentAppscRatio <= targetAppscRatio;

      let chosenIndex = -1;
      if (preferAppsc) {
        chosenIndex = pendingTopics.findIndex((t) => t.track.startsWith('appsc'));
      } else {
        chosenIndex = pendingTopics.findIndex((t) => t.track === 'semester');
      }

      // Fallback if specific track has no more topics
      if (chosenIndex === -1) {
        chosenIndex = 0;
      }

      const topic = pendingTopics[chosenIndex];
      // Session duration: between 60 and 120 minutes depending on remaining time
      const sessionMinutes = Math.min(120, remainingMinutesToday);

      remainingMinutesToday -= sessionMinutes;

      const isAppsc = topic.track.startsWith('appsc');
      if (isAppsc) appscMinutesTotal += sessionMinutes;
      else semesterMinutesTotal += sessionMinutes;

      newTasks.push({
        id: `task-gen-${Date.now()}-${newTasks.length}`,
        planId: input.plan?.id,
        topicId: topic.id,
        subjectId: topic.subjectId,
        track: topic.track,
        title: `${topic.title} (${sessionMinutes}m deep dive)`,
        date: currentDateStr,
        startTime: remainingMinutesToday >= 60 ? '08:00' : '18:00',
        durationMinutes: sessionMinutes,
        isRevision: false,
        isCompleted: false,
        notes: `Topic difficulty: ${topic.difficulty}. Priority: ${topic.priority}.`,
      });

      // If topic requires more hours, keep it in queue, otherwise remove
      const remainingTopicHours = (topic.estimatedHours || 2) - sessionMinutes / 60;
      if (remainingTopicHours <= 0.5) {
        pendingTopics.splice(chosenIndex, 1);
      } else {
        // Decrease remaining hours on the candidate clone
        pendingTopics[chosenIndex] = {
          ...topic,
          estimatedHours: remainingTopicHours,
        };
      }
    }

    // 3. Conflict detection: check if calendar exam falls on this day and total workload exceeds limit
    const examOnDay = input.calendarEvents.find((e) => e.date === currentDateStr && e.type.startsWith('exam'));
    if (examOnDay && remainingMinutesToday <= 30) {
      conflicts.push({
        date: currentDateStr,
        totalRequiredMinutes: dailyAvailableMinutes + 120,
        availableMinutes: dailyAvailableMinutes,
        overflowMinutes: 120,
        reason: `Exam scheduled on ${currentDateStr} ("${examOnDay.title}") with heavy study allocation. Consider taking a light review day.`,
      });
    }
  }

  // Check if unallocated topics remain beyond plan target date
  if (input.plan && input.plan.targetCompletionDate && pendingTopics.length > 0) {
    const targetDateObj = parseDate(input.plan.targetCompletionDate);
    const horizonDateObj = parseDate(addDays(todayStr, numDays));
    if (horizonDateObj >= targetDateObj) {
      const leftoverHours = pendingTopics.reduce((acc, t) => acc + (t.estimatedHours || 1), 0);
      conflicts.push({
        date: input.plan.targetCompletionDate,
        totalRequiredMinutes: Math.round(leftoverHours * 60),
        availableMinutes: 0,
        overflowMinutes: Math.round(leftoverHours * 60),
        reason: `${pendingTopics.length} topics (${leftoverHours.toFixed(1)} hrs) cannot fit before target date ${input.plan.targetCompletionDate} with current daily availability. Recommend increasing daily study hours or extending target date.`,
      });
    }
  }

  const totalMinutes = appscMinutesTotal + semesterMinutesTotal + revisionMinutesTotal;

  return {
    tasks: newTasks,
    conflicts,
    summary: {
      totalTasksCreated: newTasks.length,
      totalMinutesScheduled: totalMinutes,
      appscMinutes: appscMinutesTotal,
      semesterMinutes: semesterMinutesTotal,
      revisionMinutes: revisionMinutesTotal,
      averageDailyHours: numDays > 0 ? Number((totalMinutes / 60 / numDays).toFixed(1)) : 0,
    },
  };
}

/**
 * Smart Rollover for Missed / Overdue Tasks
 * Proposes a revised allocation without overloading the next single day.
 */
export function rescheduleMissedTasks(
  missedTasks: StudyTask[],
  existingTasks: StudyTask[],
  availabilityRules: AvailabilityRule[],
  startFromDate: string
): { rescheduledTasks: StudyTask[]; overloadedDays: string[] } {
  const rescheduledTasks: StudyTask[] = [];
  const overloadedDays: string[] = [];

  const ruleMap = new Map<number, number>();
  availabilityRules.forEach((r) => ruleMap.set(r.dayOfWeek, r.availableHours * 60));

  let currentTargetDate = startFromDate;
  let taskIndex = 0;

  while (taskIndex < missedTasks.length) {
    const d = parseDate(currentTargetDate);
    const dayOfWeek = d.getDay();
    const dailyBudget = ruleMap.get(dayOfWeek) || 360;

    // Existing load on this day
    const dayLoad = existingTasks
      .filter((t) => t.date === currentTargetDate)
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    const rescheduledOnDay = rescheduledTasks
      .filter((t) => t.date === currentTargetDate)
      .reduce((sum, t) => sum + t.durationMinutes, 0);

    const availableSlots = dailyBudget - (dayLoad + rescheduledOnDay);

    if (availableSlots >= 60) {
      const task = missedTasks[taskIndex];
      rescheduledTasks.push({
        ...task,
        date: currentTargetDate,
        isOverdue: false,
        notes: `${task.notes || ''} [Rescheduled from missed date]`.trim(),
      });
      taskIndex++;
    } else {
      // Day is full, advance to next day without overloading
      currentTargetDate = addDays(currentTargetDate, 1);
      // Safety check to prevent infinite loop
      if (rescheduledTasks.length > 50) break;
    }
  }

  return { rescheduledTasks, overloadedDays };
}
