import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  Calculator,
  Atom,
  Clock,
  TrendingUp,
  FileText,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { StudentProgress, QuizAttempt, Chapter, Lesson, PdfDocument } from '../types';
import { getUserProgress, getUserQuizAttempts, getChapters, getLessons, getPdfDocuments } from '../services/contentService';
import { useAuth } from '../context/AuthContext';

interface StudentDashboardPageProps {
  onSelectChapter: (chapterId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onStartQuiz: (chapterId: string) => void;
  onPreviewPdf: (pdf: PdfDocument) => void;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  onSelectChapter,
  onSelectLesson,
  onStartQuiz,
  onPreviewPdf,
  setCurrentTab,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<StudentProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [recentPdfs, setRecentPdfs] = useState<PdfDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [progs, attempts, chaps, less, pdfs] = await Promise.all([
          getUserProgress(user.uid),
          getUserQuizAttempts(user.uid),
          getChapters(),
          getLessons(),
          getPdfDocuments(),
        ]);
        setProgressList(progs);
        setQuizAttempts(attempts);
        setChapters(chaps);
        setLessons(less);
        setRecentPdfs(pdfs.slice(0, 3));
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Student Dashboard</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sign in to track your CBSE Class 10 learning journey, resume your last studied lesson, and review your practice test scores.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('signin')}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all"
        >
          Sign In to View Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading your student dashboard...</p>
      </div>
    );
  }

  const mathChapters = chapters.filter((c) => c.subjectId === 'math');
  const scienceChapters = chapters.filter((c) => c.subjectId === 'science');

  const completedMathCount = progressList.filter(
    (p) => p.subjectId === 'math' && p.completed
  ).length;
  const completedScienceCount = progressList.filter(
    (p) => p.subjectId === 'science' && p.completed
  ).length;

  const mathPct =
    mathChapters.length > 0 ? Math.round((completedMathCount / mathChapters.length) * 100) : 0;
  const sciPct =
    scienceChapters.length > 0
      ? Math.round((completedScienceCount / scienceChapters.length) * 100)
      : 0;

  // Find last visited lesson
  const lastProgress = [...progressList].sort(
    (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
  )[0];

  const lastLesson = lastProgress?.lastLessonId
    ? lessons.find((l) => l.id === lastProgress.lastLessonId)
    : lessons[0];

  const bestScore = quizAttempts.reduce((max, a) => Math.max(max, a.percentage), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                CBSE Class 10 Scholar
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Welcome back, {user.displayName || user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-slate-300">
              Continue your preparation for Mathematics and Science board examinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentTab('ai-tutor')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Doubt Solver (Gemini)</span>
            </button>
            <button
              onClick={() => setCurrentTab('math')}
              className="px-3.5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Practice Math</span>
            </button>
            <button
              onClick={() => setCurrentTab('science')}
              className="px-3.5 py-2.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Atom className="w-4 h-4" />
              <span>Practice Science</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Math Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mathematics
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{mathPct}%</span>
            <span className="text-xs text-slate-400">
              {completedMathCount} of {mathChapters.length} Chapters
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${mathPct}%` }}
            />
          </div>
        </div>

        {/* Science Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Science
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Atom className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{sciPct}%</span>
            <span className="text-xs text-slate-400">
              {completedScienceCount} of {scienceChapters.length} Chapters
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${sciPct}%` }}
            />
          </div>
        </div>

        {/* Quiz Attempts Counter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tests Taken
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{quizAttempts.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">
              Best: {bestScore > 0 ? `${bestScore}%` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {quizAttempts.length > 0 ? 'Consistent practice yields top ranks' : 'Take your first test'}
          </p>
        </div>

        {/* Total Chapters Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">
              {completedMathCount + completedScienceCount}
            </span>
            <span className="text-xs text-slate-400">of {chapters.length} Total</span>
          </div>
          <p className="text-[11px] text-slate-400">Curriculum milestone tracking</p>
        </div>
      </div>

      {/* Continue Learning Card */}
      {lastLesson && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Continue Learning
            </span>
            <h3 className="text-xl font-bold text-white">{lastLesson.title}</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              {lastLesson.summary || 'Pick up right where you left off with step-by-step examples.'}
            </p>
          </div>
          <button
            onClick={() => onSelectLesson(lastLesson.id)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>Resume Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent Quiz Attempts & Recommended Revision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quiz Attempts Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Quiz Attempts</h3>
            <span className="text-xs text-slate-500">Real Firestore Records</span>
          </div>

          {quizAttempts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">You haven't attempted any chapter quizzes yet.</p>
              <button
                onClick={() => setCurrentTab('math')}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                Start your first quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-2">Quiz Title</th>
                    <th className="py-3 px-2">Score</th>
                    <th className="py-3 px-2">Percentage</th>
                    <th className="py-3 px-2">Result</th>
                    <th className="py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {quizAttempts.slice(0, 5).map((att) => (
                    <tr key={att.id || att.submittedAt} className="hover:bg-slate-800/40">
                      <td className="py-3 px-2 font-medium text-white max-w-[200px] truncate">
                        {att.quizTitle}
                      </td>
                      <td className="py-3 px-2 font-mono">
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td className="py-3 px-2 font-bold text-emerald-400">
                        {att.percentage}%
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.passed
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {att.passed ? 'Passed' : 'Needs Review'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-[11px]">
                        {new Date(att.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recommended PDFs & Revision */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Recommended Study PDFs</h3>
          <p className="text-xs text-slate-400">
            Selected sheets for fast recall before tests:
          </p>

          <div className="space-y-3">
            {recentPdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="truncate">
                  <span className="text-[10px] font-bold text-teal-400 uppercase">
                    {pdf.category}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {pdf.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">{pdf.fileSize}</span>
                </div>
                <button
                  onClick={() => onPreviewPdf(pdf)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                  title="Preview document"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentTab('pdfs')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors text-center block"
          >
            Open Complete PDF Library
          </button>
        </div>
      </div>
    </div>
  );
};
