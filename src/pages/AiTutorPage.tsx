import React from 'react';
import {
  Sparkles,
  Calculator,
  Atom,
  BookOpen,
  Zap,
  HelpCircle,
  Lightbulb,
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { useChat } from '../context/ChatContext';

export const AiTutorPage: React.FC = () => {
  const { sendMessage, setSubject } = useChat();

  const mathTopics = [
    { name: 'Quadratic Equations', prompt: 'Solve step-by-step: Find roots of 2x² - 7x + 3 = 0 using the quadratic formula, and state the nature of roots using discriminant.' },
    { name: 'Trigonometry Proofs', prompt: 'Prove the identity: (sin θ + cosec θ)² + (cos θ + sec θ)² = 7 + tan² θ + cot² θ step-by-step.' },
    { name: 'Arithmetic Progressions', prompt: 'The 4th term of an AP is 14 and the 12th term is 70. Find the first term, common difference, and the sum of first 20 terms.' },
    { name: 'Surface Areas & Volumes', prompt: 'A solid toy is in the form of a hemisphere surmounted by a right circular cone. Explain how to compute total surface area and volume.' },
  ];

  const scienceTopics = [
    { name: 'Chemical Reactions', prompt: 'Explain Combination, Decomposition, Displacement, and Double Displacement reactions with balanced equations from NCERT Class 10.' },
    { name: 'Electricity & Circuit Numericals', prompt: 'Three resistors of 5Ω, 10Ω, and 30Ω are connected in parallel to a 12V battery. Calculate equivalent resistance, total current, and current in each resistor.' },
    { name: 'Refraction & Snell’s Law', prompt: 'State the laws of refraction of light and explain Snell’s law with refractive index formula n = c / v.' },
    { name: 'Life Processes (Nutrition & Respiration)', prompt: 'What is the difference between Aerobic and Anaerobic respiration? Write the breakdown of glucose pathways in flowchart form.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Gemini 3.8 Flash</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                CBSE Class 10 AI Study Tutor
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Ask step-by-step math derivations, physics numericals, chemistry reaction balancing, and biology concepts. Maintain full multi-turn conversation history with instant responses.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Model</span>
                <span className="text-sm font-extrabold text-emerald-400">Gemini 3.8 Flash</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Curriculum</span>
                <span className="text-sm font-extrabold text-teal-400">NCERT 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Quick Doubt Explorer & Formula Tips */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Math Practice Prompts */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>Mathematics NCERT Doubts</span>
                </h3>
                <span className="text-[10px] text-slate-500">1-Click Ask</span>
              </div>
              <div className="space-y-2">
                {mathTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSubject('math');
                      sendMessage(topic.prompt);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs text-slate-200 group flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-300 group-hover:text-cyan-300">
                      {topic.name}
                    </span>
                    <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Science Practice Prompts */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Atom className="w-4 h-4" />
                  <span>Science NCERT Doubts</span>
                </h3>
                <span className="text-[10px] text-slate-500">1-Click Ask</span>
              </div>
              <div className="space-y-2">
                {scienceTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSubject('science');
                      sendMessage(topic.prompt);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 transition-all text-xs text-slate-200 group flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-300 group-hover:text-purple-300">
                      {topic.name}
                    </span>
                    <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Board Exam Golden Rules Card */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 shadow-lg">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>CBSE 10 Scoring Strategy</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Always state the applicable theorem or formula before substituting values.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Always balance chemical equations and indicate state symbols: (s), (l), (g), (aq).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Draw neat ray diagrams with arrows indicating direction of light propagation.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Full Interactive Chat Container */}
          <div className="lg:col-span-8 h-[740px]">
            <ChatContainer />
          </div>
        </div>
      </div>
    </div>
  );
};
