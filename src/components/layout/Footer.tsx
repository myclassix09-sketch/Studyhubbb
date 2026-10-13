import React from 'react';
import { BookOpen, Shield, Heart, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, openAuthModal }) => {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md">
                <BookOpen className="w-5 h-5 font-bold" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Studyhub</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Learn Smart. Practice More. Achieve More. The complete CBSE Class 10 digital companion for Mathematics and Science.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Aligned with latest CBSE 2024-25 Syllabus</span>
            </div>
          </div>

          {/* Quick Learning Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Curriculum</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('math')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Class 10 Mathematics (14 Chapters)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('science')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Class 10 Science (Physics, Chem, Bio)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('pdfs')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Downloadable PDF Library
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  My Student Dashboard & Progress
                </button>
              </li>
            </ul>
          </div>

          {/* Important Resources */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  About Studyhub Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Student Contact & Feedback
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('privacy')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Privacy Policy (Data Minimization)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('terms')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Terms of Educational Use
                </button>
              </li>
            </ul>
          </div>

          {/* Portal & Admin access */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Access Portal</h4>
            <p className="text-xs text-slate-400">
              Students track chapter progress & practice quizzes. Administrator manages content directly without code.
            </p>
            {isAdmin ? (
              <button
                onClick={() => setCurrentTab('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all shadow-sm"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Launch Admin Control Center</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('admin-login')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Administrator Portal</span>
                </button>
              </div>
            )}
            <div className="text-[11px] text-slate-500 leading-tight">
              Verified Administrator Access (Firebase Protected)
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Studyhub. All rights reserved. Free educational platform for CBSE students.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for Class 10 success</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
