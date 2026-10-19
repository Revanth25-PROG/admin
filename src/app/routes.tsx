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
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="mock-tests" element={<MockTestsPage />} />
          <Route path="revisions" element={<RevisionsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
