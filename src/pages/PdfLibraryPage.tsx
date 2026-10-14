import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  Eye,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  X
} from 'lucide-react';
import { PdfDocument, PdfCategory } from '../types';
import { getPdfDocuments } from '../services/contentService';

interface PdfLibraryPageProps {
  onPreviewPdf: (pdf: PdfDocument) => void;
}

export const PdfLibraryPage: React.FC<PdfLibraryPageProps> = ({ onPreviewPdf }) => {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [loading, setLoading] = useState(true);

  const categories: (PdfCategory | 'All')[] = [
    'All',
    'Notes',
    'Formula Sheet',
    'Worksheet',
    'Sample Paper',
    'NCERT Solutions',
  ];

  useEffect(() => {
    async function loadPdfs() {
      setLoading(true);
      try {
        const docs = await getPdfDocuments();
        setPdfs(docs);
      } catch (err) {
        console.error('Failed to load PDF library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPdfs();

    const handleContentUpdate = () => {
      loadPdfs();
    };
    window.addEventListener('studyhub_content_changed', handleContentUpdate);
    return () => window.removeEventListener('studyhub_content_changed', handleContentUpdate);
  }, []);

  const filteredPdfs = pdfs
    .filter((pdf) => {
      const matchesSearch =
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        selectedSubject === 'All' || pdf.subjectId === selectedSubject;

      const matchesCat =
        selectedCategory === 'All' || pdf.category === selectedCategory;

      return matchesSearch && matchesSubject && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resource Repository
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Class 10 PDF Library
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Download and preview verified CBSE Class 10 study materials. Comprehensive formula cheat sheets, handwritten revision notes, worksheets, and model sample papers.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shrink-0 min-w-[200px] text-center">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Available Documents</span>
            <span className="text-3xl font-extrabold text-emerald-400">{pdfs.length}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Free to preview and download</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedSubject('All')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubject === 'All'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedSubject('math')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubject === 'math'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mathematics
            </button>
            <button
              onClick={() => setSelectedSubject('science')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubject === 'science'
                  ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Science
            </button>
          </div>

          {/* Sorting */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 w-full">
              <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="date">Sort: Recently Added</option>
                <option value="title">Sort: Title (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading PDF documents...</p>
        </div>
      ) : filteredPdfs.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No documents match your filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('All');
              setSelectedCategory('All');
            }}
            className="text-xs font-bold text-emerald-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md">
                    {pdf.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {pdf.subjectId === 'math' ? 'Mathematics' : 'Science'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-2 line-clamp-2">
                  {pdf.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-6">
                  {pdf.description}
                </p>
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{pdf.fileSize || 'Standard PDF'}</span>
                  <span>
                    {pdf.uploadedAt ? new Date(pdf.uploadedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onPreviewPdf(pdf)}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preview</span>
                  </button>
                  <a
                    href={pdf.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
