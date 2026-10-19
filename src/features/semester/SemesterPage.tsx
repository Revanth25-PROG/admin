import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  ExternalLink,
  Link2,
  Search,
  Eye,
  Download,
  Maximize2,
  Minimize2,
  Check,
  UploadCloud,
  FileCheck,
  FolderOpen,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Subject, SyllabusTopic, ResourceItem } from '../../types';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, DifficultyBadge, PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const SemesterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    semesterInfo,
    subjects,
    topics,
    resources,
    updateSemesterInfo,
    saveSubject,
    deleteSubject,
    saveTopic,
    deleteTopic,
    updateTopicStatus,
    saveResource,
    deleteResource,
    attachResourceToTopic,
    detachResourceFromTopic,
  } = useStudyVerse();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.find((s) => s.track === 'semester')?.id || ''
  );
  const [activeSubTab, setActiveSubTab] = useState<'units' | 'files'>('units');
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('all');
  const [fileUnitFilter, setFileUnitFilter] = useState<string>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');

  // Edit Semester Details Modal
  const [isEditSemModalOpen, setIsEditSemModalOpen] = useState(false);
  const [semYear, setSemYear] = useState(semesterInfo.yearName);
  const [semName, setSemName] = useState(semesterInfo.semesterName);
  const [semBranch, setSemBranch] = useState(semesterInfo.branch);
  const [mid1, setMid1] = useState(semesterInfo.mid1Date || '');
  const [mid2, setMid2] = useState(semesterInfo.mid2Date || '');
  const [labDate, setLabDate] = useState(semesterInfo.labExamDate || '');
  const [finalStart, setFinalStart] = useState(semesterInfo.finalExamStartDate || '');

  // Add Subject Modal
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubHours, setNewSubHours] = useState(40);

  // Add Unit/Topic Modal
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicHours, setTopicHours] = useState(4);

  // Upload Reference File Modal
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [targetUnitForUpload, setTargetUnitForUpload] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string>('');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'Textbook' | 'Lecture Notes' | 'Lab Manual' | 'Previous Year Question Paper' | 'Assignment Sheets'>('Textbook');
  const [docDesc, setDocDesc] = useState('');
  const [docExternalUrl, setDocExternalUrl] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Attach From Library Modal
  const [isAttachLibOpen, setIsAttachLibOpen] = useState(false);
  const [targetUnitForAttach, setTargetUnitForAttach] = useState<string>('');
  const [libSearchQuery, setLibSearchQuery] = useState('');

  // In-App PDF Reader Modal
  const [activeReadingResource, setActiveReadingResource] = useState<ResourceItem | null>(null);
  const [isReaderFullscreen, setIsReaderFullscreen] = useState(false);

  const semSubjects = subjects.filter((s) => s.track === 'semester');
  const activeSubject = semSubjects.find((s) => s.id === selectedSubjectId) || semSubjects[0];
  const activeTopics = activeSubject ? topics.filter((t) => t.subjectId === activeSubject.id) : [];

  const completedUnits = activeTopics.filter((t) => t.status === 'completed').length;
  const subjectProgress = activeTopics.length > 0 ? Math.round((completedUnits / activeTopics.length) * 100) : 0;

  // Resources for this semester subject
  const subjectResources = resources.filter((r) => {
    if (r.subjectId === activeSubject?.id) return true;
    if (r.topicIds && r.topicIds.some((tid) => activeTopics.some((at) => at.id === tid))) return true;
    return false;
  });

  const filteredResources = subjectResources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(fileSearchQuery.toLowerCase())) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(fileSearchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (fileCategoryFilter !== 'all') {
      const matchCat = r.tags && r.tags.some((t) => t.toLowerCase() === fileCategoryFilter.toLowerCase());
      if (!matchCat) return false;
    }

    if (fileUnitFilter !== 'all') {
      const hasTopic = r.topicIds && r.topicIds.includes(fileUnitFilter);
      if (!hasTopic) return false;
    }

    return true;
  });

  const handleSaveSemDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateSemesterInfo({
      yearName: semYear,
      semesterName: semName,
      branch: semBranch,
      mid1Date: mid1,
      mid2Date: mid2,
      labExamDate: labDate,
      finalExamStartDate: finalStart,
    });
    setIsEditSemModalOpen(false);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: Subject = {
      id: `sub-sem-${Date.now()}`,
      track: 'semester',
      code: newSubCode.trim() || undefined,
      name: newSubName.trim(),
      description: newSubDesc.trim() || undefined,
      color: '#0284c7',
      priority: 'high',
      semesterId: semesterInfo.id,
      targetHours: newSubHours,
    };

    saveSubject(newSub);
    setSelectedSubjectId(newSub.id);
    setIsAddSubOpen(false);
    setNewSubName('');
    setNewSubCode('');
    setNewSubDesc('');
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !topicTitle.trim()) return;

    const newTop: SyllabusTopic = {
      id: `top-sem-${Date.now()}`,
      subjectId: activeSubject.id,
      track: 'semester',
      title: topicTitle.trim(),
      description: topicDesc.trim() || undefined,
      estimatedHours: topicHours,
      difficulty: 'moderate',
      priority: 'high',
      status: 'not_started',
      progressPercent: 0,
      targetQuestionCount: 500,
    };

    saveTopic(newTop);
    setIsAddTopicOpen(false);
    setTopicTitle('');
    setTopicDesc('');
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    if (!docTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedDataUrl(reader.result as string);
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      try {
        const obj = URL.createObjectURL(file);
        setUploadedDataUrl(obj);
      } catch (err) {
        console.error('File read error', err);
      }
      setIsProcessingFile(false);
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

  const handleUploadFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !activeSubject) return;

    const topicIds = targetUnitForUpload ? [targetUnitForUpload] : [];
    const sizeStr = uploadedFile ? formatFileSize(uploadedFile.size) : 'PDF Document';

    const newRes: ResourceItem = {
      id: `res-sem-${Date.now()}`,
      title: docTitle.trim(),
      type: 'pdf',
      track: 'semester',
      subjectId: activeSubject.id,
      topicIds,
      description: docDesc.trim() || undefined,
      fileUrl: uploadedDataUrl || docExternalUrl.trim() || undefined,
      fileName: uploadedFile?.name || `${docTitle}.pdf`,
      fileSize: sizeStr,
      fileSizeBytes: uploadedFile?.size || 0,
      tags: ['Semester', activeSubject.name, docCategory],
      language: 'en',
      isVerified: true,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    };

    saveResource(newRes);
    if (targetUnitForUpload) {
      attachResourceToTopic(targetUnitForUpload, newRes.id);
    }

    setIsUploadFileOpen(false);
    setUploadedFile(null);
    setUploadedDataUrl('');
    setDocTitle('');
    setDocDesc('');
    setDocExternalUrl('');
    setTargetUnitForUpload('');
  };

  return (
    <div className="space-y-6">
      {/* Semester Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-emerald-950/40 border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {semesterInfo.yearName} — {semesterInfo.semesterName}
            </h1>
            <Badge variant="teal">{semesterInfo.branch}</Badge>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-medium">
              Flexible Academic Workspace
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300">
            Dedicated academic command center for syllabus units, textbooks, lecture slides, lab manuals, assignment sheets, and semester exams.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 size={14} />}
            onClick={() => setIsEditSemModalOpen(true)}
          >
            Configure Semester Dates
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setIsAddSubOpen(true)}
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* Exam Milestones Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <span className="text-slate-400 block font-medium">Mid Examination 1</span>
          <strong className="text-teal-400 text-sm block mt-0.5">{semesterInfo.mid1Date || 'Not Set'}</strong>
          <span className="text-[10px] text-slate-500">Units 1 & 2 Syllabus</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <span className="text-slate-400 block font-medium">Mid Examination 2</span>
          <strong className="text-blue-400 text-sm block mt-0.5">{semesterInfo.mid2Date || 'Not Set'}</strong>
          <span className="text-[10px] text-slate-500">Units 3, 4 & 5 Syllabus</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <span className="text-slate-400 block font-medium">Lab Practicals / Viva</span>
          <strong className="text-amber-400 text-sm block mt-0.5">{semesterInfo.labExamDate || 'Not Set'}</strong>
          <span className="text-[10px] text-slate-500">Internal & External Viva</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <span className="text-slate-400 block font-medium">Final University Theory</span>
          <strong className="text-rose-400 text-sm block mt-0.5">{semesterInfo.finalExamStartDate || 'Not Set'}</strong>
          <span className="text-[10px] text-slate-500">University Exam Window</span>
        </div>
      </div>

      {/* Subjects Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {semSubjects.map((sub) => {
          const isSelected = activeSubject?.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30 border border-teal-400/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <BookOpen size={14} />
              <span>{sub.name}</span>
              {sub.code && <span className="opacity-70 text-[10px]">({sub.code})</span>}
            </button>
          );
        })}
      </div>

      {/* Active Subject Detail & Units */}
      {activeSubject && (
        <div className="space-y-6">
          <Card className="bg-[#101726] border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-white">{activeSubject.name}</h2>
                  {activeSubject.code && <Badge variant="slate">{activeSubject.code}</Badge>}
                  <PriorityBadge priority={activeSubject.priority} />
                  <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-mono">
                    {subjectResources.length} Reference Files Attached
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeSubject.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => setIsAddTopicOpen(true)}
                >
                  Add Unit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500/40 text-teal-300 hover:bg-teal-500/10"
                  icon={<UploadCloud size={14} />}
                  onClick={() => {
                    setTargetUnitForUpload('');
                    setIsUploadFileOpen(true);
                  }}
                >
                  Upload File / PDF
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    if (window.confirm(`Delete subject "${activeSubject.name}"?`)) {
                      deleteSubject(activeSubject.id);
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
                  Syllabus Covered: <strong>{completedUnits} of {activeTopics.length} Units</strong>
                </span>
                <span className="text-teal-400 font-bold">{subjectProgress}%</span>
              </div>
              <ProgressBar value={subjectProgress} color="teal" size="sm" showPercent={false} />
            </div>
          </Card>

          {/* Sub-tabs: Units & Syllabus vs Reference Files Workspace */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab('units')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'units'
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>Units & Core Concepts ({activeTopics.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('files')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === 'files'
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderOpen size={14} />
                <span>Subject & Unit Files Workspace ({subjectResources.length})</span>
              </button>
            </div>

            {activeSubTab === 'files' && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Link2 size={13} />}
                  onClick={() => {
                    setTargetUnitForAttach('');
                    setIsAttachLibOpen(true);
                  }}
                >
                  Attach from Library
                </Button>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-500 text-white"
                  icon={<UploadCloud size={13} />}
                  onClick={() => {
                    setTargetUnitForUpload('');
                    setIsUploadFileOpen(true);
                  }}
                >
                  Add Required File
                </Button>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* VIEW 1: UNITS & CORE CONCEPTS                        */}
          {/* ==================================================== */}
          {activeSubTab === 'units' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTopics.map((topic, idx) => {
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
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-400 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-100">{topic.title}</h4>
                          </div>
                          <StatusBadge status={topic.status} />
                        </div>

                        {topic.description && (
                          <p className="text-xs text-slate-400 line-clamp-3 pl-8">
                            {topic.description}
                          </p>
                        )}

                        {/* Unit quick file pill */}
                        <div className="flex items-center gap-2 pl-8 flex-wrap">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <FileText size={12} className="text-teal-400" />
                            {topicFiles.length} File{topicFiles.length !== 1 ? 's' : ''} Attached
                          </span>
                          <button
                            onClick={() => {
                              setTargetUnitForUpload(topic.id);
                              setIsUploadFileOpen(true);
                            }}
                            className="text-[11px] text-teal-400 hover:text-teal-300 font-medium underline flex items-center gap-0.5"
                          >
                            + Upload File
                          </button>
                          <button
                            onClick={() => {
                              setTargetUnitForAttach(topic.id);
                              setIsAttachLibOpen(true);
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-200 underline"
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

                        <div className="flex items-center gap-2">
                          <select
                            value={topic.status}
                            onChange={(e) => updateTopicStatus(topic.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="needs_revision">Needs Revision</option>
                          </select>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-teal-300 border-teal-500/30 hover:bg-teal-500/10"
                            icon={<ExternalLink size={12} />}
                            onClick={() => navigate(`/topics/${topic.id}`)}
                          >
                            Open Unit Workspace
                          </Button>

                          <button
                            onClick={() => deleteTopic(topic.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 p-1"
                            title="Delete Unit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW 2: SUBJECT & UNIT FILES WORKSPACE              */}
          {/* ==================================================== */}
          {activeSubTab === 'files' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Search documents, slides, manuals..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-slate-400">Unit:</span>
                    <select
                      value={fileUnitFilter}
                      onChange={(e) => setFileUnitFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="all">All Units</option>
                      {activeTopics.map((top, idx) => (
                        <option key={top.id} value={top.id}>
                          Unit {idx + 1}: {top.title.substring(0, 24)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-slate-400">Category:</span>
                    <select
                      value={fileCategoryFilter}
                      onChange={(e) => setFileCategoryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="Textbook">Textbooks</option>
                      <option value="Lecture Notes">Lecture Slides & Notes</option>
                      <option value="Lab Manual">Lab Manuals</option>
                      <option value="Previous Year Question Paper">Previous Question Papers</option>
                      <option value="Assignment Sheets">Assignment Sheets</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Cards */}
              {filteredResources.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
                  <FileText size={32} className="mx-auto text-slate-500 mb-2" />
                  <h3 className="text-sm font-semibold text-slate-300">No Reference Files Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Upload textbooks, slides, lab manuals, or PYQs directly to this subject and link them to units.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-500 text-white"
                    icon={<UploadCloud size={14} />}
                    onClick={() => {
                      setTargetUnitForUpload('');
                      setIsUploadFileOpen(true);
                    }}
                  >
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((res) => {
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
                            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg shrink-0">
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
                            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-2">
                              {res.title}
                            </h4>
                            {res.description && (
                              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                {res.description}
                              </p>
                            )}
                          </div>

                          {/* Unit tags */}
                          {linkedTopicNames.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {linkedTopicNames.map((name, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/40 font-medium truncate max-w-[200px]"
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
                            onClick={() => setActiveReadingResource(res)}
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
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800"
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

      {/* Modal: Edit Semester Dates */}
      <Modal
        isOpen={isEditSemModalOpen}
        onClose={() => setIsEditSemModalOpen(false)}
        title="Configure Academic Semester & Milestones"
        description="Update semester name, department branch, and examination calendar dates."
      >
        <form onSubmit={handleSaveSemDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Academic Year</label>
              <input
                type="text"
                value={semYear}
                onChange={(e) => setSemYear(e.target.value)}
                placeholder="e.g. M.Tech 1st Year (SAHE M.Tech-24)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester Name</label>
              <input
                type="text"
                value={semName}
                onChange={(e) => setSemName(e.target.value)}
                placeholder="e.g. 1st Semester"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Branch / Specialization</label>
            <input
              type="text"
              value={semBranch}
              onChange={(e) => setSemBranch(e.target.value)}
              placeholder="e.g. Artificial Intelligence & Data Science"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-semibold text-slate-200 mb-3">Examination Milestones</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mid Examination 1 Date</label>
                <input
                  type="date"
                  value={mid1}
                  onChange={(e) => setMid1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mid Examination 2 Date</label>
                <input
                  type="date"
                  value={mid2}
                  onChange={(e) => setMid2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Lab / Viva Exam Date</label>
                <input
                  type="date"
                  value={labDate}
                  onChange={(e) => setLabDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Final Exam Start Date</label>
                <input
                  type="date"
                  value={finalStart}
                  onChange={(e) => setFinalStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditSemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Semester Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Subject */}
      <Modal
        isOpen={isAddSubOpen}
        onClose={() => setIsAddSubOpen(false)}
        title="Add New Semester Subject"
        description="Add a curriculum subject, course code, and target hours."
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="e.g. Distributed Database Systems"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject Code</label>
              <input
                type="text"
                value={newSubCode}
                onChange={(e) => setNewSubCode(e.target.value)}
                placeholder="e.g. 24IT504"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Study Hours</label>
            <input
              type="number"
              min="10"
              max="120"
              value={newSubHours}
              onChange={(e) => setNewSubHours(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject Syllabus Summary</label>
            <textarea
              rows={2}
              value={newSubDesc}
              onChange={(e) => setNewSubDesc(e.target.value)}
              placeholder="Key concepts, lab components, and textbook references..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddSubOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Unit */}
      <Modal
        isOpen={isAddTopicOpen}
        onClose={() => setIsAddTopicOpen(false)}
        title={`Add Unit to ${activeSubject?.name || 'Subject'}`}
        description="Specify unit title, duration, and important questions."
      >
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Unit / Topic Title *</label>
            <input
              type="text"
              required
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="e.g. Unit 3: Concurrency Control & Two-Phase Locking"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Hours</label>
            <input
              type="number"
              min="1"
              max="20"
              value={topicHours}
              onChange={(e) => setTopicHours(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Important Questions & Concepts</label>
            <textarea
              rows={3}
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              placeholder="e.g. Explain Strict 2PL vs Rigorous 2PL with serializability graph..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTopicOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Upload Reference File */}
      <Modal
        isOpen={isUploadFileOpen}
        onClose={() => setIsUploadFileOpen(false)}
        title="Upload Required Subject / Unit File"
        description="Attach textbooks, lecture slides, lab manuals, or previous papers."
        maxWidth="lg"
      >
        <form onSubmit={handleUploadFileSubmit} className="space-y-4 text-xs">
          {/* File Picker */}
          <div className="p-4 border-2 border-dashed border-teal-500/40 rounded-xl bg-teal-950/20 text-center hover:bg-teal-950/30 transition-colors">
            <input
              type="file"
              id="sem-file-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelection}
              className="hidden"
            />
            <label htmlFor="sem-file-upload" className="cursor-pointer block">
              <UploadCloud size={28} className="mx-auto text-teal-400 mb-2" />
              <span className="font-semibold text-slate-200 block">
                {uploadedFile ? uploadedFile.name : 'Click to select PDF or Document'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {uploadedFile ? `${formatFileSize(uploadedFile.size)} selected` : 'Supports PDF up to 50MB for in-app reading'}
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
                placeholder="e.g. Introduction to Algorithms 4th Ed"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Document Category *</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="Textbook">Textbook</option>
                <option value="Lecture Notes">Lecture Slides & Notes</option>
                <option value="Lab Manual">Lab Manual</option>
                <option value="Previous Year Question Paper">Previous Year Question Paper</option>
                <option value="Assignment Sheets">Assignment Sheets</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Link to Unit (Optional)</label>
            <select
              value={targetUnitForUpload}
              onChange={(e) => setTargetUnitForUpload(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="">Subject-Wide (All Units)</option>
              {activeTopics.map((top, idx) => (
                <option key={top.id} value={top.id}>
                  Unit {idx + 1}: {top.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Description / Key Chapters</label>
            <textarea
              rows={2}
              value={docDesc}
              onChange={(e) => setDocDesc(e.target.value)}
              placeholder="e.g. Reference for Unit 2 AVL and Red-Black tree proofs..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">External Web Link (Optional)</label>
            <input
              type="url"
              value={docExternalUrl}
              onChange={(e) => setDocExternalUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadFileOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-teal-600 hover:bg-teal-500 text-white"
              disabled={isProcessingFile}
            >
              {isProcessingFile ? 'Processing...' : 'Upload & Link File'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Attach from Library */}
      <Modal
        isOpen={isAttachLibOpen}
        onClose={() => setIsAttachLibOpen(false)}
        title="Attach Document from Library"
        description="Select existing PDFs from your library to link to this subject or unit."
        maxWidth="xl"
      >
        <div className="space-y-3.5 text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={libSearchQuery}
              onChange={(e) => setLibSearchQuery(e.target.value)}
              placeholder="Search library documents..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {targetUnitForAttach && (
            <div className="p-2 rounded bg-teal-950/50 border border-teal-800/40 text-teal-300">
              Attaching to unit: <strong>{topics.find((t) => t.id === targetUnitForAttach)?.title}</strong>
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
                const isAttached = targetUnitForAttach
                  ? res.topicIds?.includes(targetUnitForAttach)
                  : res.subjectId === activeSubject?.id;

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
                        if (targetUnitForAttach) {
                          if (isAttached) {
                            detachResourceFromTopic(targetUnitForAttach, res.id);
                          } else {
                            attachResourceToTopic(targetUnitForAttach, res.id);
                          }
                        } else if (activeSubject) {
                          saveResource({
                            ...res,
                            subjectId: activeSubject.id,
                          });
                        }
                      }}
                    >
                      {isAttached ? (
                        <>
                          <Check size={12} className="mr-1 text-teal-400" /> Attached
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
      {activeReadingResource && (
        <Modal
          isOpen={true}
          onClose={() => setActiveReadingResource(null)}
          title={activeReadingResource.title}
          description={`Viewing: ${activeReadingResource.fileName || 'Document'} (${activeReadingResource.fileSize || 'PDF'})`}
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
                {activeReadingResource.fileUrl && (
                  <a
                    href={activeReadingResource.fileUrl}
                    download={activeReadingResource.fileName || 'document.pdf'}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center">
              {activeReadingResource.fileUrl ? (
                <iframe
                  src={activeReadingResource.fileUrl}
                  title={activeReadingResource.title}
                  className="w-full h-full border-none"
                />
              ) : activeReadingResource.content ? (
                <div className="w-full h-full p-6 overflow-y-auto text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {activeReadingResource.content}
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  <FileText size={32} className="mx-auto mb-2 text-slate-500" />
                  <p>Document preview unavailable directly. Click below to open.</p>
                  {activeReadingResource.externalUrl && (
                    <a
                      href={activeReadingResource.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-teal-400 underline"
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
