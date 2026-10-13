import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase/config';
import {
  Chapter,
  Lesson,
  Quiz,
  QuizAttempt,
  StudentProgress,
  PdfDocument,
  SiteSettings,
  Announcement,
  ContactSubmission,
  AuditLog,
  Subject
} from '../types';
import {
  DEFAULT_SUBJECTS,
  DEFAULT_CHAPTERS,
  DEFAULT_LESSONS,
  DEFAULT_QUIZZES,
  DEFAULT_PDFS,
  DEFAULT_SETTINGS,
  DEFAULT_ANNOUNCEMENTS
} from '../data/defaultCurriculum';

// Helper to log administrative actions
export async function logAdminAction(action: string, targetType: string, targetId: string, details: string) {
  try {
    const adminEmail =
      auth.currentUser?.email ||
      (typeof window !== 'undefined' ? localStorage.getItem('studyhub_admin_session') : null) ||
      'Himanshu00';
    await addDoc(collection(db, 'audit_logs'), {
      adminEmail,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Audit log write skipped or forbidden:', err);
  }
}

// ---------------- SITE SETTINGS ----------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const path = 'site_settings/global';
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'global'));
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('Fallback to default settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const path = 'site_settings/global';
  try {
    await setDoc(doc(db, 'site_settings', 'global'), {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await logAdminAction('UPDATE', 'SiteSettings', 'global', 'Updated website global settings');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- ANNOUNCEMENTS ----------------
export async function getAnnouncements(isAdmin = false): Promise<Announcement[]> {
  const path = 'announcements';
  try {
    const q = isAdmin
      ? query(collection(db, path))
      : query(collection(db, path), where('isPublished', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !isAdmin) {
      return DEFAULT_ANNOUNCEMENTS;
    }
    const results: Announcement[] = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() } as Announcement);
    });
    return results;
  } catch (error) {
    console.warn('Announcements fetch fallback:', error);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export async function saveAnnouncement(ann: Announcement): Promise<void> {
  const path = `announcements/${ann.id}`;
  try {
    await setDoc(doc(db, 'announcements', ann.id), ann, { merge: true });
    await logAdminAction('SAVE', 'Announcement', ann.id, `Saved announcement: ${ann.title}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const path = `announcements/${id}`;
  try {
    await deleteDoc(doc(db, 'announcements', id));
    await logAdminAction('DELETE', 'Announcement', id, `Deleted announcement ID ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- SUBJECTS ----------------
export async function getSubjects(): Promise<Subject[]> {
  const path = 'subjects';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return DEFAULT_SUBJECTS;
    }
    const list: Subject[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Subject));
    return list.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn('Subjects fetch fallback:', error);
    return DEFAULT_SUBJECTS;
  }
}

// ---------------- CHAPTERS ----------------
export async function getChapters(subjectId?: string, isAdmin = false): Promise<Chapter[]> {
  const path = 'chapters';
  try {
    let q = query(collection(db, path));
    if (subjectId) {
      q = query(collection(db, path), where('subjectId', '==', subjectId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      const filtered = subjectId ? DEFAULT_CHAPTERS.filter(c => c.subjectId === subjectId) : DEFAULT_CHAPTERS;
      return filtered.sort((a, b) => a.order - b.order);
    }
    let list: Chapter[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Chapter));
    if (!isAdmin) {
      list = list.filter(c => c.isPublished);
    }
    return list.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn('Chapters fetch fallback:', error);
    const filtered = subjectId ? DEFAULT_CHAPTERS.filter(c => c.subjectId === subjectId) : DEFAULT_CHAPTERS;
    return filtered;
  }
}

export async function saveChapter(chapter: Chapter): Promise<void> {
  const path = `chapters/${chapter.id}`;
  try {
    await setDoc(doc(db, 'chapters', chapter.id), chapter, { merge: true });
    await logAdminAction('SAVE', 'Chapter', chapter.id, `Saved chapter: ${chapter.title}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteChapter(id: string): Promise<void> {
  const path = `chapters/${id}`;
  try {
    await deleteDoc(doc(db, 'chapters', id));
    await logAdminAction('DELETE', 'Chapter', id, `Deleted chapter ID ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- LESSONS ----------------
export async function getLessons(chapterId?: string, isAdmin = false): Promise<Lesson[]> {
  const path = 'lessons';
  try {
    let q = query(collection(db, path));
    if (chapterId) {
      q = query(collection(db, path), where('chapterId', '==', chapterId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      const fallback = chapterId ? DEFAULT_LESSONS.filter(l => l.chapterId === chapterId) : DEFAULT_LESSONS;
      return fallback.sort((a, b) => a.order - b.order);
    }
    let list: Lesson[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Lesson));
    if (!isAdmin) {
      list = list.filter(l => l.isPublished);
    }
    return list.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn('Lessons fetch fallback:', error);
    return chapterId ? DEFAULT_LESSONS.filter(l => l.chapterId === chapterId) : DEFAULT_LESSONS;
  }
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const path = `lessons/${lessonId}`;
  try {
    const snap = await getDoc(doc(db, 'lessons', lessonId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Lesson;
    }
    const local = DEFAULT_LESSONS.find(l => l.id === lessonId);
    return local || null;
  } catch (error) {
    console.warn('Lesson get fallback:', error);
    return DEFAULT_LESSONS.find(l => l.id === lessonId) || null;
  }
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const path = `lessons/${lesson.id}`;
  try {
    await setDoc(doc(db, 'lessons', lesson.id), {
      ...lesson,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await logAdminAction('SAVE', 'Lesson', lesson.id, `Saved lesson: ${lesson.title}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLesson(id: string): Promise<void> {
  const path = `lessons/${id}`;
  try {
    await deleteDoc(doc(db, 'lessons', id));
    await logAdminAction('DELETE', 'Lesson', id, `Deleted lesson ID ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- QUIZZES ----------------
export async function getQuizzes(subjectId?: string, chapterId?: string, isAdmin = false): Promise<Quiz[]> {
  const path = 'quizzes';
  try {
    let q = query(collection(db, path));
    if (subjectId) {
      q = query(collection(db, path), where('subjectId', '==', subjectId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      let filtered = DEFAULT_QUIZZES;
      if (subjectId) filtered = filtered.filter(q => q.subjectId === subjectId);
      if (chapterId) filtered = filtered.filter(q => q.chapterId === chapterId);
      return filtered;
    }
    let list: Quiz[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Quiz));
    if (chapterId) {
      list = list.filter(q => q.chapterId === chapterId);
    }
    if (!isAdmin) {
      list = list.filter(q => q.isPublished);
    }
    return list;
  } catch (error) {
    console.warn('Quizzes fetch fallback:', error);
    let filtered = DEFAULT_QUIZZES;
    if (subjectId) filtered = filtered.filter(q => q.subjectId === subjectId);
    if (chapterId) filtered = filtered.filter(q => q.chapterId === chapterId);
    return filtered;
  }
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const path = `quizzes/${quizId}`;
  try {
    const snap = await getDoc(doc(db, 'quizzes', quizId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Quiz;
    }
    return DEFAULT_QUIZZES.find(q => q.id === quizId) || null;
  } catch (error) {
    console.warn('Quiz get fallback:', error);
    return DEFAULT_QUIZZES.find(q => q.id === quizId) || null;
  }
}

export async function saveQuiz(quiz: Quiz): Promise<void> {
  const path = `quizzes/${quiz.id}`;
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), {
      ...quiz,
      createdAt: quiz.createdAt || new Date().toISOString()
    }, { merge: true });
    await logAdminAction('SAVE', 'Quiz', quiz.id, `Saved quiz: ${quiz.title}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  const path = `quizzes/${id}`;
  try {
    await deleteDoc(doc(db, 'quizzes', id));
    await logAdminAction('DELETE', 'Quiz', id, `Deleted quiz ID ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- QUIZ ATTEMPTS ----------------
export async function saveQuizAttempt(attempt: QuizAttempt): Promise<string> {
  const path = 'quiz_attempts';
  try {
    const docRef = await addDoc(collection(db, path), attempt);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  const path = 'quiz_attempts';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: QuizAttempt[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as QuizAttempt));
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ---------------- STUDENT PROGRESS ----------------
export async function getUserProgress(userId: string): Promise<StudentProgress[]> {
  const path = 'student_progress';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: StudentProgress[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as StudentProgress));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function recordLessonProgress(
  userId: string,
  chapterId: string,
  subjectId: 'math' | 'science',
  lessonId: string,
  totalChapterLessons: number
): Promise<void> {
  const docId = `${userId}_${chapterId}`;
  const path = `student_progress/${docId}`;
  try {
    const ref = doc(db, 'student_progress', docId);
    const snap = await getDoc(ref);
    const now = new Date().toISOString();

    let completedLessons: string[] = [];
    if (snap.exists()) {
      const data = snap.data() as StudentProgress;
      completedLessons = Array.from(new Set([...(data.completedLessons || []), lessonId]));
    } else {
      completedLessons = [lessonId];
    }

    const isChapterCompleted = totalChapterLessons > 0 && completedLessons.length >= totalChapterLessons;

    await setDoc(ref, {
      userId,
      chapterId,
      subjectId,
      completed: isChapterCompleted,
      completedLessons,
      lastLessonId: lessonId,
      lastAccessedAt: now
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- PDF DOCUMENTS ----------------
export async function getPdfDocuments(subjectId?: string, category?: string, isAdmin = false): Promise<PdfDocument[]> {
  const path = 'pdf_documents';
  try {
    let q = query(collection(db, path));
    if (subjectId) {
      q = query(collection(db, path), where('subjectId', '==', subjectId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      let filtered = DEFAULT_PDFS;
      if (subjectId) filtered = filtered.filter(p => p.subjectId === subjectId);
      if (category && category !== 'All') filtered = filtered.filter(p => p.category === category);
      return filtered;
    }
    let list: PdfDocument[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as PdfDocument));
    if (category && category !== 'All') {
      list = list.filter(p => p.category === category);
    }
    if (!isAdmin) {
      list = list.filter(p => p.isPublished);
    }
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.warn('PDF fetch fallback:', error);
    let filtered = DEFAULT_PDFS;
    if (subjectId) filtered = filtered.filter(p => p.subjectId === subjectId);
    if (category && category !== 'All') filtered = filtered.filter(p => p.category === category);
    return filtered;
  }
}

export async function savePdfDocument(pdf: PdfDocument): Promise<void> {
  const path = `pdf_documents/${pdf.id}`;
  try {
    await setDoc(doc(db, 'pdf_documents', pdf.id), {
      ...pdf,
      uploadedAt: pdf.uploadedAt || new Date().toISOString()
    }, { merge: true });
    await logAdminAction('SAVE', 'PdfDocument', pdf.id, `Saved PDF document: ${pdf.title}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePdfDocument(id: string): Promise<void> {
  const path = `pdf_documents/${id}`;
  try {
    await deleteDoc(doc(db, 'pdf_documents', id));
    await logAdminAction('DELETE', 'PdfDocument', id, `Deleted PDF ID ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- CONTACT & FEEDBACK ----------------
export async function submitContactForm(submission: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<void> {
  const path = 'contact_submissions';
  try {
    await addDoc(collection(db, path), {
      ...submission,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const path = 'contact_submissions';
  try {
    const snap = await getDocs(collection(db, path));
    const list: ContactSubmission[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as ContactSubmission));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ---------------- AUDIT LOGS ----------------
export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'audit_logs';
  try {
    const snap = await getDocs(collection(db, path));
    const list: AuditLog[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as AuditLog));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ---------------- DATABASE SEEDING ROUTINE ----------------
export async function seedInitialDatabaseIfEmpty(force = false): Promise<void> {
  try {
    const checkSnap = await getDocs(collection(db, 'chapters'));
    if (!checkSnap.empty && !force) {
      return; // Already initialized
    }

    console.log('🌱 Seeding initial CBSE Class 10 content into Firestore...');

    // 1. Site Settings
    await setDoc(doc(db, 'site_settings', 'global'), {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 2. Subjects
    for (const sub of DEFAULT_SUBJECTS) {
      await setDoc(doc(db, 'subjects', sub.id), sub, { merge: true });
    }

    // 3. Chapters
    for (const ch of DEFAULT_CHAPTERS) {
      await setDoc(doc(db, 'chapters', ch.id), ch, { merge: true });
    }

    // 4. Lessons
    for (const les of DEFAULT_LESSONS) {
      await setDoc(doc(db, 'lessons', les.id), les, { merge: true });
    }

    // 5. Quizzes
    for (const qz of DEFAULT_QUIZZES) {
      await setDoc(doc(db, 'quizzes', qz.id), qz, { merge: true });
    }

    // 6. PDFs
    for (const pdf of DEFAULT_PDFS) {
      await setDoc(doc(db, 'pdf_documents', pdf.id), pdf, { merge: true });
    }

    // 7. Announcements
    for (const ann of DEFAULT_ANNOUNCEMENTS) {
      await setDoc(doc(db, 'announcements', ann.id), ann, { merge: true });
    }

    console.log('✅ CBSE Class 10 initial content successfully seeded!');
  } catch (err) {
    console.warn('Initial seeding encountered an error or non-admin write limitation:', err);
  }
}
