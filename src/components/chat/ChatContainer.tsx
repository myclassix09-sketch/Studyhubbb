import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  Calculator,
  Atom,
  HelpCircle,
  ArrowDown,
  Info
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ChatMessageItem } from './ChatMessageItem';
import { QUICK_PROMPTS } from '../../services/geminiService';

interface ChatContainerProps {
  initialSubject?: 'all' | 'math' | 'science';
  chapterContext?: string;
  isCompact?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  chapterContext,
  isCompact = false,
}) => {
  const {
    messages,
    isLoading,
    error,
    subject,
    setSubject,
    sendMessage,
    clearHistory,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new message or thinking
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text, chapterContext);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredQuickPrompts = QUICK_PROMPTS.filter((qp) =>
    subject === 'all' ? true : qp.subject === subject || qp.subject === 'all'
  );

  return (
    <div className="flex flex-col h-full bg-slate-950/70 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Top Header bar with Subject Filter & Controls */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Studyhub AI Tutor
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            {chapterContext && (
              <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                Context: {chapterContext}
              </p>
            )}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubject('all')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              subject === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSubject('math')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              subject === 'math'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Focus on CBSE Class 10 Math"
          >
            <Calculator className="w-3 h-3" />
            <span className="hidden sm:inline">Math</span>
          </button>
          <button
            onClick={() => setSubject('science')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
              subject === 'science'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Focus on CBSE Class 10 Science"
          >
            <Atom className="w-3 h-3" />
            <span className="hidden sm:inline">Science</span>
          </button>

          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Conversation Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 select-text min-h-[300px]"
      >
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 my-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-300 flex items-center gap-3 shadow-md">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span className="font-medium text-slate-300">
                Gemini 3.8 Flash is calculating & preparing step-by-step answer...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-28 right-6 p-2 rounded-full bg-emerald-500 text-slate-950 shadow-lg hover:bg-emerald-400 transition-all z-10 flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowDown className="w-4 h-4" />
          <span>New</span>
        </button>
      )}

      {/* Suggested CBSE Doubt Chips */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 shrink-0">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            Popular CBSE Class 10 Doubts:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredQuickPrompts.slice(0, 5).map((qp, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(qp.prompt, chapterContext)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-[11px] font-medium border border-slate-700/60 transition-all text-left whitespace-nowrap"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Box */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/90 shrink-0">
        <div className="relative flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isCompact
                ? 'Ask any Math or Science doubt...'
                : 'Ask any CBSE Class 10 doubt (e.g. solve 3x² - 5x + 2 = 0, explain Ohm’s Law, balanced equations)...'
            }
            rows={isCompact ? 2 : 2}
            className="w-full resize-none rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              !inputText.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20 active:scale-95'
            }`}
            title="Send (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-emerald-400" />
            <span>Shift+Enter for newline, Enter to send</span>
          </span>
          <span>Aligned with NCERT 2026</span>
        </div>
      </div>
    </div>
  );
};
