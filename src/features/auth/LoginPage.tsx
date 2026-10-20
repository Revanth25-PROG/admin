import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Globe,
  KeyRound,
} from 'lucide-react';
import { useStudyVerse } from '../../hooks/useStudyVerse';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, isUsingSupabase } = useStudyVerse();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState(profile.email || 'sravan.studyverse@example.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState(profile.name || 'Sravan Kumar');
  const [role, setRole] = useState<'student' | 'admin' | 'examiner'>('student');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
    });
    setStatusMsg(`Signed in as ${name} (${role.toUpperCase()}) successfully!`);
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  const handleDemoLogin = (demoRole: 'student' | 'admin') => {
    if (demoRole === 'admin') {
      setName('Platform Administrator');
      setEmail('admin.studyverse@example.com');
      setRole('admin');
      updateProfile({
        name: 'Platform Administrator',
        email: 'admin.studyverse@example.com',
      });
      navigate('/admin/inventory');
    } else {
      setName('Sravan Kumar');
      setEmail('sravan.appsc@example.com');
      setRole('student');
      updateProfile({
        name: 'Sravan Kumar',
        email: 'sravan.appsc@example.com',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 mx-auto">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            APPSC STUDYVERSE
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your persistent 9-subject question bank, mock test engine, and analytics studio.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-[#101726] border-slate-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Mode Switcher */}
            <div className="flex border-b border-slate-800 pb-2 mb-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 font-bold uppercase tracking-wider text-[11px] text-center border-b-2 transition-all ${
                  mode === 'signin'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 font-bold uppercase tracking-wider text-[11px] text-center border-b-2 transition-all ${
                  mode === 'register'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sravan Kumar"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@studyverse.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {statusMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{statusMsg}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full mt-2">
              {mode === 'signin' ? 'Sign In to Workspace' : 'Create Student Account'}
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 text-[11px] block font-semibold text-center">
              Instant 1-Click Access Roles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-blue-500 hover:text-white transition-all text-center"
              >
                <div className="font-bold text-white text-[11px]">Student Mode</div>
                <div className="text-[10px] text-slate-500">Full Prelims/Mains</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500 hover:text-white transition-all text-center"
              >
                <div className="font-bold text-white text-[11px]">Admin Mode</div>
                <div className="text-[10px] text-slate-500">Question Bank & Inventory</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Backend Connectivity Status Pill */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Globe size={12} className="text-emerald-400" />
          <span>Synced with Render: <code className="text-slate-400">admin-feq0.onrender.com</code></span>
        </div>
      </div>
    </div>
  );
};
