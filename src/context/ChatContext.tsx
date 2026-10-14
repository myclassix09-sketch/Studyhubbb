import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage, sendChatMessage } from '../services/geminiService';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  subject: 'all' | 'math' | 'science';
  setSubject: (sub: 'all' | 'math' | 'science') => void;
  sendMessage: (text: string, chapterTitle?: string) => Promise<void>;
  clearHistory: () => void;
  isWidgetOpen: boolean;
  setIsWidgetOpen: (open: boolean) => void;
  openWidgetWithPrompt: (promptText: string, chapterTitle?: string) => void;
}

const STORAGE_KEY = 'studyhub_gemini_chat_history_v1';

const INITIAL_GREETING: ChatMessage = {
  id: 'welcome-msg',
  role: 'model',
  content: `👋 **Namaste & Welcome to Studyhub AI Tutor!**\n\nI am your dedicated **CBSE Class 10** study partner powered by **Gemini 3.8 Flash** ⚡.\n\nHere is how I can assist you today:\n* 📐 **Mathematics:** Step-by-step problem solving, theorem proofs, and formula derivations.\n* 🔬 **Science:** Physics numericals, Chemistry chemical equations & reactions, and Biology diagrams & concepts.\n* 📝 **Board Exam Strategies:** High-scoring presentation tips and marking scheme insights.\n\nPick a topic below or type any doubt you have!`,
  timestamp: Date.now(),
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read chat history from localStorage', e);
    }
    return [INITIAL_GREETING];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<'all' | 'math' | 'science'>('all');
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [messages]);

  const sendMessage = async (userText: string, chapterTitle?: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Send conversational history (excluding internal greetings or format headers if desired)
      // Format history as user & model pairs
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        messages: apiMessages,
        subject,
        chapterTitle,
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'model',
        content: res.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg = err?.message || 'Unable to connect to Gemini AI Tutor. Please try again.';
      setError(errMsg);

      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Unable to complete request:** ${errMsg}\n\n*Please ensure your internet connection is active, or try asking your question again.*`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([INITIAL_GREETING]);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const openWidgetWithPrompt = (promptText: string, chapterTitle?: string) => {
    setIsWidgetOpen(true);
    sendMessage(promptText, chapterTitle);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        subject,
        setSubject,
        sendMessage,
        clearHistory,
        isWidgetOpen,
        setIsWidgetOpen,
        openWidgetWithPrompt,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
