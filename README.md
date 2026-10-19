# STUDYVERSE — Smart Study Planner & Academic Management Platform

**STUDYVERSE** is a personalized exam preparation, intelligent study planner, and academic command centre designed for students concurrently managing competitive examinations (such as APPSC Group 2 Prelims and Mains) and university degree courses (such as B.Tech semester syllabi, internals, mid-terms, and lab practicals).

> **Core Philosophy**: Fully customizable and editable by the student owner. No hardcoded study plans, static demos, or code changes required to add, edit, or reorder ordinary study material.

---

## Key Features & Architecture

1. **Dashboard (`/`)**
   - Live study agenda with instant complete/toggle checkmark controls.
   - Real-time study hour targets versus actuals with daily and weekly progress indicators.
   - Dual-track progress rings for APPSC Prelims, APPSC Mains, and B.Tech Semester courses.
   - 7-day streak indicator, countdown to nearest exam milestones, and quick access to recent verified notes and PDFs.

2. **Fully Editable Study Plan Builder (`/plans`)**
   - Unlimited custom plans: rename, edit, duplicate, archive, and delete.
   - Target dates, daily availability, and curriculum topic associations.
   - Set estimated study duration, topic difficulty, and priorities.
   - Single-click schedule generator preview before applying to the timetable.
   - JSON export and import for individual study plans.

3. **Smart Day Allocator & Timetable (`/timetable`)**
   - Algorithmic, deterministic scheduling engine respecting daily availability windows (Mon-Sun), preferred study slots (morning, afternoon, evening, night), and rest days.
   - Three scheduling modes:
     - **Balanced**: Even distribution across weekdays and weekends with break allowances.
     - **Deadline-focused**: Front-loads high priority and near-term examination milestones.
     - **Revision-focused**: Prioritizes spaced repetition intervals and weak topics.
   - **Smart Rollover**: Automatically redistributes missed/overdue tasks over upcoming days without overloading tomorrow.
   - Manual rescheduling: Move tasks between days with instant conflict detection.

4. **APPSC Preparation Hub (`/appsc`)**
   - **Prelims Workspace**: Official syllabus explorer, topic completion, concept notes, topic-wise MCQs, and weak-topic diagnostics.
   - **Mains Workspace**: Descriptive answer-writing suite with word counters, live timer, self-evaluation checklists, and verified model answers.
   - **Shared Syllabus Mapping**: Explicitly links overlapping topics between Prelims and Mains while tracking conceptual mastery and descriptive practice independently.
   - Dual language support (Telugu and English).

5. **Semester Preparation Hub (`/semester`)**
   - Configurable Academic Year, Semester, Branch, and Courses (e.g. Operating Systems, Computer Networks, DBMS).
   - Milestone tracking for Internal Exams 1 & 2, Mid Examinations 1 & 2, Practical Labs, and End-Semester Finals.
   - Unit-wise topic breakdown, important questions, and study-hour allocations.

6. **Syllabus Tracker (`/syllabus`)**
   - Cross-track searchable matrix with filter by track, status (Not Started, In Progress, Completed, Needs Revision), difficulty, and priority.
   - Instant inline status toggles.

7. **Notes & PDF Resource Library (`/resources`)**
   - Searchable repository for PDFs, personal markdown notes, PYQ papers, and external references.
   - Built-in In-App Reader with clean **Light Reading Mode** and **Dark Dashboard Mode** toggling.
   - Tagging, bookmarking, and verified source indicators.

8. **Mock Test Centre (`/mock-tests`)**
   - Full MCQ examination runner with live countdown timer and auto-submission.
   - Configurable marks and negative marking penalty (e.g. -0.33).
   - Question navigation palette with standard color codes (Answered, Unanswered, Marked for Review).
   - Question-by-question review mode with verified answer explanations.
   - One-click action to inject weak/failed topics directly into the Revision Queue.
   - Custom test builder to add custom questions, options, and explanations.

9. **Revision Centre (`/revisions`)**
   - Spaced repetition algorithm implementing 1, 3, 7, 14, and 30-day intervals.
   - Interactive 3D flip **Flashcards Mode** with recall ratings (Easy, Good, Hard).
   - Sync due revisions directly into the daily study timetable.

10. **Calendar & Deadlines (`/calendar`)**
    - Month calendar and agenda list views with color-coded exam milestones and study deadlines.

11. **Analytics & Reports (`/analytics`)**
    - Visual charts powered by Recharts: Daily Study Hours vs Goal, Mock Test Accuracy Progression, Subject Distribution, and Weak Topics Table.
    - Exportable analytics summary report.

12. **Settings & Data Management (`/settings`)**
    - Student profile, target examination goals, and daily study hour targets.
    - Day-by-day availability table and rest day toggles.
    - Full Workspace JSON Export & Import (zero data loss across devices).
    - Reset to comprehensive sample data or start with a blank workspace.
    - Supabase configuration and PostgreSQL schema reference.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React
- **Routing**: React Router v7
- **Analytics & Data Visualizations**: Recharts
- **Forms & Validation**: Zod
- **Testing**: Vitest unit test suite
- **Data Persistence**: Offline-first reactive LocalStorage engine + Supabase PostgreSQL & Auth integration layer

---

## Local Development & Setup

### 1. Prerequisites
- Node.js (v18+ recommended; tested on v26)
- npm or pnpm

### 2. Installation
```bash
cd studyverse
npm install --legacy-peer-deps
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Run Unit Tests
```bash
npx vitest run
```

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## Supabase PostgreSQL Setup & Migrations

If connecting a Supabase backend:

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, copy its contents, and execute the query.
4. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart the Vite development server. STUDYVERSE will automatically detect the Supabase credentials and display **"Supabase Synced"** in the top navigation bar.

*Note*: If credentials are not provided, STUDYVERSE automatically operates in **Local Demo Mode** using browser `localStorage` and provides full offline data editing, persistence, and JSON backup capabilities.

---

## Required Workflows Tested

- **Workflow A (Create Plan)**: User creates APPSC sprint plan -> specifies subjects & target date -> previews generated schedule -> accepts plan -> tasks appear on dashboard.
- **Workflow B (Reschedule)**: User adjusts daily availability or has missed tasks -> triggers "Smart Rollover" -> tasks are redistributed evenly without cramming.
- **Workflow C (Resource Library)**: User opens resources -> previews notes in Light Reading Mode -> toggles bookmark -> resource accessible from topic view.
- **Workflow D (Mock Test)**: User starts Prelims Mock -> answers questions with timer -> marks questions for review -> submits exam -> reviews wrong answers with explanations -> clicks "Sync Weak Topics to Revision".
- **Workflow E (Semester Balance)**: User configures 65% APPSC : 35% Semester split ratio -> Auto-Allocator schedules both tracks harmoniously.
- **Workflow F (Persistence & Export)**: All changes remain saved after browser refreshes; full workspace can be exported to JSON and restored at any time.
