import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Atom,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  Download,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Chapter, Lesson, PdfDocument, SiteSettings, Announcement } from '../types';
import { getSiteSettings, getAnnouncements, getPdfDocuments, getChapters, getLessons } from '../services/contentService';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
  onSelectChapter: (chapterId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onPreviewPdf: (pdf: PdfDocument) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentTab,
  openAuthModal,
  onSelectChapter,
  onSelectLesson,
  onPreviewPdf,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [featuredPdfs, setFeaturedPdfs] = useState<PdfDocument[]>([]);
  const [featuredLessons, setFeaturedLessons] = useState<Lesson[]>([]);
  const [mathChaptersCount, setMathChaptersCount] = useState(14);
  const [scienceChaptersCount, setScienceChaptersCount] = useState(13);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [sets, anns, pdfs, chaps, less] = await Promise.all([
          getSiteSettings(),
          getAnnouncements(),
          getPdfDocuments(),
          getChapters(),
          getLessons(),
        ]);
        setSettings(sets);
        setAnnouncements(anns);
        setFeaturedPdfs(pdfs.slice(0, 4));
        setFeaturedLessons(less.slice(0, 3));
        setMathChaptersCount(chaps.filter(c => c.subjectId === 'math').length || 14);
        setScienceChaptersCount(chaps.filter(c => c.subjectId === 'science').length || 13);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();

    const handleContentUpdate = () => {
      loadHomeData();
    };
    window.addEventListener('studyhub_content_changed', handleContentUpdate);
    return () => window.removeEventListener('studyhub_content_changed', handleContentUpdate);
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Dynamic Announcement Banner */}
      {announcements.length > 0 && announcements[0].isPublished && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-800/40 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
                {announcements[0].badge || 'Notice'}
              </span>
              <span className="font-semibold text-slate-200">{announcements[0].title}:</span>
              <span className="text-slate-400 hidden md:inline">{announcements[0].content}</span>
            </div>
            <button
              onClick={() => setCurrentTab('pdfs')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0 text-xs"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Dedicated CBSE Class 10 Learning Portal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Learn Smart. Practice More.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Achieve More.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {settings?.heroDescription ||
              'Master Class 10 CBSE Mathematics and Science with structured concept explanations, formulas, NCERT solved examples, interactive quizzes, and downloadable PDF sheets.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => (user ? setCurrentTab('dashboard') : setCurrentTab('math'))}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <span>{user ? 'Go to Student Dashboard' : 'Start Learning Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab('pdfs')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-xl text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Browse PDF Library</span>
            </button>
          </div>

          {/* Feature Highlights Pill Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">CBSE Syllabus Aligned</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <BrainCircuit className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Concept-First Notes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Real Progress Tracking</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Chapter-Wise Quizzes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Subjects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Class 10 Core Subjects</h2>
          <p className="text-sm text-slate-400 mt-2">
            Structured topic breakdowns designed specifically for high retention and 95%+ board examination results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mathematics Subject Card */}
          <div
            onClick={() => setCurrentTab('math')}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 sm:p-8 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calculator className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                {mathChaptersCount} Chapters
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Mathematics
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Step-by-step proofs, quadratic formulas, arithmetic progressions, trigonometry, coordinate geometry, circles, and statistics.
            </p>

            <div className="space-y-2 border-t border-slate-800/80 pt-4 mb-6 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Key Focus:</span>
                <span className="font-semibold text-slate-200">Real Numbers, Trigonometry & Geometry</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Exam Pattern:</span>
                <span className="font-semibold text-slate-200">Standard & Basic Compatible</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Explore Mathematics Chapters</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Science Subject Card */}
          <div
            onClick={() => setCurrentTab('science')}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 sm:p-8 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-sky-950/40"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Atom className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
                {scienceChaptersCount} Chapters
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
              Science
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Organized into Physics, Chemistry, and Biology. Detailed chemical equations, ray diagrams, human organs, and electrical circuits.
            </p>

            <div className="space-y-2 border-t border-slate-800/80 pt-4 mb-6 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Sub-Branches:</span>
                <span className="font-semibold text-slate-200">Physics, Chemistry, Biology</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Practicals & Diagrams:</span>
                <span className="font-semibold text-slate-200">Ray optics, Circuits & Life Processes</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Explore Science Topics</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Lessons & Quick Revision */}
      {featuredLessons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white">High-Yield Revision Lessons</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Recommended by CBSE toppers for mastering conceptual clarity before tests.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('math')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {lesson.subjectId === 'math' ? 'Mathematics' : 'Science'}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {lesson.estimatedMinutes} mins
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-2 line-clamp-2">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {lesson.summary || 'Comprehensive breakdown with step-by-step NCERT examples.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Start Reading Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured PDF Resources */}
      {featuredPdfs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Class 10 PDF Library & Worksheets</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Handwritten notes, quick formula sheets, and CBSE sample papers for offline study.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('pdfs')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Explore All PDFs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-teal-400 text-[10px] bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {pdf.category}
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">{pdf.fileSize || 'PDF'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mb-2 line-clamp-2">
                    {pdf.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {pdf.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onPreviewPdf(pdf)}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold text-center transition-colors"
                  >
                    Preview
                  </button>
                  <a
                    href={pdf.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Studyhub Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Educational Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Engineered to replace rote memorization with deep conceptual clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Visual & Step-by-Step Proofs</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every theorem, chemical reaction, and ray diagram is explained with the underlying reasoning so you understand the "why" before the "how".
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Active Recall with Timed MCQs</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test your understanding after every chapter with instant marking scheme feedback, step-by-step solutions, and score persistence.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-white">No Clutter, High Reliability</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Zero distractions or spam. All materials are curated strictly according to the latest CBSE Board syllabus guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
