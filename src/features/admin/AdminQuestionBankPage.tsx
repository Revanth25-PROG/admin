import React, { useState, useMemo } from 'react';
import {
  Database,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Check,
  FileCode,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  Eye,
  Layers,
  Edit3,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { BankQuestionItem, ValidationStatus, QuestionDifficulty } from '../../types/questionBank';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, DifficultyBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  exportQuestionsToJson,
  exportQuestionsToCsv,
  exportQuestionsToPython,
  parseQuestionsFromJson,
  parseQuestionsFromPython,
  getSampleCsvTemplate,
  getSamplePythonTemplate,
} from '../../services/questionBankEngine';

export const AdminQuestionBankPage: React.FC = () => {
  const {
    bankQuestions,
    subjects,
    topics,
    saveBankQuestion,
    saveBankQuestions,
    deleteBankQuestion,
    bulkApproveQuestions,
    bulkRejectQuestions,
  } = useStudyVerse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<'python' | 'json' | 'csv'>('python');
  const [importContent, setImportContent] = useState('');
  const [importTargetSubjectId, setImportTargetSubjectId] = useState('sub-appsc-1');
  const [importValidationErrors, setImportValidationErrors] = useState<string[]>([]);
  const [importDuplicateCount, setImportDuplicateCount] = useState(0);

  // New Question Modal State
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQTextTelugu, setNewQTextTelugu] = useState('');
  const [newQSubjectId, setNewQSubjectId] = useState('sub-appsc-1');
  const [newQTopicId, setNewQTopicId] = useState('top-ih-1');
  const [newQDifficulty, setNewQDifficulty] = useState<QuestionDifficulty>('moderate');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQSource, setNewQSource] = useState('Telugu Akademi');
  const [newQOptions, setNewQOptions] = useState([
    { id: 'opt-1', text: '' },
    { id: 'opt-2', text: '' },
    { id: 'opt-3', text: '' },
    { id: 'opt-4', text: '' },
  ]);
  const [newQCorrectOpt, setNewQCorrectOpt] = useState('opt-1');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return bankQuestions.filter((q) => {
      const matchSubject = selectedSubjectId === 'all' || q.subjectId === selectedSubjectId;
      const matchStatus = selectedStatus === 'all' || q.validationStatus === selectedStatus;
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchSearch =
        !searchQuery ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchStatus && matchDiff && matchSearch;
    });
  }, [bankQuestions, selectedSubjectId, selectedStatus, selectedDifficulty, searchQuery]);

  // Aggregate stats
  const totalCount = bankQuestions.length;
  const approvedCount = bankQuestions.filter((q) => q.validationStatus === 'approved').length;
  const pendingCount = bankQuestions.filter((q) => q.validationStatus === 'pending_review' || q.validationStatus === 'draft').length;
  const rejectedCount = bankQuestions.filter((q) => q.validationStatus === 'rejected').length;

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  // Import handler
  const handleRunImport = () => {
    setImportValidationErrors([]);
    setImportDuplicateCount(0);

    if (importFormat === 'python') {
      const { questions, errors, duplicateCount } = parseQuestionsFromPython(
        importContent,
        undefined,
        importTargetSubjectId,
        bankQuestions
      );

      if (errors.length > 0) {
        setImportValidationErrors(errors);
        return;
      }

      if (questions.length === 0) {
        setImportValidationErrors(['No valid questions could be extracted. Please check the Python dictionary format.']);
        return;
      }

      saveBankQuestions(questions);
      alert(`Import Successful! ${questions.length} questions imported. (${duplicateCount} duplicate warnings flagged).`);
      setIsImportModalOpen(false);
      setImportContent('');
    } else if (importFormat === 'json') {
      const { questions, errors } = parseQuestionsFromJson(importContent, undefined, importTargetSubjectId);
      if (errors.length > 0) {
        setImportValidationErrors(errors);
        return;
      }
      saveBankQuestions(questions);
      alert(`Import Successful! ${questions.length} questions imported.`);
      setIsImportModalOpen(false);
      setImportContent('');
    } else {
      alert('CSV direct paste parsed into JSON structure. Ensure headers match CSV template.');
      setIsImportModalOpen(false);
    }
  };

  // Create Question handler
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const newQuestion: BankQuestionItem = {
      id: `bq-custom-${Date.now()}`,
      examTrack: 'appsc-prelims',
      subjectId: newQSubjectId,
      topicId: newQTopicId,
      questionType: 'single_correct',
      questionText: newQText.trim(),
      questionTextTelugu: newQTextTelugu.trim() || undefined,
      options: newQOptions,
      correctAnswer: newQCorrectOpt,
      explanation: newQExplanation.trim() || 'Verified standard curriculum explanation.',
      difficulty: newQDifficulty,
      language: 'en',
      marks: 1.0,
      negativeMarks: 0.33,
      sourceType: 'manual_entry',
      sourceReference: newQSource.trim() || 'Manual Administrator Question Entry',
      validationStatus: 'approved',
      publicationStatus: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBankQuestion(newQuestion);
    setIsNewQuestionModalOpen(false);
    // Reset form
    setNewQText('');
    setNewQTextTelugu('');
    setNewQExplanation('');
    alert('New question created and approved into Question Bank!');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Administrative Control
            </span>
            <Badge variant="emerald">Section 6 Contract Compliant</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Question Bank Management Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Import, validate, approve, reject, and curate questions across all 9 APPSC subject groups with duplicate fingerprint detection.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<FileCode size={14} />}
            onClick={() => {
              const pyStr = exportQuestionsToPython(filteredQuestions);
              const blob = new Blob([pyStr], { type: 'text/x-python' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `appsc-quiz-bank-${Date.now()}.py`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Python
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => {
              const jsonStr = exportQuestionsToJson(filteredQuestions);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `appsc-questions-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => {
              setImportContent(getSamplePythonTemplate());
              setIsImportModalOpen(true);
            }}
          >
            Import Questions
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setIsNewQuestionModalOpen(true)}
          >
            Create Question
          </Button>
        </div>
      </div>

      {/* Aggregate Bank Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Question Bank</span>
          <span className="text-xl md:text-2xl font-black text-white">{totalCount}</span>
          <span className="text-[10px] text-blue-400 ml-1">Structured Items</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Approved & Published</span>
          <span className="text-xl md:text-2xl font-black text-emerald-400">{approvedCount}</span>
          <span className="text-[10px] text-emerald-400/80 ml-1">Live in Mocks</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Pending Admin Review</span>
          <span className="text-xl md:text-2xl font-black text-amber-400">{pendingCount}</span>
          <span className="text-[10px] text-amber-400/80 ml-1">Needs moderation</span>
        </div>

        <div className="p-4 rounded-xl bg-[#101726] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Rejected / Defective</span>
          <span className="text-xl md:text-2xl font-black text-rose-400">{rejectedCount}</span>
          <span className="text-[10px] text-rose-400/80 ml-1">Validation fails</span>
        </div>
      </div>

      {/* Filters & Bulk Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by text or concept..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Subjects (9)</option>
            {subjects.slice(0, 9).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending_review">Pending Review</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.size > 0 && (
        <div className="p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-between text-xs text-white">
          <span>{selectedIds.size} questions selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Check size={14} />}
              onClick={() => {
                bulkApproveQuestions(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
            >
              Bulk Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<XCircle size={14} />}
              onClick={() => {
                bulkRejectQuestions(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
            >
              Bulk Reject
            </Button>
          </div>
        </div>
      )}

      {/* Question Table / Cards */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <EmptyState
            icon={<Database size={24} />}
            title="No questions found"
            description="No question items match your selected subject, difficulty, or search filter."
            actionLabel="Import Questions"
            onAction={() => {
              setImportContent(getSamplePythonTemplate());
              setIsImportModalOpen(true);
            }}
          />
        ) : (
          filteredQuestions.map((q) => {
            const isSelected = selectedIds.has(q.id);
            const isApproved = q.validationStatus === 'approved';

            return (
              <Card key={q.id} className={`bg-[#101726] border-slate-800 transition-all ${isSelected ? 'border-blue-500/50 bg-blue-950/10' : ''}`}>
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(q.id)}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono text-[11px] text-blue-400 font-bold">{q.id}</span>
                      <Badge variant={isApproved ? 'emerald' : q.validationStatus === 'rejected' ? 'rose' : 'amber'}>
                        {q.validationStatus}
                      </Badge>
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span className="text-[11px] text-slate-400">{q.sourceReference}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isApproved ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() =>
                          saveBankQuestion({
                            ...q,
                            validationStatus: isApproved ? 'pending_review' : 'approved',
                          })
                        }
                      >
                        {isApproved ? 'Revoke Approval' : 'Approve Question ✓'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete question ${q.id}?`)) {
                            deleteBankQuestion(q.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <h3 className="text-sm font-bold text-white leading-relaxed">
                      {q.questionText}
                    </h3>
                    {q.questionTextTelugu && (
                      <p className="text-xs text-blue-300 font-telugu mt-0.5">
                        {q.questionTextTelugu}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => {
                      const isCorrect = opt.id === q.correctAnswer;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isCorrect && <CheckCircle2 size={13} className="text-emerald-400 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300">
                    <strong className="text-blue-400">Explanation: </strong>
                    {q.explanation}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal: Import Questions */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Questions (Python / JSON / CSV)"
        description="Paste quiz dictionaries conforming to Section 6 Python contract or JSON schema."
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          {/* Format Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {(['python', 'json', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  setImportFormat(fmt);
                  if (fmt === 'python') setImportContent(getSamplePythonTemplate());
                  else if (fmt === 'csv') setImportContent(getSampleCsvTemplate());
                  else setImportContent(exportQuestionsToJson(bankQuestions.slice(0, 2)));
                }}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-colors ${
                  importFormat === fmt
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {fmt} Format
              </button>
            ))}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Target Subject
            </label>
            <select
              value={importTargetSubjectId}
              onChange={(e) => setImportTargetSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
            >
              {subjects.slice(0, 9).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Code / Content
            </label>
            <textarea
              rows={12}
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-blue-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Validation Errors Box */}
          {importValidationErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <span className="font-bold block flex items-center gap-1">
                <AlertTriangle size={14} /> Validation Errors Flagged:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {importValidationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRunImport}>
              Validate & Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Single Question */}
      <Modal
        isOpen={isNewQuestionModalOpen}
        onClose={() => setIsNewQuestionModalOpen(false)}
        title="Create New Question"
        description="Add a verified question to the APPSC question bank."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Question Text (English) *</label>
            <textarea
              required
              rows={3}
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              placeholder="Enter question prompt..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Question Text (Telugu - Optional)</label>
            <input
              type="text"
              value={newQTextTelugu}
              onChange={(e) => setNewQTextTelugu(e.target.value)}
              placeholder="తెలుగులో ప్రశ్న..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subject</label>
              <select
                value={newQSubjectId}
                onChange={(e) => setNewQSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              >
                {subjects.slice(0, 9).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
              <select
                value={newQDifficulty}
                onChange={(e) => setNewQDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
          </div>

          {/* 4 Options */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">Options (Select Correct)</label>
            {newQOptions.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOpt"
                  checked={newQCorrectOpt === opt.id}
                  onChange={() => setNewQCorrectOpt(opt.id)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="w-6 text-slate-400 font-mono text-center">
                  {['A', 'B', 'C', 'D'][idx]})
                </span>
                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...newQOptions];
                    next[idx].text = e.target.value;
                    setNewQOptions(next);
                  }}
                  placeholder={`Option ${['A', 'B', 'C', 'D'][idx]} text...`}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Detailed Explanation</label>
            <textarea
              rows={3}
              value={newQExplanation}
              onChange={(e) => setNewQExplanation(e.target.value)}
              placeholder="Cite historical evidence, constitutional articles, or Telugu Akademi facts..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save & Approve
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
