-- STUDYVERSE PostgreSQL Database Schema & Row-Level Security Policies
-- Optimized for Supabase Auth & PostgreSQL 15+

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    target_exam TEXT DEFAULT 'APPSC Group 2 & M.Tech 1st Sem',
    target_date DATE,
    daily_goal_hours NUMERIC(4,2) DEFAULT 6.5,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    density TEXT DEFAULT 'comfortable',
    appsc_ratio INTEGER DEFAULT 60,
    semester_ratio INTEGER DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AVAILABILITY RULES
CREATE TABLE IF NOT EXISTS public.availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    available_hours NUMERIC(4,2) NOT NULL DEFAULT 6.5,
    preferred_slots TEXT[] DEFAULT ARRAY['morning', 'evening'],
    is_rest_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXAM SETTINGS
CREATE TABLE IF NOT EXISTS public.exam_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    total_questions INTEGER DEFAULT 150,
    total_marks NUMERIC(6,2) DEFAULT 150.0,
    marks_per_question NUMERIC(4,2) DEFAULT 1.0,
    negative_marks NUMERIC(4,2) DEFAULT 0.33,
    duration_minutes INTEGER DEFAULT 150,
    subject_targets JSONB DEFAULT '[]'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    track TEXT NOT NULL CHECK (track IN ('appsc-prelims', 'appsc-mains', 'semester', 'general')),
    paper TEXT,
    code TEXT,
    group_number INTEGER,
    name TEXT NOT NULL,
    name_telugu TEXT,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    official_marks NUMERIC(6,2),
    target_weight_percent NUMERIC(5,2),
    target_hours NUMERIC(5,2) DEFAULT 40.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYLLABUS TOPICS
CREATE TABLE IF NOT EXISTS public.syllabus_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    track TEXT NOT NULL CHECK (track IN ('appsc-prelims', 'appsc-mains', 'semester', 'general')),
    paper TEXT,
    topic_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    title_telugu TEXT,
    description TEXT,
    learning_objectives TEXT[],
    timeline TEXT,
    important_personalities TEXT[],
    key_events TEXT[],
    causes_and_consequences TEXT,
    exam_facts TEXT[],
    estimated_hours NUMERIC(4,2) DEFAULT 4.0,
    difficulty TEXT DEFAULT 'moderate' CHECK (difficulty IN ('easy', 'moderate', 'hard')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_revision')),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    is_verified BOOLEAN DEFAULT TRUE,
    verification_source TEXT,
    is_shared_with_mains BOOLEAN DEFAULT FALSE,
    shared_mains_topic_id UUID,
    revision_intervals INTEGER[] DEFAULT ARRAY[1, 3, 7, 14, 30],
    last_studied_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    concepts_learned BOOLEAN DEFAULT FALSE,
    notes_reviewed BOOLEAN DEFAULT FALSE,
    practice_completed BOOLEAN DEFAULT FALSE,
    revision_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SYLLABUS SUBTOPICS
CREATE TABLE IF NOT EXISTS public.syllabus_subtopics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_telugu TEXT,
    explanation TEXT,
    key_concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
    important_facts TEXT[] DEFAULT ARRAY[]::TEXT[],
    definitions TEXT[] DEFAULT ARRAY[]::TEXT[],
    examples TEXT[] DEFAULT ARRAY[]::TEXT[],
    exam_relevance TEXT,
    estimated_minutes INTEGER DEFAULT 45,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RESOURCES (PDFs, Notes, Documents)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'notes', 'link', 'pyq', 'mock_test_ref')),
    track TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subtopic_id UUID REFERENCES public.syllabus_subtopics(id) ON DELETE SET NULL,
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    content TEXT,
    external_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    language TEXT DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    source_url TEXT,
    publication_date DATE,
    last_verified_date DATE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    personal_comments TEXT,
    last_opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RESOURCE-TOPIC LINKS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.resource_topic_links (
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, topic_id)
);

-- 10. CHATGPT CONVERSATION LINKS
CREATE TABLE IF NOT EXISTS public.chatgpt_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.syllabus_subtopics(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    track TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'en',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    personal_comments TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PRACTICE QUESTIONS (MCQs)
CREATE TABLE IF NOT EXISTS public.practice_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.syllabus_subtopics(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    track TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_text_telugu TEXT,
    options JSONB NOT NULL DEFAULT '[]'::JSONB,
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    explanation_telugu TEXT,
    difficulty TEXT DEFAULT 'moderate',
    source TEXT,
    personal_notes TEXT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    attempt_history JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STUDY PLANS & TASKS
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    track TEXT NOT NULL,
    start_date DATE NOT NULL,
    target_completion_date DATE NOT NULL,
    daily_available_hours NUMERIC(4,2) DEFAULT 4.0,
    scheduling_mode TEXT DEFAULT 'balanced',
    is_paused BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.study_plans(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.syllabus_subtopics(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    track TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    task_type TEXT DEFAULT 'learn',
    attached_resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
    attached_chatgpt_link_id UUID REFERENCES public.chatgpt_links(id) ON DELETE SET NULL,
    is_revision BOOLEAN DEFAULT FALSE,
    revision_cycle INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    is_overdue BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MOCK TESTS & ATTEMPTS
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    track TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 150,
    marks_per_question NUMERIC(4,2) DEFAULT 1.0,
    negative_marks NUMERIC(4,2) DEFAULT 0.33,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE,
    test_title TEXT NOT NULL,
    track TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    score NUMERIC(6,2) NOT NULL,
    total_possible_marks NUMERIC(6,2) NOT NULL,
    accuracy NUMERIC(5,2) NOT NULL,
    correct_count INTEGER NOT NULL,
    incorrect_count INTEGER NOT NULL,
    unanswered_count INTEGER NOT NULL,
    marked_for_review_count INTEGER NOT NULL,
    answers_json JSONB DEFAULT '{}'::JSONB,
    suggested_revision_topic_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. REVISION ITEMS
CREATE TABLE IF NOT EXISTS public.revision_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.syllabus_subtopics(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    track TEXT NOT NULL,
    title TEXT NOT NULL,
    key_facts TEXT[],
    formulae_or_defs TEXT[],
    repetition_stage INTEGER DEFAULT 1,
    next_due_date DATE NOT NULL,
    last_reviewed_date DATE,
    difficulty_rating TEXT,
    is_due BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    end_date DATE,
    type TEXT NOT NULL,
    track TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. QUESTION BANK
CREATE TABLE IF NOT EXISTS public.bank_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_track TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    subtopic_id UUID REFERENCES public.syllabus_subtopics(id) ON DELETE SET NULL,
    question_type TEXT DEFAULT 'single_correct',
    question_text TEXT NOT NULL,
    question_text_telugu TEXT,
    options JSONB NOT NULL DEFAULT '[]'::JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    explanation_telugu TEXT,
    difficulty TEXT DEFAULT 'moderate',
    language TEXT DEFAULT 'en',
    marks NUMERIC(4,2) DEFAULT 1.0,
    negative_marks NUMERIC(4,2) DEFAULT 0.33,
    source_type TEXT DEFAULT 'standard_book',
    source_reference TEXT,
    validation_status TEXT DEFAULT 'approved',
    publication_status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. GENERATION JOBS & BLUEPRINTS
CREATE TABLE IF NOT EXISTS public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    exam_track TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    target_questions INTEGER NOT NULL DEFAULT 50,
    generated_count INTEGER DEFAULT 0,
    approved_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    progress_percent INTEGER DEFAULT 0,
    difficulty_mix JSONB DEFAULT '{"easy":20,"moderate":50,"difficult":25,"very_difficult":5}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.test_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    exam_track TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    duration_minutes INTEGER DEFAULT 60,
    question_count INTEGER DEFAULT 50,
    marks_per_question NUMERIC(4,2) DEFAULT 1.0,
    negative_marks NUMERIC(4,2) DEFAULT 0.33,
    topic_distribution JSONB DEFAULT '[]'::JSONB,
    difficulty_distribution JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MISTAKE BOOK
CREATE TABLE IF NOT EXISTS public.mistake_book (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_text_telugu TEXT,
    options JSONB NOT NULL DEFAULT '[]'::JSONB,
    correct_option_id TEXT NOT NULL,
    explanation TEXT NOT NULL,
    explanation_telugu TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    topic_title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'moderate',
    mistake_count INTEGER DEFAULT 1,
    consecutive_correct_count INTEGER DEFAULT 0,
    first_mistake_date TIMESTAMPTZ DEFAULT NOW(),
    last_mistake_date TIMESTAMPTZ DEFAULT NOW(),
    last_attempt_date TIMESTAMPTZ DEFAULT NOW(),
    most_recent_result TEXT DEFAULT 'incorrect',
    last_selected_option_id TEXT,
    user_notes TEXT,
    revision_status TEXT DEFAULT 'pending_review',
    error_category TEXT DEFAULT 'unclassified',
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. INDEXES
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON public.study_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_topics_user_subject ON public.syllabus_topics(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON public.syllabus_subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_chatgpt_links_topic ON public.chatgpt_links(topic_id);
CREATE INDEX IF NOT EXISTS idx_practice_questions_topic ON public.practice_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_bank_questions_topic ON public.bank_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_mistake_book_user ON public.mistake_book(user_id);

-- 20. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_topic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatgpt_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own availability" ON public.availability_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exam settings" ON public.exam_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own topics" ON public.syllabus_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subtopics" ON public.syllabus_subtopics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own resources" ON public.resources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chatgpt links" ON public.chatgpt_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own practice questions" ON public.practice_questions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own plans" ON public.study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tests" ON public.mock_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own attempts" ON public.test_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own revisions" ON public.revision_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own calendar" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bank questions" ON public.bank_questions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own generation jobs" ON public.generation_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own test blueprints" ON public.test_blueprints FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mistake book" ON public.mistake_book FOR ALL USING (auth.uid() = user_id);

