import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  FileText,
  Sparkles,
  Bookmark,
  RotateCcw,
  AlertCircle,
  Share2,
  Layers,
  Search,
  Eye,
  Filter,
  Save,
  ShieldCheck,
  Tag,
  Link2,
  BookMarked,
  Sun,
  Moon,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Award,
  Hash,
  UploadCloud,
  Unlink,
  Download,
  FileCheck,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, TrackBadge, PriorityBadge, DifficultyBadge, StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import {
  SyllabusTopic,
  Subtopic,
  ChatGPTLink,
  PracticeQuestion,
  ResourceItem,
  TopicStatus,
  Difficulty,
  Priority,
} from '../../types';

export const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const {
    topics,
    subjects,
    subtopics,
    chatgptLinks,
    practiceQuestions,
    resources,
    revisions,
    updateTopicStatus,
    updateTopicDetails,
    addTaskFromTopic,
    saveSubtopic,
    deleteSubtopic,
    toggleSubtopicCompletion,
    saveChatGPTLink,
    deleteChatGPTLink,
    savePracticeQuestion,
    deletePracticeQuestion,
    recordQuestionAttempt,
    toggleQuestionBookmark,
    saveResource,
    deleteResource,
    attachResourceToTopic,
    detachResourceFromTopic,
    saveRevisionItem,
    completeRevisionItem,
  } = useStudyVerse();

  // Find topic
  const topic = topics.find((t) => t.id === topicId);
  const subject = subjects.find((s) => s.id === topic?.subjectId);

  // Active digital reference tab
  const [activeTab, setActiveTab] = useState<string>('subtopics');

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------------------------------------------
  // Modals state
  // ----------------------------------------------------
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [isAddSubtopicOpen, setIsAddSubtopicOpen] = useState(false);
  const [isAddChatGPTLinkOpen, setIsAddChatGPTLinkOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isAttachPDFOpen, setIsAttachPDFOpen] = useState(false);
  const [isUploadPDFOpen, setIsUploadPDFOpen] = useState(false);
  const [attachSearchQuery, setAttachSearchQuery] = useState('');
  const [attachFilterMode, setAttachFilterMode] = useState<'all' | 'subject'>('all');

  // PDF Viewer modal state
  const [viewingPDF, setViewingPDF] = useState<ResourceItem | null>(null);
  const [pdfReaderView, setPdfReaderView] = useState<'embed' | 'study_notes'>('embed');
  const [pdfReadingMode, setPdfReadingMode] = useState<'light' | 'dark'>('light');
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfTotalPages] = useState<number>(18);
  const [pdfReadingNotes, setPdfReadingNotes] = useState<string>('');

  // Personal notes markdown editor state
  const [personalNotes, setPersonalNotes] = useState<string>(
    topic?.personalNotes ||
      `# Key Revision Notes for ${topic?.title || 'Topic'}\n\n## 1. Core Concepts & Definitions\n- Write your analytical summary here.\n- Focus on APPSC high-yield questions.\n\n## 2. Key Facts & Personalities\n- Important dates and contributions.\n\n## 3. Andhra Pradesh Relevance\n- Linkages to AP regional history, polity, or economic indices.`
  );
  const [notesViewMode, setNotesViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [notesSavedFeedback, setNotesSavedFeedback] = useState(false);

  // MCQ Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [mcqFilterDifficulty, setMcqFilterDifficulty] = useState<string>('all');

  // Copied link feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subtopics for this topic
  const topicSubtopics = subtopics.filter((st) => st.topicId === topicId);
  const completedSubtopicsCount = topicSubtopics.filter((st) => st.isCompleted).length;
  const subtopicProgress =
    topicSubtopics.length > 0
      ? Math.round((completedSubtopicsCount / topicSubtopics.length) * 100)
      : topic?.progressPercent || 0;

  // ChatGPT links for this topic
  const topicChatGPTLinks = chatgptLinks.filter((l) => l.topicId === topicId);

  // Practice questions for this topic
  const topicQuestions = practiceQuestions.filter((q) => q.topicId === topicId);

  // Resources (PDFs) specifically attached to this topic
  const topicResources = resources.filter(
    (r) => r.topicIds?.includes(topicId || '') || topic?.resourceIds?.includes(r.id)
  );

  // Revision item for this topic
  const topicRevision = revisions.find((r) => r.topicId === topicId);

  if (!topic) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/syllabus')} className="gap-2">
          <ArrowLeft size={16} /> Back to Syllabus
        </Button>
        <Card className="text-center py-16">
          <AlertCircle size={48} className="mx-auto text-amber-400 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Topic Not Found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            The topic requested could not be located in the syllabus database.
          </p>
          <Button onClick={() => navigate('/syllabus')}>Go to Syllabus Hub</Button>
        </Card>
      </div>
    );
  }

  // Handle adding topic to today's study plan
  const handleAddToTodayPlan = () => {
    addTaskFromTopic(topic.id);
    showToast(`Added "${topic.title.substring(0, 32)}..." to Today's Study Plan!`);
  };

  // Handle saving personal notes
  const handleSaveNotes = () => {
    updateTopicDetails(topic.id, { personalNotes });
    setNotesSavedFeedback(true);
    setTimeout(() => setNotesSavedFeedback(false), 2500);
    showToast('Personal notes saved successfully!');
  };

  // Handle MCQ check answer
  const handleCheckAnswer = (qId: string, correctOptId: string) => {
    const chosen = selectedAnswers[qId];
    if (!chosen) return;
    const isCorrect = chosen === correctOptId;
    setRevealedAnswers((prev) => ({ ...prev, [qId]: true }));
    recordQuestionAttempt(qId, chosen, isCorrect);
  };

  // Handle logging revision
  const handleLogRevision = (rating: 'hard' | 'good' | 'easy') => {
    if (topicRevision) {
      completeRevisionItem(topicRevision.id, rating);
      showToast(`Revision logged with rating: ${rating.toUpperCase()}! Next interval calculated.`);
    } else {
      // Create new revision item
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + (rating === 'easy' ? 3 : 1));
      saveRevisionItem({
        id: `rev-${Date.now()}`,
        topicId: topic.id,
        subjectId: topic.subjectId,
        track: topic.track,
        title: topic.title,
        repetitionStage: rating === 'hard' ? 1 : 2,
        nextDueDate: nextDate.toISOString().split('T')[0],
        lastReviewedDate: new Date().toISOString().split('T')[0],
        difficultyRating: rating,
        isDue: false,
        isOverdue: false,
        keyFacts: topic.examFacts || [],
      });
      showToast('Spaced repetition tracking initialized for this topic!');
    }
  };

  // Tabs for the digital reference workspace
  const tabs = [
    { id: 'subtopics', label: 'Subtopics & Micro-Syllabus', count: topicSubtopics.length, icon: <Layers size={15} /> },
    { id: 'notes', label: 'Personal Notes', icon: <FileText size={15} /> },
    { id: 'pdfs', label: 'My PDFs & E-Books', count: topicResources.length, icon: <BookOpen size={15} /> },
    { id: 'chatgpt', label: 'ChatGPT Links', count: topicChatGPTLinks.length, icon: <Sparkles size={15} /> },
    { id: 'practice', label: 'Practice MCQs', count: topicQuestions.length, icon: <Award size={15} /> },
    { id: 'references', label: 'Cross-References & AP Regional', icon: <Link2 size={15} /> },
    { id: 'revision', label: 'Spaced Revision (SM-2)', icon: <RotateCcw size={15} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-blue-400 text-sm animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <Link to="/syllabus" className="hover:text-blue-400 transition-colors">
            Syllabus
          </Link>
          <ChevronRight size={12} />
          <span>{subject?.name || 'Subject'}</span>
          <ChevronRight size={12} />
          <span className="text-slate-200 font-medium">Topic #{topic.topicNumber || 1}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/syllabus')} className="gap-1.5 text-xs">
            <ArrowLeft size={14} /> Back to Syllabus
          </Button>
          <Button
            size="sm"
            onClick={handleAddToTodayPlan}
            className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
          >
            <Calendar size={14} /> Add to Today's Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditTopicOpen(true)}
            className="gap-1.5 text-xs text-slate-300"
          >
            <Edit3 size={14} /> Edit Topic
          </Button>
        </div>
      </div>

      {/* Topic Master Card */}
      <Card className="bg-gradient-to-br from-[#101726] to-[#0c1220] border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-4">
          {/* Header Row: Badges, Title, Verification */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="blue" size="sm" className="font-mono font-bold">
                  Topic #{topic.topicNumber || 1}
                </Badge>
                <TrackBadge track={topic.track} />
                <DifficultyBadge difficulty={topic.difficulty} />
                <PriorityBadge priority={topic.priority} />

                {/* Verification Badge */}
                {topic.isVerified ? (
                  <Badge variant="emerald" size="sm" className="gap-1">
                    <ShieldCheck size={12} /> Verified APPSC Notification (37/2026)
                  </Badge>
                ) : (
                  <Badge variant="amber" size="sm" className="gap-1">
                    <AlertCircle size={12} /> Editable Syllabus Draft
                  </Badge>
                )}

                {topic.isSharedWithMains && (
                  <Badge variant="violet" size="sm" className="gap-1">
                    <Share2 size={12} /> Dual-Track: Prelims + Mains
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {topic.title}
                </h1>
                {topic.titleTelugu && (
                  <p className="text-sm md:text-base text-blue-400 font-medium mt-1">
                    {topic.titleTelugu}
                  </p>
                )}
              </div>

              {topic.description && (
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl pt-1">
                  {topic.description}
                </p>
              )}
            </div>

            {/* Quick Status Control & Progress Pill */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 shrink-0 min-w-[200px]">
              <div className="text-left lg:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Topic Status
                </span>
                <select
                  value={topic.status}
                  onChange={(e) =>
                    updateTopicStatus(
                      topic.id,
                      e.target.value as TopicStatus,
                      e.target.value === 'completed' ? 100 : e.target.value === 'not_started' ? 0 : 50
                    )
                  }
                  className="bg-slate-950 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>

              <div className="text-right w-full pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Subtopic Mastery</span>
                  <span className="font-bold text-emerald-400">{subtopicProgress}%</span>
                </div>
                <ProgressBar value={subtopicProgress} color="emerald" size="sm" showPercent={false} />
              </div>
            </div>
          </div>

          {/* Quick Syllabus Metadata Cards (Objectives, Timeline, Key Personalities, Exam Facts) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {topic.learningObjectives && topic.learningObjectives.length > 0 && (
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Learning Objectives
                </span>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {topic.learningObjectives.slice(0, 3).map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {topic.timeline && (
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> Historical Timeline
                </span>
                <p className="text-xs text-slate-200 leading-snug">{topic.timeline}</p>
              </div>
            )}

            {topic.importantPersonalities && topic.importantPersonalities.length > 0 && (
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark size={12} /> Key Personalities
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {topic.importantPersonalities.map((p, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topic.examFacts && topic.examFacts.length > 0 && (
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={12} /> High-Yield Exam Facts
                </span>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {topic.examFacts.slice(0, 2).map((fact, i) => (
                    <li key={i}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {/* ==================================================== */}
      {/* TAB 1: SUBTOPICS & MICRO-SYLLABUS                   */}
      {/* ==================================================== */}
      {activeTab === 'subtopics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                Subtopics & Micro-Syllabus
              </h2>
              <p className="text-xs text-slate-400">
                Granular breakdown of curriculum items. Checking off subtopics automatically updates parent topic progress.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddSubtopicOpen(true)}
              className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <Plus size={14} /> Add Subtopic
            </Button>
          </div>

          {topicSubtopics.length === 0 ? (
            <Card className="text-center py-12">
              <Layers size={36} className="mx-auto text-slate-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">No Subtopics Defined Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Add granular subtopics to build your customized micro-syllabus checklist.
              </p>
              <Button size="sm" onClick={() => setIsAddSubtopicOpen(true)} className="gap-1.5">
                <Plus size={14} /> Create First Subtopic
              </Button>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {topicSubtopics.map((st, index) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    st.isCompleted
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleSubtopicCompletion(st.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      {st.isCompleted ? (
                        <CheckCircle2 size={20} className="text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {index + 1}.
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            st.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {st.title}
                        </span>
                        {st.titleTelugu && (
                          <span className="text-xs text-blue-400 font-medium">
                            {st.titleTelugu}
                          </span>
                        )}
                        {st.estimatedMinutes && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {st.estimatedMinutes} mins
                          </span>
                        )}
                      </div>

                      {st.keyFacts && st.keyFacts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {st.keyFacts.map((kf: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                            >
                              • {kf}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => deleteSubtopic(st.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                      title="Delete Subtopic"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: PERSONAL NOTES (MARKDOWN EDITOR)              */}
      {/* ==================================================== */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                Personal Study Notes & Key Summaries
              </h2>
              <p className="text-xs text-slate-400">
                Rich Markdown notes supporting LaTeX formulas ($\dots$), headings, lists, and exam bullet points.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setNotesViewMode('editor')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    notesViewMode === 'editor' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setNotesViewMode('preview')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    notesViewMode === 'preview' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setNotesViewMode('split')}
                  className={`px-2.5 py-1 rounded-md transition-colors hidden md:block ${
                    notesViewMode === 'split' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Split View
                </button>
              </div>

              <Button
                size="sm"
                onClick={handleSaveNotes}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <Save size={14} /> {notesSavedFeedback ? 'Saved!' : 'Save Notes'}
              </Button>
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              notesViewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Editor Pane */}
            {(notesViewMode === 'editor' || notesViewMode === 'split') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Markdown Raw Editor</span>
                  <span>Supports GFM + LaTeX Math</span>
                </div>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  rows={20}
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner resize-y"
                  placeholder="Type your notes in markdown format..."
                />
              </div>
            )}

            {/* Live Preview Pane */}
            {(notesViewMode === 'preview' || notesViewMode === 'split') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Formatted Reader Preview</span>
                  <span className="text-emerald-400">Live Rendered</span>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 text-xs leading-relaxed prose prose-invert prose-xs max-w-none min-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {personalNotes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: MY PDFS & E-BOOKS                            */}
      {/* ==================================================== */}
      {activeTab === 'pdfs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-blue-400" />
                My PDFs & Digital Reference Materials
              </h2>
              <p className="text-xs text-slate-400">
                Official notifications, Telugu Akademi chapters, standard textbooks, and revision notes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAttachPDFOpen(true)}
                className="gap-1.5 text-xs text-slate-300"
              >
                <Link2 size={14} /> Attach from Library
              </Button>
              <Button
                size="sm"
                onClick={() => setIsUploadPDFOpen(true)}
                className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                <Plus size={14} /> Add PDF
              </Button>
            </div>
          </div>

          {topicResources.length === 0 ? (
            <Card className="text-center py-12 border border-dashed border-slate-800">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">No PDFs Attached to this Topic</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                Upload chapter PDFs, Telugu Akademi material, official notifications, or lecture notes for quick in-app reading.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <Button
                  size="sm"
                  onClick={() => setIsUploadPDFOpen(true)}
                  className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  <Plus size={14} /> Upload New PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAttachPDFOpen(true)}
                  className="gap-1.5 text-xs text-slate-300"
                >
                  <Link2 size={14} /> Attach from Library
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {topicResources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-md group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex items-center gap-1">
                        {res.isVerified && (
                          <Badge variant="emerald" size="sm">
                            Verified
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {res.fileSize || 'PDF'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {res.title}
                      </h3>
                      {res.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {res.description}
                        </p>
                      )}
                    </div>

                    {res.tags && res.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {res.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setViewingPDF(res);
                        setPdfReaderView(res.fileUrl ? 'embed' : 'study_notes');
                      }}
                      className="flex-1 gap-1.5 text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                    >
                      <Eye size={13} /> Open Reader
                    </Button>
                    {res.fileUrl && (
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={res.fileName || res.title}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Download / Open in New Tab"
                      >
                        <Download size={13} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        detachResourceFromTopic(topic.id, res.id);
                        showToast(`Detached "${res.title.substring(0, 24)}..." from topic`);
                      }}
                      className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                      title="Detach from this topic"
                    >
                      <Unlink size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: CHATGPT LINKS & AI PROMPTS                   */}
      {/* ==================================================== */}
      {activeTab === 'chatgpt' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-violet-400" />
                ChatGPT Direct Links & AI Query Prompts
              </h2>
              <p className="text-xs text-slate-400">
                Direct URLs to specific ChatGPT conversations, shared prompts, and AI-generated conceptual explanations.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddChatGPTLinkOpen(true)}
              className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              <Plus size={14} /> Add ChatGPT Link
            </Button>
          </div>

          {topicChatGPTLinks.length === 0 ? (
            <Card className="text-center py-12">
              <Sparkles size={36} className="mx-auto text-violet-400/50 mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">No ChatGPT Links Added</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Save your ChatGPT prompts and shared chat URLs for quick reference during study sessions.
              </p>
              <Button size="sm" onClick={() => setIsAddChatGPTLinkOpen(true)} className="gap-1.5">
                <Plus size={14} /> Add First Link
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {topicChatGPTLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{link.title}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded font-mono">
                        Added {link.createdAt.split('T')[0]}
                      </span>
                    </div>

                    {link.promptSummary && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        "{link.promptSummary}"
                      </p>
                    )}

                    {link.notes && (
                      <p className="text-xs text-slate-400">
                        <strong className="text-slate-300">Notes:</strong> {link.notes}
                      </p>
                    )}

                    <div className="text-[11px] font-mono text-slate-500 truncate max-w-xl">
                      {link.url}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(link.url);
                        setCopiedId(link.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="gap-1 text-xs text-slate-300"
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check size={13} className="text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy URL
                        </>
                      )}
                    </Button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <span>Open in ChatGPT</span>
                      <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={() => deleteChatGPTLink(link.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                      title="Delete Link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: PRACTICE MCQS & QUIZ RUNNER                  */}
      {/* ==================================================== */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-400" />
                Practice Questions (MCQs) & Instant Evaluation
              </h2>
              <p className="text-xs text-slate-400">
                Interactive topic practice with bilingual explanations and attempt analytics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={mcqFilterDifficulty}
                onChange={(e) => setMcqFilterDifficulty(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>

              <Button
                size="sm"
                onClick={() => setIsAddQuestionOpen(true)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <Plus size={14} /> Add Question
              </Button>
            </div>
          </div>

          {topicQuestions.length === 0 ? (
            <Card className="text-center py-12">
              <Award size={36} className="mx-auto text-emerald-400/50 mb-2" />
              <h3 className="text-sm font-semibold text-slate-200">No Practice Questions Added Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Add previous year questions (PYQs) or standard model questions for this topic.
              </p>
              <Button size="sm" onClick={() => setIsAddQuestionOpen(true)} className="gap-1.5">
                <Plus size={14} /> Add First MCQ
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {topicQuestions
                .filter(
                  (q) => mcqFilterDifficulty === 'all' || q.difficulty === mcqFilterDifficulty
                )
                .map((q, idx) => {
                  const isAnswerRevealed = !!revealedAnswers[q.id];
                  const chosenOptId = selectedAnswers[q.id];
                  const isCorrect = chosenOptId === q.correctOptionId;

                  return (
                    <div
                      key={q.id}
                      className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5 shadow-md"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              Q{idx + 1}.
                            </span>
                            <DifficultyBadge difficulty={q.difficulty} />
                            {q.source && (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                {q.source}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-semibold text-white leading-relaxed">
                            {q.questionText}
                          </h3>

                          {q.questionTextTelugu && (
                            <p className="text-xs text-blue-400 font-medium leading-relaxed">
                              {q.questionTextTelugu}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleQuestionBookmark(q.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              q.isBookmarked
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                            title="Bookmark Question"
                          >
                            <Bookmark size={15} />
                          </button>
                          <button
                            onClick={() => deletePracticeQuestion(q.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                            title="Delete Question"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = chosenOptId === opt.id;
                          const isThisCorrect = opt.id === q.correctOptionId;

                          let btnClasses =
                            'p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between ';
                          if (isAnswerRevealed) {
                            if (isThisCorrect) {
                              btnClasses += 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && !isThisCorrect) {
                              btnClasses += 'bg-red-950/60 border-red-500 text-red-200';
                            } else {
                              btnClasses += 'bg-slate-950/50 border-slate-800 text-slate-400 opacity-60';
                            }
                          } else {
                            if (isSelected) {
                              btnClasses += 'bg-blue-600/20 border-blue-500 text-blue-200 font-medium';
                            } else {
                              btnClasses += 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';
                            }
                          }

                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                if (!isAnswerRevealed) {
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                                }
                              }}
                              disabled={isAnswerRevealed}
                              className={btnClasses}
                            >
                              <span>{opt.text}</span>
                              {isAnswerRevealed && isThisCorrect && (
                                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Action Bar & Feedback */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="text-xs text-slate-400">
                          {q.attemptHistory && q.attemptHistory.length > 0 && (
                            <span>
                              Attempted {q.attemptHistory.length} time(s) • Last:{' '}
                              {q.attemptHistory[0].isCorrect ? '✅ Correct' : '❌ Incorrect'}
                            </span>
                          )}
                        </div>

                        {!isAnswerRevealed ? (
                          <Button
                            size="sm"
                            disabled={!chosenOptId}
                            onClick={() => handleCheckAnswer(q.id, q.correctOptionId)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4"
                          >
                            Check Answer
                          </Button>
                        ) : (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                              isCorrect
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {isCorrect ? 'Correct Answer! (+1 Mark)' : 'Incorrect (–0.33 Penalty)'}
                          </span>
                        )}
                      </div>

                      {/* Explanation Reveal */}
                      {isAnswerRevealed && (
                        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 mt-2 text-xs">
                          <span className="font-bold text-amber-400 flex items-center gap-1.5">
                            <Sparkles size={13} /> Detailed Explanation
                          </span>
                          <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                          {q.explanationTelugu && (
                            <p className="text-blue-400 leading-relaxed font-medium">
                              {q.explanationTelugu}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: CROSS-REFERENCES & AP REGIONAL               */}
      {/* ==================================================== */}
      {activeTab === 'references' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Link2 size={18} className="text-blue-400" />
              Cross-References, Mains Alignment & Regional Links
            </h2>
            <p className="text-xs text-slate-400">
              Integrated mapping between Prelims and Mains papers, and regional Andhra Pradesh linkages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mains Overlap Card */}
            <Card className="bg-slate-900/80 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-violet-400">
                <Share2 size={16} />
                <h3>APPSC Mains Examination Overlap</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This topic constitutes core foundational theory for the APPSC Group 2 Mains Examination.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target Paper</span>
                  <span className="text-slate-200 font-semibold">
                    {topic.paper || 'Screening & Mains'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Integration Status</span>
                  <Badge variant="violet" size="sm">
                    {topic.isSharedWithMains ? 'Direct Syllabus Match' : 'Prelims Focus'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* AP Regional Linkage Card */}
            <Card className="bg-slate-900/80 border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <ShieldCheck size={16} />
                <h3>Andhra Pradesh Regional Linkages</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Specific events, geographic features, or legislative provisions with high-yield Andhra Pradesh context.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs text-slate-300">
                <p>
                  • Regional excavations and inscriptions (Amaravati, Nagarjunakonda, Bhattiprolu)
                </p>
                <p>
                  • AP State Government welfare schemes & budget allocations relevant to this domain
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: SPACED REVISION (SM-2 / LEITNER)              */}
      {/* ==================================================== */}
      {activeTab === 'revision' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw size={18} className="text-blue-400" />
                Spaced Repetition & Retention Schedule (SM-2)
              </h2>
              <p className="text-xs text-slate-400">
                Ebbinghaus forgetting curve intervals: Day 1 → Day 3 → Day 7 → Day 14 → Day 30.
              </p>
            </div>
          </div>

          <Card className="bg-slate-900/90 border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Current Stage
                </span>
                <span className="text-lg font-bold text-blue-400 mt-1 block">
                  Stage {topicRevision?.repetitionStage || 1} of 5
                </span>
                <span className="text-xs text-slate-500">
                  {topicRevision ? 'Active Repetition Cycle' : 'Initial Study Stage'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Next Due Date
                </span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">
                  {topicRevision?.nextDueDate || 'Not Scheduled'}
                </span>
                <span className="text-xs text-slate-500">
                  Last Reviewed: {topicRevision?.lastReviewedDate || 'Never'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Retention Confidence
                </span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block capitalize">
                  {topicRevision?.difficultyRating || 'Moderate'}
                </span>
                <span className="text-xs text-slate-500">Calculated via SM-2</span>
              </div>
            </div>

            {/* Quick Action: Log Revision */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Log Revision & Re-calculate Next Interval
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLogRevision('hard')}
                  className="gap-1.5 text-xs text-red-300 border-red-500/30 hover:bg-red-500/10"
                >
                  Hard (Reset to Stage 1)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLogRevision('good')}
                  className="gap-1.5 text-xs text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                >
                  Good (Advance Interval)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLogRevision('easy')}
                  className="gap-1.5 text-xs text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  Easy (Advance + Bonus)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: EDIT TOPIC METADATA                         */}
      {/* ==================================================== */}
      <Modal
        isOpen={isEditTopicOpen}
        onClose={() => setIsEditTopicOpen(false)}
        title={`Edit Topic #${topic.topicNumber || 1}`}
        description="Customize topic title, Telugu translation, estimated hours, difficulty, and priority."
        maxWidth="lg"
      >
        <EditTopicForm
          topic={topic}
          onSave={(updates) => {
            updateTopicDetails(topic.id, updates);
            setIsEditTopicOpen(false);
            showToast('Topic details updated successfully!');
          }}
          onClose={() => setIsEditTopicOpen(false)}
        />
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 2: ADD SUBTOPIC                                */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAddSubtopicOpen}
        onClose={() => setIsAddSubtopicOpen(false)}
        title="Add Subtopic to Micro-Syllabus"
        description="Create a granular subtopic entry to track mastery."
        maxWidth="md"
      >
        <AddSubtopicForm
          topicId={topic.id}
          nextOrder={topicSubtopics.length + 1}
          onSave={(st) => {
            saveSubtopic(st);
            setIsAddSubtopicOpen(false);
            showToast('Subtopic added!');
          }}
          onClose={() => setIsAddSubtopicOpen(false)}
        />
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 3: ADD CHATGPT LINK                            */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAddChatGPTLinkOpen}
        onClose={() => setIsAddChatGPTLinkOpen(false)}
        title="Add ChatGPT URL & Prompt"
        description="Save your ChatGPT chat link for quick access."
        maxWidth="md"
      >
        <AddChatGPTLinkForm
          topicId={topic.id}
          onSave={(link) => {
            saveChatGPTLink(link);
            setIsAddChatGPTLinkOpen(false);
            showToast('ChatGPT link saved!');
          }}
          onClose={() => setIsAddChatGPTLinkOpen(false)}
        />
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 4: ADD PRACTICE QUESTION                       */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title="Add Practice MCQ"
        description="Add a multiple-choice question with bilingual text and detailed explanation."
        maxWidth="xl"
      >
        <AddQuestionForm
          topicId={topic.id}
          subjectId={topic.subjectId}
          track={topic.track}
          onSave={(q) => {
            savePracticeQuestion(q);
            setIsAddQuestionOpen(false);
            showToast('Practice question added!');
          }}
          onClose={() => setIsAddQuestionOpen(false)}
        />
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 5: ATTACH PDF FROM LIBRARY                     */}
      {/* ==================================================== */}
      <Modal
        isOpen={isAttachPDFOpen}
        onClose={() => setIsAttachPDFOpen(false)}
        title="Attach PDF from Library"
        description={`Link existing reference documents from your Library to "${topic.title}".`}
        maxWidth="xl"
      >
        <div className="space-y-3.5">
          {/* Search & Subject filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={attachSearchQuery}
                onChange={(e) => setAttachSearchQuery(e.target.value)}
                placeholder="Search documents by title, tags, or description..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setAttachFilterMode('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  attachFilterMode === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Documents
              </button>
              <button
                type="button"
                onClick={() => setAttachFilterMode('subject')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  attachFilterMode === 'subject'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Same Subject
              </button>
            </div>
          </div>

          {/* List of library documents */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {resources
              .filter((res) => {
                const matchesSearch =
                  res.title.toLowerCase().includes(attachSearchQuery.toLowerCase()) ||
                  (res.tags && res.tags.some((t) => t.toLowerCase().includes(attachSearchQuery.toLowerCase()))) ||
                  (res.description && res.description.toLowerCase().includes(attachSearchQuery.toLowerCase()));

                if (!matchesSearch) return false;
                if (attachFilterMode === 'subject') {
                  return res.subjectId === topic.subjectId;
                }
                return true;
              })
              .map((res) => {
                const isAlreadyAttached = res.topicIds?.includes(topic.id) || topic.resourceIds?.includes(res.id);
                return (
                  <div
                    key={res.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      isAlreadyAttached
                        ? 'bg-slate-900/90 border-blue-500/40 ring-1 ring-blue-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className={isAlreadyAttached ? 'text-blue-400' : 'text-slate-400'} />
                        <h4 className="font-semibold text-slate-100 truncate">{res.title}</h4>
                        {res.isVerified && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium shrink-0">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-mono text-slate-500">{res.type.toUpperCase()} • {res.fileSize || 'PDF'}</span>
                        {res.tags?.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAlreadyAttached ? 'outline' : 'primary'}
                      onClick={() => {
                        if (isAlreadyAttached) {
                          detachResourceFromTopic(topic.id, res.id);
                          showToast(`Unlinked "${res.title.substring(0, 24)}..." from topic`);
                        } else {
                          attachResourceToTopic(topic.id, res.id);
                          showToast(`Attached "${res.title.substring(0, 24)}..." to topic`);
                        }
                      }}
                      className={`text-xs gap-1 shrink-0 ${
                        isAlreadyAttached
                          ? 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 hover:text-rose-400 hover:border-rose-500/40'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isAlreadyAttached ? (
                        <>
                          <Check size={12} /> Attached
                        </>
                      ) : (
                        <>
                          <Plus size={12} /> Attach
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            {resources.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No documents found in Library.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Attached to this topic: <strong className="text-white">{topicResources.length}</strong>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAttachPDFOpen(false);
                  setIsUploadPDFOpen(true);
                }}
                className="gap-1 text-xs text-blue-400 border-blue-500/30"
              >
                <Plus size={13} /> Or Upload New PDF
              </Button>
              <Button size="sm" onClick={() => setIsAttachPDFOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 5B: UPLOAD & ADD PDF REFERENCE                 */}
      {/* ==================================================== */}
      <Modal
        isOpen={isUploadPDFOpen}
        onClose={() => setIsUploadPDFOpen(false)}
        title="Upload & Add PDF Reference"
        description={`Upload a PDF file or link a digital reference directly to "${topic.title}".`}
        maxWidth="2xl"
      >
        <AddPDFForm
          topic={topic}
          onSave={(newRes) => {
            saveResource(newRes);
            attachResourceToTopic(topic.id, newRes.id);
            setIsUploadPDFOpen(false);
            showToast(`PDF "${newRes.title.substring(0, 28)}..." added and attached!`);
          }}
          onClose={() => setIsUploadPDFOpen(false)}
        />
      </Modal>

      {/* ==================================================== */}
      {/* MODAL 6: IN-APP PDF READER MODAL                     */}
      {/* ==================================================== */}
      {viewingPDF && (
        <Modal
          isOpen={!!viewingPDF}
          onClose={() => setViewingPDF(null)}
          title={viewingPDF.title}
          description="In-App Digital Reader with embedded PDF viewing and clean study modes"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* PDF Reader Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 mr-1">View:</span>
                {viewingPDF.fileUrl && (
                  <button
                    type="button"
                    onClick={() => setPdfReaderView('embed')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
                      pdfReaderView === 'embed'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText size={13} /> Embedded PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPdfReaderView('study_notes')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
                    pdfReaderView === 'study_notes'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen size={13} /> Study Digest & Notes
                </button>
              </div>

              {pdfReaderView === 'study_notes' && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Theme:</span>
                  <button
                    onClick={() => setPdfReadingMode('light')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
                      pdfReadingMode === 'light'
                        ? 'bg-amber-100 text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun size={13} /> Clean Light
                  </button>
                  <button
                    onClick={() => setPdfReadingMode('dark')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
                      pdfReadingMode === 'dark'
                        ? 'bg-slate-800 text-blue-300 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon size={13} /> Dark Navy
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {viewingPDF.fileUrl && (
                  <a
                    href={viewingPDF.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={viewingPDF.fileName || viewingPDF.title}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors"
                  >
                    <Download size={13} /> Download / Open Tab
                  </a>
                )}
              </div>
            </div>

            {/* Reading Document Canvas */}
            {pdfReaderView === 'embed' && viewingPDF.fileUrl ? (
              <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-800 bg-white shadow-lg">
                <iframe
                  src={viewingPDF.fileUrl}
                  title={viewingPDF.title}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div
                className={`p-8 rounded-xl border transition-colors min-h-[420px] max-h-[55vh] overflow-y-auto leading-relaxed shadow-inner ${
                  pdfReadingMode === 'light'
                    ? 'bg-white text-slate-900 border-slate-300 selection:bg-amber-200'
                    : 'bg-slate-950 text-slate-200 border-slate-800'
                }`}
                style={{ fontSize: `${(pdfZoom / 100) * 14}px` }}
              >
                <div className="max-w-3xl mx-auto space-y-4 font-serif">
                  <div className="border-b pb-3 mb-4 flex items-center justify-between text-xs text-slate-500 font-sans">
                    <span>{viewingPDF.title}</span>
                    <span>Section {pdfCurrentPage}</span>
                  </div>

                  <h2 className="text-lg font-bold font-sans">
                    {topic.title} — Official Comprehensive Study Digest
                  </h2>

                  {viewingPDF.content ? (
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
                      {viewingPDF.content}
                    </div>
                  ) : (
                    <>
                      <p>
                        This reading module delivers verified syllabus extracts and academic reference material for <strong>{topic.title}</strong> ({topic.titleTelugu || ''}).
                      </p>

                      <h3 className="text-md font-bold font-sans pt-2">
                        1. Salient Features & Core Theoretical Framework
                      </h3>
                      <p>
                        As outlined under APPSC Group 2 Preliminary and Main Examination notification specifications, study candidates should prioritize causal mechanisms, historical chronology, statutory enactments, and socio-economic outcomes.
                      </p>

                      <h3 className="text-md font-bold font-sans pt-2">
                        2. Andhra Pradesh Regional Significance
                      </h3>
                      <p>
                        Correlate nationwide patterns with regional developments across Coastal Andhra, Rayalaseema, and Uttarandhra. Special attention should be devoted to archaeological discoveries, key leader biographies, legislative amendments, and welfare program delivery metrics.
                      </p>

                      <div
                        className={`p-4 rounded-lg my-4 text-xs font-sans ${
                          pdfReadingMode === 'light'
                            ? 'bg-amber-50 border border-amber-200 text-amber-900'
                            : 'bg-slate-900 border border-slate-800 text-amber-300'
                        }`}
                      >
                        <strong>High-Yield Examination Tip:</strong> Prepare comparative tables contrasting early and later developments to effectively eliminate distractor options in negative-marking screening tests.
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick In-Reader Annotations Pane */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Edit3 size={13} className="text-blue-400" /> Quick Reading Annotations & Takeaways
              </span>
              <input
                type="text"
                value={pdfReadingNotes}
                onChange={(e) => setPdfReadingNotes(e.target.value)}
                placeholder="Type quick thoughts while reading this page..."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ====================================================
// SUB-COMPONENTS: FORMS & DIALOGS
// ====================================================

interface EditTopicFormProps {
  topic: SyllabusTopic;
  onSave: (updates: Partial<SyllabusTopic>) => void;
  onClose: () => void;
}

const EditTopicForm: React.FC<EditTopicFormProps> = ({ topic, onSave, onClose }) => {
  const [title, setTitle] = useState(topic.title);
  const [titleTelugu, setTitleTelugu] = useState(topic.titleTelugu || '');
  const [description, setDescription] = useState(topic.description || '');
  const [estimatedHours, setEstimatedHours] = useState(topic.estimatedHours);
  const [difficulty, setDifficulty] = useState<Difficulty>(topic.difficulty);
  const [priority, setPriority] = useState<Priority>(topic.priority);
  const [timeline, setTimeline] = useState(topic.timeline || '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          title,
          titleTelugu,
          description,
          estimatedHours: Number(estimatedHours),
          difficulty,
          priority,
          timeline,
        });
      }}
      className="space-y-4 text-xs"
    >
      <div>
        <label className="text-slate-300 font-semibold block mb-1">Topic Title (English)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Topic Title (Telugu)</label>
        <input
          type="text"
          value={titleTelugu}
          onChange={(e) => setTitleTelugu(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Syllabus Scope & Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Est. Hours</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Historical Timeline / Context</label>
        <input
          type="text"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          placeholder="e.g. c. 2500 BCE – 1750 BCE"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

interface AddSubtopicFormProps {
  topicId: string;
  nextOrder: number;
  onSave: (st: Subtopic) => void;
  onClose: () => void;
}

const AddSubtopicForm: React.FC<AddSubtopicFormProps> = ({ topicId, nextOrder, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [titleTelugu, setTitleTelugu] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [keyFactText, setKeyFactText] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const keyFacts = keyFactText
          ? keyFactText.split('\n').filter((k) => k.trim().length > 0)
          : [];
        onSave({
          id: `st-${Date.now()}`,
          topicId,
          orderIndex: nextOrder,
          order: nextOrder,
          title,
          titleTelugu: titleTelugu || undefined,
          keyConcepts: [],
          importantFacts: keyFacts,
          keyFacts,
          estimatedMinutes: Number(estimatedMinutes),
          isCompleted: false,
        });
      }}
      className="space-y-4 text-xs"
    >
      <div>
        <label className="text-slate-300 font-semibold block mb-1">Subtopic Title (English)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Town Planning, Great Bath and Drainage Systems"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Subtopic Title (Telugu)</label>
        <input
          type="text"
          value={titleTelugu}
          onChange={(e) => setTitleTelugu(e.target.value)}
          placeholder="e.g. నగర ప్రణాళిక, మహా స్నానవాటిక మరియు డ్రైనేజీ వ్యవస్థ"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Estimated Study Duration (Minutes)</label>
        <input
          type="number"
          step="5"
          min="10"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Key Revision Facts (One per line)</label>
        <textarea
          value={keyFactText}
          onChange={(e) => setKeyFactText(e.target.value)}
          rows={3}
          placeholder="Grid system layout with streets cutting at right angles&#10;Burnt brick architecture"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
          Add Subtopic
        </Button>
      </div>
    </form>
  );
};

interface AddChatGPTLinkFormProps {
  topicId: string;
  onSave: (link: ChatGPTLink) => void;
  onClose: () => void;
}

const AddChatGPTLinkForm: React.FC<AddChatGPTLinkFormProps> = ({ topicId, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [promptSummary, setPromptSummary] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          id: `cgl-${Date.now()}`,
          topicId,
          title,
          url,
          promptSummary: promptSummary || undefined,
          description: promptSummary || undefined,
          notes: notes || undefined,
          personalComments: notes || undefined,
          language: 'en',
          tags: ['ChatGPT', 'AI-Study'],
          isBookmarked: false,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        });
      }}
      className="space-y-4 text-xs"
    >
      <div>
        <label className="text-slate-300 font-semibold block mb-1">Prompt / Chat Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Deep Dive into Indus Valley Trade Networks & Seals"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">ChatGPT URL / Share Link</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://chatgpt.com/share/..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Initial Prompt Summary</label>
        <textarea
          value={promptSummary}
          onChange={(e) => setPromptSummary(e.target.value)}
          rows={2}
          placeholder="Explain the dockyard engineering at Lothal and Persian Gulf trade routes for APPSC Group 2."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Key Takeaway Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Lothal Bhogavo river, circular seals, bead making factory."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white">
          Save ChatGPT Link
        </Button>
      </div>
    </form>
  );
};

interface AddQuestionFormProps {
  topicId: string;
  subjectId: string;
  track: SyllabusTopic['track'];
  onSave: (q: PracticeQuestion) => void;
  onClose: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({
  topicId,
  subjectId,
  track,
  onSave,
  onClose,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [questionTextTelugu, setQuestionTextTelugu] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('a');
  const [explanation, setExplanation] = useState('');
  const [explanationTelugu, setExplanationTelugu] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [source, setSource] = useState('APPSC Group-2 PYQ');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          id: `pq-${Date.now()}`,
          topicId,
          subjectId,
          track,
          questionText,
          questionTextTelugu: questionTextTelugu || undefined,
          options: [
            { id: 'opt-a', text: optA },
            { id: 'opt-b', text: optB },
            { id: 'opt-c', text: optC },
            { id: 'opt-d', text: optD },
          ],
          correctOptionId: `opt-${correctOpt}`,
          explanation,
          explanationTelugu: explanationTelugu || undefined,
          difficulty,
          source,
          isBookmarked: false,
        });
      }}
      className="space-y-4 text-xs"
    >
      <div>
        <label className="text-slate-300 font-semibold block mb-1">Question Text (English)</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Question Text (Telugu)</label>
        <textarea
          value={questionTextTelugu}
          onChange={(e) => setQuestionTextTelugu(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Option A</label>
          <input
            type="text"
            value={optA}
            onChange={(e) => setOptA(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Option B</label>
          <input
            type="text"
            value={optB}
            onChange={(e) => setOptB(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Option C</label>
          <input
            type="text"
            value={optC}
            onChange={(e) => setOptC(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Option D</label>
          <input
            type="text"
            value={optD}
            onChange={(e) => setOptD(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Correct Option</label>
          <select
            value={correctOpt}
            onChange={(e) => setCorrectOpt(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-bold"
          >
            <option value="a">Option A</option>
            <option value="b">Option B</option>
            <option value="c">Option C</option>
            <option value="d">Option D</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="text-slate-300 font-semibold block mb-1">Source / Exam</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Detailed Explanation (English)</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          required
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-slate-300 font-semibold block mb-1">Detailed Explanation (Telugu)</label>
        <textarea
          value={explanationTelugu}
          onChange={(e) => setExplanationTelugu(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white">
          Save MCQ
        </Button>
      </div>
    </form>
  );
};

// ====================================================
// SUB-COMPONENT: ADD / UPLOAD PDF REFERENCE FORM
// ====================================================

interface AddPDFFormProps {
  topic: SyllabusTopic;
  onSave: (res: ResourceItem) => void;
  onClose: () => void;
}

const AddPDFForm: React.FC<AddPDFFormProps> = ({ topic, onSave, onClose }) => {
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('APPSC, Study Material, Revision');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [externalUrl, setExternalUrl] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const processFile = (selected: File) => {
    setFileError(null);
    setFile(selected);

    if (!title) {
      const cleanName = selected.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      try {
        const objUrl = URL.createObjectURL(selected);
        setFileDataUrl(objUrl);
      } catch (err) {
        setFileError('Could not process file. Please try another file.');
      }
      setIsReadingFile(false);
    };
    reader.readAsDataURL(selected);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0);

        const calculatedSize = file ? formatBytes(file.size) : 'PDF Reference';
        const finalFileUrl = sourceMode === 'upload' ? fileDataUrl : externalUrl.trim();

        onSave({
          id: `res-${Date.now()}`,
          title: title.trim(),
          type: 'pdf',
          track: topic.track,
          subjectId: topic.subjectId,
          topicIds: [topic.id],
          description: description.trim() || undefined,
          fileUrl: finalFileUrl || undefined,
          fileName: file ? file.name : undefined,
          fileSize: calculatedSize,
          fileSizeBytes: file ? file.size : undefined,
          tags: tags.length > 0 ? tags : ['Study Material', 'Digital Reference'],
          language,
          isVerified,
          sourceUrl: externalUrl.trim() || undefined,
          isBookmarked: false,
          publicationDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        });
      }}
      className="space-y-4 text-xs"
    >
      {/* Source Mode Toggle */}
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => setSourceMode('upload')}
          className={`flex-1 py-1.5 rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors ${
            sourceMode === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud size={14} /> Upload PDF from Computer
        </button>
        <button
          type="button"
          onClick={() => setSourceMode('url')}
          className={`flex-1 py-1.5 rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors ${
            sourceMode === 'url' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link2 size={14} /> Attach via Online PDF URL
        </button>
      </div>

      {/* File Upload Drop Area */}
      {sourceMode === 'upload' ? (
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Select PDF File *</label>
          <div
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
              file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              id="topic-pdf-input"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{file.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {formatBytes(file.size)} • PDF Ready to attach
                  </p>
                </div>
                {isReadingFile && (
                  <p className="text-[11px] text-amber-400 animate-pulse">Reading file content...</p>
                )}
                <label
                  htmlFor="topic-pdf-input"
                  className="inline-block px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer text-xs"
                >
                  Choose Different File
                </label>
              </div>
            ) : (
              <label htmlFor="topic-pdf-input" className="cursor-pointer block space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Click to browse or drop PDF here</p>
                  <p className="text-[11px] text-slate-400">
                    Official APPSC notifications, Telugu Akademi chapters, standard textbooks (.pdf)
                  </p>
                </div>
              </label>
            )}
          </div>
          {fileError && <p className="text-[11px] text-rose-400 mt-1">{fileError}</p>}
        </div>
      ) : (
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Direct PDF or Google Drive URL *</label>
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            required={sourceMode === 'url'}
            placeholder="https://example.com/appsc-history.pdf or Google Drive PDF link"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Document Title */}
      <div>
        <label className="text-slate-300 font-semibold block mb-1">Document Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Telugu Akademi Indian History - Chapter 3 Summary"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-slate-300 font-semibold block mb-1">Description / Syllabus Focus</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Brief summary of concepts, chapters, or exam focus covered in this document..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tags */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Tags (Comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="APPSC, Prelims, History, Telugu Akademi"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Language */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'te')}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="en">English (Official Standard)</option>
            <option value="te">Telugu (తెలుగు మాధ్యమం)</option>
          </select>
        </div>
      </div>

      {/* Verification Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="pdfVerifyCheckbox"
          checked={isVerified}
          onChange={(e) => setIsVerified(e.target.checked)}
          className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="pdfVerifyCheckbox" className="text-slate-300 cursor-pointer">
          Mark as Verified Study Material (Telugu Akademi / Government Notification / Standard Author)
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={sourceMode === 'upload' && !file && !title}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          Attach PDF to Topic
        </Button>
      </div>
    </form>
  );
};
