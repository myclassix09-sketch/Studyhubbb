import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Sparkles,
  Check,
  ShieldAlert
} from 'lucide-react';
import { Quiz, QuizAttempt, QuizQuestion } from '../types';
import { getQuizzes, saveQuizAttempt } from '../services/contentService';
import { useAuth } from '../context/AuthContext';

interface QuizPlayerPageProps {
  quizId?: string;
  chapterId?: string;
  subjectId?: 'math' | 'science';
  onBack: () => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const QuizPlayerPage: React.FC<QuizPlayerPageProps> = ({
  quizId,
  chapterId,
  subjectId,
  onBack,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 min default
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingAttempt, setSavingAttempt] = useState<boolean>(false);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      try {
        const list = await getQuizzes(subjectId, chapterId);
        let targetQuiz = null;
        if (quizId) {
          targetQuiz = list.find((q) => q.id === quizId) || null;
        }
        if (!targetQuiz && list.length > 0) {
          targetQuiz = list[0];
        }
        setQuiz(targetQuiz);
        if (targetQuiz) {
          setSecondsRemaining((targetQuiz.durationMinutes || 10) * 60);
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId, chapterId, subjectId]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || loading || !quiz || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, loading, quiz, secondsRemaining]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    if (!isSubmitted) {
      calculateAndSubmit();
    }
  };

  const calculateAndSubmit = async () => {
    if (!quiz) return;

    let score = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });

    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 60);

    const calculatedResult = { score, total, percentage, passed };
    setResult(calculatedResult);
    setIsSubmitted(true);

    // Trigger celebration confetti if passed
    if (passed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    // Save attempt if user is authenticated
    if (user) {
      setSavingAttempt(true);
      const attempt: QuizAttempt = {
        userId: user.uid,
        userEmail: user.email || 'student@studyhub.edu',
        quizId: quiz.id,
        quizTitle: quiz.title,
        subjectId: quiz.subjectId,
        score,
        totalQuestions: total,
        percentage,
        passed,
        timeSpentSeconds: (quiz.durationMinutes * 60) - secondsRemaining,
        answers: selectedAnswers,
        submittedAt: new Date().toISOString(),
      };
      try {
        await saveQuizAttempt(attempt);
      } catch (err) {
        console.error('Failed to save quiz attempt:', err);
      } finally {
        setSavingAttempt(false);
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setResult(null);
    setCurrentQuestionIndex(0);
    if (quiz) {
      setSecondsRemaining((quiz.durationMinutes || 10) * 60);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Preparing your practice test questions...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-300">
          No practice quiz is available for this selection yet.
        </p>
        <button
          onClick={onBack}
          className="text-xs font-bold text-emerald-400 hover:underline"
        >
          Return to previous page
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Test</span>
        </button>

        {/* Timer Badge */}
        {!isSubmitted && (
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-colors ${
              secondsRemaining < 120
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-slate-900 text-slate-200 border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time Left: {formatTimer(secondsRemaining)}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {isSubmitted && result ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-8 animate-fade-in">
          <div className="space-y-3">
            <div
              className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-xl ${
                result.passed
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-3xl font-extrabold text-white">
              {result.passed ? 'Excellent Performance!' : 'Good Effort! Revision Recommended'}
            </h2>

            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You scored <span className="font-bold text-white">{result.score}</span> out of{' '}
              <span className="font-bold text-white">{result.total}</span> questions (
              <span className="font-bold text-emerald-400">{result.percentage}%</span>).
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total</span>
              <span className="text-lg font-bold text-white">{result.total}</span>
            </div>
            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">Correct</span>
              <span className="text-lg font-bold text-emerald-400">{result.score}</span>
            </div>
            <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/40">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Incorrect</span>
              <span className="text-lg font-bold text-rose-400">{result.total - result.score}</span>
            </div>
          </div>

          {!user && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-w-md mx-auto flex items-center justify-between gap-3">
              <span>Sign in to save this score in your permanent student record!</span>
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shrink-0"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Question-by-Question Detailed Review */}
          <div className="text-left space-y-6 pt-6 border-t border-slate-800">
            <h3 className="text-base font-bold text-white">Question Review & Explanations</h3>

            <div className="space-y-4">
              {quiz.questions.map((q, qIdx) => {
                const studentAns = selectedAnswers[q.id];
                const isCorrect = studentAns === q.correctOptionIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'bg-slate-950/70 border-emerald-500/30'
                        : 'bg-slate-950/70 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold text-slate-400">
                        Q{qIdx + 1}.
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isCorrect
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white mb-3">{q.question}</p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = studentAns === oIdx;
                        const isActualCorrect = q.correctOptionIndex === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                              isActualCorrect
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                                : isChosen
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/40'
                                : 'bg-slate-900/40 text-slate-400 border-slate-800'
                            }`}
                          >
                            <span>{opt}</span>
                            {isActualCorrect && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-slate-400 block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-slate-800">
            <button
              onClick={handleRetake}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Back to Course
            </button>
          </div>
        </div>
      ) : (
        /* Active Quiz Taking Interface */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Quiz Header */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-emerald-400">
                {quiz.title}
              </span>
              <span className="font-semibold">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Navigator Pills */}
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Box */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Difficulty: {currentQ.difficulty || 'Standard'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-xl text-xs sm:text-sm text-left font-medium transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigator */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Previous Question
            </button>

            <div className="flex items-center gap-2">
              {!isLastQuestion ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={calculateAndSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
