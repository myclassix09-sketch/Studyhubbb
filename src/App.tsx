import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { PdfPreviewModal } from './components/pdf/PdfPreviewModal';

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

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('math-ch1');
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>(undefined);
  const [previewPdf, setPreviewPdf] = useState<PdfDocument | null>(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Run connection test and seed default content
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

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors">
          {/* Header Navbar (Hidden inside standalone AdminPanel for maximum workspace, or visible with switcher) */}
          {currentTab !== 'admin' && (
            <Navbar
              currentTab={currentTab}
              setCurrentTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              openAuthModal={openAuth}
            />
          )}

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

            {currentTab === 'admin-login' && (
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
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                onExitAdmin={() => setCurrentTab('home')}
                onOpenAdminLogin={() => setCurrentTab('admin-login')}
              />
            )}
          </div>

          {/* Footer (Hidden in Admin mode or Admin Login mode) */}
          {currentTab !== 'admin' && currentTab !== 'admin-login' && (
            <Footer
              setCurrentTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              openAuthModal={openAuth}
            />
          )}

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
      </AuthProvider>
    </ThemeProvider>
  );
}
