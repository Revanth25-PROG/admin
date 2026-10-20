import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { StudyPlansPage } from '../features/study-plans/StudyPlansPage';
import { TimetablePage } from '../features/timetable/TimetablePage';
import { AppscPage } from '../features/appsc/AppscPage';
import { SemesterPage } from '../features/semester/SemesterPage';
import { SyllabusPage } from '../features/syllabus/SyllabusPage';
import { ResourcesPage } from '../features/resources/ResourcesPage';
import { MockTestsPage } from '../features/mock-tests/MockTestsPage';
import { RevisionsPage } from '../features/revisions/RevisionsPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { TopicDetailPage } from '../features/topics/TopicDetailPage';
import { SubjectDetailPage } from '../features/subjects/SubjectDetailPage';
import { MainsWorkspacePage } from '../features/mains/MainsWorkspacePage';
import { MistakeBookPage } from '../features/mistakes/MistakeBookPage';
import { CurrentAffairsPage } from '../features/current-affairs/CurrentAffairsPage';
import { TestHistoryPage } from '../features/history/TestHistoryPage';
import { AdminQuestionBankPage } from '../features/admin/AdminQuestionBankPage';
import { AdminMockInventoryPage } from '../features/admin/AdminMockInventoryPage';
import { LoginPage } from '../features/auth/LoginPage';
import { LiveExamPage } from '../features/exam/LiveExamPage';
import { TestConfigPage } from '../features/mock-tests/TestConfigPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="plans" element={<StudyPlansPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="appsc" element={<AppscPage />} />
          <Route path="semester" element={<SemesterPage />} />
          <Route path="syllabus" element={<SyllabusPage />} />
          <Route path="topics/:topicId" element={<TopicDetailPage />} />
          <Route path="subjects/:subjectId" element={<SubjectDetailPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="mock-tests" element={<MockTestsPage />} />
          <Route path="mock-tests/configure" element={<TestConfigPage />} />
          <Route path="exam/:testId" element={<LiveExamPage />} />
          <Route path="mains" element={<MainsWorkspacePage />} />
          <Route path="mistakes" element={<MistakeBookPage />} />
          <Route path="current-affairs" element={<CurrentAffairsPage />} />
          <Route path="history" element={<TestHistoryPage />} />
          <Route path="revisions" element={<RevisionsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin/question-bank" element={<AdminQuestionBankPage />} />
          <Route path="admin/inventory" element={<AdminMockInventoryPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
