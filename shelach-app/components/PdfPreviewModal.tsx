// components/PdfPreviewModal.tsx
'use client';

import React from 'react';
import { Download, X } from 'lucide-react';

interface PdfPreviewModalProps {
  imgData: string | null;
  onDownload: () => void;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  imgData,
  onDownload,
  onClose,
}) => {
  if (!imgData) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 md:p-6 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base">
            <span>📄 תצוגה מקדימה של הקובץ לפני הורדה</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Image scroll view */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-100 flex justify-center items-start">
          <img
            src={imgData}
            alt="תצוגה מקדימה"
            className="w-auto max-w-full shadow-lg rounded border border-neutral-300 bg-white"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            סגור
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow transition active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>הורד PDF ⬇</span>
          </button>
        </div>
      </div>
    </div>
  );
};
