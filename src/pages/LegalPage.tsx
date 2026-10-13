import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Lock } from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'privacy' }) => {
  const [tab, setTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 pb-24">
      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'privacy'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>
        <button
          onClick={() => setTab('terms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'terms'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Terms of Use</span>
        </button>
      </div>

      {tab === 'privacy' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-extrabold text-white">Studyhub Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-1">
              Data Minimization & Student Privacy Standards — Updated for CBSE 2024-25
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Strict Principle of Data Minimization</h2>
            <p>
              Studyhub is an educational platform designed specifically for students. We collect only the absolute minimum information necessary to authenticate accounts and persist chapter progress. We do not collect school names, home addresses, phone numbers, Aadhaar numbers, or dates of birth.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. What Information We Store</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Authentication credentials: Email address and display name via Google or Firebase Auth.</li>
              <li>Learning metrics: Completed lessons, quiz scores, percentages, and timestamps to track your academic progress.</li>
              <li>Feedback: Voluntary messages submitted via the student contact form.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Zero Third-Party Advertising & No Sale of Data</h2>
            <p>
              Student data is never sold, leased, or shared with commercial marketing entities or ad brokers. Your learning records are protected by database security rules that prevent cross-student inspection.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Account Rights & Deletion</h2>
            <p>
              Students may sign out at any time or request account deletion by emailing support@studyhub.edu.
            </p>
          </section>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-extrabold text-white">Terms of Educational Use</h1>
            <p className="text-xs text-slate-500 mt-1">
              Guidelines for Students and Authorized Educators
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Educational Purpose</h2>
            <p>
              Studyhub materials, notes, formula sheets, and practice test engines are provided for self-study and CBSE Class 10 board exam preparation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Permitted Use</h2>
            <p>
              Students are free to read online, attempt quizzes, and download PDF sheets for non-commercial educational study.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Platform Integrity</h2>
            <p>
              Unauthorized automated scraping, reverse engineering, or attempting to bypass administrative security controls or manipulate database state is strictly prohibited.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
