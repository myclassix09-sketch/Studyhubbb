export type SubjectId = 'math' | 'science';

export interface Subject {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isPublished: boolean;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  chapterNumber: number;
  title: string;
  subBranch?: 'Physics' | 'Chemistry' | 'Biology' | 'General';
  description: string;
  isPublished: boolean;
  totalLessons: number;
  estimatedMinutes: number;
  order: number;
}

export type BlockType = 'heading' | 'paragraph' | 'formula' | 'example' | 'tip' | 'warning' | 'mcq';

export interface LessonBlock {
  id: string;
  type: BlockType;
  title?: string;
  content: string;
  subContent?: string;
  details?: string[];
  latex?: string;
  problemStatement?: string;
  solutionSteps?: string[];
  finalAnswer?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  subjectId: SubjectId;
  title: string;
  order: number;
  estimatedMinutes: number;
  isPublished: boolean;
  blocks: LessonBlock[];
  summary?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: SubjectId;
  chapterId?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  passingScore: number;
  isPublished: boolean;
  questions: QuizQuestion[];
  createdAt?: string;
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  userEmail: string;
  quizId: string;
  quizTitle: string;
  subjectId: SubjectId;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: { [questionId: string]: number };
  submittedAt: string;
}

export interface StudentProgress {
  id?: string;
  userId: string;
  chapterId: string;
  subjectId: SubjectId;
  completed: boolean;
  completedLessons: string[];
  lastLessonId?: string;
  lastAccessedAt: string;
}

export type PdfCategory = 'Notes' | 'Formula Sheet' | 'Worksheet' | 'Sample Paper' | 'NCERT Solutions';

export interface PdfDocument {
  id: string;
  title: string;
  description: string;
  subjectId: SubjectId;
  chapterId?: string;
  category: PdfCategory;
  fileUrl: string;
  fileSize?: string;
  isPublished: boolean;
  downloadsCount: number;
  uploadedAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  heroDescription: string;
  ctaText: string;
  ctaLink: string;
  footerNote: string;
  supportEmail: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  badge: string;
  isPublished: boolean;
  createdAt: string;
}

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface AuditLog {
  id?: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
