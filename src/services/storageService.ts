import {
  StudyVerseState,
  StudyPlan,
  SyllabusTopic,
  StudyTask,
  ResourceItem,
  MockTest,
  TestAttempt,
  MainsAnswerPrompt,
  RevisionItem,
  CalendarEvent,
  AvailabilityRule,
  UserProfile,
  SemesterInfo,
  Subject,
  Subtopic,
  ChatGPTLink,
  PracticeQuestion,
  ExamSettings,
  BankQuestionItem,
  GenerationJob,
  TestBlueprint,
  MistakeBookItem,
} from '../types';
import { INITIAL_SAMPLE_DATA } from './sampleData';
import { DEFAULT_EXAM_SETTINGS } from './syllabusDatabase';
import { isSupabaseConfigured } from './supabaseClient';
import { syncMistakeBookFromAttempt } from './analyticsEngine';
import { backendConfig } from './backendConfig';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'STUDYVERSE_APP_DATA_V2';

type StateListener = (state: StudyVerseState) => void;
const listeners: Set<StateListener> = new Set();

class StorageService {
  private state: StudyVerseState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): StudyVerseState {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Ensure all required fields exist
          return {
            ...INITIAL_SAMPLE_DATA,
            ...parsed,
            bankQuestions: parsed.bankQuestions && parsed.bankQuestions.length > 0 ? parsed.bankQuestions : INITIAL_SAMPLE_DATA.bankQuestions,
            generationJobs: parsed.generationJobs && parsed.generationJobs.length > 0 ? parsed.generationJobs : INITIAL_SAMPLE_DATA.generationJobs,
            testBlueprints: parsed.testBlueprints && parsed.testBlueprints.length > 0 ? parsed.testBlueprints : INITIAL_SAMPLE_DATA.testBlueprints,
            mistakeBook: parsed.mistakeBook && parsed.mistakeBook.length > 0 ? parsed.mistakeBook : (INITIAL_SAMPLE_DATA.mistakeBook || []),
            isUsingSupabase: isSupabaseConfigured(),
          };
        }
      }
    } catch (err) {
      console.warn('Could not read from localStorage, using initial sample data', err);
    }

    const initial = {
      ...INITIAL_SAMPLE_DATA,
      isUsingSupabase: isSupabaseConfigured(),
    };
    this.persist(initial);
    return initial;
  }

  private persist(state: StudyVerseState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (err) {
      console.error('Failed to persist to localStorage', err);
    }
    this.notify();
  }

  public subscribe(listener: StateListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private notify(): void {
    listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in state subscriber', err);
      }
    });
  }

  public getState(): StudyVerseState {
    return this.state;
  }

  public resetToSampleData(): void {
    this.state = {
      ...INITIAL_SAMPLE_DATA,
      isUsingSupabase: isSupabaseConfigured(),
      lastSyncedAt: new Date().toISOString(),
    };
    this.persist(this.state);
  }

  public clearAllUserData(): void {
    this.state = {
      profile: {
        id: 'user-blank',
        name: 'New Student',
        email: '',
        targetExam: 'Custom Plan',
        targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        dailyGoalHours: 5.0,
        language: 'en',
        theme: 'dark',
        density: 'comfortable',
        studySplitRatio: { appsc: 50, semester: 50 },
      },
      availabilityRules: [
        { dayOfWeek: 0, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
        { dayOfWeek: 1, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
        { dayOfWeek: 2, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
        { dayOfWeek: 3, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
        { dayOfWeek: 4, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
        { dayOfWeek: 5, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
        { dayOfWeek: 6, availableHours: 6, preferredSlots: ['morning', 'evening'], isRestDay: false },
      ],
      examSettings: DEFAULT_EXAM_SETTINGS,
      semesterInfo: {
        id: 'sem-custom',
        degreeName: 'M.Tech',
        academicYear: '2025-2026',
        yearName: 'Custom Year',
        semesterName: 'Custom Semester',
        branch: 'General',
      },
      subjects: [],
      topics: [],
      subtopics: [],
      chatgptLinks: [],
      practiceQuestions: [],
      plans: [],
      tasks: [],
      resources: [],
      mockTests: [],
      testAttempts: [],
      mainsPrompts: [],
      revisions: [],
      calendarEvents: [],
      isUsingSupabase: isSupabaseConfigured(),
      lastSyncedAt: new Date().toISOString(),
    };
    this.persist(this.state);
  }

  public exportDataAsJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importDataFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !Array.isArray(parsed.topics)) {
        throw new Error('Invalid STUDYVERSE data schema');
      }
      this.state = {
        ...INITIAL_SAMPLE_DATA,
        ...parsed,
        lastSyncedAt: new Date().toISOString(),
      };
      this.persist(this.state);
      return true;
    } catch (err) {
      console.error('Failed to import data', err);
      return false;
    }
  }

  // Profile & Preferences
  public updateProfile(profile: Partial<UserProfile>): void {
    this.state = {
      ...this.state,
      profile: { ...this.state.profile, ...profile },
    };
    this.persist(this.state);
  }

  public updateAvailabilityRules(rules: AvailabilityRule[]): void {
    this.state = {
      ...this.state,
      availabilityRules: rules,
    };
    this.persist(this.state);
  }

  public updateSemesterInfo(info: Partial<SemesterInfo>): void {
    this.state = {
      ...this.state,
      semesterInfo: { ...this.state.semesterInfo, ...info },
    };
    this.persist(this.state);
  }

  // Subjects CRUD
  public saveSubject(subject: Subject): void {
    const exists = this.state.subjects.some((s) => s.id === subject.id);
    this.state = {
      ...this.state,
      subjects: exists
        ? this.state.subjects.map((s) => (s.id === subject.id ? subject : s))
        : [...this.state.subjects, subject],
    };
    this.persist(this.state);
  }

  public deleteSubject(subjectId: string): void {
    this.state = {
      ...this.state,
      subjects: this.state.subjects.filter((s) => s.id !== subjectId),
      topics: this.state.topics.filter((t) => t.subjectId !== subjectId),
      tasks: this.state.tasks.filter((t) => t.subjectId !== subjectId),
    };
    this.persist(this.state);
  }

  // Study Plans CRUD
  public savePlan(plan: StudyPlan): void {
    const exists = this.state.plans.some((p) => p.id === plan.id);
    this.state = {
      ...this.state,
      plans: exists
        ? this.state.plans.map((p) => (p.id === plan.id ? plan : p))
        : [plan, ...this.state.plans],
    };
    this.persist(this.state);
  }

  public deletePlan(planId: string): void {
    this.state = {
      ...this.state,
      plans: this.state.plans.filter((p) => p.id !== planId),
      tasks: this.state.tasks.filter((t) => t.planId !== planId),
    };
    this.persist(this.state);
  }

  public duplicatePlan(planId: string): StudyPlan | null {
    const orig = this.state.plans.find((p) => p.id === planId);
    if (!orig) return null;
    const duplicated: StudyPlan = {
      ...orig,
      id: `plan-dup-${Date.now()}`,
      title: `${orig.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.savePlan(duplicated);
    return duplicated;
  }

  // Topics CRUD
  public saveTopic(topic: SyllabusTopic): void {
    const exists = this.state.topics.some((t) => t.id === topic.id);
    this.state = {
      ...this.state,
      topics: exists
        ? this.state.topics.map((t) => (t.id === topic.id ? topic : t))
        : [...this.state.topics, topic],
    };
    this.persist(this.state);
  }

  public deleteTopic(topicId: string): void {
    this.state = {
      ...this.state,
      topics: this.state.topics.filter((t) => t.id !== topicId),
      tasks: this.state.tasks.filter((task) => task.topicId !== topicId),
      revisions: this.state.revisions.filter((rev) => rev.topicId !== topicId),
    };
    this.persist(this.state);
  }

  public updateTopicStatus(topicId: string, status: SyllabusTopic['status'], progressPercent?: number): void {
    this.state = {
      ...this.state,
      topics: this.state.topics.map((t) => {
        if (t.id !== topicId) return t;
        const progress =
          progressPercent !== undefined
            ? progressPercent
            : status === 'completed'
            ? 100
            : status === 'not_started'
            ? 0
            : t.progressPercent;
        return {
          ...t,
          status,
          progressPercent: progress,
          completedAt: status === 'completed' ? new Date().toISOString().split('T')[0] : t.completedAt,
        };
      }),
    };
    this.persist(this.state);
  }

  public updateTopicDetails(topicId: string, updates: Partial<SyllabusTopic>): void {
    this.state = {
      ...this.state,
      topics: this.state.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
    };
    this.persist(this.state);
  }

  public addTaskFromTopic(topicId: string, targetDate?: string): StudyTask {
    const topic = this.state.topics.find((t) => t.id === topicId);
    const date = targetDate || new Date().toISOString().split('T')[0];
    const newTask: StudyTask = {
      id: `task-topic-${Date.now()}`,
      topicId,
      subjectId: topic?.subjectId || '',
      track: topic?.track || 'appsc-prelims',
      title: topic ? `Study: ${topic.title}` : 'Study Session',
      date,
      startTime: '09:00',
      durationMinutes: Math.round((topic?.estimatedHours || 1.5) * 60),
      isRevision: topic?.status === 'needs_revision',
      isCompleted: false,
      notes: topic?.description || '',
    };
    this.saveTask(newTask);
    return newTask;
  }

  // Subtopics CRUD
  public saveSubtopic(subtopic: Subtopic): void {
    const exists = this.state.subtopics.some((st) => st.id === subtopic.id);
    const updatedSubtopics = exists
      ? this.state.subtopics.map((st) => (st.id === subtopic.id ? subtopic : st))
      : [...this.state.subtopics, subtopic];

    const updatedTopics = this.state.topics.map((t) => {
      if (t.id === subtopic.topicId) {
        const subtopicIds = t.subtopicIds || [];
        if (!subtopicIds.includes(subtopic.id)) {
          return { ...t, subtopicIds: [...subtopicIds, subtopic.id] };
        }
      }
      return t;
    });

    this.state = {
      ...this.state,
      subtopics: updatedSubtopics,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public deleteSubtopic(subtopicId: string): void {
    const target = this.state.subtopics.find((st) => st.id === subtopicId);
    const updatedSubtopics = this.state.subtopics.filter((st) => st.id !== subtopicId);
    const updatedTopics = this.state.topics.map((t) => {
      if (target && t.id === target.topicId) {
        return {
          ...t,
          subtopicIds: (t.subtopicIds || []).filter((id) => id !== subtopicId),
        };
      }
      return t;
    });

    this.state = {
      ...this.state,
      subtopics: updatedSubtopics,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public toggleSubtopicCompletion(subtopicId: string): void {
    let parentTopicId: string | undefined;
    const updatedSubtopics = this.state.subtopics.map((st) => {
      if (st.id === subtopicId) {
        parentTopicId = st.topicId;
        const newCompleted = !st.isCompleted;
        return {
          ...st,
          isCompleted: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      }
      return st;
    });

    let updatedTopics = this.state.topics;
    if (parentTopicId) {
      const topicSubtopics = updatedSubtopics.filter((st) => st.topicId === parentTopicId);
      if (topicSubtopics.length > 0) {
        const completedCount = topicSubtopics.filter((st) => st.isCompleted).length;
        const pct = Math.round((completedCount / topicSubtopics.length) * 100);
        const newStatus = pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'not_started';
        updatedTopics = updatedTopics.map((t) =>
          t.id === parentTopicId
            ? {
                ...t,
                progressPercent: pct,
                status: newStatus,
                completedAt: pct === 100 ? new Date().toISOString().split('T')[0] : t.completedAt,
              }
            : t
        );
      }
    }

    this.state = {
      ...this.state,
      subtopics: updatedSubtopics,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  // ChatGPT Links CRUD
  public saveChatGPTLink(link: ChatGPTLink): void {
    const exists = this.state.chatgptLinks.some((l) => l.id === link.id);
    const updatedLinks = exists
      ? this.state.chatgptLinks.map((l) => (l.id === link.id ? link : l))
      : [link, ...this.state.chatgptLinks];

    const updatedTopics = this.state.topics.map((t) => {
      if (t.id === link.topicId) {
        const linkIds = t.chatgptLinkIds || [];
        if (!linkIds.includes(link.id)) {
          return { ...t, chatgptLinkIds: [...linkIds, link.id] };
        }
      }
      return t;
    });

    this.state = {
      ...this.state,
      chatgptLinks: updatedLinks,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public deleteChatGPTLink(linkId: string): void {
    const target = this.state.chatgptLinks.find((l) => l.id === linkId);
    const updatedLinks = this.state.chatgptLinks.filter((l) => l.id !== linkId);
    const updatedTopics = this.state.topics.map((t) => {
      if (target && t.id === target.topicId) {
        return {
          ...t,
          chatgptLinkIds: (t.chatgptLinkIds || []).filter((id) => id !== linkId),
        };
      }
      return t;
    });

    this.state = {
      ...this.state,
      chatgptLinks: updatedLinks,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  // Practice Questions CRUD
  public savePracticeQuestion(question: PracticeQuestion): void {
    const exists = this.state.practiceQuestions.some((q) => q.id === question.id);
    const updatedQuestions = exists
      ? this.state.practiceQuestions.map((q) => (q.id === question.id ? question : q))
      : [question, ...this.state.practiceQuestions];

    const updatedTopics = this.state.topics.map((t) => {
      if (t.id === question.topicId) {
        const questionIds = t.practiceQuestionIds || [];
        if (!questionIds.includes(question.id)) {
          return { ...t, practiceQuestionIds: [...questionIds, question.id] };
        }
      }
      return t;
    });

    this.state = {
      ...this.state,
      practiceQuestions: updatedQuestions,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public deletePracticeQuestion(questionId: string): void {
    const target = this.state.practiceQuestions.find((q) => q.id === questionId);
    const updatedQuestions = this.state.practiceQuestions.filter((q) => q.id !== questionId);
    const updatedTopics = this.state.topics.map((t) => {
      if (target && t.id === target.topicId) {
        return {
          ...t,
          practiceQuestionIds: (t.practiceQuestionIds || []).filter((id) => id !== questionId),
        };
      }
      return t;
    });

    this.state = {
      ...this.state,
      practiceQuestions: updatedQuestions,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public recordQuestionAttempt(questionId: string, selectedOptionId: string, isCorrect: boolean): void {
    this.state = {
      ...this.state,
      practiceQuestions: this.state.practiceQuestions.map((q) => {
        if (q.id !== questionId) return q;
        const attempt = {
          attemptedAt: new Date().toISOString(),
          selectedOptionId,
          isCorrect,
        };
        return {
          ...q,
          attemptHistory: [attempt, ...(q.attemptHistory || [])],
        };
      }),
    };
    this.persist(this.state);
  }

  public toggleQuestionBookmark(questionId: string): void {
    this.state = {
      ...this.state,
      practiceQuestions: this.state.practiceQuestions.map((q) =>
        q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q
      ),
    };
    this.persist(this.state);
  }

  // Exam Settings
  public updateExamSettings(settings: ExamSettings): void {
    this.state = {
      ...this.state,
      examSettings: settings,
    };
    this.persist(this.state);
  }

  // Tasks CRUD
  public saveTask(task: StudyTask): void {
    const exists = this.state.tasks.some((t) => t.id === task.id);
    this.state = {
      ...this.state,
      tasks: exists
        ? this.state.tasks.map((t) => (t.id === task.id ? task : t))
        : [...this.state.tasks, task],
    };
    this.persist(this.state);
  }

  public toggleTaskCompletion(taskId: string): void {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const isCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : undefined,
        };
      }),
    };
    this.persist(this.state);
  }

  public deleteTask(taskId: string): void {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.filter((t) => t.id !== taskId),
    };
    this.persist(this.state);
  }

  public moveTaskDate(taskId: string, newDate: string): void {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => (t.id === taskId ? { ...t, date: newDate, isOverdue: false } : t)),
    };
    this.persist(this.state);
  }

  public addGeneratedTasks(newTasks: StudyTask[]): void {
    this.state = {
      ...this.state,
      tasks: [...this.state.tasks, ...newTasks],
    };
    this.persist(this.state);
  }

  // Resources CRUD
  public saveResource(res: ResourceItem): void {
    const exists = this.state.resources.some((r) => r.id === res.id);
    const updatedResources = exists
      ? this.state.resources.map((r) => (r.id === res.id ? res : r))
      : [res, ...this.state.resources];

    // Synchronize topic.resourceIds across all topics
    const targetTopicIds = res.topicIds || [];
    const updatedTopics = this.state.topics.map((t) => {
      const shouldHave = targetTopicIds.includes(t.id);
      const curResourceIds = t.resourceIds || [];
      const hasIt = curResourceIds.includes(res.id);

      if (shouldHave && !hasIt) {
        return { ...t, resourceIds: [...curResourceIds, res.id] };
      }
      if (!shouldHave && hasIt && exists) {
        return { ...t, resourceIds: curResourceIds.filter((id) => id !== res.id) };
      }
      return t;
    });

    this.state = {
      ...this.state,
      resources: updatedResources,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public deleteResource(resourceId: string): void {
    const updatedResources = this.state.resources.filter((r) => r.id !== resourceId);
    const updatedTopics = this.state.topics.map((t) => {
      if (t.resourceIds?.includes(resourceId)) {
        return { ...t, resourceIds: t.resourceIds.filter((id) => id !== resourceId) };
      }
      return t;
    });

    this.state = {
      ...this.state,
      resources: updatedResources,
      topics: updatedTopics,
    };
    this.persist(this.state);
  }

  public attachResourceToTopic(topicId: string, resourceId: string): void {
    const targetResource = this.state.resources.find((r) => r.id === resourceId);
    if (!targetResource) return;

    const currentTopicIds = targetResource.topicIds || [];
    if (!currentTopicIds.includes(topicId)) {
      this.saveResource({
        ...targetResource,
        topicIds: [...currentTopicIds, topicId],
      });
    }
  }

  public detachResourceFromTopic(topicId: string, resourceId: string): void {
    const targetResource = this.state.resources.find((r) => r.id === resourceId);
    if (!targetResource) return;

    const currentTopicIds = targetResource.topicIds || [];
    this.saveResource({
      ...targetResource,
      topicIds: currentTopicIds.filter((id) => id !== topicId),
    });
  }

  public toggleBookmark(resourceId: string): void {
    this.state = {
      ...this.state,
      resources: this.state.resources.map((r) =>
        r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r
      ),
    };
    this.persist(this.state);
  }

  public recordResourceOpened(resourceId: string): void {
    this.state = {
      ...this.state,
      resources: this.state.resources.map((r) =>
        r.id === resourceId ? { ...r, lastOpenedAt: new Date().toISOString() } : r
      ),
    };
    this.persist(this.state);
  }

  // Mock Tests & Attempts
  public saveMockTest(test: MockTest): void {
    const exists = this.state.mockTests.some((t) => t.id === test.id);
    this.state = {
      ...this.state,
      mockTests: exists
        ? this.state.mockTests.map((t) => (t.id === test.id ? test : t))
        : [test, ...this.state.mockTests],
    };
    this.persist(this.state);
  }

  public saveTestAttempt(attempt: TestAttempt): void {
    const updatedMistakes = syncMistakeBookFromAttempt(
      this.state.mistakeBook || [],
      attempt,
      this.state.mockTests,
      this.state.topics,
      this.state.subjects
    );
    this.state = {
      ...this.state,
      testAttempts: [attempt, ...this.state.testAttempts],
      mistakeBook: updatedMistakes,
    };
    this.persist(this.state);
  }

  // Revisions & Spaced Repetition
  public saveRevisionItem(item: RevisionItem): void {
    const exists = this.state.revisions.some((r) => r.id === item.id);
    this.state = {
      ...this.state,
      revisions: exists
        ? this.state.revisions.map((r) => (r.id === item.id ? item : r))
        : [item, ...this.state.revisions],
    };
    this.persist(this.state);
  }

  public completeRevisionItem(itemId: string, rating: 'easy' | 'good' | 'hard'): void {
    const intervals = [1, 3, 7, 14, 30];
    this.state = {
      ...this.state,
      revisions: this.state.revisions.map((r) => {
        if (r.id !== itemId) return r;
        const nextStage = rating === 'hard' ? 1 : Math.min(5, r.repetitionStage + 1);
        const daysToAdd = intervals[nextStage - 1] || 7;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        return {
          ...r,
          repetitionStage: nextStage,
          nextDueDate: nextDate.toISOString().split('T')[0],
          lastReviewedDate: new Date().toISOString().split('T')[0],
          difficultyRating: rating,
          isDue: false,
          isOverdue: false,
        };
      }),
    };
    this.persist(this.state);
  }

  // Mains Prompts
  public saveMainsPrompt(prompt: MainsAnswerPrompt): void {
    const exists = this.state.mainsPrompts.some((p) => p.id === prompt.id);
    this.state = {
      ...this.state,
      mainsPrompts: exists
        ? this.state.mainsPrompts.map((p) => (p.id === prompt.id ? prompt : p))
        : [prompt, ...this.state.mainsPrompts],
    };
    this.persist(this.state);
  }

  // Calendar Events
  public saveCalendarEvent(evt: CalendarEvent): void {
    const exists = this.state.calendarEvents.some((e) => e.id === evt.id);
    this.state = {
      ...this.state,
      calendarEvents: exists
        ? this.state.calendarEvents.map((e) => (e.id === evt.id ? evt : e))
        : [...this.state.calendarEvents, evt],
    };
    this.persist(this.state);
  }

  public deleteCalendarEvent(id: string): void {
    this.state = {
      ...this.state,
      calendarEvents: this.state.calendarEvents.filter((e) => e.id !== id),
    };
    this.persist(this.state);
  }

  // ----------------------------------------------------
  // QUESTION BANK & MOCK TEST GENERATION
  // ----------------------------------------------------
  public saveBankQuestion(question: BankQuestionItem): void {
    const list = this.state.bankQuestions || [];
    const exists = list.some((q) => q.id === question.id);
    this.state = {
      ...this.state,
      bankQuestions: exists
        ? list.map((q) => (q.id === question.id ? question : q))
        : [question, ...list],
    };
    this.persist(this.state);
  }

  public saveBankQuestions(questions: BankQuestionItem[]): void {
    const list = this.state.bankQuestions || [];
    const questionMap = new Map<string, BankQuestionItem>();
    list.forEach((q) => questionMap.set(q.id, q));
    questions.forEach((q) => questionMap.set(q.id, q));
    this.state = {
      ...this.state,
      bankQuestions: Array.from(questionMap.values()),
    };
    this.persist(this.state);
  }

  public deleteBankQuestion(id: string): void {
    const list = this.state.bankQuestions || [];
    this.state = {
      ...this.state,
      bankQuestions: list.filter((q) => q.id !== id),
    };
    this.persist(this.state);
  }

  public bulkApproveQuestions(ids: string[]): void {
    const idSet = new Set(ids);
    const list = this.state.bankQuestions || [];
    this.state = {
      ...this.state,
      bankQuestions: list.map((q) =>
        idSet.has(q.id)
          ? {
              ...q,
              validationStatus: 'approved' as const,
              publicationStatus: 'published' as const,
              updatedAt: new Date().toISOString(),
            }
          : q
      ),
    };
    this.persist(this.state);
  }

  public bulkRejectQuestions(ids: string[], reason?: string): void {
    const idSet = new Set(ids);
    const list = this.state.bankQuestions || [];
    this.state = {
      ...this.state,
      bankQuestions: list.map((q) =>
        idSet.has(q.id)
          ? {
              ...q,
              validationStatus: 'rejected' as const,
              publicationStatus: 'draft' as const,
              reviewNotes: reason || q.reviewNotes || 'Does not meet syllabus standards',
              updatedAt: new Date().toISOString(),
            }
          : q
      ),
    };
    this.persist(this.state);
  }

  public saveGenerationJob(job: GenerationJob): void {
    const list = this.state.generationJobs || [];
    const exists = list.some((j) => j.id === job.id);
    this.state = {
      ...this.state,
      generationJobs: exists
        ? list.map((j) => (j.id === job.id ? job : j))
        : [job, ...list],
    };
    this.persist(this.state);
  }

  public updateGenerationJob(jobId: string, updates: Partial<GenerationJob>): void {
    const list = this.state.generationJobs || [];
    this.state = {
      ...this.state,
      generationJobs: list.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
    };
    this.persist(this.state);
  }

  public saveTestBlueprint(blueprint: TestBlueprint): void {
    const list = this.state.testBlueprints || [];
    const exists = list.some((bp) => bp.id === blueprint.id);
    this.state = {
      ...this.state,
      testBlueprints: exists
        ? list.map((bp) => (bp.id === blueprint.id ? blueprint : bp))
        : [blueprint, ...list],
    };
    this.persist(this.state);
  }

  public deleteTestBlueprint(id: string): void {
    const list = this.state.testBlueprints || [];
    this.state = {
      ...this.state,
      testBlueprints: list.filter((bp) => bp.id !== id),
    };
    this.persist(this.state);
  }

  public updateTopicQuestionTarget(topicId: string, targetCount: number): void {
    this.state = {
      ...this.state,
      topics: this.state.topics.map((t) =>
        t.id === topicId ? { ...t, targetQuestionCount: targetCount } : t
      ),
    };
    this.persist(this.state);
  }

  // Mistake Book
  public getMistakeBook(): MistakeBookItem[] {
    return this.state.mistakeBook || [];
  }

  public saveMistakeBookItem(item: MistakeBookItem): void {
    const list = this.state.mistakeBook || [];
    const exists = list.some((m) => m.id === item.id);
    this.state = {
      ...this.state,
      mistakeBook: exists ? list.map((m) => (m.id === item.id ? item : m)) : [item, ...list],
    };
    this.persist(this.state);
  }

  public deleteMistakeBookItem(id: string): void {
    const list = this.state.mistakeBook || [];
    this.state = {
      ...this.state,
      mistakeBook: list.filter((m) => m.id !== id),
    };
    this.persist(this.state);
  }

  public updateMistakeItemClassification(id: string, updates: Partial<MistakeBookItem>): void {
    const list = this.state.mistakeBook || [];
    this.state = {
      ...this.state,
      mistakeBook: list.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    };
    this.persist(this.state);
  }

  // Remote Backend Sync Helpers
  public async pushToRemote(): Promise<{ success: boolean; message: string }> {
    const config = backendConfig.getConfig();
    if (config.backendType === 'custom_api') {
      if (!config.backendUrl) {
        return { success: false, message: 'No backend URL configured. Please set one in Settings.' };
      }
      try {
        const res = await apiClient.pushFullState(this.state);
        return { success: true, message: res.message || 'Data pushed to remote backend successfully!' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to push data to remote backend.' };
      }
    } else if (config.backendType === 'supabase') {
      return {
        success: true,
        message: 'Supabase operates via direct PostgreSQL table sync. Ensure migrations in supabase/schema.sql are applied.',
      };
    }
    return { success: false, message: 'Application is currently in Local Demo Mode. Configure a backend in Settings.' };
  }

  public async pullFromRemote(): Promise<{ success: boolean; message: string }> {
    const config = backendConfig.getConfig();
    if (config.backendType === 'custom_api') {
      if (!config.backendUrl) {
        return { success: false, message: 'No backend URL configured. Please set one in Settings.' };
      }
      try {
        const remoteState = await apiClient.fetchFullState();
        if (remoteState && typeof remoteState === 'object') {
          this.state = {
            ...this.state,
            ...remoteState,
          };
          this.persist(this.state);
          return { success: true, message: 'Data pulled from backend successfully!' };
        }
        return { success: false, message: 'Invalid response received from remote backend.' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to pull data from remote backend.' };
      }
    }
    return { success: false, message: 'No custom REST backend configured. Configure one in Settings.' };
  }
}

export const storageService = new StorageService();
