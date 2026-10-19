import React, { useState } from 'react';
import {
  Settings,
  User,
  Clock,
  Palette,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle,
  Copy,
  AlertTriangle,
  Code2,
  Server,
  Globe,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  HelpCircle,
  Terminal,
  Check,
  Zap,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AvailabilityRule, SchedulingMode } from '../../types';
import { backendConfig, BackendType } from '../../services/backendConfig';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    availabilityRules,
    isUsingSupabase,
    updateProfile,
    updateAvailabilityRules,
    resetToSampleData,
    clearAllUserData,
    exportDataAsJson,
    importDataFromJson,
    pushToRemote,
    pullFromRemote,
  } = useStudyVerse();

  // Profile Form
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [targetExam, setTargetExam] = useState(profile.targetExam);
  const [dailyGoalHours, setDailyGoalHours] = useState(profile.dailyGoalHours);
  const [appscRatio, setAppscRatio] = useState(profile.studySplitRatio.appsc);

  // Availability Rules Form (clone)
  const [rules, setRules] = useState<AvailabilityRule[]>([...availabilityRules]);

  // Backend Connection Management State
  const initialBackendConfig = backendConfig.getConfig();
  const [backendType, setBackendType] = useState<BackendType>(initialBackendConfig.backendType);
  const [backendUrl, setBackendUrl] = useState(initialBackendConfig.backendUrl || '');
  const [apiKey, setApiKey] = useState(initialBackendConfig.apiKey || '');
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    details?: any;
  } | null>(null);
  const [backendNotice, setBackendNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'render' | 'railway' | 'local' | 'supabase'>('render');

  // Import / Export states
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Save profile settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      targetExam: targetExam.trim(),
      dailyGoalHours,
      studySplitRatio: {
        appsc: appscRatio,
        semester: 100 - appscRatio,
      },
    });
    alert('Profile & study preferences updated successfully!');
  };

  // Availability rules update
  const handleUpdateRuleHours = (dayIndex: number, hours: number) => {
    const updated = rules.map((r) =>
      r.dayOfWeek === dayIndex ? { ...r, availableHours: hours } : r
    );
    setRules(updated);
    updateAvailabilityRules(updated);
  };

  const handleToggleRestDay = (dayIndex: number) => {
    const updated = rules.map((r) =>
      r.dayOfWeek === dayIndex ? { ...r, isRestDay: !r.isRestDay } : r
    );
    setRules(updated);
    updateAvailabilityRules(updated);
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyverse-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = importDataFromJson(importJsonText);
    if (success) {
      alert('STUDYVERSE data imported successfully!');
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      alert('Failed to import JSON data. Please ensure it adheres to STUDYVERSE schema.');
    }
  };

  // Test connection to backend
  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    setTestResult(null);
    setBackendNotice(null);
    try {
      const res = await backendConfig.testConnection(backendUrl, backendType, apiKey);
      setTestResult(res);
      if (res.success) {
        backendConfig.saveConfig({
          backendType,
          backendUrl,
          apiKey,
          isConnected: true,
          lastPingMs: res.latencyMs,
          lastCheckedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err?.message || 'Connection test failed',
      });
    } finally {
      setIsTestingBackend(false);
    }
  };

  // Save backend configuration
  const handleSaveBackendConfig = () => {
    backendConfig.saveConfig({
      backendType,
      backendUrl: backendUrl.trim(),
      apiKey: apiKey.trim(),
      isConnected: testResult?.success || false,
    });
    setBackendNotice({
      type: 'success',
      message: `Backend configuration saved! Active mode: ${
        backendType === 'custom_api'
          ? 'Custom REST Backend'
          : backendType === 'supabase'
          ? 'Supabase Cloud'
          : 'Local Demo Mode'
      }`,
    });
    setTimeout(() => setBackendNotice(null), 5000);
  };

  // Push local data to remote (Seed Remote DB)
  const handlePushData = async () => {
    setIsPushing(true);
    setBackendNotice(null);
    try {
      const res = await pushToRemote();
      setBackendNotice({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: any) {
      setBackendNotice({
        type: 'error',
        message: err?.message || 'Failed to push data to remote backend.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  // Pull remote data
  const handlePullData = async () => {
    setIsPulling(true);
    setBackendNotice(null);
    try {
      const res = await pullFromRemote();
      setBackendNotice({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: any) {
      setBackendNotice({
        type: 'error',
        message: err?.message || 'Failed to pull data from remote backend.',
      });
    } finally {
      setIsPulling(false);
    }
  };

  // Reset to Local Demo Mode
  const handleResetToLocalMode = () => {
    if (window.confirm('Switch back to Offline-First Local Demo Mode?')) {
      backendConfig.resetToDefault();
      const updated = backendConfig.getConfig();
      setBackendType(updated.backendType);
      setBackendUrl(updated.backendUrl || '');
      setApiKey(updated.apiKey || '');
      setTestResult(null);
      setBackendNotice({
        type: 'info',
        message: 'Switched back to Local Demo Mode (Browser localStorage persistence).',
      });
      setTimeout(() => setBackendNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Settings & Data Management
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Owner profile controls, weekly study availability rules, Supabase credentials, and database backups.
        </p>
      </div>

      {/* Profile & Target Goals */}
      <Card className="bg-[#101726]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-400" />
            <CardTitle className="text-sm md:text-base">Student Profile & Exam Objectives</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Examinations</label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g. APPSC Group 2 Prelims & B.Tech Sem 6"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Daily Study Target Goal (Hours)</label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300">Preparation Allocation Split Ratio</span>
              <span className="font-semibold text-blue-400">
                {appscRatio}% APPSC : {100 - appscRatio}% Semester
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={appscRatio}
              onChange={(e) => setAppscRatio(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Availability Rules Table */}
      <Card className="bg-[#101726]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-teal-400" />
            <CardTitle className="text-sm md:text-base">Weekly Study Availability Rules</CardTitle>
          </div>
          <span className="text-xs text-slate-400">Used by Smart Day Allocator engine</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Day of Week</th>
                <th className="px-4 py-3">Available Hours</th>
                <th className="px-4 py-3">Rest Day</th>
                <th className="px-4 py-3">Preferred Windows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((r) => (
                <tr key={r.dayOfWeek} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    {dayNames[r.dayOfWeek]}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="16"
                      step="0.5"
                      disabled={r.isRestDay}
                      value={r.availableHours}
                      onChange={(e) => handleUpdateRuleHours(r.dayOfWeek, Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100 disabled:opacity-40"
                    />{' '}
                    hrs
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={r.isRestDay}
                      onChange={() => handleToggleRestDay(r.dayOfWeek)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {r.preferredSlots.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Backend & Data Persistence Management */}
      <Card className="bg-[#101726] border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-blue-400" />
              <CardTitle className="text-sm md:text-base">Backend Connection & Cloud Persistence</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {backendType === 'custom_api' && (
                <Badge variant={testResult?.success ? 'emerald' : backendUrl ? 'amber' : 'blue'}>
                  {testResult?.success
                    ? '● Custom REST Connected'
                    : backendUrl
                    ? '○ Configured (Untested)'
                    : '○ No Backend URL'}
                </Badge>
              )}
              {backendType === 'supabase' && (
                <Badge variant={isUsingSupabase ? 'emerald' : 'amber'}>
                  {isUsingSupabase ? '● Supabase PostgreSQL Synced' : '○ Supabase Credentials Needed'}
                </Badge>
              )}
              {backendType === 'local_demo' && (
                <Badge variant="blue">● Local Demo Mode (Offline-First)</Badge>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Connect any backend deployment link you provide (Node.js/Express, Python/FastAPI, Render, Railway, Fly.io) or Supabase Cloud to persist all 150 syllabus topics, question banks, mock exams, and analytics in the cloud.
          </span>
        </CardHeader>

        <div className="space-y-5">
          {/* Backend Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Persistence Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBackendType('custom_api')}
                className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all ${
                  backendType === 'custom_api'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-200 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-100 mb-1">
                  <Globe size={14} className={backendType === 'custom_api' ? 'text-blue-400' : 'text-slate-400'} />
                  <span>Custom REST API</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  Provide your Render, Railway, Fly.io, or VPS URL
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBackendType('supabase')}
                className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all ${
                  backendType === 'supabase'
                    ? 'bg-teal-600/15 border-teal-500 text-teal-200 shadow-sm shadow-teal-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-100 mb-1">
                  <Database size={14} className={backendType === 'supabase' ? 'text-teal-400' : 'text-slate-400'} />
                  <span>Supabase PostgreSQL</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  Direct database sync via Supabase credentials
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBackendType('local_demo')}
                className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all ${
                  backendType === 'local_demo'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-100 mb-1">
                  <Zap size={14} className={backendType === 'local_demo' ? 'text-indigo-400' : 'text-slate-400'} />
                  <span>Local Demo Mode</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  Offline-first persistence via browser localStorage
                </span>
              </button>
            </div>
          </div>

          {/* CUSTOM REST API CONFIGURATION */}
          {backendType === 'custom_api' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Backend Link / Base URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={(e) => {
                      setBackendUrl(e.target.value);
                      setTestResult(null);
                    }}
                    placeholder="https://your-backend.onrender.com or https://studyverse-api.railway.app"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">Quick link presets:</span>
                  <button
                    type="button"
                    onClick={() => setBackendUrl('http://localhost:5000')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-300 font-mono"
                  >
                    http://localhost:5000 (Local Server)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackendUrl('https://studyverse-backend.onrender.com')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-300 font-mono"
                  >
                    Render Example URL
                  </button>
                  {backendUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setBackendUrl('');
                        setTestResult(null);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-rose-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  API Key / Bearer Auth Token <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Bearer token if authentication is enabled"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!backendUrl.trim() || isTestingBackend}
                  icon={isTestingBackend ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
                  onClick={handleTestBackend}
                >
                  {isTestingBackend ? 'Testing Connection...' : 'Test Connection'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Check size={14} />}
                  onClick={handleSaveBackendConfig}
                >
                  Save Configuration
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!backendUrl.trim() || isPushing}
                  icon={isPushing ? <RefreshCw size={14} className="animate-spin" /> : <ArrowUpFromLine size={14} />}
                  onClick={handlePushData}
                  title="Upload all local syllabus topics, question banks, and tests to the backend database"
                >
                  {isPushing ? 'Pushing Data...' : 'Push Local Data to Remote (Seed DB)'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!backendUrl.trim() || isPulling}
                  icon={isPulling ? <RefreshCw size={14} className="animate-spin" /> : <ArrowDownToLine size={14} />}
                  onClick={handlePullData}
                  title="Download the latest state from your remote backend"
                >
                  {isPulling ? 'Pulling Data...' : 'Pull Remote Data'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToLocalMode}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Revert to Local Mode
                </Button>
              </div>

              {/* Live Test Connection Result Banner */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-semibold text-white">
                      {testResult.success ? 'Backend Connection Successful!' : 'Connection Check Failed'}
                    </div>
                    <div className="text-slate-300 leading-relaxed">{testResult.message}</div>
                    {testResult.latencyMs > 0 && (
                      <div className="text-[11px] text-slate-400">
                        Ping Latency: <span className="font-mono text-emerald-400">{testResult.latencyMs}ms</span>
                        {testResult.details?.uptimeSeconds && (
                          <span className="ml-3">
                            Uptime: <span className="font-mono text-slate-300">{testResult.details.uptimeSeconds}s</span>
                          </span>
                        )}
                        {testResult.details?.version && (
                          <span className="ml-3">
                            Backend Version: <span className="font-mono text-slate-300">{testResult.details.version}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUPABASE CONFIGURATION */}
          {backendType === 'supabase' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">Supabase Cloud PostgreSQL Connection</span>
                <Badge variant={isUsingSupabase ? 'emerald' : 'amber'}>
                  {isUsingSupabase ? 'Credentials Detected' : 'Missing Credentials'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                STUDYVERSE connects directly to your Supabase project using the official client SDK. Provide your credentials in an <code className="text-teal-300 font-mono">.env</code> file:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-teal-300 border border-slate-800">
                <div>VITE_SUPABASE_URL=https://your-project-id.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Code2 size={14} />}
                  onClick={() => setIsSchemaModalOpen(true)}
                >
                  View PostgreSQL SQL Schema (supabase/schema.sql)
                </Button>
              </div>
            </div>
          )}

          {/* LOCAL DEMO MODE */}
          {backendType === 'local_demo' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="font-semibold text-white text-xs">Offline-First Local Demo Mode</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                STUDYVERSE is completely operational in standalone offline mode. All 150 syllabus topics, question banks, study plans, custom mock tests, and analytics are saved securely in your browser's <code className="text-blue-300 font-mono">localStorage</code>. No network connection or external database is required.
              </p>
            </div>
          )}

          {/* Feedback Notice Banner */}
          {backendNotice && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                backendNotice.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : backendNotice.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
              }`}
            >
              {backendNotice.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
              {backendNotice.type === 'error' && <XCircle size={16} className="text-rose-400 shrink-0" />}
              {backendNotice.type === 'info' && <HelpCircle size={16} className="text-blue-400 shrink-0" />}
              <span>{backendNotice.message}</span>
            </div>
          )}

          {/* Collapsible Backend Deployment Guide */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-900/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-blue-400" />
                <span className="font-medium">How to deploy the backend in 2 minutes (Render, Railway, Docker, Local)</span>
              </div>
              <span className="text-blue-400 text-xs font-semibold">
                {showDeploymentGuide ? 'Hide Guide' : 'View Instructions'}
              </span>
            </button>

            {showDeploymentGuide && (
              <div className="mt-2.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-3">
                <div className="flex gap-2 border-b border-slate-800 pb-2">
                  {(['render', 'railway', 'local', 'supabase'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveGuideTab(tab)}
                      className={`px-3 py-1 rounded text-xs capitalize font-medium transition-colors ${
                        activeGuideTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'render' ? 'Render (Recommended)' : tab === 'railway' ? 'Railway' : tab === 'local' ? 'Local Server' : 'Supabase'}
                    </button>
                  ))}
                </div>

                {activeGuideTab === 'render' && (
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white">Deploy on Render (Free & Fast):</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Push your repository to GitHub.</li>
                      <li>Go to <span className="text-blue-300">dashboard.render.com</span> & click <span className="text-white">New + Web Service</span>.</li>
                      <li>Select your repo, set Root Directory to <code className="text-blue-300 font-mono">server</code>.</li>
                      <li>Build Command: <code className="text-blue-300 font-mono">npm install</code> | Start Command: <code className="text-blue-300 font-mono">npm start</code>.</li>
                      <li>Or use the included Blueprint in <code className="text-blue-300 font-mono">server/render.yaml</code> for automated 1-click deployment!</li>
                      <li>Copy your live URL (e.g. <code className="text-blue-300 font-mono">https://studyverse-backend.onrender.com</code>) and paste it into the Backend Link field above!</li>
                    </ol>
                  </div>
                )}

                {activeGuideTab === 'railway' && (
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white">Deploy on Railway / Fly.io / Container:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>In Railway, create a new project from your repo.</li>
                      <li>Set root directory to <code className="text-blue-300 font-mono">server</code> or use the included <code className="text-blue-300 font-mono">server/Dockerfile</code>.</li>
                      <li>Railway will generate a public domain (e.g. <code className="text-blue-300 font-mono">https://studyverse.up.railway.app</code>).</li>
                      <li>Paste that domain into the Backend Link field above and click "Test Connection".</li>
                    </ol>
                  </div>
                )}

                {activeGuideTab === 'local' && (
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white">Run Node.js Server Locally:</p>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-blue-300">
                      cd server<br />
                      npm install<br />
                      npm start
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      The server runs on port 5000 (<code className="text-blue-300">http://localhost:5000</code>). Click the preset button above to test!
                    </p>
                  </div>
                )}

                {activeGuideTab === 'supabase' && (
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white">Supabase Cloud PostgreSQL Setup:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Create a new project at <span className="text-blue-300">supabase.com</span>.</li>
                      <li>Navigate to the SQL Editor and run the script in <code className="text-blue-300 font-mono">supabase/schema.sql</code>.</li>
                      <li>Copy your project URL and anon public key into <code className="text-blue-300 font-mono">.env</code>.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Backup, Restore & Reset Buttons */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2">Local Workspace & Backup Controls</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={14} />}
                onClick={handleExportJson}
              >
                Export Full Backup (JSON)
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<Upload size={14} />}
                onClick={() => setIsImportModalOpen(true)}
              >
                Import Backup (JSON)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw size={14} />}
                onClick={() => {
                  if (window.confirm('Reset all topics, plans, and tests to illustrative sample data?')) {
                    resetToSampleData();
                    alert('Reset to sample data completed.');
                  }
                }}
              >
                Reset Sample Data
              </Button>

              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setIsClearConfirmOpen(true)}
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal: View PostgreSQL Schema */}
      <Modal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        title="PostgreSQL Database Schema (supabase/schema.sql)"
        description="Run this DDL script in your Supabase SQL editor to create all tables and RLS policies."
        maxWidth="4xl"
      >
        <div className="space-y-3">
          <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-blue-300 border border-slate-800 whitespace-pre">
{`-- STUDYVERSE Database Tables Summary:
-- 1. profiles (id, name, target_exam, daily_goal_hours, appsc_ratio, semester_ratio)
-- 2. availability_rules (user_id, day_of_week, available_hours, preferred_slots)
-- 3. subjects (user_id, track, code, name, name_telugu, target_hours)
-- 4. syllabus_topics (user_id, subject_id, track, title, title_telugu, status, progress_percent)
-- 5. study_plans (user_id, title, track, start_date, target_completion_date, mode)
-- 6. study_tasks (user_id, plan_id, topic_id, date, duration_minutes, is_completed)
-- 7. resources (user_id, title, type, content, is_verified, is_bookmarked)
-- 8. mock_tests (user_id, title, track, duration_minutes, negative_marks)
-- 9. mock_questions (test_id, question_text, correct_option_id, explanation)
-- 10. test_attempts (user_id, test_id, score, accuracy, answers_json)
-- 11. revision_items (user_id, topic_id, repetition_stage, next_due_date)
-- 12. calendar_events (user_id, title, date, type, color)`}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              variant="primary"
              size="sm"
              icon={<Copy size={14} />}
              onClick={() => {
                navigator.clipboard.writeText('-- Run supabase/schema.sql in your Supabase SQL Editor');
                alert('Schema reference path copied! Check supabase/schema.sql in the project.');
              }}
            >
              Copy Reference
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Import Data */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import STUDYVERSE Backup JSON"
        description="Paste JSON content exported from STUDYVERSE to restore your study plans, notes, and tests."
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <textarea
            rows={8}
            required
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder='Paste JSON: { "profile": { ... }, "topics": [ ... ] }'
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Validate & Import
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Clear Workspace */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Clear All Study Data?"
        description="This will erase all existing tasks, plans, and test attempts to create a blank workspace."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>
              Warning: This action clears all local records. Export a JSON backup first if you wish to keep your data.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                clearAllUserData();
                setIsClearConfirmOpen(false);
                alert('Workspace cleared. You now have a blank slate.');
              }}
            >
              Confirm Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
