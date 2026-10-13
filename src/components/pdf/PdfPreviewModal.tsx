import React from 'react';
import { X, Download, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { PdfDocument } from '../../types';

interface PdfPreviewModalProps {
  pdf: PdfDocument | null;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ pdf, onClose }) => {
  if (!pdf) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {pdf.title}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{pdf.category}</span>
                <span>•</span>
                <span>{pdf.fileSize || 'Standard Document'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdf.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-4">
          <div className="w-full h-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl overflow-y-auto border border-slate-800 text-slate-900 dark:text-slate-100 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Studyhub CBSE Class 10 Educational Repository
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {pdf.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Subject: {pdf.subjectId === 'math' ? 'Mathematics' : 'Science'} | Category: {pdf.category}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Document Synopsis:</h4>
              <p className="text-slate-600 dark:text-slate-400">{pdf.description}</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                High-Yield Key Summary & Revision Highlights:
              </h4>

              <ul className="space-y-2.5 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Strictly aligned with current CBSE Class 10 syllabus and marking scheme.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Contains solved NCERT exemplar questions with complete step-by-step logic.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Includes board exam frequent questions (PYQs) and expected exam patterns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Condensed for 30-minute rapid review prior to board examinations.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Ready for printing or offline study on mobile / tablet.
              </span>
              <a
                href={pdf.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Save Full Document</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
