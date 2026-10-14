import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { PdfPreviewModal } from './components/pdf/PdfPreviewModal';
import { StudentAccessGate } from './components/auth/StudentAccessGate';

import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { LessonViewerPage } from './pages/LessonViewerPage';
import { QuizPlayerPage } from './pages/QuizPlayerPage';
import { PdfLibraryPage } from './pages/PdfLibraryPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPanel } from './pages/admin/AdminPanel';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

import { PdfDocument } from './types';
import { testFirestoreConnection } from './firebase/config';
import { seedInitialDatabaseIfEmpty } from './services/contentService';
import { BookOpen } from 'lucide-react';

function StudyhubApp() {
  const { user, isAdmin, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('math-ch1');
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>(undefined);
  const [previewPdf, setPreviewPdf] = useState<PdfDocument | null>(null);

  // Auth modal for in-app mode switches
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Run connection test and seed default content into Firestore
    testFirestoreConnection();
    seedInitialDatabaseIfEmpty();
  }, []);

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedLessonId(undefined);
    setCurrentTab('lesson-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentTab('lesson-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuiz = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedQuizId(undefined);
    setCurrentTab('quiz-play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Loading splash screen while Firebase Auth initializes
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-sm font-extrabold text-white">Studyhub CBSE Class 10</h2>
          <p className="mt-1 text-xs text-slate-400">Verifying secure student access...</p>
        </div>
      </div>
    );
  }

  // 2. Separate Administrator Login route
  if (currentTab === 'admin-login') {
    return (
      <AdminLoginPage
        onSuccess={() => {
          setCurrentTab('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBack={() => {
          setCurrentTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // 3. Admin Panel route
  if (currentTab === 'admin') {
    return (
      <AdminPanel
        onExitAdmin={() => setCurrentTab('home')}
        onOpenAdminLogin={() => setCurrentTab('admin-login')}
      />
    );
  }

  // 4. REQUIRE STUDENT LOGIN GATE:
  // If no user is logged in, restrict access to the student access gateway!
  if (!user) {
    return (
      <StudentAccessGate
        onOpenAdminLogin={() => {
          setCurrentTab('admin-login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // 5. Authenticated Student Learning Portal: Full access granted
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors">
      {/* Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={openAuth}
      />

      {/* Dynamic Page Router */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            openAuthModal={openAuth}
            onSelectChapter={handleSelectChapter}
            onSelectLesson={handleSelectLesson}
            onPreviewPdf={(pdf) => setPreviewPdf(pdf)}
          />
        )}

        {currentTab === 'math' && (
          <SubjectPage
            subjectId="math"
            onSelectChapter={handleSelectChapter}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentTab === 'science' && (
          <SubjectPage
            subjectId="science"
            onSelectChapter={handleSelectChapter}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentTab === 'lesson-view' && (
          <LessonViewerPage
            chapterId={selectedChapterId}
            initialLessonId={selectedLessonId}
            onBack={() => setCurrentTab('math')}
            onStartQuiz={handleStartQuiz}
            openAuthModal={openAuth}
          />
        )}

        {currentTab === 'quiz-play' && (
          <QuizPlayerPage
            chapterId={selectedChapterId}
            quizId={selectedQuizId}
            onBack={() => setCurrentTab('math')}
            openAuthModal={openAuth}
          />
        )}

        {currentTab === 'pdfs' && (
          <PdfLibraryPage onPreviewPdf={(pdf) => setPreviewPdf(pdf)} />
        )}

        {currentTab === 'dashboard' && (
          <StudentDashboardPage
            onSelectChapter={handleSelectChapter}
            onSelectLesson={handleSelectLesson}
            onStartQuiz={handleStartQuiz}
            onPreviewPdf={(pdf) => setPreviewPdf(pdf)}
            setCurrentTab={setCurrentTab}
            openAuthModal={openAuth}
          />
        )}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'contact' && <ContactPage />}

        {currentTab === 'privacy' && <LegalPage initialTab="privacy" />}

        {currentTab === 'terms' && <LegalPage initialTab="terms" />}
      </div>

      {/* Footer */}
      <Footer
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={openAuth}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onOpenAdminLogin={() => {
          setCurrentTab('admin-login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <PdfPreviewModal
        pdf={previewPdf}
        onClose={() => setPreviewPdf(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudyhubApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
