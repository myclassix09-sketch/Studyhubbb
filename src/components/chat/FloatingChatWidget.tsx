import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  MessageSquare,
  Bot
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ChatContainer } from './ChatContainer';

export const FloatingChatWidget: React.FC = () => {
  const { isWidgetOpen, setIsWidgetOpen } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isWidgetOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsWidgetOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Open Studyhub AI Tutor (Gemini 3.8 Flash)"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">AI Doubt Solver</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-900 border border-slate-950/20 font-black">
            Flash
          </span>
          {/* Subtle ping indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'inset-3 sm:inset-10'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh]'
      }`}
    >
      <div className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-slate-950/95 backdrop-blur-2xl">
        {/* Floating Header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Study Companion
                <span className="text-[9px] font-semibold text-emerald-400 px-1 py-0.2 rounded bg-emerald-950 border border-emerald-800/80">
                  Gemini
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Restore window size' : 'Expand full screen'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => setIsWidgetOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="Close widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-hidden relative">
          <ChatContainer isCompact={!isExpanded} />
        </div>
      </div>
    </div>
  );
};
