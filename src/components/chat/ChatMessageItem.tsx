import React, { useState } from 'react';
import { Sparkles, User, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../../services/geminiService';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format basic markdown-like content into structured elements
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      // Check for code block boundary
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          elements.push(
            <div
              key={`code-${index}`}
              className="my-3 p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto select-text"
            >
              <pre>{codeBlockBuffer.join('\n')}</pre>
            </div>
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          // Open code block
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      // Headers ###
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${index}`} className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {line.replace('### ', '')}
          </h4>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${index}`} className="text-base font-bold text-emerald-400 mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${index}`} className="text-lg font-extrabold text-white mt-4 mb-2">
            {line.replace('# ', '')}
          </h2>
        );
        return;
      }

      // Blockquotes >
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="border-l-2 border-emerald-500/60 pl-3 py-1 my-2 bg-emerald-950/20 text-slate-300 text-xs italic rounded-r"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Bullet lists * or -
      if (line.match(/^[\*\-]\s+/)) {
        const bulletText = line.replace(/^[\*\-]\s+/, '');
        elements.push(
          <li key={`bullet-${index}`} className="flex items-start gap-2 my-1 text-xs text-slate-300">
            <span className="text-emerald-400 font-bold mt-0.5">•</span>
            <span>{renderInlineFormatting(bulletText)}</span>
          </li>
        );
        return;
      }

      // Numbered lists 1. 2.
      if (line.match(/^\d+\.\s+/)) {
        const match = line.match(/^(\d+\.)\s+(.*)/);
        if (match) {
          const [, num, text] = match;
          elements.push(
            <li key={`num-${index}`} className="flex items-start gap-2 my-1.5 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400 min-w-4 text-right">{num}</span>
              <span>{renderInlineFormatting(text)}</span>
            </li>
          );
          return;
        }
      }

      // Empty line spacer
      if (!line.trim()) {
        elements.push(<div key={`spacer-${index}`} className="h-2" />);
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${index}`} className="text-xs text-slate-200 leading-relaxed my-1">
          {renderInlineFormatting(line)}
        </p>
      );
    });

    return elements;
  };

  // Helper for bold **text**, inline code `code`, and highlighting
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Split by markdown bold **
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex items-start gap-3 my-3.5 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } group transition-all`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white'
            : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-semibold text-slate-400">
            {isUser ? 'You' : 'Studyhub AI Tutor (Gemini 3.8 Flash)'}
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div
          className={`relative rounded-2xl p-4 shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm border border-emerald-500/40'
              : 'bg-slate-900/90 text-slate-200 rounded-tl-sm border border-slate-800/90 backdrop-blur-sm'
          }`}
        >
          {/* Formatted body */}
          <div className="prose prose-invert max-w-none text-xs">
            {renderFormattedText(message.content)}
          </div>

          {/* Copy action button for model responses */}
          {!isUser && (
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-[10px] text-emerald-400/80 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                CBSE Class 10 Syllabus
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 opacity-70" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
