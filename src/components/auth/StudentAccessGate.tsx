import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Atom,
  Award,
  FileText,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentAccessGateProps {
  onOpenAdminLogin: () => void;
}

export const StudentAccessGate: React.FC<StudentAccessGateProps> = ({ onOpenAdminLogin }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendResetPassword, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      const targetEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail.toLowerCase()}@student.studyhub.edu`;

      if (tab === 'signin') {
        if (!cleanEmail || !password) {
          throw new Error('Please enter both your email/student ID and password.');
        }
        await signInWithEmail(targetEmail, password);
      } else {
        if (!cleanEmail || !password) {
          throw new Error('Please fill in all registration fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(name.trim() || 'Student', targetEmail, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in failed. Please try email sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address to receive password reset instructions.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendResetPassword(email.trim());
      setResetSent(true);
      setShowForgot(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with brand and Admin link */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">Studyhub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CBSE Class 10
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Learn Smart. Practice More. Achieve More.</p>
          </div>
        </div>

        <button
          onClick={onOpenAdminLogin}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-semibold transition-all hover:scale-101 shadow-sm"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Administrator Login</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 relative z-10">
        
        {/* Left Side: Educational Platform Highlights */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Student Login Required for Course Access</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Master CBSE Class 10 <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Mathematics & Science
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Sign in with your student account to unlock all 14 Mathematics chapters, 13 Science chapters, 
            interactive chapter quizzes, formula sheets, and verified PDF library.
          </p>

          {/* Curriculum feature badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">14 Mathematics Chapters</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Real Numbers, Trigonometry, Quadratic Equations & more</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                <Atom className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Comprehensive Science</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Physics, Chemistry, and Biology concept breakdowns</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Interactive MCQ Quizzes</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant timer, step-by-step solutions, and progress tracking</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Downloadable PDF Library</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">NCERT solutions, formula handbooks, and exemplar questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Student Access Card */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          
          {/* Card Title & Mode Switcher */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {tab === 'signin' ? 'Student Sign In' : 'Create Student Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tab === 'signin'
                    ? 'Enter your student credentials to continue'
                    : 'Get free instant access to CBSE Class 10 materials'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Toggle tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className={`py-2 rounded-lg transition-all ${
                  tab === 'signin'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError(null);
                }}
                className={`py-2 rounded-lg transition-all ${
                  tab === 'signup'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Reset password notification */}
          {resetSent && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>Password reset link sent to your email address. Check your inbox!</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google 1-Click Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Student Google Account</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              or use student email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(!showForgot)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {showForgot && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-fade-in">
                <p className="text-[11px] text-slate-400">
                  Enter your email above and click below to receive a password reset link.
                </p>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700"
                >
                  Send Password Reset Link
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-101 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'signin' ? 'Sign In & Enter Studyhub' : 'Create Student Account & Enter'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick guest exploration button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Explore as Guest Student (Instant Free Access)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Instant access • Browse all 27 chapters, quizzes, formula notes & PDFs
            </p>
          </div>

          {/* Bottom admin switcher */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              onClick={onOpenAdminLogin}
              className="text-xs text-slate-400 hover:text-amber-400 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Are you an Administrator? Access Admin Portal</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="border-t border-slate-800/60 py-4 px-4 text-center text-xs text-slate-500">
        Studyhub • Dedicated Educational Platform for CBSE Class 10 Students • Authenticated & Secured by Firebase
      </footer>
    </div>
  );
};
