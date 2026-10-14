import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Atom,
  Search,
  BookOpen,
  HelpCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter,
  Sparkles,
  Award
} from 'lucide-react';
import { Chapter, SubjectId, StudentProgress } from '../types';
import { getChapters, getUserProgress } from '../services/contentService';
import { useAuth } from '../context/AuthContext';

interface SubjectPageProps {
  subjectId: SubjectId;
  onSelectChapter: (chapterId: string) => void;
  onStartQuiz: (chapterId: string) => void;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({
  subjectId,
  onSelectChapter,
  onStartQuiz,
}) => {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progressList, setProgressList] = useState<StudentProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjectData() {
      setLoading(true);
      try {
        const [chaps, progs] = await Promise.all([
          getChapters(subjectId),
          user ? getUserProgress(user.uid) : Promise.resolve([]),
        ]);
        setChapters(chaps);
        setProgressList(progs);
      } catch (err) {
        console.error('Error loading chapters:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjectData();

    const handleContentUpdate = () => {
      loadSubjectData();
    };
    window.addEventListener('studyhub_content_changed', handleContentUpdate);
    return () => window.removeEventListener('studyhub_content_changed', handleContentUpdate);
  }, [subjectId, user]);

  const isMath = subjectId === 'math';
  const completedChapterIds = new Set(
    progressList.filter(p => p.completed && p.subjectId === subjectId).map(p => p.chapterId)
  );

  const filteredChapters = chapters.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `chapter ${c.chapterNumber}`.includes(searchTerm.toLowerCase());

    const matchesBranch =
      selectedBranch === 'All' || c.subBranch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  const completionPercentage =
    chapters.length > 0 ? Math.round((completedChapterIds.size / chapters.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Subject Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                  isMath
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}
              >
                {isMath ? <Calculator className="w-6 h-6" /> : <Atom className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  CBSE Class 10 Curriculum
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {isMath ? 'Mathematics' : 'Science'}
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {isMath
                ? 'Complete coverage of all 14 official CBSE Class 10 Mathematics chapters. Master formulas, NCERT theorems, coordinate geometry, trigonometry, and statistics.'
                : 'Comprehensive syllabus organized into Physics, Chemistry, and Biology. In-depth chemical balancing, physiological systems, ray diagrams, and electricity.'}
            </p>
          </div>

          {/* Student Progress Badge */}
          {user && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shrink-0 min-w-[220px]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-semibold">Your Completion</span>
                <span className="font-bold text-emerald-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {completedChapterIds.size} of {chapters.length} chapters completed
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search chapters or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Science Branch Filter (Physics, Chemistry, Biology) */}
        {!isMath && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {['All', 'Chemistry', 'Biology', 'Physics'].map((branch) => (
              <button
                key={branch}
                onClick={() => setSelectedBranch(branch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedBranch === branch
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chapters Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading curriculum chapters...</p>
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <p className="text-sm font-semibold text-slate-300">No chapters match your search.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBranch('All');
            }}
            className="mt-3 text-xs font-bold text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => {
            const isCompleted = completedChapterIds.has(chapter.id);
            return (
              <div
                key={chapter.id}
                className={`relative bg-slate-900/90 border rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-xl ${
                  isCompleted ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                      Chapter {chapter.chapterNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {chapter.subBranch && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                          {chapter.subBranch}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {chapter.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-5">
                    {chapter.description}
                  </p>
                </div>

                {/* Card Footer / Action Buttons */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {chapter.totalLessons} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      ~{chapter.estimatedMinutes} mins
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectChapter(chapter.id)}
                      className="w-full py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Notes</span>
                    </button>
                    <button
                      onClick={() => onStartQuiz(chapter.id)}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Take Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
