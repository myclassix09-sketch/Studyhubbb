import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Award,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Clock,
  ArrowLeft,
  Share2,
  FileText
} from 'lucide-react';
import { Lesson, Chapter, LessonBlock, BlockType } from '../types';
import { getLessons, getChapters, recordLessonProgress, getUserProgress } from '../services/contentService';
import { useAuth } from '../context/AuthContext';

interface LessonViewerPageProps {
  chapterId: string;
  initialLessonId?: string;
  onBack: () => void;
  onStartQuiz: (chapterId: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const LessonViewerPage: React.FC<LessonViewerPageProps> = ({
  chapterId,
  initialLessonId,
  onBack,
  onStartQuiz,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allChapters, chLessons, userProg] = await Promise.all([
          getChapters(),
          getLessons(chapterId),
          user ? getUserProgress(user.uid) : Promise.resolve([]),
        ]);

        const currChap = allChapters.find((c) => c.id === chapterId) || null;
        setChapter(currChap);
        setLessons(chLessons);

        if (chLessons.length > 0) {
          const matched = initialLessonId
            ? chLessons.find((l) => l.id === initialLessonId)
            : chLessons[0];
          setCurrentLesson(matched || chLessons[0]);
        }

        if (user) {
          const chapProg = userProg.find((p) => p.chapterId === chapterId);
          if (chapProg?.completedLessons) {
            setCompletedLessonIds(new Set(chapProg.completedLessons));
          }
        }
      } catch (err) {
        console.error('Error loading lesson viewer data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [chapterId, initialLessonId, user]);

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkCompleted = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!currentLesson || !chapter) return;

    setMarking(true);
    try {
      await recordLessonProgress(
        user.uid,
        chapter.id,
        chapter.subjectId,
        currentLesson.id,
        lessons.length
      );
      setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));
    } catch (err) {
      console.error('Failed to mark lesson completed:', err);
    } finally {
      setMarking(false);
    }
  };

  const copyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(text);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading chapter lesson notes...</p>
      </div>
    );
  }

  if (!chapter || lessons.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-300">
          No lessons found for this chapter yet.
        </p>
        <button
          onClick={onBack}
          className="text-xs font-bold text-emerald-400 hover:underline"
        >
          Return to chapters
        </button>
      </div>
    );
  }

  const currentIndex = currentLesson
    ? lessons.findIndex((l) => l.id === currentLesson.id)
    : 0;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCurrentCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {chapter.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartQuiz(chapter.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Chapter Quiz</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Chapter Table of Contents */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Chapter {chapter.chapterNumber}
              </span>
              <h3 className="text-base font-bold text-white line-clamp-2">
                {chapter.title}
              </h3>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Lessons ({lessons.length})
              </p>
              {lessons.map((lesson, idx) => {
                const isActive = currentLesson?.id === lesson.id;
                const isDone = completedLessonIds.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-500 text-[11px] shrink-0">{idx + 1}.</span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {currentLesson && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
              {/* Lesson Title Header */}
              <div className="border-b border-slate-800/80 pb-6 mb-8">
                <div className="flex items-center justify-between gap-4 text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-emerald-400">
                    Lesson {currentIndex + 1} of {lessons.length}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" /> ~{currentLesson.estimatedMinutes} min read
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentLesson.title}
                </h2>
                {currentLesson.summary && (
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {currentLesson.summary}
                  </p>
                )}
              </div>

              {/* Structured Educational Blocks */}
              <div className="space-y-8 text-slate-200">
                {currentLesson.blocks?.map((block) => {
                  switch (block.type) {
                    case 'heading':
                      return (
                        <div key={block.id} className="pt-2">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                            <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
                            <span>{block.content}</span>
                          </h3>
                        </div>
                      );

                    case 'paragraph':
                      return (
                        <p key={block.id} className="text-sm sm:text-base text-slate-300 leading-relaxed">
                          {block.content}
                        </p>
                      );

                    case 'formula':
                      return (
                        <div
                          key={block.id}
                          className="relative bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-950/20"
                        >
                          {block.title && (
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                {block.title}
                              </span>
                              <button
                                onClick={() => copyFormula(block.content)}
                                className="text-slate-400 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
                              >
                                {copiedFormula === block.content ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                          <div className="math-display text-emerald-300 font-semibold text-base sm:text-lg whitespace-pre-wrap bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                            {block.content}
                          </div>
                          {block.subContent && (
                            <p className="text-xs text-slate-400 mt-2.5 italic">
                              {block.subContent}
                            </p>
                          )}
                        </div>
                      );

                    case 'example':
                      return (
                        <div
                          key={block.id}
                          className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
                              CBSE Solved Example
                            </span>
                            {block.title && (
                              <span className="text-sm font-bold text-white truncate">
                                {block.title}
                              </span>
                            )}
                          </div>

                          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-200 font-medium">
                            {block.content}
                          </div>

                          {block.solutionSteps && block.solutionSteps.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Step-by-Step Solution:
                              </span>
                              <ol className="space-y-2 text-xs sm:text-sm text-slate-300">
                                {block.solutionSteps.map((step, idx) => (
                                  <li
                                    key={idx}
                                    className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60"
                                  >
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {block.finalAnswer && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                              Result: {block.finalAnswer}
                            </div>
                          )}
                        </div>
                      );

                    case 'tip':
                      return (
                        <div
                          key={block.id}
                          className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 text-xs sm:text-sm"
                        >
                          <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-300 block mb-1">
                              {block.title || 'CBSE Board Exam Tip'}
                            </span>
                            <span className="text-slate-300 leading-relaxed">{block.content}</span>
                          </div>
                        </div>
                      );

                    case 'warning':
                      return (
                        <div
                          key={block.id}
                          className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3 text-xs sm:text-sm"
                        >
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-rose-300 block mb-1">
                              {block.title || 'Common Exam Mistake'}
                            </span>
                            <span className="text-slate-300 leading-relaxed">{block.content}</span>
                          </div>
                        </div>
                      );

                    default:
                      return (
                        <p key={block.id} className="text-sm text-slate-300">
                          {block.content}
                        </p>
                      );
                  }
                })}
              </div>

              {/* Lesson Bottom Completion & Navigation */}
              <div className="mt-12 pt-8 border-t border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={handleMarkCompleted}
                    disabled={marking}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isCurrentCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {isCurrentCompleted ? 'Lesson Completed ✓' : 'Mark as Completed'}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {prevLesson && (
                      <button
                        onClick={() => handleSelectLesson(prevLesson)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    )}

                    {nextLesson && (
                      <button
                        onClick={() => handleSelectLesson(nextLesson)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Next Lesson</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
