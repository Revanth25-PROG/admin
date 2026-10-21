import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  Database,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, DifficultyBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  validateAndReportMockTestsJson,
  getSampleSectionMockTestsJson,
  JsonValidationReport,
} from '../../services/questionBankEngine';

export const AdminImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { bankQuestions, saveBankQuestion, subjects, topics } = useStudyVerse();

  const [rawJson, setRawJson] = useState<string>('');
  const [report, setReport] = useState<JsonValidationReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [fileFoundOnDisk, setFileFoundOnDisk] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'report' | 'preview'>('upload');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [searchPreview, setSearchPreview] = useState('');

  // Check whether appsc_group2_section_mock_tests.json exists in public/data or server/data
  useEffect(() => {
    async function checkFileOnDisk() {
      try {
        const res = await fetch('/data/appsc_group2_section_mock_tests.json');
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().startsWith('[') || text.trim().startsWith('{')) {
            setFileFoundOnDisk(true);
            setRawJson(text);
            const initialReport = validateAndReportMockTestsJson(text, bankQuestions);
            setReport(initialReport);
            return;
          }
        }
      } catch {
        // file not found
      }
      setFileFoundOnDisk(false);
    }

    checkFileOnDisk();
  }, [bankQuestions]);

  const handleRunAudit = () => {
    if (!rawJson.trim()) {
      alert('Please paste or load JSON content before running the audit.');
      return;
    }
    setIsAuditing(true);
    setTimeout(() => {
      const rep = validateAndReportMockTestsJson(rawJson, bankQuestions);
      setReport(rep);
      setIsAuditing(false);
      setActiveTab('report');
    }, 250);
  };

  const handleLoadSample = () => {
    const sample = getSampleSectionMockTestsJson();
    setRawJson(sample);
    const rep = validateAndReportMockTestsJson(sample, bankQuestions);
    setReport(rep);
    setActiveTab('report');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawJson(content);
      const rep = validateAndReportMockTestsJson(content, bankQuestions);
      setReport(rep);
      setActiveTab('report');
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (!report || report.questions.length === 0) {
      alert('No valid questions to import.');
      return;
    }

    setIsImporting(true);
    let count = 0;
    try {
      for (const q of report.questions) {
        saveBankQuestion(q);
        count++;
      }
      setImportSuccessMessage(
        `Successfully imported ${count} validated questions into the active Question Bank across the 9 syllabus sections!`
      );
      setTimeout(() => setImportSuccessMessage(null), 8000);
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const sample = getSampleSectionMockTestsJson();
    const blob = new Blob([sample], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appsc_group2_section_mock_tests.sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Admin & Data Studio
            </span>
            <Badge variant="blue">JSON Audit Engine</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Section Mock Tests Import & Validation Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Import, validate, and integrity-check <code className="text-blue-300">appsc_group2_section_mock_tests.json</code> conforming to Section 5 standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleDownloadSample}
          >
            Download Schema Template
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Database size={14} />}
            onClick={() => navigate('/admin/questions')}
          >
            Question Bank ({bankQuestions.length})
          </Button>
        </div>
      </div>

      {/* File Detection Status Banner */}
      {fileFoundOnDisk === false && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-200">
              Seed File <code>appsc_group2_section_mock_tests.json</code> Not Found on Server Disk
            </h4>
            <p className="text-slate-300 leading-relaxed">
              To seed the application automatically, place your file at{' '}
              <code className="text-blue-300 font-mono bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                public/data/appsc_group2_section_mock_tests.json
              </code>{' '}
              or upload/paste its contents below. The system will never fabricate an import result without validating your real file.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleLoadSample}
                icon={<Sparkles size={14} />}
              >
                Load Verified 9-Section Starter Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {fileFoundOnDisk === true && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-emerald-200">
              Found <code>appsc_group2_section_mock_tests.json</code> on Server Disk
            </h4>
            <p className="text-slate-300">
              The seed file was located in the public data folder and loaded into the audit engine below.
            </p>
          </div>
        </div>
      )}

      {importSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{importSuccessMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Upload size={14} />
          <span>1. Paste / Upload JSON</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>2. Validation Report</span>
          {report && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                report.isValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {report.validCount} valid
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Eye size={14} />
          <span>3. Question Preview</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD / PASTE */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <Card className="bg-[#101726]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div>
                  <CardTitle>JSON Input (Section 5 Schema)</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts questions formatted as <code>{'{"id": "...", "q": "...", "options": {"A": "...", ...}, "ans": "B", "explanation": "..."}'}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors">
                      <Upload size={14} />
                      Choose File (.json)
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 size={14} />}
                    onClick={handleRunAudit}
                    disabled={isAuditing || !rawJson.trim()}
                  >
                    {isAuditing ? 'Auditing JSON...' : 'Run Validation Audit'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <div className="space-y-2">
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder={`Paste your JSON question bank here, e.g.:\n[\n  {\n    "id": "MUG001",\n    "q": "Which Mughal emperor instituted the Mansabdari system?",\n    "options": {\n      "A": "Babur",\n      "B": "Akbar",\n      "C": "Jahangir",\n      "D": "Shah Jahan"\n    },\n    "ans": "B",\n    "explanation": "Akbar introduced the Mansabdari system in 1571 CE to organize civil and military administration.",\n    "topic": "Mughal Empire",\n    "difficulty": "easy",\n    "marks": 1,\n    "negative_marks": 0.33\n  }\n]`}
                rows={16}
                className="w-full p-4 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Characters: {rawJson.length.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => setRawJson('')}
                  className="text-slate-500 hover:text-slate-300 underline cursor-pointer"
                >
                  Clear Editor
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: VALIDATION REPORT */}
      {activeTab === 'report' && report && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Total Parsed</span>
              <span className="text-xl font-bold text-white">{report.totalParsed}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Questions detected</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Valid & Verified</span>
              <span className="text-xl font-bold text-emerald-400">{report.validCount}</span>
              <span className="text-[10px] text-emerald-500 block mt-0.5">100% compliant</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Invalid / Errors</span>
              <span className={`text-xl font-bold ${report.invalidCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {report.invalidCount}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Missing fields or keys</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Unique IDs</span>
              <span className="text-xl font-bold text-blue-400">{report.uniqueIdsCount}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {report.duplicateIds.length === 0 ? 'No duplicate IDs' : `${report.duplicateIds.length} duplicate IDs`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">4-Option Check</span>
              <span className="text-xl font-bold text-indigo-400">
                {report.totalParsed - report.invalidOptionCounts.length} / {report.totalParsed}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">MCQ A, B, C, D</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Duplicates</span>
              <span className={`text-xl font-bold ${report.duplicateQuestions.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {report.duplicateQuestions.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Fingerprint checks</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-xl bg-[#101726] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Validation Status</h3>
              <p className="text-xs text-slate-400">
                {report.isValid
                  ? 'All question items passed the validation tests and are ready to be imported into the active Question Bank.'
                  : `${report.invalidCount} question items contain errors. You can still import the ${report.validCount} valid questions.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                icon={<Database size={16} />}
                onClick={handleCommitImport}
                disabled={isImporting || report.validCount === 0}
              >
                {isImporting ? 'Importing Questions...' : `Import ${report.validCount} Valid Questions`}
              </Button>
            </div>
          </div>

          {/* Detailed Audit Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 9-Section Syllabus Distribution */}
            <Card className="bg-[#101726]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-400" />
                  <CardTitle>9-Section Syllabus Distribution</CardTitle>
                </div>
              </CardHeader>

              <div className="space-y-2">
                {report.sectionBreakdown.map((sec) => (
                  <div
                    key={sec.sectionName}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{sec.sectionName}</span>
                      <span className="text-[10px] text-slate-500 block capitalize">{sec.examStage}</span>
                    </div>
                    <Badge variant={sec.examStage === 'screening' ? 'blue' : 'violet'}>
                      {sec.count} Questions
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Diagnostics & Error Log */}
            <Card className="bg-[#101726]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <CardTitle>Integrity Checks & Flagged Items</CardTitle>
                </div>
              </CardHeader>

              <div className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
                {report.duplicateIds.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <XCircle size={14} /> Duplicate IDs Detected ({report.duplicateIds.length})
                    </span>
                    <p className="text-[11px]">{report.duplicateIds.join(', ')}</p>
                  </div>
                )}

                {report.duplicateQuestions.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Duplicate Question Texts Detected ({report.duplicateQuestions.length})
                    </span>
                    {report.duplicateQuestions.map((d, i) => (
                      <p key={i} className="text-[11px] truncate">
                        • [{d.id}] {d.text}
                      </p>
                    ))}
                  </div>
                )}

                {report.missingFields.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <XCircle size={14} /> Missing Required Fields ({report.missingFields.length})
                    </span>
                    {report.missingFields.slice(0, 5).map((m, i) => (
                      <p key={i} className="text-[11px]">
                        • [{m.id}] Missing: {m.missing.join(', ')}
                      </p>
                    ))}
                  </div>
                )}

                {report.invalidOptionCounts.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <XCircle size={14} /> Questions Without 4 Options ({report.invalidOptionCounts.length})
                    </span>
                    {report.invalidOptionCounts.slice(0, 5).map((o, i) => (
                      <p key={i} className="text-[11px]">
                        • [{o.id}] Found {o.count} options instead of required 4.
                      </p>
                    ))}
                  </div>
                )}

                {report.invalidAnswerKeys.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <XCircle size={14} /> Invalid Answer Keys ({report.invalidAnswerKeys.length})
                    </span>
                    {report.invalidAnswerKeys.slice(0, 5).map((a, i) => (
                      <p key={i} className="text-[11px]">
                        • [{a.id}] ans: "{a.ans}" does not match options A, B, C, or D.
                      </p>
                    ))}
                  </div>
                )}

                {report.missingExplanations.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Missing Explanations ({report.missingExplanations.length})
                    </span>
                    <p className="text-[11px]">
                      {report.missingExplanations.map((e) => e.id).join(', ')}
                    </p>
                  </div>
                )}

                {report.duplicateIds.length === 0 &&
                  report.duplicateQuestions.length === 0 &&
                  report.missingFields.length === 0 &&
                  report.invalidOptionCounts.length === 0 &&
                  report.invalidAnswerKeys.length === 0 &&
                  report.missingExplanations.length === 0 && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center py-8">
                      <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                      <p className="font-bold">Zero Validation Errors Found!</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        All question items comply with official schema requirements, 4 options, unique IDs, and answer keys.
                      </p>
                    </div>
                  )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTION PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchPreview}
                onChange={(e) => setSearchPreview(e.target.value)}
                placeholder="Search parsed questions..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={previewFilter}
                onChange={(e) => setPreviewFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Parsed ({report?.questions.length || 0})</option>
                <option value="valid">Valid Questions</option>
                <option value="invalid">Invalid Items</option>
              </select>
            </div>
          </div>

          {!report || report.questions.length === 0 ? (
            <EmptyState
              icon={<FileCode size={24} />}
              title="No Questions Loaded"
              description="Paste or upload JSON in Step 1, or click 'Load Verified 9-Section Starter Data' to preview questions."
              actionLabel="Load Starter Data"
              onAction={handleLoadSample}
            />
          ) : (
            <div className="space-y-3">
              {report.questions
                .filter((q) => {
                  const matchSearch =
                    !searchPreview ||
                    q.questionText.toLowerCase().includes(searchPreview.toLowerCase()) ||
                    q.id.toLowerCase().includes(searchPreview.toLowerCase());
                  return matchSearch;
                })
                .slice(0, 50)
                .map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {q.id}
                        </span>
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span className="text-xs text-slate-400 font-medium">{q.topicId}</span>
                      </div>
                      <Badge variant="blue">Ans: {q.correctAnswer}</Badge>
                    </div>

                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt) => {
                        const isCorrect = opt.id === q.correctAnswer;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 font-medium'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>
                              <strong className="mr-1.5 font-mono text-slate-400">[{opt.id}]</strong>
                              {opt.text}
                            </span>
                            {isCorrect && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/30 text-xs text-slate-300 space-y-1">
                        <span className="text-[11px] font-bold text-blue-300">Explanation:</span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
