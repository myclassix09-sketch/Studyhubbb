import React from 'react';
import { BookOpen, Target, Award, Users, CheckCircle, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
          About Studyhub
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Transforming CBSE Class 10 Learning
        </h1>
        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Studyhub is built around one clear mission: empower every Class 10 student to truly understand core scientific and mathematical concepts without memorizing blindly.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Concept-First Pedagogy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instead of presenting bare formula tables, we walk through the mathematical logic and physical principles step-by-step with real-life connections.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">CBSE Marking Scheme Focus</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All worked examples mirror the exact step marks evaluated in official CBSE standard and basic board exam question papers.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Zero Clutter & Safe Design</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No advertisements or tracking bloat. Only verified study notes, timed interactive questions, and instant score analysis.
          </p>
        </div>
      </div>

      {/* Syllabus Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Curriculum Alignment Notice</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Studyhub content is actively aligned with the current official CBSE Class 10 rationalized curriculum for Mathematics (Real Numbers to Probability) and Science (Chemical Reactions, Life Processes, Light, Electricity, and Environment).
        </p>
        <p className="text-xs text-slate-400">
          Administrator updates can be published instantly without modifying source code, guaranteeing students always have the latest curriculum updates.
        </p>
      </div>
    </div>
  );
};
