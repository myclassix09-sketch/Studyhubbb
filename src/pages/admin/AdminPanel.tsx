import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Globe,
  Bell,
  BookOpen,
  FileEdit,
  Award,
  FileText,
  Users,
  History,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  SiteSettings,
  Announcement,
  Subject,
  Chapter,
  Lesson,
  Quiz,
  PdfDocument,
  AuditLog,
  ContactSubmission,
  LessonBlock,
  BlockType
} from '../../types';
import {
  getSiteSettings,
  updateSiteSettings,
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  getSubjects,
  getChapters,
  saveChapter,
  deleteChapter,
  getLessons,
  saveLesson,
  deleteLesson,
  getQuizzes,
  saveQuiz,
  deleteQuiz,
  getPdfDocuments,
  savePdfDocument,
  deletePdfDocument,
  getContactSubmissions,
  getAuditLogs,
  seedInitialDatabaseIfEmpty
} from '../../services/contentService';

type AdminTab =
  | 'overview'
  | 'website'
  | 'announcements'
  | 'chapters'
  | 'lessons'
  | 'quizzes'
  | 'pdfs'
  | 'students'
  | 'audit';

export const AdminPanel: React.FC<{ onExitAdmin: () => void; onOpenAdminLogin?: () => void }> = ({ onExitAdmin, onOpenAdminLogin }) => {
  const { user, isAdmin, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Studyhub',
    tagline: 'Learn Smart. Practice More. Achieve More.',
    heroDescription: '',
    ctaText: 'Start Learning Now',
    ctaLink: '/subjects',
    footerNote: '',
    supportEmail: 'support@studyhub.edu',
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Forms / Modal Editing states
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingPdf, setEditingPdf] = useState<PdfDocument | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [sets, anns, subs, chaps, less, qzs, pdfList, logs, msgs] = await Promise.all([
        getSiteSettings(),
        getAnnouncements(true),
        getSubjects(),
        getChapters(undefined, true),
        getLessons(undefined, true),
        getQuizzes(undefined, undefined, true),
        getPdfDocuments(undefined, undefined, true),
        getAuditLogs(),
        getContactSubmissions(),
      ]);

      setSettings(sets);
      setAnnouncements(anns);
      setSubjects(subs);
      setChapters(chaps);
      setLessons(less);
      setQuizzes(qzs);
      setPdfs(pdfList);
      setAuditLogs(logs);
      setContacts(msgs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      await seedInitialDatabaseIfEmpty(true);
      await loadAllAdminData();
      showNotification('CBSE Class 10 full curriculum seeded into Firestore!');
    } catch (err) {
      showNotification('Failed to seed curriculum. Check permissions.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          This panel is restricted to verified platform administrators.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              Sign In as Administrator
            </button>
          )}
          <button
            onClick={onExitAdmin}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Return to Student View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 shrink-0">
        <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white">Admin Panel</span>
              <p className="text-[10px] text-amber-400 font-semibold">Zero-Code Management</p>
            </div>
          </div>
          <button
            onClick={onExitAdmin}
            className="text-xs text-slate-400 hover:text-white p-1"
            title="Switch to student website"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation tabs */}
        <nav className="space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'website', label: 'Website Editor', icon: Globe },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'chapters', label: 'Chapters Manager', icon: BookOpen },
            { id: 'lessons', label: 'Lesson Editor', icon: FileEdit },
            { id: 'quizzes', label: 'Quiz Manager', icon: Award },
            { id: 'pdfs', label: 'PDF Library Manager', icon: FileText },
            { id: 'students', label: 'Student Inquiries', icon: Users },
            { id: 'audit', label: 'Audit History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id as AdminTab);
                  setEditingChapter(null);
                  setEditingLesson(null);
                  setEditingQuiz(null);
                  setEditingPdf(null);
                  setEditingAnnouncement(null);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database Seeder Button */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{seeding ? 'Seeding...' : 'Reset Default Curriculum'}</span>
          </button>
          <div className="text-[10px] text-amber-400/90 text-center font-mono font-semibold pt-1 truncate px-2">
            Admin: {user?.email || 'Verified Administrator'}
          </div>
          <button
            onClick={() => {
              signOut();
              onExitAdmin();
            }}
            className="w-full py-1.5 px-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-6xl">
        {/* Top feedback banner */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {currentTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Administrator Overview</h2>
              <p className="text-xs text-slate-400 mt-1">
                Live metrics from Cloud Firestore. No code updates required for educational changes.
              </p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Published Chapters
                </span>
                <span className="text-2xl font-extrabold text-emerald-400">{chapters.length}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Math & Science</span>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Active Lessons
                </span>
                <span className="text-2xl font-extrabold text-teal-400">{lessons.length}</span>
                <span className="text-[11px] text-slate-500 block mt-1">With structured blocks</span>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Practice Quizzes
                </span>
                <span className="text-2xl font-extrabold text-amber-400">{quizzes.length}</span>
                <span className="text-[11px] text-slate-500 block mt-1">MCQ Question banks</span>
              </div>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  PDF Documents
                </span>
                <span className="text-2xl font-extrabold text-sky-400">{pdfs.length}</span>
                <span className="text-[11px] text-slate-500 block mt-1">Notes & Question Papers</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Quick Administration Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setCurrentTab('website')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-left space-y-1 transition-colors"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <p className="font-bold">Edit Homepage</p>
                  <p className="text-[10px] text-slate-400">Change titles & CTA</p>
                </button>
                <button
                  onClick={() => setCurrentTab('lessons')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-left space-y-1 transition-colors"
                >
                  <Plus className="w-4 h-4 text-teal-400" />
                  <p className="font-bold">Add Lesson</p>
                  <p className="text-[10px] text-slate-400">Create new notes block</p>
                </button>
                <button
                  onClick={() => setCurrentTab('quizzes')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-left space-y-1 transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <p className="font-bold">New Quiz</p>
                  <p className="text-[10px] text-slate-400">Add MCQs & timer</p>
                </button>
                <button
                  onClick={() => setCurrentTab('pdfs')}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-left space-y-1 transition-colors"
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <p className="font-bold">Upload PDF</p>
                  <p className="text-[10px] text-slate-400">Publish study sheet</p>
                </button>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent System Audit Events</h3>
                <span className="text-[11px] text-slate-500">Security Rule Enforced</span>
              </div>
              <div className="space-y-2">
                {auditLogs.slice(0, 4).map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{log.action}: </span>
                      <span className="text-slate-400">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. WEBSITE EDITOR TAB */}
        {currentTab === 'website' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Visual Website Editor</h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize homepage titles, descriptions, and CTA buttons directly without altering code.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hero Section Description
                </label>
                <textarea
                  rows={3}
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.ctaText}
                    onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Footer Disclaimer
                </label>
                <input
                  type="text"
                  value={settings.footerNote}
                  onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <button
                onClick={async () => {
                  try {
                    await updateSiteSettings(settings);
                    showNotification('Website settings saved to Firestore successfully!');
                  } catch (err) {
                    showNotification('Failed to save settings.', 'error');
                  }
                }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Website Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. ANNOUNCEMENTS TAB */}
        {currentTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Notice Board Announcements</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Broadcast exam alerts and study updates to the homepage.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingAnnouncement({
                    id: `ann-${Date.now()}`,
                    title: 'New Announcement',
                    content: 'Write details here...',
                    badge: 'Alert',
                    isPublished: true,
                    createdAt: new Date().toISOString(),
                  })
                }
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </button>
            </div>

            {editingAnnouncement && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Edit Announcement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Title</label>
                    <input
                      type="text"
                      value={editingAnnouncement.title}
                      onChange={(e) =>
                        setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={editingAnnouncement.badge}
                      onChange={(e) =>
                        setEditingAnnouncement({ ...editingAnnouncement, badge: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Content</label>
                  <textarea
                    rows={2}
                    value={editingAnnouncement.content}
                    onChange={(e) =>
                      setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      await saveAnnouncement(editingAnnouncement);
                      setEditingAnnouncement(null);
                      await loadAllAdminData();
                      showNotification('Announcement saved!');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                  >
                    Save Announcement
                  </button>
                  <button
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {ann.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          ann.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {ann.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{ann.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingAnnouncement(ann)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this announcement?')) {
                          await deleteAnnouncement(ann.id);
                          await loadAllAdminData();
                          showNotification('Announcement deleted.');
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CHAPTERS MANAGER TAB */}
        {currentTab === 'chapters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Curriculum Chapters</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Add, rename, reorder, or update chapters according to official CBSE changes.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingChapter({
                    id: `ch-${Date.now()}`,
                    subjectId: 'math',
                    chapterNumber: chapters.length + 1,
                    title: 'New Chapter Title',
                    description: 'Chapter summary and syllabus coverage...',
                    isPublished: true,
                    totalLessons: 1,
                    estimatedMinutes: 45,
                    order: chapters.length + 1,
                  })
                }
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Chapter</span>
              </button>
            </div>

            {editingChapter && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Edit Chapter Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Subject</label>
                    <select
                      value={editingChapter.subjectId}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          subjectId: e.target.value as 'math' | 'science',
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    >
                      <option value="math">Mathematics</option>
                      <option value="science">Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Chapter Number</label>
                    <input
                      type="number"
                      value={editingChapter.chapterNumber}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          chapterNumber: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Sub-Branch (Science)</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics, Chemistry, Biology"
                      value={editingChapter.subBranch || ''}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          subBranch: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Chapter Title</label>
                  <input
                    type="text"
                    value={editingChapter.title}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingChapter.description}
                    onChange={(e) =>
                      setEditingChapter({ ...editingChapter, description: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      await saveChapter(editingChapter);
                      setEditingChapter(null);
                      await loadAllAdminData();
                      showNotification('Chapter saved successfully!');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                  >
                    Save Chapter
                  </button>
                  <button
                    onClick={() => setEditingChapter(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Ch {ch.chapterNumber}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        {ch.subjectId}
                      </span>
                      {ch.subBranch && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          {ch.subBranch}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ch.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingChapter(ch)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete chapter "${ch.title}"?`)) {
                          await deleteChapter(ch.id);
                          await loadAllAdminData();
                          showNotification('Chapter deleted.');
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. LESSON EDITOR TAB (Structured Educational Blocks) */}
        {currentTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Visual Lesson Editor</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Build structured lesson content blocks (Headings, Formulas, Solved Examples, Exam Tips).
                </p>
              </div>
              <button
                onClick={() => {
                  const defaultCh = chapters[0];
                  setEditingLesson({
                    id: `lesson-${Date.now()}`,
                    chapterId: defaultCh?.id || 'math-ch1',
                    subjectId: defaultCh?.subjectId || 'math',
                    title: 'New Lesson Title',
                    order: lessons.length + 1,
                    estimatedMinutes: 15,
                    isPublished: true,
                    summary: 'Lesson summary statement...',
                    blocks: [
                      {
                        id: `b-${Date.now()}-1`,
                        type: 'heading',
                        content: '1. Introduction to Concept',
                      },
                      {
                        id: `b-${Date.now()}-2`,
                        type: 'paragraph',
                        content: 'Detailed explanation of the topic here...',
                      },
                      {
                        id: `b-${Date.now()}-3`,
                        type: 'formula',
                        title: 'Important Formula',
                        content: 'x = (-b ± √(b² - 4ac)) / (2a)',
                      },
                    ],
                  });
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Lesson</span>
              </button>
            </div>

            {editingLesson && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Edit Educational Lesson</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await saveLesson(editingLesson);
                        setEditingLesson(null);
                        await loadAllAdminData();
                        showNotification('Lesson saved and published to students!');
                      }}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Lesson</span>
                    </button>
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Assign to Chapter</label>
                    <select
                      value={editingLesson.chapterId}
                      onChange={(e) => {
                        const targetCh = chapters.find((c) => c.id === e.target.value);
                        setEditingLesson({
                          ...editingLesson,
                          chapterId: e.target.value,
                          subjectId: targetCh?.subjectId || 'math',
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    >
                      {chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.subjectId.toUpperCase()}: Ch {ch.chapterNumber} - {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Lesson Title</label>
                    <input
                      type="text"
                      value={editingLesson.title}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, title: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Estimated Minutes</label>
                    <input
                      type="number"
                      value={editingLesson.estimatedMinutes}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          estimatedMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Structured Blocks List */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Content Blocks ({editingLesson.blocks.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newBlock: LessonBlock = {
                            id: `b-${Date.now()}`,
                            type: 'heading',
                            content: 'Section Heading',
                          };
                          setEditingLesson({
                            ...editingLesson,
                            blocks: [...editingLesson.blocks, newBlock],
                          });
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                      >
                        + Heading
                      </button>
                      <button
                        onClick={() => {
                          const newBlock: LessonBlock = {
                            id: `b-${Date.now()}`,
                            type: 'paragraph',
                            content: 'New paragraph description...',
                          };
                          setEditingLesson({
                            ...editingLesson,
                            blocks: [...editingLesson.blocks, newBlock],
                          });
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                      >
                        + Paragraph
                      </button>
                      <button
                        onClick={() => {
                          const newBlock: LessonBlock = {
                            id: `b-${Date.now()}`,
                            type: 'formula',
                            title: 'Formula Card',
                            content: 'A = πr²',
                          };
                          setEditingLesson({
                            ...editingLesson,
                            blocks: [...editingLesson.blocks, newBlock],
                          });
                        }}
                        className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs"
                      >
                        + Formula
                      </button>
                      <button
                        onClick={() => {
                          const newBlock: LessonBlock = {
                            id: `b-${Date.now()}`,
                            type: 'tip',
                            title: 'Board Exam Scoring Tip',
                            content: 'Highlight keywords to score full step marks.',
                          };
                          setEditingLesson({
                            ...editingLesson,
                            blocks: [...editingLesson.blocks, newBlock],
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs"
                      >
                        + Exam Tip
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {editingLesson.blocks.map((block, bIdx) => (
                      <div
                        key={block.id}
                        className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase text-emerald-400 text-[10px]">
                            Block {bIdx + 1}: {block.type}
                          </span>
                          <button
                            onClick={() => {
                              const updated = editingLesson.blocks.filter((b) => b.id !== block.id);
                              setEditingLesson({ ...editingLesson, blocks: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        {block.title !== undefined && (
                          <input
                            type="text"
                            placeholder="Block Title / Label"
                            value={block.title || ''}
                            onChange={(e) => {
                              const updated = [...editingLesson.blocks];
                              updated[bIdx].title = e.target.value;
                              setEditingLesson({ ...editingLesson, blocks: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                          />
                        )}

                        <textarea
                          rows={2}
                          value={block.content}
                          onChange={(e) => {
                            const updated = [...editingLesson.blocks];
                            updated[bIdx].content = e.target.value;
                            setEditingLesson({ ...editingLesson, blocks: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {lessons.map((les) => (
                <div
                  key={les.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {les.subjectId.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-white">{les.title}</h4>
                      <span className="text-[11px] text-slate-500">
                        ({les.blocks?.length || 0} blocks)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{les.summary}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingLesson(les)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete lesson "${les.title}"?`)) {
                          await deleteLesson(les.id);
                          await loadAllAdminData();
                          showNotification('Lesson deleted.');
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. QUIZ MANAGER TAB */}
        {currentTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Quiz & Question Bank Manager</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create and manage chapter practice tests with multiple-choice questions and timer limits.
                </p>
              </div>
              <button
                onClick={() => {
                  const defaultCh = chapters[0];
                  setEditingQuiz({
                    id: `quiz-${Date.now()}`,
                    title: 'Class 10 Practice Assessment',
                    subjectId: defaultCh?.subjectId || 'math',
                    chapterId: defaultCh?.id,
                    difficulty: 'Medium',
                    durationMinutes: 10,
                    passingScore: 60,
                    isPublished: true,
                    questions: [
                      {
                        id: `q-${Date.now()}-1`,
                        question: 'Sample Question text...',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctOptionIndex: 0,
                        explanation: 'Detailed explanation of why A is correct...',
                        difficulty: 'Medium',
                      },
                    ],
                  });
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Quiz</span>
              </button>
            </div>

            {editingQuiz && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Edit Quiz Assessment</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await saveQuiz(editingQuiz);
                        setEditingQuiz(null);
                        await loadAllAdminData();
                        showNotification('Quiz saved and activated for students!');
                      }}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Quiz</span>
                    </button>
                    <button
                      onClick={() => setEditingQuiz(null)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-300 block mb-1">Quiz Title</label>
                    <input
                      type="text"
                      value={editingQuiz.title}
                      onChange={(e) =>
                        setEditingQuiz({ ...editingQuiz, title: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingQuiz.durationMinutes}
                      onChange={(e) =>
                        setEditingQuiz({
                          ...editingQuiz,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Passing Score (%)</label>
                    <input
                      type="number"
                      value={editingQuiz.passingScore}
                      onChange={(e) =>
                        setEditingQuiz({
                          ...editingQuiz,
                          passingScore: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Questions Bank */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Questions ({editingQuiz.questions.length})
                    </span>
                    <button
                      onClick={() => {
                        const newQ = {
                          id: `q-${Date.now()}`,
                          question: 'New question statement...',
                          options: ['Option A', 'Option B', 'Option C', 'Option D'],
                          correctOptionIndex: 0,
                          explanation: 'Explanation...',
                          difficulty: 'Medium' as const,
                        };
                        setEditingQuiz({
                          ...editingQuiz,
                          questions: [...editingQuiz.questions, newQ],
                        });
                      }}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingQuiz.questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Question {qIdx + 1}</span>
                          <button
                            onClick={() => {
                              const updated = editingQuiz.questions.filter((item) => item.id !== q.id);
                              setEditingQuiz({ ...editingQuiz, questions: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const updated = [...editingQuiz.questions];
                            updated[qIdx].question = e.target.value;
                            setEditingQuiz({ ...editingQuiz, questions: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                        />

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctOptionIndex === oIdx}
                                onChange={() => {
                                  const updated = [...editingQuiz.questions];
                                  updated[qIdx].correctOptionIndex = oIdx;
                                  setEditingQuiz({ ...editingQuiz, questions: updated });
                                }}
                                title="Mark as correct answer"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...editingQuiz.questions];
                                  updated[qIdx].options[oIdx] = e.target.value;
                                  setEditingQuiz({ ...editingQuiz, questions: updated });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            Explanation shown after submission:
                          </label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={(e) => {
                              const updated = [...editingQuiz.questions];
                              updated[qIdx].explanation = e.target.value;
                              setEditingQuiz({ ...editingQuiz, questions: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {quizzes.map((qz) => (
                <div
                  key={qz.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {qz.subjectId.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-white">{qz.title}</h4>
                      <span className="text-[11px] text-slate-500">
                        {qz.questions.length} questions • {qz.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingQuiz(qz)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete quiz "${qz.title}"?`)) {
                          await deleteQuiz(qz.id);
                          await loadAllAdminData();
                          showNotification('Quiz deleted.');
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. PDF LIBRARY MANAGER TAB */}
        {currentTab === 'pdfs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">PDF Library & Storage Manager</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload and manage Class 10 revision sheets, mind maps, and model papers.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingPdf({
                    id: `pdf-${Date.now()}`,
                    title: 'New Class 10 Revision Document',
                    description: 'Detailed study notes and formula overview...',
                    subjectId: 'math',
                    category: 'Notes',
                    fileUrl: 'https://raw.githubusercontent.com/ncert/ncert-books/main/class10/math/formulas.pdf',
                    fileSize: '1.5 MB',
                    isPublished: true,
                    downloadsCount: 0,
                    uploadedAt: new Date().toISOString(),
                  })
                }
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add / Upload PDF</span>
              </button>
            </div>

            {editingPdf && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Edit PDF Document</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Subject</label>
                    <select
                      value={editingPdf.subjectId}
                      onChange={(e) =>
                        setEditingPdf({
                          ...editingPdf,
                          subjectId: e.target.value as 'math' | 'science',
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    >
                      <option value="math">Mathematics</option>
                      <option value="science">Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Category</label>
                    <select
                      value={editingPdf.category}
                      onChange={(e) =>
                        setEditingPdf({ ...editingPdf, category: e.target.value as any })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    >
                      <option value="Notes">Notes</option>
                      <option value="Formula Sheet">Formula Sheet</option>
                      <option value="Worksheet">Worksheet</option>
                      <option value="Sample Paper">Sample Paper</option>
                      <option value="NCERT Solutions">NCERT Solutions</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">File Size Label</label>
                    <input
                      type="text"
                      placeholder="e.g. 2.1 MB"
                      value={editingPdf.fileSize || ''}
                      onChange={(e) =>
                        setEditingPdf({ ...editingPdf, fileSize: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={editingPdf.title}
                    onChange={(e) =>
                      setEditingPdf({ ...editingPdf, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">PDF File URL</label>
                  <input
                    type="url"
                    value={editingPdf.fileUrl}
                    onChange={(e) =>
                      setEditingPdf({ ...editingPdf, fileUrl: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingPdf.description}
                    onChange={(e) =>
                      setEditingPdf({ ...editingPdf, description: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      await savePdfDocument(editingPdf);
                      setEditingPdf(null);
                      await loadAllAdminData();
                      showNotification('PDF document saved to library!');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                  >
                    Save PDF
                  </button>
                  <button
                    onClick={() => setEditingPdf(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                        {pdf.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {pdf.subjectId}
                      </span>
                      <h4 className="text-sm font-bold text-white">{pdf.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{pdf.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPdf(pdf)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete PDF "${pdf.title}"?`)) {
                          await deletePdfDocument(pdf.id);
                          await loadAllAdminData();
                          showNotification('PDF document deleted.');
                        }
                      }}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. STUDENT INQUIRIES TAB */}
        {currentTab === 'students' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Student Contact & Inquiries</h2>
              <p className="text-xs text-slate-400 mt-1">
                Messages received from students through the platform contact form.
              </p>
            </div>

            {contacts.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No new messages from students.
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold">{c.email}</span>
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. AUDIT HISTORY TAB */}
        {currentTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Administrative Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tamper-proof record of all content creations, edits, and deletions.
              </p>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-400 mr-2">[{log.action}]</span>
                    <span className="text-slate-200">{log.details}</span>
                    <span className="text-[10px] text-slate-500 block">by {log.adminEmail}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
