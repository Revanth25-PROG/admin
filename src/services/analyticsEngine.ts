import {
  TestAttempt,
  MockTest,
  MockQuestion,
  SyllabusTopic,
  Subject,
  StudyTask,
} from '../types';
import {
  BankQuestionItem,
} from '../types/questionBank';
import {
  MistakeBookItem,
  MistakeErrorCategory,
  TopicAnalyticsDetail,
  SubjectAnalyticsDetail,
  OverallPerformanceSummary,
  TimeEfficiencyAnalytics,
  ReadinessIndicator,
  PersonalizedStudyRecommendation,
  AttemptComparisonResult,
} from '../types/analytics';

/**
 * 1. Overall Performance Summary
 */
export function calculateOverallSummary(
  attempts: TestAttempt[],
  mockTests: MockTest[],
  topics: SyllabusTopic[],
  subjects: Subject[],
  tasks: StudyTask[] = []
): OverallPerformanceSummary {
  if (attempts.length === 0) {
    return {
      totalTestsAttempted: 0,
      totalTestsCompleted: 0,
      totalQuestionsAttempted: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalUnanswered: 0,
      overallAccuracy: 0,
      overallAverageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      avgTimePerQuestionSeconds: 0,
      totalStudyAndTestTimeMinutes: 0,
      syllabusCoveragePercent: 0,
      performanceTrend: 'stable',
      personalBest: null,
      improvementSinceFirst: 0,
      recentAttempts: [],
    };
  }

  const totalTestsAttempted = attempts.length;
  const totalTestsCompleted = attempts.filter((a) => !!a.completedAt).length;

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;
  let totalScore = 0;
  let totalTimeSpentSeconds = 0;
  let highestScore = -Infinity;
  let lowestScore = Infinity;
  let personalBestAttempt: TestAttempt | null = null;

  attempts.forEach((a) => {
    totalCorrect += a.correctCount || 0;
    totalIncorrect += a.incorrectCount || 0;
    totalUnanswered += a.unansweredCount || 0;
    totalScore += a.score || 0;
    totalTimeSpentSeconds += a.timeSpentSeconds || 0;

    if (a.score > highestScore) {
      highestScore = a.score;
      personalBestAttempt = a;
    }
    if (a.score < lowestScore) {
      lowestScore = a.score;
    }
  });

  const totalQuestionsAttempted = totalCorrect + totalIncorrect;
  const overallAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
      : 0;

  const overallAverageScore =
    attempts.length > 0 ? Number((totalScore / attempts.length).toFixed(2)) : 0;

  const avgTimePerQuestionSeconds =
    totalQuestionsAttempted > 0
      ? Math.round(totalTimeSpentSeconds / totalQuestionsAttempted)
      : 0;

  // Track task study time + test time
  const taskMinutes = tasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const testMinutes = Math.round(totalTimeSpentSeconds / 60);
  const totalStudyAndTestTimeMinutes = taskMinutes + testMinutes;

  // Syllabus Coverage calculation
  const attemptedTopicIdSet = new Set<string>();
  attempts.forEach((a) => {
    if (a.answers) {
      Object.keys(a.answers).forEach((qId) => {
        // Find question in mockTests or matching topics
        for (const test of mockTests) {
          const q = test.questions.find((quest) => quest.id === qId);
          if (q?.topicId) attemptedTopicIdSet.add(q.topicId);
        }
      });
    }
  });
  topics.forEach((t) => {
    if (t.status === 'completed' || (t.progressPercent && t.progressPercent > 0)) {
      attemptedTopicIdSet.add(t.id);
    }
  });

  const syllabusCoveragePercent =
    topics.length > 0
      ? Math.min(100, Math.round((attemptedTopicIdSet.size / topics.length) * 100))
      : 0;

  // Performance Trend
  const sortedByDate = [...attempts].sort(
    (a, b) => new Date(a.completedAt || a.startedAt).getTime() - new Date(b.completedAt || b.startedAt).getTime()
  );

  let performanceTrend: 'rising' | 'declining' | 'stable' = 'stable';
  let improvementSinceFirst = 0;

  if (sortedByDate.length >= 2) {
    const firstScore = sortedByDate[0].score;
    const latestScore = sortedByDate[sortedByDate.length - 1].score;
    improvementSinceFirst = Number((latestScore - firstScore).toFixed(2));

    const half = Math.floor(sortedByDate.length / 2);
    const olderAvg =
      sortedByDate.slice(0, half).reduce((s, a) => s + a.score, 0) / (half || 1);
    const recentAvg =
      sortedByDate.slice(half).reduce((s, a) => s + a.score, 0) / (sortedByDate.length - half || 1);

    if (recentAvg - olderAvg > 1.0) performanceTrend = 'rising';
    else if (olderAvg - recentAvg > 1.0) performanceTrend = 'declining';
  }

  const bestAttempt = personalBestAttempt as TestAttempt | null;
  const personalBest = bestAttempt
    ? {
        score: bestAttempt.score,
        testTitle: bestAttempt.testTitle,
        date: (bestAttempt.completedAt || bestAttempt.startedAt).split('T')[0],
      }
    : null;

  return {
    totalTestsAttempted,
    totalTestsCompleted,
    totalQuestionsAttempted,
    totalCorrect,
    totalIncorrect,
    totalUnanswered,
    overallAccuracy,
    overallAverageScore,
    highestScore: highestScore === -Infinity ? 0 : Number(highestScore.toFixed(2)),
    lowestScore: lowestScore === Infinity ? 0 : Number(lowestScore.toFixed(2)),
    avgTimePerQuestionSeconds,
    totalStudyAndTestTimeMinutes,
    syllabusCoveragePercent,
    performanceTrend,
    personalBest,
    improvementSinceFirst,
    firstAttemptDate: sortedByDate[0]?.completedAt || sortedByDate[0]?.startedAt,
    recentAttempts: [...sortedByDate].reverse().slice(0, 10),
  };
}

/**
 * 2. Subject-Wise Performance Intelligence
 */
export function calculateSubjectIntelligence(
  subjectId: string,
  attempts: TestAttempt[],
  mockTests: MockTest[],
  topics: SyllabusTopic[],
  bankQuestions: BankQuestionItem[] = [],
  subjects: Subject[] = []
): SubjectAnalyticsDetail {
  const subject = subjects.find((s) => s.id === subjectId);
  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);
  const subjectTopicIds = new Set(subjectTopics.map((t) => t.id));

  // Isolate attempts related to this subject
  const subjectAttempts = attempts.filter((att) => {
    // 1. Direct match on attempt/test
    const test = mockTests.find((m) => m.id === att.testId);
    if (test?.subjectId === subjectId) return true;

    // 2. Questions in this test that belong to this subject
    if (test) {
      return test.questions.some((q) => q.subjectId === subjectId || (q.topicId && subjectTopicIds.has(q.topicId)));
    }
    return false;
  });

  const availableQuestionsCount = bankQuestions.filter((q) => q.subjectId === subjectId).length;

  // Topic metrics within subject
  const topicStatsMap: Record<
    string,
    { title: string; correct: number; incorrect: number; total: number }
  > = {};

  subjectTopics.forEach((t) => {
    topicStatsMap[t.id] = { title: t.title, correct: 0, incorrect: 0, total: 0 };
  });

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalScoreSum = 0;
  let totalTimeSpent = 0;
  let highestScore = 0;
  const attemptedTopicIdSet = new Set<string>();

  const mockSeriesProgress: SubjectAnalyticsDetail['mockSeriesProgress'] = [];

  subjectAttempts.forEach((att, idx) => {
    totalScoreSum += att.score;
    if (att.score > highestScore) highestScore = att.score;
    totalTimeSpent += att.timeSpentSeconds || 0;

    mockSeriesProgress.push({
      testIndex: idx + 1,
      mockTestId: att.testId,
      title: att.testTitle,
      score: att.score,
      accuracy: att.accuracy,
      completedAt: att.completedAt || att.startedAt,
    });

    // Inspect question-level answers for topics
    const test = mockTests.find((m) => m.id === att.testId);
    if (test && att.answers) {
      test.questions.forEach((q) => {
        if (q.subjectId === subjectId || (q.topicId && subjectTopicIds.has(q.topicId))) {
          const ans = att.answers[q.id];
          if (ans && ans.selectedOptionId) {
            if (q.topicId && topicStatsMap[q.topicId]) {
              attemptedTopicIdSet.add(q.topicId);
              topicStatsMap[q.topicId].total++;
              if (ans.isCorrect) {
                topicStatsMap[q.topicId].correct++;
                totalCorrect++;
              } else {
                topicStatsMap[q.topicId].incorrect++;
                totalIncorrect++;
              }
            }
          }
        }
      });
    }
  });

  const totalAttemptedQuestions = totalCorrect + totalIncorrect;
  const averageAccuracy =
    totalAttemptedQuestions > 0
      ? Math.round((totalCorrect / totalAttemptedQuestions) * 100)
      : 0;

  const averageMarks =
    subjectAttempts.length > 0
      ? Number((totalScoreSum / subjectAttempts.length).toFixed(2))
      : 0;

  const recentScore =
    mockSeriesProgress.length > 0
      ? mockSeriesProgress[mockSeriesProgress.length - 1].score
      : 0;

  const firstScore = mockSeriesProgress.length > 0 ? mockSeriesProgress[0].score : 0;
  const improvementDelta = Number((recentScore - firstScore).toFixed(2));

  const averageTimePerQuestionSeconds =
    totalAttemptedQuestions > 0 ? Math.round(totalTimeSpent / totalAttemptedQuestions) : 0;

  const topicCoveragePercent =
    subjectTopics.length > 0
      ? Math.round((attemptedTopicIdSet.size / subjectTopics.length) * 100)
      : 0;

  // Identify strong vs weak topics (minimum 2 attempts)
  const strongTopics: SubjectAnalyticsDetail['strongTopics'] = [];
  const weakTopics: SubjectAnalyticsDetail['weakTopics'] = [];
  const frequentlyIncorrectConcepts: string[] = [];
  const unattemptedTopics: SubjectAnalyticsDetail['unattemptedTopics'] = [];

  Object.entries(topicStatsMap).forEach(([tId, stat]) => {
    if (stat.total === 0) {
      unattemptedTopics.push({ id: tId, title: stat.title });
    } else {
      const acc = Math.round((stat.correct / stat.total) * 100);
      if (acc >= 70 && stat.total >= 3) {
        strongTopics.push({ id: tId, title: stat.title, accuracy: acc, attempts: stat.total });
      } else if (acc < 50 && stat.total >= 3) {
        weakTopics.push({ id: tId, title: stat.title, accuracy: acc, attempts: stat.total });
        frequentlyIncorrectConcepts.push(stat.title);
      }
    }
  });

  // Actionable recommendations
  const recommendedNextActions: string[] = [];
  if (unattemptedTopics.length > 0) {
    recommendedNextActions.push(
      `Expand coverage: ${unattemptedTopics.length} topics remain unattempted in ${subject?.name || 'this subject'}. Start with "${unattemptedTopics[0]?.title}".`
    );
  }
  if (weakTopics.length > 0) {
    recommendedNextActions.push(
      `Targeted Revision: Focus on "${weakTopics[0]?.title}" (${weakTopics[0]?.accuracy}% accuracy). Review explanations and retake incorrect questions.`
    );
  }
  if (mockSeriesProgress.length < 100) {
    const remaining = 100 - mockSeriesProgress.length;
    recommendedNextActions.push(
      `100-Mock Series: ${mockSeriesProgress.length}/100 tests completed. Attempt Test #${mockSeriesProgress.length + 1} to maintain consistency.`
    );
  }

  return {
    subjectId,
    subjectName: subject?.name || 'Subject',
    subjectNameTelugu: subject?.nameTelugu,
    track: subject?.track || 'appsc-prelims',
    paper: subject?.paper,
    availableQuestionsCount,
    topicsTotal: subjectTopics.length,
    topicsAttemptedCount: attemptedTopicIdSet.size,
    subtopicsAttemptedCount: 0,
    testsCompletedOutOf100: Math.min(100, subjectAttempts.length),
    averageMarks,
    averageAccuracy,
    highestScore,
    recentScore,
    improvementDelta,
    averageTimePerQuestionSeconds,
    topicCoveragePercent,
    strongTopics,
    weakTopics,
    frequentlyIncorrectConcepts,
    unattemptedTopics: unattemptedTopics.slice(0, 10),
    recommendedNextActions,
    preparednessStatus: averageAccuracy >= 75 ? 'exam_ready' : averageAccuracy >= 50 ? 'moderate_progress' : 'immediate_focus',
    mockSeriesProgress,
  };
}

/**
 * 3. Topic-Wise and Subtopic-Wise Deep Analysis
 */
export function calculateTopicDeepAnalytics(
  topics: SyllabusTopic[],
  attempts: TestAttempt[],
  mockTests: MockTest[],
  subjects: Subject[] = []
): TopicAnalyticsDetail[] {
  // Map topics to their stats
  return topics.map((topic) => {
    const subject = subjects.find((s) => s.id === topic.subjectId);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;
    let totalTimeSeconds = 0;
    let lastPracticedDate: string | undefined;

    const diffStats = {
      easy: { correct: 0, total: 0 },
      moderate: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    const chronologicalResults: { date: string; isCorrect: boolean }[] = [];

    attempts.forEach((att) => {
      const test = mockTests.find((m) => m.id === att.testId);
      if (!test || !att.answers) return;

      test.questions.forEach((q) => {
        if (q.topicId === topic.id) {
          const ans = att.answers[q.id];
          const diff = (q.difficulty || 'moderate') as 'easy' | 'moderate' | 'hard';
          const validDiff = diffStats[diff] ? diff : 'moderate';

          if (ans) {
            const time = ans.timeSpentSeconds || 0;
            totalTimeSeconds += time;

            if (!ans.selectedOptionId) {
              unansweredCount++;
            } else if (ans.isCorrect) {
              correctCount++;
              diffStats[validDiff].correct++;
              diffStats[validDiff].total++;
              totalScore += q.marks || test.marksPerQuestion;
              lastPracticedDate = att.completedAt || att.startedAt;
              chronologicalResults.push({ date: lastPracticedDate, isCorrect: true });
            } else {
              incorrectCount++;
              diffStats[validDiff].total++;
              totalScore -= q.negativeMarks !== undefined ? q.negativeMarks : test.negativeMarks;
              lastPracticedDate = att.completedAt || att.startedAt;
              chronologicalResults.push({ date: lastPracticedDate, isCorrect: false });
            }
          }
        }
      });
    });

    const questionsAttempted = correctCount + incorrectCount;
    const accuracy =
      questionsAttempted > 0 ? Math.round((correctCount / questionsAttempted) * 100) : 0;

    const avgScore =
      questionsAttempted > 0 ? Number((totalScore / questionsAttempted).toFixed(2)) : 0;

    const avgResponseTimeSeconds =
      questionsAttempted > 0 ? Math.round(totalTimeSeconds / questionsAttempted) : 0;

    // Classification based on minimum sample size threshold (5 questions)
    let classification: TopicAnalyticsDetail['classification'] = 'not_attempted';
    let improvementTrend: TopicAnalyticsDetail['improvementTrend'] = 'insufficient_data';
    let improvementDelta = 0;

    if (questionsAttempted === 0) {
      classification = 'not_attempted';
    } else if (questionsAttempted < 5) {
      // Under threshold: classify as needs_practice regardless of early accuracy
      classification = 'needs_practice';
    } else {
      if (accuracy >= 75) {
        classification = 'strong';
      } else if (accuracy < 50) {
        classification = 'weak';
      } else {
        classification = 'needs_practice';
      }

      // Check trend across attempts
      if (chronologicalResults.length >= 4) {
        const mid = Math.floor(chronologicalResults.length / 2);
        const earlyAcc =
          chronologicalResults.slice(0, mid).filter((r) => r.isCorrect).length / mid;
        const recentAcc =
          chronologicalResults.slice(mid).filter((r) => r.isCorrect).length /
          (chronologicalResults.length - mid);

        improvementDelta = Math.round((recentAcc - earlyAcc) * 100);
        if (recentAcc > earlyAcc + 0.15) {
          improvementTrend = 'improving';
          if (classification !== 'strong') classification = 'improving';
        } else if (earlyAcc > recentAcc + 0.15) {
          improvementTrend = 'declining';
        } else {
          improvementTrend = 'stable';
        }
      }
    }

    const difficultyAccuracy = {
      easy: diffStats.easy.total > 0 ? Math.round((diffStats.easy.correct / diffStats.easy.total) * 100) : 0,
      moderate: diffStats.moderate.total > 0 ? Math.round((diffStats.moderate.correct / diffStats.moderate.total) * 100) : 0,
      hard: diffStats.hard.total > 0 ? Math.round((diffStats.hard.correct / diffStats.hard.total) * 100) : 0,
    };

    const attemptCountsByDifficulty = {
      easy: diffStats.easy.total,
      moderate: diffStats.moderate.total,
      hard: diffStats.hard.total,
    };

    let recommendedRevisionPriority: 'high' | 'medium' | 'low' = 'low';
    if (classification === 'weak' || (classification === 'not_attempted' && topic.priority === 'high')) {
      recommendedRevisionPriority = 'high';
    } else if (classification === 'needs_practice' || classification === 'improving') {
      recommendedRevisionPriority = 'medium';
    }

    return {
      topicId: topic.id,
      topicTitle: topic.title,
      topicTitleTelugu: topic.titleTelugu,
      subjectId: topic.subjectId,
      subjectName: subject?.name || 'General Subject',
      track: topic.track,
      questionsAttempted,
      correctCount,
      incorrectCount,
      unansweredCount,
      accuracy,
      avgScore,
      avgResponseTimeSeconds,
      difficultyAccuracy,
      attemptCountsByDifficulty,
      classification,
      improvementTrend,
      improvementDelta,
      frequentlyIncorrectConcepts: incorrectCount >= 2 ? [topic.title] : [],
      bookmarkedQuestionsCount: 0,
      lastPracticedDate: lastPracticedDate ? lastPracticedDate.split('T')[0] : undefined,
      recommendedRevisionPriority,
    };
  });
}

/**
 * 4. Time Management & Question Efficiency Analytics
 */
export function calculateTimeEfficiency(
  attempts: TestAttempt[],
  mockTests: MockTest[]
): TimeEfficiencyAnalytics {
  let totalQuestions = 0;
  let totalTimeAll = 0;
  let totalCorrectTime = 0;
  let correctCount = 0;
  let totalIncorrectTime = 0;
  let incorrectCount = 0;
  let slowResponsesCount = 0; // > 90s
  let rapidGuessCount = 0; // < 20s and incorrect
  let timeSpentOnDifficultSeconds = 0;
  let completedWithinTimerCount = 0;

  attempts.forEach((att) => {
    const test = mockTests.find((m) => m.id === att.testId);
    if (!test || !att.answers) return;

    const testAllocatedSeconds = (test.durationMinutes || 30) * 60;
    if (att.timeSpentSeconds <= testAllocatedSeconds) {
      completedWithinTimerCount++;
    }

    test.questions.forEach((q) => {
      const ans = att.answers[q.id];
      if (ans && ans.timeSpentSeconds !== undefined) {
        const time = ans.timeSpentSeconds;
        totalTimeAll += time;
        totalQuestions++;

        if (q.difficulty === 'hard' || (q.difficulty as string) === 'difficult') {
          timeSpentOnDifficultSeconds += time;
        }

        if (time > 90) {
          slowResponsesCount++;
        }

        if (ans.isCorrect) {
          totalCorrectTime += time;
          correctCount++;
        } else if (ans.selectedOptionId) {
          totalIncorrectTime += time;
          incorrectCount++;
          if (time < 20) {
            rapidGuessCount++;
          }
        }
      }
    });
  });

  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeAll / totalQuestions) : 0;
  const avgTimeCorrect = correctCount > 0 ? Math.round(totalCorrectTime / correctCount) : 0;
  const avgTimeIncorrect = incorrectCount > 0 ? Math.round(totalIncorrectTime / incorrectCount) : 0;
  const completionRateBeforeExpiry =
    attempts.length > 0 ? Math.round((completedWithinTimerCount / attempts.length) * 100) : 100;

  const efficiencyPatterns: TimeEfficiencyAnalytics['efficiencyPatterns'] = [];
  const recommendations: string[] = [];

  if (rapidGuessCount >= 2) {
    efficiencyPatterns.push({
      title: 'Fast But Inaccurate Responses',
      description: `${rapidGuessCount} questions were answered in under 20 seconds and marked wrong. This suggests premature guessing under time anxiety.`,
      type: 'warning',
    });
    recommendations.push(
      'Read all four options completely before locking answers; allocate at least 35-45 seconds even on straightforward questions.'
    );
  }

  if (avgTimeIncorrect > avgTimeCorrect * 1.4 && incorrectCount >= 3) {
    efficiencyPatterns.push({
      title: 'Time Lost on Difficult Sticking Points',
      description: `You spend 1.4x more time on questions you ultimately miss (${avgTimeIncorrect}s vs ${avgTimeCorrect}s).`,
      type: 'warning',
    });
    recommendations.push(
      'Adopt the "Two-Pass" rule: if a difficult question takes more than 75 seconds without a clear path, mark for review and skip to bank easier marks.'
    );
  }

  if (slowResponsesCount >= 4) {
    efficiencyPatterns.push({
      title: 'Pacing Bottlenecks Detected',
      description: `${slowResponsesCount} questions exceeded 90 seconds response time.`,
      type: 'info',
    });
    recommendations.push(
      'Practice 15-minute sectional speed-drills focusing on fast elimination of false options.'
    );
  }

  if (completionRateBeforeExpiry >= 90) {
    efficiencyPatterns.push({
      title: 'Strong Timer Discipline',
      description: `Completed ${completionRateBeforeExpiry}% of exam simulations before timer expiration.`,
      type: 'positive',
    });
  }

  const timeEfficiencyScore = Math.max(
    10,
    Math.min(
      100,
      Math.round(100 - slowResponsesCount * 5 - rapidGuessCount * 8 + (completionRateBeforeExpiry >= 90 ? 10 : 0))
    )
  );

  return {
    avgTimePerQuestion,
    avgTimeCorrect,
    avgTimeIncorrect,
    averageTimeCorrectSeconds: avgTimeCorrect,
    averageTimeIncorrectSeconds: avgTimeIncorrect,
    slowResponsesCount,
    rapidGuessCount,
    timeSpentOnDifficultSeconds,
    completionRateBeforeExpiry,
    timeEfficiencyScore,
    efficiencyPatterns,
    recommendations,
  };
}

/**
 * 5. Exam Readiness & Performance Prediction Engine
 */
export function calculateReadinessIndicator(
  attempts: TestAttempt[],
  topics: SyllabusTopic[],
  subjects: Subject[],
  targetScore: number = 100
): ReadinessIndicator {
  if (attempts.length === 0) {
    return {
      readinessScore: 15,
      readinessLevel: 'Building Foundation',
      predictedScoreRange: { min: 25, max: 45, label: '25 – 45 (Initial Estimate)' },
      syllabusCoverageWeight: 0,
      accuracyWeight: 0,
      consistencyWeight: 0,
      unattemptedHighPriorityAreas: topics.filter((t) => t.priority === 'high').map((t) => t.title).slice(0, 5),
      explanation: 'No mock attempts recorded yet. Complete your first mock test to calibrate actual predictive readiness.',
    };
  }

  // Pillar 1: Syllabus Coverage (30% weight)
  const coveredTopicsCount = topics.filter(
    (t) => t.status === 'completed' || (t.progressPercent && t.progressPercent > 50)
  ).length;
  const coverageRatio = topics.length > 0 ? coveredTopicsCount / topics.length : 0;
  const syllabusCoverageWeight = Math.round(coverageRatio * 30);

  // Pillar 2: Accuracy on sampled topics (50% weight)
  let totalCorrect = 0;
  let totalAttempted = 0;
  attempts.forEach((a) => {
    totalCorrect += a.correctCount || 0;
    totalAttempted += (a.correctCount || 0) + (a.incorrectCount || 0);
  });
  const accuracyRatio = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
  const accuracyWeight = Math.round(accuracyRatio * 50);

  // Pillar 3: Consistency across recent tests (20% weight)
  const recentAttempts = [...attempts].reverse().slice(0, 5);
  const avgRecentScore =
    recentAttempts.reduce((sum, a) => sum + a.score, 0) / (recentAttempts.length || 1);
  const variance =
    recentAttempts.reduce((sum, a) => sum + Math.pow(a.score - avgRecentScore, 2), 0) /
    (recentAttempts.length || 1);
  const stdDev = Math.sqrt(variance);

  // Lower stdDev means higher consistency
  const consistencyFactor = Math.max(0, 1 - stdDev / 20);
  const consistencyWeight = Math.round(consistencyFactor * 20);

  const readinessScore = Math.min(
    100,
    Math.max(10, syllabusCoverageWeight + accuracyWeight + consistencyWeight)
  );

  let readinessLevel: ReadinessIndicator['readinessLevel'] = 'Building Foundation';
  if (readinessScore >= 80) readinessLevel = 'Exam Ready & Consistent';
  else if (readinessScore >= 65) readinessLevel = 'Improving & Competitive';
  else if (readinessScore >= 45) readinessLevel = 'Developing Proficiency';

  // Predicted score estimate based on 150 marks Prelims scale
  const estMid = Math.round((readinessScore / 100) * 150);
  const estMin = Math.max(15, estMid - 10);
  const estMax = Math.min(150, estMid + 12);

  const unattemptedHighPriorityAreas = topics
    .filter((t) => t.priority === 'high' && t.status !== 'completed')
    .map((t) => t.title)
    .slice(0, 5);

  const explanation = `Estimate derived from 3 weighted dimensions: Syllabus Coverage (${syllabusCoverageWeight}/30), Tested Accuracy (${accuracyWeight}/50), and Recent Consistency (${consistencyWeight}/20). This represents your current calibrated proficiency band.`;

  return {
    readinessScore,
    readinessLevel,
    predictedScoreRange: {
      min: estMin,
      max: estMax,
      label: `${estMin} – ${estMax} Marks (out of 150)`,
    },
    syllabusCoverageWeight,
    accuracyWeight,
    consistencyWeight,
    unattemptedHighPriorityAreas,
    explanation,
  };
}

/**
 * 6. Personalized Next-Study Recommendations
 */
export function generatePersonalizedRecommendations(
  attempts: TestAttempt[],
  topics: SyllabusTopic[],
  subjects: Subject[],
  mockTests: MockTest[],
  mistakeBook: MistakeBookItem[] = []
): PersonalizedStudyRecommendation {
  const topicAnalytics = calculateTopicDeepAnalytics(topics, attempts, mockTests, subjects);

  // Strong points: Top 2 topics by accuracy with >= 3 attempts
  const strongTopics = [...topicAnalytics]
    .filter((t) => t.questionsAttempted >= 3 && t.accuracy >= 70)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 2);

  const strongPoints = strongTopics.map(
    (t) => `${t.topicTitle}: Strong retention at ${t.accuracy}% accuracy across ${t.questionsAttempted} questions.`
  );
  if (strongPoints.length === 0) {
    strongPoints.push('Exam stamina: Regularly attempting structured question sets builds test endurance.');
  }

  // Top 3 Weaknesses: Lowest accuracy with >= 3 attempts
  const weakTopics = [...topicAnalytics]
    .filter((t) => t.questionsAttempted >= 2 && t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const top3Weaknesses = weakTopics.map((w) => ({
    topicId: w.topicId,
    topicTitle: w.topicTitle,
    accuracy: w.accuracy,
    attempts: w.questionsAttempted,
    advice: `Accuracy is currently ${w.accuracy}%. Revise foundational concepts and complete 20 targeted practice questions.`,
  }));

  // Fallback if not enough attempts
  if (top3Weaknesses.length === 0) {
    const unattemptedHigh = topics.filter((t) => t.priority === 'high').slice(0, 3);
    unattemptedHigh.forEach((t) => {
      top3Weaknesses.push({
        topicId: t.id,
        topicTitle: t.title,
        accuracy: 0,
        attempts: 0,
        advice: `High-priority unattempted syllabus area. Complete initial practice questions.`,
      });
    });
  }

  // Topics to revise
  const topicsToRevise = top3Weaknesses.map((w) => ({
    topicId: w.topicId,
    title: w.topicTitle,
    priority: 'high' as const,
  }));

  const unmasteredMistakes = mistakeBook.filter((m) => m.revisionStatus !== 'mastered');

  const suggestedNextMockTest = {
    id: mockTests[0]?.id || 'mock-1',
    title: mockTests[0]?.title || 'APPSC Prelims Screening Mock 1',
    reason: 'Balanced full-syllabus simulation to measure score retention across all 5 subject groups.',
  };

  const measurableNextGoal =
    top3Weaknesses.length > 0
      ? `Elevate accuracy in "${top3Weaknesses[0].topicTitle}" to 70% in your next 25-question practice set.`
      : 'Complete your next full simulation test with minimum 75% accuracy and under 60s per question.';

  const generatedNarrative = `Based on your recent performance, prioritize revising ${topicsToRevise.map((t) => `"${t.title}"`).join(', ')}. Clear the ${unmasteredMistakes.length} pending questions in your Mistake Book before taking your next full mock test.`;

  return {
    strongPoints,
    top3Weaknesses,
    top3WeakTopics: top3Weaknesses,
    topicsToRevise,
    incorrectQuestionsToReviewCount: unmasteredMistakes.length,
    recommendedPracticeCount: 25,
    recommendedDifficulty: 'moderate',
    suggestedNextMockTest,
    measurableNextGoal,
    generatedNarrative,
  };
}

/**
 * 7. Mistake Book Synchronization Engine
 */
export function syncMistakeBookFromAttempt(
  currentMistakeBook: MistakeBookItem[],
  attempt: TestAttempt,
  testOrTests: MockTest | MockTest[],
  topics: SyllabusTopic[],
  subjects: Subject[]
): MistakeBookItem[] {
  const updatedMistakes = [...currentMistakeBook];
  const dateStr = (attempt.completedAt || attempt.startedAt || new Date().toISOString()).split('T')[0];

  const targetTest = Array.isArray(testOrTests)
    ? testOrTests.find((m) => m.id === attempt.testId)
    : testOrTests;

  if (!targetTest || !targetTest.questions) {
    return updatedMistakes;
  }

  targetTest.questions.forEach((q) => {
    const ans = attempt.answers[q.id];
    if (!ans) return;

    const existingIndex = updatedMistakes.findIndex((m) => m.questionId === q.id);
    const topic = topics.find((t) => t.id === q.topicId);
    const subject = subjects.find((s) => s.id === q.subjectId || s.id === topic?.subjectId);

    if (ans.selectedOptionId && !ans.isCorrect) {
      // INCORRECT ANSWER
      if (existingIndex >= 0) {
        const item = updatedMistakes[existingIndex];
        updatedMistakes[existingIndex] = {
          ...item,
          mistakeCount: item.mistakeCount + 1,
          consecutiveCorrectCount: 0,
          lastMistakeDate: dateStr,
          lastAttemptDate: dateStr,
          mostRecentResult: 'incorrect',
          lastSelectedOptionId: ans.selectedOptionId,
          revisionStatus: 'pending_review',
        };
      } else {
        // Classify error reason tentatively
        let category: MistakeErrorCategory = 'unclassified';
        if (ans.timeSpentSeconds && ans.timeSpentSeconds < 20) {
          category = 'careless_error';
        } else if (ans.timeSpentSeconds && ans.timeSpentSeconds > 90) {
          category = 'conceptual_misunderstanding';
        } else if (q.difficulty === 'hard' || (q.difficulty as string) === 'difficult') {
          category = 'knowledge_gap';
        }

        const newItem: MistakeBookItem = {
          id: `mistake-${Date.now()}-${q.id}`,
          questionId: q.id,
          questionText: q.questionText,
          questionTextTelugu: q.questionTextTelugu,
          options: q.options || [],
          correctOptionId: q.correctOptionId,
          explanation: q.explanation || 'Verified curriculum explanation.',
          explanationTelugu: q.explanationTelugu,
          subjectId: subject?.id || q.subjectId || 'general-subject',
          subjectName: subject?.name || 'General Subject',
          topicId: topic?.id || q.topicId || 'general-topic',
          topicTitle: topic?.title || 'General Topic',
          difficulty: q.difficulty || 'moderate',
          mistakeCount: 1,
          consecutiveCorrectCount: 0,
          firstMistakeDate: dateStr,
          lastMistakeDate: dateStr,
          lastAttemptDate: dateStr,
          mostRecentResult: 'incorrect',
          lastSelectedOptionId: ans.selectedOptionId,
          revisionStatus: 'pending_review',
          errorCategory: category,
          isBookmarked: false,
        };
        updatedMistakes.push(newItem);
      }
    } else if (ans.selectedOptionId && ans.isCorrect) {
      // CORRECT ANSWER: Check if it was previously in mistake book
      if (existingIndex >= 0) {
        const item = updatedMistakes[existingIndex];
        const newConsecutive = item.consecutiveCorrectCount + 1;
        // Mastery rule: 2 consecutive correct answers marks it as mastered
        const newStatus = newConsecutive >= 2 ? 'mastered' : 'in_revision';

        updatedMistakes[existingIndex] = {
          ...item,
          consecutiveCorrectCount: newConsecutive,
          lastAttemptDate: dateStr,
          mostRecentResult: 'correct',
          revisionStatus: newStatus,
        };
      }
    }
  });

  return updatedMistakes;
}

/**
 * 8. Side-by-Side Attempt Comparison
 */
export function compareTwoAttempts(
  attemptA: TestAttempt,
  attemptB: TestAttempt,
  mockTests: MockTest[],
  topics: SyllabusTopic[]
): AttemptComparisonResult {
  const scoreDelta = Number((attemptB.score - attemptA.score).toFixed(2));
  const accuracyDelta = Number((attemptB.accuracy - attemptA.accuracy).toFixed(1));
  const timeSpentDeltaSeconds = (attemptB.timeSpentSeconds || 0) - (attemptA.timeSpentSeconds || 0);
  const correctDelta = (attemptB.correctCount || 0) - (attemptA.correctCount || 0);
  const incorrectDelta = (attemptB.incorrectCount || 0) - (attemptA.incorrectCount || 0);

  // Compare topic accuracies
  const testA = mockTests.find((m) => m.id === attemptA.testId);
  const testB = mockTests.find((m) => m.id === attemptB.testId);

  const topicAccuracyMap: Record<
    string,
    { title: string; aCorrect: number; aTotal: number; bCorrect: number; bTotal: number }
  > = {};

  const processAttempt = (
    att: TestAttempt,
    test: MockTest | undefined,
    field: 'a' | 'b'
  ) => {
    if (!test || !att.answers) return;
    test.questions.forEach((q) => {
      const tId = q.topicId || 'general';
      const topicObj = topics.find((t) => t.id === tId);
      if (!topicAccuracyMap[tId]) {
        topicAccuracyMap[tId] = {
          title: topicObj?.title || 'General Topic',
          aCorrect: 0,
          aTotal: 0,
          bCorrect: 0,
          bTotal: 0,
        };
      }
      const ans = att.answers[q.id];
      if (ans && ans.selectedOptionId) {
        if (field === 'a') {
          topicAccuracyMap[tId].aTotal++;
          if (ans.isCorrect) topicAccuracyMap[tId].aCorrect++;
        } else {
          topicAccuracyMap[tId].bTotal++;
          if (ans.isCorrect) topicAccuracyMap[tId].bCorrect++;
        }
      }
    });
  };

  processAttempt(attemptA, testA, 'a');
  processAttempt(attemptB, testB, 'b');

  const topicComparisons = Object.entries(topicAccuracyMap).map(([tId, stat]) => {
    const accA = stat.aTotal > 0 ? Math.round((stat.aCorrect / stat.aTotal) * 100) : 0;
    const accB = stat.bTotal > 0 ? Math.round((stat.bCorrect / stat.bTotal) * 100) : 0;
    return {
      topicId: tId,
      topicTitle: stat.title,
      accuracyA: accA,
      accuracyB: accB,
      accuracyDelta: accB - accA,
    };
  });

  const topicComparison = topicComparisons.map((tc) => ({
    topicId: tc.topicId,
    topicTitle: tc.topicTitle,
    attemptAScore: tc.accuracyA,
    attemptBScore: tc.accuracyB,
    delta: tc.accuracyDelta,
  }));

  return {
    attemptA,
    attemptB,
    scoreDelta,
    accuracyDelta,
    timeSpentDeltaSeconds,
    timeDeltaSeconds: timeSpentDeltaSeconds,
    correctDelta,
    incorrectDelta,
    topicComparisons,
    topicComparison,
  };
}
