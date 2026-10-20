import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  FileText,
  CheckCircle2,
  Circle,
  HelpCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Plus,
  PenTool,
  CheckSquare,
  AlertCircle,
  UploadCloud,
  FolderOpen,
  Search,
  Eye,
  ExternalLink,
  Download,
  Trash2,
  Check,
  Minimize2,
  Maximize2,
  Layers,
  Calendar,
  Edit2,
  Link2,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Badge, DifficultyBadge, PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Subject, SyllabusTopic, MainsAnswerPrompt, ResourceItem } from '../../types';

export const AppscPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    topics,
    subjects,
    mainsPrompts,
    resources,
    saveMainsPrompt,
    updateTopicStatus,
    saveTopic,
    deleteTopic,
    saveSubject,
    deleteSubject,
    saveResource,
    deleteResource,
    attachResourceToTopic,
    detachResourceFromTopic,
    addTaskFromTopic,
  } = useStudyVerse();

  const [activeTab, setActiveTab] = useState<'syllabus_view' | 'prelims' | 'mains' | 'shared'>('syllabus_view');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [mainsSubView, setMainsSubView] = useState<'editor' | 'documents'>('editor');

  // Semester-style APPSC Syllabus State
  const [syllabusTrackFilter, setSyllabusTrackFilter] = useState<'all' | 'appsc-prelims' | 'appsc-mains'>('all');
  const [semActiveSubTab, setSemActiveSubTab] = useState<'units' | 'files'>('units');
  const [semFileCategoryFilter, setSemFileCategoryFilter] = useState<string>('all');
  const [semFileTopicFilter, setSemFileTopicFilter] = useState<string>('all');
  const [semFileSearchQuery, setSemFileSearchQuery] = useState('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // All APPSC subjects (Prelims + Mains)
  const appscSubjects = subjects.filter((s) => s.track === 'appsc-prelims' || s.track === 'appsc-mains');
  const displayedSyllabusSubjects = appscSubjects.filter((s) => {
    if (syllabusTrackFilter === 'all') return true;
    return s.track === syllabusTrackFilter;
  });

  const [selectedSemSubjectId, setSelectedSemSubjectId] = useState<string>(
    displayedSyllabusSubjects[0]?.id || 'sub-pre-group-1'
  );

  const activeSemSubject =
    displayedSyllabusSubjects.find((s) => s.id === selectedSemSubjectId) ||
    displayedSyllabusSubjects[0] ||
    appscSubjects[0];

  const activeSemTopics = topics.filter((t) => t.subjectId === activeSemSubject?.id);
  const completedSemTopicsCount = activeSemTopics.filter((t) => t.status === 'completed').length;
  const semSubjectProgress =
    activeSemTopics.length > 0
      ? Math.round((completedSemTopicsCount / activeSemTopics.length) * 100)
      : 0;

  const activeSemResources = resources.filter(
    (r) =>
      r.subjectId === activeSemSubject?.id ||
      (r.topicIds && r.topicIds.some((tid) => activeSemTopics.some((at) => at.id === tid)))
  );

  const filteredSemResources = activeSemResources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(semFileSearchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(semFileSearchQuery.toLowerCase())) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(semFileSearchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (semFileCategoryFilter !== 'all') {
      const matchCat = r.tags && r.tags.some((t) => t.toLowerCase() === semFileCategoryFilter.toLowerCase());
      if (!matchCat) return false;
    }

    if (semFileTopicFilter !== 'all') {
      const hasTopic = r.topicIds && r.topicIds.includes(semFileTopicFilter);
      if (!hasTopic) return false;
    }

    return true;
  });

  // Attach Document from Library Modal
  const [isAttachLibOpen, setIsAttachLibOpen] = useState(false);
  const [targetTopicForAttach, setTargetTopicForAttach] = useState<string>('');
  const [libSearchQuery, setLibSearchQuery] = useState('');

  // Add Subject Modal
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubNameTelugu, setNewSubNameTelugu] = useState('');
  const [newSubTrack, setNewSubTrack] = useState<'appsc-prelims' | 'appsc-mains'>('appsc-prelims');
  const [newSubPaper, setNewSubPaper] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubHours, setNewSubHours] = useState(50);

  // Mains Answer Writing Workspace State
  const [activeMainsPrompt, setActiveMainsPrompt] = useState<MainsAnswerPrompt | null>(
    mainsPrompts[0] || null
  );
  const [userDraftAnswer, setUserDraftAnswer] = useState<string>(
    mainsPrompts[0]?.userDraft || ''
  );
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selfScore, setSelfScore] = useState<number>(mainsPrompts[0]?.userScoreSelf || 0);

  // Add Subject/Topic Modal
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleTelugu, setNewTitleTelugu] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newHours, setNewHours] = useState(4.0);
  const [isSharedWithMains, setIsSharedWithMains] = useState(false);

  // Mains Reference Files State
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [targetTopicForDoc, setTargetTopicForDoc] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docDataUrl, setDocDataUrl] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<string>('Standard Book / Reference');
  const [docDesc, setDocDesc] = useState('');
  const [docExternalUrl, setDocExternalUrl] = useState('');
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  // In-App PDF Reader
  const [activeReadingDoc, setActiveReadingDoc] = useState<ResourceItem | null>(null);
  const [isReaderFullscreen, setIsReaderFullscreen] = useState(false);

  // Attach Document to Prompt Modal
  const [isAttachPromptDocOpen, setIsAttachPromptDocOpen] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Filter topics
  const prelimsTopics = topics.filter((t) => t.track === 'appsc-prelims');
  const mainsTopics = topics.filter((t) => t.track === 'appsc-mains');
  const sharedTopics = topics.filter((t) => t.isSharedWithMains);

  const currentTopics =
    activeTab === 'prelims'
      ? prelimsTopics
      : activeTab === 'mains'
      ? mainsTopics
      : sharedTopics;

  const filteredTopics =
    selectedSubjectId === 'all'
      ? currentTopics
      : currentTopics.filter((t) => t.subjectId === selectedSubjectId);

  // Mains documents
  const mainsResources = resources.filter((r) => {
    if (r.track === 'appsc-mains') return true;
    if (r.tags && r.tags.some((t) => ['Mains', 'Survey', 'Bifurcation', 'G.O.', 'Budget', 'Model Answer'].includes(t))) return true;
    return false;
  });

  // Calculate word count for mains workspace
  const wordCount = userDraftAnswer.trim() ? userDraftAnswer.trim().split(/\s+/).length : 0;
  const wordLimit = activeMainsPrompt?.wordLimit || 150;
  const isOverWordLimit = wordCount > wordLimit;

  // Attached files for currently active prompt
  const promptAttachedDocs = (activeMainsPrompt?.referenceResourceIds || [])
    .map((rid) => resources.find((r) => r.id === rid))
    .filter(Boolean) as ResourceItem[];

  // Save answer draft
  const handleSaveMainsDraft = () => {
    if (!activeMainsPrompt) return;
    saveMainsPrompt({
      ...activeMainsPrompt,
      userDraft: userDraftAnswer,
      userScoreSelf: selfScore,
      status: 'evaluated',
      lastUpdated: new Date().toISOString(),
    });
    alert('Answer draft and rubric evaluation saved successfully!');
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTopic: SyllabusTopic = {
      id: `top-appsc-${Date.now()}`,
      subjectId: newSubjectId || subjects.find((s) => s.track.startsWith('appsc'))?.id || 'sub-appsc-hist',
      track: activeTab === 'mains' ? 'appsc-mains' : 'appsc-prelims',
      title: newTitle.trim(),
      titleTelugu: newTitleTelugu.trim() || undefined,
      description: newDesc.trim() || undefined,
      estimatedHours: newHours,
      difficulty: 'moderate',
      priority: 'high',
      status: 'not_started',
      progressPercent: 0,
      isSharedWithMains: isSharedWithMains || activeTab === 'shared',
      targetQuestionCount: 500,
    };

    saveTopic(newTopic);
    setIsAddTopicModalOpen(false);
    setNewTitle('');
    setNewTitleTelugu('');
    setNewDesc('');
  };

  const handleDocFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFile(file);
    if (!docTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    setIsProcessingDoc(true);
    const reader = new FileReader();
    reader.onload = () => {
      setDocDataUrl(reader.result as string);
      setIsProcessingDoc(false);
    };
    reader.onerror = () => {
      try {
        const obj = URL.createObjectURL(file);
        setDocDataUrl(obj);
      } catch (err) {
        console.error('File read error', err);
      }
      setIsProcessingDoc(false);
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const sizeStr = docFile ? formatFileSize(docFile.size) : 'PDF Document';
    const topicIds = targetTopicForDoc ? [targetTopicForDoc] : [];
    const targetSubId = activeSemSubject?.id || 'sub-pre-group-1';
    const targetTrack = activeSemSubject?.track || (activeTab === 'mains' ? 'appsc-mains' : 'appsc-prelims');

    const newRes: ResourceItem = {
      id: `res-appsc-${Date.now()}`,
      title: docTitle.trim(),
      type: 'pdf',
      track: targetTrack,
      subjectId: targetSubId,
      topicIds,
      description: docDesc.trim() || undefined,
      fileUrl: docDataUrl || docExternalUrl.trim() || undefined,
      fileName: docFile?.name || `${docTitle}.pdf`,
      fileSize: sizeStr,
      fileSizeBytes: docFile?.size || 0,
      tags: [
        'APPSC',
        targetTrack === 'appsc-prelims' ? 'Prelims' : 'Mains',
        activeSemSubject?.name || 'General',
        docCategory,
      ],
      language: 'en',
      isVerified: true,
      isBookmarked: true,
      createdAt: new Date().toISOString(),
    };

    saveResource(newRes);
    if (targetTopicForDoc) {
      attachResourceToTopic(targetTopicForDoc, newRes.id);
    }

    // If in mains tab with active prompt, link to it as well
    if (activeTab === 'mains' && activeMainsPrompt) {
      const existingRefIds = activeMainsPrompt.referenceResourceIds || [];
      if (!existingRefIds.includes(newRes.id)) {
        saveMainsPrompt({
          ...activeMainsPrompt,
          referenceResourceIds: [...existingRefIds, newRes.id],
        });
      }
    }

    setIsUploadDocOpen(false);
    setDocFile(null);
    setDocDataUrl('');
    setDocTitle('');
    setDocDesc('');
    setDocExternalUrl('');
    setTargetTopicForDoc('');
    showToast(`Document "${newRes.title}" saved successfully!`);
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSubject: Subject = {
      id: `sub-appsc-${Date.now()}`,
      track: newSubTrack,
      name: newSubName.trim(),
      nameTelugu: newSubNameTelugu.trim() || undefined,
      paper: newSubPaper.trim() || undefined,
      description: newSubDesc.trim() || undefined,
      color: newSubTrack === 'appsc-prelims' ? '#0284c7' : '#7c3aed',
      priority: 'high',
      targetHours: newSubHours,
    };

    saveSubject(newSubject);
    setSelectedSemSubjectId(newSubject.id);
    setIsAddSubjectOpen(false);
    setNewSubName('');
    setNewSubNameTelugu('');
    setNewSubPaper('');
    setNewSubDesc('');
    showToast(`Subject "${newSubject.name}" created successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Hub Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              APPSC Group 2 Preparation Hub
            </h1>
            <Badge variant="blue">Official Syllabus Pattern</Badge>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
              Flexible Prelims & Mains Workspace
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            Dedicated multi-tier workspace for Screening Test (Prelims 150M), Mains (300M), AP Socio-Economic Survey, bifurcation documents, and descriptive evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<CheckSquare size={14} />}
            onClick={() => navigate('/mock-tests')}
          >
            Take Mock Test
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setIsAddTopicModalOpen(true)}
          >
            Add Syllabus Topic
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-blue-400 text-sm animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Track Workspace Tabs */}
      <Tabs
        tabs={[
          {
            id: 'syllabus_view',
            label: 'Syllabus & Units (Prelims + Mains)',
            count: topics.filter((t) => t.track.startsWith('appsc')).length,
          },
          { id: 'prelims', label: 'Prelims Practice & MCQs', count: prelimsTopics.length },
          { id: 'mains', label: 'Mains Workspace (Descriptive & Documents)', count: mainsTopics.length },
          { id: 'shared', label: 'Shared Syllabus Mapping', count: sharedTopics.length },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId as any);
          setSelectedSubjectId('all');
        }}
      />

      {/* Main Content Area */}
      {activeTab === 'syllabus_view' ? (
        <div className="space-y-6">
          {/* APPSC Exam Milestones Grid (Similar to Semester Milestones!) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
              <span className="text-slate-400 block font-medium">Prelims Screening Test</span>
              <strong className="text-blue-400 text-sm block mt-0.5">150 Questions • 150 Marks</strong>
              <span className="text-[10px] text-slate-500">5 Subject Groups • Negative: 0.33</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
              <span className="text-slate-400 block font-medium">Mains Paper 1</span>
              <strong className="text-violet-400 text-sm block mt-0.5">150 Questions • 150 Marks</strong>
              <span className="text-[10px] text-slate-500">AP History & Indian Constitution</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
              <span className="text-slate-400 block font-medium">Mains Paper 2</span>
              <strong className="text-emerald-400 text-sm block mt-0.5">150 Questions • 150 Marks</strong>
              <span className="text-[10px] text-slate-500">Economy of India/AP & Science/Tech</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
              <span className="text-slate-400 block font-medium">Total Selection Window</span>
              <strong className="text-rose-400 text-sm block mt-0.5">450 Marks Total Rank</strong>
              <span className="text-[10px] text-slate-500">Merit & Post Preference Cutoff</span>
            </div>
          </div>

          {/* Track Filter Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1">Filter Track:</span>
              <button
                onClick={() => setSyllabusTrackFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  syllabusTrackFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Combined Prelims + Mains ({appscSubjects.length} Subjects)
              </button>
              <button
                onClick={() => setSyllabusTrackFilter('appsc-prelims')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  syllabusTrackFilter === 'appsc-prelims'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Prelims (5 Groups)
              </button>
              <button
                onClick={() => setSyllabusTrackFilter('appsc-mains')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  syllabusTrackFilter === 'appsc-mains'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Mains (Papers 1 & 2)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => setIsAddSubjectOpen(true)}
              >
                Add Subject
              </Button>
            </div>
          </div>

          {/* Subjects Navigation Pills (Identical to Semester Exam!) */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
            {displayedSyllabusSubjects.map((sub) => {
              const isSelected = activeSemSubject?.id === sub.id;
              const subTopicsCount = topics.filter((t) => t.subjectId === sub.id).length;
              const isPrelims = sub.track === 'appsc-prelims';

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSemSubjectId(sub.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? isPrelims
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-400/40'
                        : 'bg-violet-600 text-white shadow-md shadow-violet-900/30 border border-violet-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>{sub.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isPrelims
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-violet-500/10 text-violet-400'
                    }`}
                  >
                    {isPrelims ? 'Prelims' : sub.paper ? 'Mains' : 'Mains'} • {subTopicsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Subject Detail Card */}
          {activeSemSubject && (
            <div className="space-y-6">
              <Card className="bg-[#101726] border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-white">{activeSemSubject.name}</h2>
                      {activeSemSubject.nameTelugu && (
                        <span className="text-sm text-blue-400 font-medium">
                          ({activeSemSubject.nameTelugu})
                        </span>
                      )}
                      <Badge variant={activeSemSubject.track === 'appsc-prelims' ? 'blue' : 'violet'}>
                        {activeSemSubject.track === 'appsc-prelims' ? 'Prelims' : 'Mains'}
                      </Badge>
                      {activeSemSubject.paper && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-violet-950/60 text-violet-300 border border-violet-700/40">
                          {activeSemSubject.paper}
                        </span>
                      )}
                      <PriorityBadge priority={activeSemSubject.priority} />
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-mono">
                        {activeSemResources.length} Reference Files Attached
                      </span>
                    </div>
                    {activeSemSubject.description && (
                      <p className="text-xs text-slate-400 mt-1">{activeSemSubject.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Award size={14} />}
                      onClick={() => navigate(`/subjects/${activeSemSubject.id}`)}
                      className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
                    >
                      Subject Intelligence & Mocks
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => {
                        setNewSubjectId(activeSemSubject.id);
                        setIsAddTopicModalOpen(true);
                      }}
                    >
                      Add Topic / Unit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                      icon={<UploadCloud size={14} />}
                      onClick={() => {
                        setTargetTopicForDoc('');
                        setIsUploadDocOpen(true);
                      }}
                    >
                      Upload File / PDF
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => {
                        if (window.confirm(`Delete subject "${activeSemSubject.name}"?`)) {
                          deleteSubject(activeSemSubject.id);
                        }
                      }}
                    >
                      Delete Subject
                    </Button>
                  </div>
                </div>

                {/* Subject completion bar */}
                <div className="pt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">
                      Syllabus Covered: <strong>{completedSemTopicsCount} of {activeSemTopics.length} Topics</strong>
                    </span>
                    <span className="text-blue-400 font-bold">{semSubjectProgress}%</span>
                  </div>
                  <ProgressBar
                    value={semSubjectProgress}
                    color={activeSemSubject.track === 'appsc-prelims' ? 'blue' : 'violet'}
                    size="sm"
                    showPercent={false}
                  />
                </div>
              </Card>

              {/* Sub-tabs: Topics & Units vs Subject Files Workspace */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSemActiveSubTab('units')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      semActiveSubTab === 'units'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers size={14} />
                    <span>Topics & Core Concepts ({activeSemTopics.length})</span>
                  </button>

                  <button
                    onClick={() => setSemActiveSubTab('files')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      semActiveSubTab === 'files'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FolderOpen size={14} />
                    <span>Subject & Unit Files Workspace ({activeSemResources.length})</span>
                  </button>
                </div>

                {semActiveSubTab === 'files' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Link2 size={13} />}
                      onClick={() => {
                        setTargetTopicForAttach('');
                        setIsAttachLibOpen(true);
                      }}
                    >
                      Attach from Library
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                      icon={<UploadCloud size={13} />}
                      onClick={() => {
                        setTargetTopicForDoc('');
                        setIsUploadDocOpen(true);
                      }}
                    >
                      Add Required File
                    </Button>
                  </div>
                )}
              </div>

              {/* VIEW 1: TOPICS & CORE CONCEPTS (Semester Style) */}
              {semActiveSubTab === 'units' && (
                <div className="space-y-4">
                  {activeSemTopics.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
                      <BookOpen size={32} className="mx-auto text-slate-500 mb-2" />
                      <h3 className="text-sm font-semibold text-slate-300">No Topics Configured</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Click "Add Topic / Unit" to populate syllabus topics for this subject.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus size={14} />}
                        onClick={() => {
                          setNewSubjectId(activeSemSubject.id);
                          setIsAddTopicModalOpen(true);
                        }}
                      >
                        Add Topic
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeSemTopics.map((topic, idx) => {
                        const topicFiles = resources.filter(
                          (r) => r.topicIds && r.topicIds.includes(topic.id)
                        );

                        return (
                          <div
                            key={topic.id}
                            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                                    {topic.topicNumber ? `#${topic.topicNumber}` : idx + 1}
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                                      {topic.title}
                                    </h4>
                                    {topic.titleTelugu && (
                                      <p className="text-xs text-blue-400/90 font-medium mt-0.5">
                                        {topic.titleTelugu}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <StatusBadge status={topic.status} />
                              </div>

                              {topic.description && (
                                <p className="text-xs text-slate-400 line-clamp-3 pl-8">
                                  {topic.description}
                                </p>
                              )}

                              {topic.isSharedWithMains && (
                                <div className="pl-8">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/50 border border-violet-800/40 text-[10px] text-violet-300 font-medium">
                                    <Sparkles size={10} /> Overlaps with Mains Paper 1/2
                                  </span>
                                </div>
                              )}

                              {/* Topic quick file pill */}
                              <div className="flex items-center gap-2 pl-8 flex-wrap">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <FileText size={12} className="text-blue-400" />
                                  {topicFiles.length} File{topicFiles.length !== 1 ? 's' : ''} Attached
                                </span>
                                <button
                                  onClick={() => {
                                    setTargetTopicForDoc(topic.id);
                                    setIsUploadDocOpen(true);
                                  }}
                                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  + Upload File
                                </button>
                                <button
                                  onClick={() => {
                                    setTargetTopicForAttach(topic.id);
                                    setIsAttachLibOpen(true);
                                  }}
                                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                                >
                                  Attach From Lib
                                </button>
                              </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
                              <div className="flex items-center gap-2">
                                <DifficultyBadge difficulty={topic.difficulty} />
                                <span className="text-slate-400">{topic.estimatedHours} hrs</span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <select
                                  value={topic.status}
                                  onChange={(e) => updateTopicStatus(topic.id, e.target.value as any)}
                                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                                >
                                  <option value="not_started">Not Started</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="needs_revision">Needs Revision</option>
                                </select>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addTaskFromTopic(topic.id);
                                    showToast(`Added "${topic.title.substring(0, 30)}..." to Today's Plan!`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium cursor-pointer"
                                  title="Add to Daily Study Plan"
                                >
                                  + Today
                                </button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                                  icon={<ExternalLink size={12} />}
                                  onClick={() => navigate(`/topics/${topic.id}`)}
                                >
                                  Open Workspace
                                </Button>

                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete topic "${topic.title}"?`)) {
                                      deleteTopic(topic.id);
                                    }
                                  }}
                                  className="text-xs text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                                  title="Delete Topic"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: SUBJECT & TOPIC FILES WORKSPACE */}
              {semActiveSubTab === 'files' && (
                <div className="space-y-4">
                  {/* Filter & Search Bar */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-72">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={semFileSearchQuery}
                        onChange={(e) => setSemFileSearchQuery(e.target.value)}
                        placeholder="Search standard books, survey chapters, G.O.s..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400">Topic:</span>
                        <select
                          value={semFileTopicFilter}
                          onChange={(e) => setSemFileTopicFilter(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="all">All Topics</option>
                          {activeSemTopics.map((top, idx) => (
                            <option key={top.id} value={top.id}>
                              #{top.topicNumber || idx + 1}: {top.title.substring(0, 24)}...
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400">Category:</span>
                        <select
                          value={semFileCategoryFilter}
                          onChange={(e) => setSemFileCategoryFilter(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="all">All Categories</option>
                          <option value="Standard Book / Reference">Standard Books & Textbooks</option>
                          <option value="Telugu Akademi Publication">Telugu Akademi Publications</option>
                          <option value="AP Socio-Economic Survey">AP Socio-Economic Survey</option>
                          <option value="AP Bifurcation Act & G.O.s">AP Bifurcation Act & G.O.s</option>
                          <option value="State Budget & Planning">State Budget & Planning</option>
                          <option value="Previous Year Question Paper">Previous Year Questions</option>
                          <option value="Model Answer Framework">Model Answers</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Document Cards */}
                  {filteredSemResources.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
                      <FileText size={32} className="mx-auto text-slate-500 mb-2" />
                      <h3 className="text-sm font-semibold text-slate-300">No Reference Files Attached</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Upload standard books, survey chapters, G.O.s, or previous question papers to this subject.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        icon={<UploadCloud size={14} />}
                        onClick={() => {
                          setTargetTopicForDoc('');
                          setIsUploadDocOpen(true);
                        }}
                      >
                        Upload First Document
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSemResources.map((res) => {
                        const linkedTopicNames = (res.topicIds || [])
                          .map((tid) => topics.find((t) => t.id === tid)?.title)
                          .filter(Boolean);

                        return (
                          <div
                            key={res.id}
                            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-md group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                                  <FileText size={18} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                  {res.isVerified && (
                                    <Badge variant="emerald" size="sm">
                                      Verified
                                    </Badge>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {res.fileSize || 'PDF'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                                  {res.title}
                                </h4>
                                {res.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                    {res.description}
                                  </p>
                                )}
                              </div>

                              {/* Topic tags */}
                              {linkedTopicNames.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {linkedTopicNames.map((name, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-medium truncate max-w-[200px]"
                                    >
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Category Tags */}
                              {res.tags && res.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {res.tags.slice(0, 3).map((t, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="text-xs gap-1 py-1"
                                icon={<Eye size={13} />}
                                onClick={() => setActiveReadingDoc(res)}
                              >
                                Read In App
                              </Button>

                              <div className="flex items-center gap-1">
                                {res.fileUrl && (
                                  <a
                                    href={res.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                                    title="Open externally"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete file "${res.title}"?`)) {
                                      deleteResource(res.id);
                                    }
                                  }}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800 cursor-pointer"
                                  title="Delete Resource"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'mains' ? (
        <div className="space-y-4">
          {/* Mains Sub-Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setMainsSubView('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  mainsSubView === 'editor'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool size={14} />
                <span>Answer Writing & Rubrics ({mainsPrompts.length})</span>
              </button>

              <button
                onClick={() => setMainsSubView('documents')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  mainsSubView === 'documents'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderOpen size={14} />
                <span>Mains Reference Files & Documents ({mainsResources.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
                icon={<UploadCloud size={13} />}
                onClick={() => setIsUploadDocOpen(true)}
              >
                Upload Mains Document
              </Button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* VIEW 1: DESCRIPTIVE ANSWER-WRITING SUITE             */}
          {/* ==================================================== */}
          {mainsSubView === 'editor' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Questions List & Topics */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mains Answer Prompts</CardTitle>
                    <Badge variant="violet">{mainsPrompts.length} Prompts</Badge>
                  </CardHeader>
                  <div className="space-y-2.5">
                    {mainsPrompts.map((p) => {
                      const isSelected = activeMainsPrompt?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveMainsPrompt(p);
                            setUserDraftAnswer(p.userDraft || '');
                            setSelfScore(p.userScoreSelf || 0);
                            setShowModelAnswer(false);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-violet-950/40 border-violet-500/50 shadow-sm ring-1 ring-violet-500/30'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="text-violet-400 font-semibold">{p.paper}</span>
                            <span>{p.wordLimit} Words • {p.marks} Marks</span>
                          </div>
                          <p className="text-slate-200 font-medium line-clamp-2">{p.questionText}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Status: {p.status.toUpperCase()}</span>
                            {p.userScoreSelf ? (
                              <span className="text-emerald-400 font-bold">Self Score: {p.userScoreSelf}/{p.marks}</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Mains Syllabus Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mains Syllabus Units</CardTitle>
                    <span className="text-xs text-slate-400">{mainsTopics.length} Units</span>
                  </CardHeader>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    {mainsTopics.map((topic) => (
                      <div key={topic.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-slate-200 block truncate">{topic.title}</span>
                          {topic.titleTelugu && <p className="text-[11px] text-violet-400 mt-0.5 truncate">{topic.titleTelugu}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[11px] text-blue-400 hover:text-blue-300 p-1 shrink-0"
                          onClick={() => navigate(`/topics/${topic.id}`)}
                          title="Open Unit Workspace"
                        >
                          Workspace
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right 2 Columns: Interactive Descriptive Writing Editor & Evaluation Rubric */}
              <div className="lg:col-span-2 space-y-4">
                {activeMainsPrompt ? (
                  <Card className="bg-[#101726]">
                    {/* Prompt Question Display */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="violet">{activeMainsPrompt.paper}</Badge>
                        <span className="text-slate-400">
                          Word Target: <strong>{activeMainsPrompt.wordLimit} words</strong> • Marks: <strong>{activeMainsPrompt.marks}</strong>
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-white leading-relaxed">
                        {activeMainsPrompt.questionText}
                      </h3>

                      {/* Attached Reference Files for this prompt */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-400 font-medium">Attached Source Materials:</span>
                          {promptAttachedDocs.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">None attached</span>
                          ) : (
                            promptAttachedDocs.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => setActiveReadingDoc(doc)}
                                className="px-2 py-0.5 rounded bg-violet-950/60 border border-violet-700/50 text-[11px] text-violet-300 flex items-center gap-1 hover:bg-violet-900/40 cursor-pointer"
                              >
                                <FileText size={11} />
                                <span className="truncate max-w-[150px]">{doc.title}</span>
                              </button>
                            ))
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] text-violet-300 border-violet-500/30 hover:bg-violet-500/10 py-0.5 px-2"
                          icon={<Plus size={11} />}
                          onClick={() => setIsAttachPromptDocOpen(true)}
                        >
                          Attach Document
                        </Button>
                      </div>
                    </div>

                    {/* Editor Bar */}
                    <div className="flex items-center justify-between text-xs mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <PenTool size={14} className="text-blue-400" />
                        <span className="font-semibold text-slate-300">Answer Composition Workspace</span>
                      </div>
                      <div className={`font-semibold ${isOverWordLimit ? 'text-rose-400' : 'text-slate-300'}`}>
                        Word Count: {wordCount} / {wordLimit} words {isOverWordLimit && '(Exceeded limit)'}
                      </div>
                    </div>

                    <textarea
                      rows={10}
                      value={userDraftAnswer}
                      onChange={(e) => setUserDraftAnswer(e.target.value)}
                      placeholder="Structure your answer with: 1. Introduction & Context, 2. Core Arguments & Constitutional Articles, 3. Case Laws / Survey Data, 4. Balanced Conclusion..."
                      className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 leading-relaxed font-sans"
                    />

                    {/* Rubric and Model Answer Controls */}
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowModelAnswer(!showModelAnswer)}
                        >
                          {showModelAnswer ? 'Hide Model Answer' : 'Reveal Verified Model Answer'}
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Self Evaluation:</span>
                          <input
                            type="number"
                            min="0"
                            max={activeMainsPrompt.marks}
                            value={selfScore}
                            onChange={(e) => setSelfScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-center text-white"
                          />
                          <span className="text-xs text-slate-400">/ {activeMainsPrompt.marks}</span>
                          <Button variant="primary" size="sm" onClick={handleSaveMainsDraft}>
                            Save Evaluation
                          </Button>
                        </div>
                      </div>

                      {/* Rubric Checklist */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Standard Evaluation Rubric
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {activeMainsPrompt.rubric.map((r, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-200">{r.criterion} ({r.maxMarks}M)</span>
                                <p className="text-[11px] text-slate-400 mt-0.5">{r.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Model Answer Display */}
                      {showModelAnswer && (
                        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-200 space-y-2">
                          <div className="font-bold text-blue-400 text-sm">Verified Model Answer:</div>
                          <div className="whitespace-pre-line leading-relaxed text-slate-300">
                            {activeMainsPrompt.modelAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <p className="text-slate-500 text-center py-12">Select a prompt from the left panel.</p>
                )}
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* VIEW 2: MAINS REFERENCE FILES & DOCUMENTS WORKSPACE   */
            /* ==================================================== */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Search Socio-Economic Survey, G.O.s, Acts..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
                    icon={<UploadCloud size={14} />}
                    onClick={() => setIsUploadDocOpen(true)}
                  >
                    Upload Document / PDF
                  </Button>
                </div>
              </div>

              {mainsResources.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
                  <FileText size={32} className="mx-auto text-slate-500 mb-2" />
                  <h3 className="text-sm font-semibold text-slate-300">No Mains Reference Documents Added</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Upload official AP Socio-Economic Survey chapters, AP Reorganisation Act, Government Orders (G.O.s), and model answer copies.
                  </p>
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                    icon={<UploadCloud size={14} />}
                    onClick={() => setIsUploadDocOpen(true)}
                  >
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mainsResources
                    .filter((r) => {
                      const q = docSearchQuery.toLowerCase();
                      return (
                        r.title.toLowerCase().includes(q) ||
                        (r.description && r.description.toLowerCase().includes(q)) ||
                        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
                      );
                    })
                    .map((res) => (
                      <div
                        key={res.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-md group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {res.isVerified && (
                                <Badge variant="emerald" size="sm">
                                  Verified
                                </Badge>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {res.fileSize || 'PDF'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-2">
                              {res.title}
                            </h4>
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
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs gap-1 py-1"
                            icon={<Eye size={13} />}
                            onClick={() => setActiveReadingDoc(res)}
                          >
                            Read In App
                          </Button>

                          <div className="flex items-center gap-1">
                            {res.fileUrl && (
                              <a
                                href={res.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                                title="Open externally"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete document "${res.title}"?`)) {
                                  deleteResource(res.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800"
                              title="Delete Resource"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* PRELIMS & SHARED WORKSPACE */
        <div className="space-y-4">
          {/* Subject Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedSubjectId === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Subjects ({currentTopics.length})
            </button>
            {subjects
              .filter((s) => s.track.startsWith('appsc'))
              .map((sub) => {
                const count = currentTopics.filter((t) => t.subjectId === sub.id).length;
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className="opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic) => {
              const sub = subjects.find((s) => s.id === topic.subjectId);
              return (
                <Card
                  key={topic.id}
                  className="hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {sub?.name || 'APPSC Group 2'}
                        </span>
                        <h3 className="text-sm font-semibold text-white leading-snug">{topic.title}</h3>
                        {topic.titleTelugu && (
                          <p className="text-xs text-blue-400">{topic.titleTelugu}</p>
                        )}
                      </div>
                      <StatusBadge status={topic.status} />
                    </div>

                    {topic.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{topic.description}</p>
                    )}

                    {topic.isSharedWithMains && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/40 border border-violet-800/40 text-[10px] text-violet-300 font-medium">
                        <Sparkles size={11} /> Overlaps with Mains Paper 1/2
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={topic.difficulty} />
                      <span className="text-slate-400">{topic.estimatedHours} hrs</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={topic.status}
                        onChange={(e) => updateTopicStatus(topic.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="needs_revision">Needs Revision</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-400 hover:text-blue-300"
                        onClick={() => navigate(`/topics/${topic.id}`)}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Topic */}
      <Modal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        title="Add APPSC Syllabus Topic"
        description="Add a new topic to Prelims, Mains, or Shared syllabus."
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Topic Title (English) *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AP Bifurcation Act 2014 & Socio-Economic Impact"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Topic Title (Telugu)</label>
            <input
              type="text"
              value={newTitleTelugu}
              onChange={(e) => setNewTitleTelugu(e.target.value)}
              placeholder="e.g. ఆంధ్రప్రదేశ్ విభజన చట్టం 2014"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {subjects
                  .filter((s) => s.track.startsWith('appsc'))
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newHours}
                onChange={(e) => setNewHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sharedCheckbox"
              checked={isSharedWithMains}
              onChange={(e) => setIsSharedWithMains(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sharedCheckbox" className="text-xs text-slate-300 cursor-pointer">
              Shared syllabus mapping (Overlaps with both Prelims & Mains)
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Syllabus Description</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Important articles, committee recommendations, and key facts..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTopicModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Upload Mains Document */}
      <Modal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        title="Upload Mains Document / Reference"
        description="Attach AP Socio-Economic Survey chapters, G.O.s, or Model Answers."
        maxWidth="lg"
      >
        <form onSubmit={handleUploadDocSubmit} className="space-y-4 text-xs">
          <div className="p-4 border-2 border-dashed border-violet-500/40 rounded-xl bg-violet-950/20 text-center hover:bg-violet-950/30 transition-colors">
            <input
              type="file"
              id="mains-file-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleDocFileSelection}
              className="hidden"
            />
            <label htmlFor="mains-file-upload" className="cursor-pointer block">
              <UploadCloud size={28} className="mx-auto text-violet-400 mb-2" />
              <span className="font-semibold text-slate-200 block">
                {docFile ? docFile.name : 'Click to select PDF or Document'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {docFile ? `${formatFileSize(docFile.size)} selected` : 'Supports PDF up to 50MB for in-app reading'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Document Title *</label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. AP Socio-Economic Survey 2024-25: Agriculture Chapter"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Document Category *</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Standard Book / Reference">Standard Book & Textbook</option>
                <option value="Telugu Akademi Publication">Telugu Akademi Publication</option>
                <option value="AP Socio-Economic Survey">AP Socio-Economic Survey</option>
                <option value="AP Bifurcation Act & G.O.s">AP Bifurcation Act & G.O.s</option>
                <option value="State Budget & Planning">State Budget & Planning</option>
                <option value="Previous Year Question Paper">Previous Year Question Paper</option>
                <option value="Model Answer Framework">Model Answer Framework</option>
                <option value="Constitutional Reference">Constitutional Reference</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Link to Topic / Unit (Optional)</label>
            <select
              value={targetTopicForDoc}
              onChange={(e) => setTargetTopicForDoc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Subject-Wide (All Units / Topics)</option>
              {activeSemTopics.map((top) => (
                <option key={top.id} value={top.id}>
                  #{top.topicNumber || ''} {top.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Description / Key Highlights</label>
            <textarea
              rows={2}
              value={docDesc}
              onChange={(e) => setDocDesc(e.target.value)}
              placeholder="e.g. Section 46 & 50 tax devolution details under AP Reorganisation Act 2014..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">External Source Link (Optional)</label>
            <input
              type="url"
              value={docExternalUrl}
              onChange={(e) => setDocExternalUrl(e.target.value)}
              placeholder="https://apeconomics.ap.gov.in/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadDocOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 text-white"
              disabled={isProcessingDoc}
            >
              {isProcessingDoc ? 'Processing...' : 'Upload & Attach Document'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Attach Document to Active Mains Prompt */}
      {isAttachPromptDocOpen && activeMainsPrompt && (
        <Modal
          isOpen={true}
          onClose={() => setIsAttachPromptDocOpen(false)}
          title={`Attach Document to Prompt`}
          description={`Link reference sources to "${activeMainsPrompt.questionText.substring(0, 40)}..."`}
          maxWidth="lg"
        >
          <div className="space-y-3 text-xs">
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {resources.map((res) => {
                const isAttached = activeMainsPrompt.referenceResourceIds?.includes(res.id);

                return (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-100 truncate">{res.title}</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {res.fileSize || 'PDF'} • {res.track.toUpperCase()}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAttached ? 'secondary' : 'primary'}
                      className="text-xs"
                      onClick={() => {
                        const current = activeMainsPrompt.referenceResourceIds || [];
                        const next = isAttached
                          ? current.filter((id) => id !== res.id)
                          : [...current, res.id];

                        saveMainsPrompt({
                          ...activeMainsPrompt,
                          referenceResourceIds: next,
                        });
                        setActiveMainsPrompt({
                          ...activeMainsPrompt,
                          referenceResourceIds: next,
                        });
                      }}
                    >
                      {isAttached ? (
                        <>
                          <Check size={12} className="mr-1 text-emerald-400" /> Attached
                        </>
                      ) : (
                        '+ Attach'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button size="sm" onClick={() => setIsAttachPromptDocOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add APPSC Subject */}
      <Modal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        title="Add APPSC Subject Group / Paper"
        description="Add a new subject to Prelims or Mains syllabus."
      >
        <form onSubmit={handleAddSubjectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name (English) *</label>
            <input
              type="text"
              required
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="e.g. Science & Technology"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name (Telugu)</label>
            <input
              type="text"
              value={newSubNameTelugu}
              onChange={(e) => setNewSubNameTelugu(e.target.value)}
              placeholder="e.g. సైన్స్ మరియు టెక్నాలజీ"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Exam Track *</label>
              <select
                value={newSubTrack}
                onChange={(e) => setNewSubTrack(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="appsc-prelims">APPSC Group 2 Prelims</option>
                <option value="appsc-mains">APPSC Group 2 Mains</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Study Hours</label>
              <input
                type="number"
                min="10"
                max="200"
                value={newSubHours}
                onChange={(e) => setNewSubHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Paper / Section Details</label>
            <input
              type="text"
              value={newSubPaper}
              onChange={(e) => setNewSubPaper(e.target.value)}
              placeholder="e.g. Paper II - Section B (75 Marks)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Syllabus Overview / Scope</label>
            <textarea
              rows={2}
              value={newSubDesc}
              onChange={(e) => setNewSubDesc(e.target.value)}
              placeholder="Detailed description of topics, official weightage, and target chapters..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddSubjectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Attach Document from Library */}
      <Modal
        isOpen={isAttachLibOpen}
        onClose={() => setIsAttachLibOpen(false)}
        title="Attach Document from Library"
        description="Select existing PDFs or notes from your library to link to this subject or topic."
        maxWidth="xl"
      >
        <div className="space-y-3.5 text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={libSearchQuery}
              onChange={(e) => setLibSearchQuery(e.target.value)}
              placeholder="Search library documents, notes, survey chapters..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {targetTopicForAttach && (
            <div className="p-2 rounded bg-blue-950/50 border border-blue-800/40 text-blue-300">
              Attaching to topic: <strong>{topics.find((t) => t.id === targetTopicForAttach)?.title}</strong>
            </div>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {resources
              .filter((res) => {
                const q = libSearchQuery.toLowerCase();
                return (
                  res.title.toLowerCase().includes(q) ||
                  (res.description && res.description.toLowerCase().includes(q))
                );
              })
              .map((res) => {
                const isAttached = targetTopicForAttach
                  ? res.topicIds?.includes(targetTopicForAttach)
                  : res.subjectId === activeSemSubject?.id;

                return (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-100 truncate">{res.title}</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {res.fileSize || 'PDF'} • {res.track.toUpperCase()}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAttached ? 'outline' : 'secondary'}
                      className="text-xs shrink-0"
                      onClick={() => {
                        if (targetTopicForAttach) {
                          if (isAttached) {
                            detachResourceFromTopic(targetTopicForAttach, res.id);
                            showToast(`Detached "${res.title}"`);
                          } else {
                            attachResourceToTopic(targetTopicForAttach, res.id);
                            showToast(`Attached "${res.title}" to topic!`);
                          }
                        } else if (activeSemSubject) {
                          if (!isAttached) {
                            saveResource({
                              ...res,
                              subjectId: activeSemSubject.id,
                            });
                            showToast(`Linked "${res.title}" to subject!`);
                          }
                        }
                      }}
                    >
                      {isAttached ? (
                        <>
                          <Check size={12} className="mr-1 text-emerald-400" /> Attached
                        </>
                      ) : (
                        '+ Attach'
                      )}
                    </Button>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button size="sm" onClick={() => setIsAttachLibOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: In-App PDF Reader */}
      {activeReadingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setActiveReadingDoc(null)}
          title={activeReadingDoc.title}
          description={`Viewing: ${activeReadingDoc.fileName || 'Document'} (${activeReadingDoc.fileSize || 'PDF'})`}
          maxWidth={isReaderFullscreen ? 'full' : '2xl'}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">
                In-App Document Reader
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReaderFullscreen(!isReaderFullscreen)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Toggle Fullscreen"
                >
                  {isReaderFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                {activeReadingDoc.fileUrl && (
                  <a
                    href={activeReadingDoc.fileUrl}
                    download={activeReadingDoc.fileName || 'document.pdf'}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center">
              {activeReadingDoc.fileUrl ? (
                <iframe
                  src={activeReadingDoc.fileUrl}
                  title={activeReadingDoc.title}
                  className="w-full h-full border-none"
                />
              ) : activeReadingDoc.content ? (
                <div className="w-full h-full p-6 overflow-y-auto text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {activeReadingDoc.content}
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  <FileText size={32} className="mx-auto mb-2 text-slate-500" />
                  <p>Document preview unavailable directly. Click below to open.</p>
                  {activeReadingDoc.externalUrl && (
                    <a
                      href={activeReadingDoc.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-blue-400 underline"
                    >
                      Open Document URL <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
