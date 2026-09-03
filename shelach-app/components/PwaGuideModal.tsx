// components/PwaGuideModal.tsx
'use client';

import React from 'react';
import { X, Smartphone, PlusSquare, Share2 } from 'lucide-react';

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({
  isOpen,
  onClose,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <span>📲 התקנת האפליקציה</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-neutral-700">
          {isIOS ? (
            <div>
              <p className="font-bold text-sm text-neutral-900 mb-3">
                להתקנה מהירה באייפון / אייפד:
              </p>
              <ol className="space-y-3 text-xs md:text-sm list-none p-0">
                <li className="flex items-start gap-2.5">
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>
                    1. לחץ על כפתור השיתוף בתחתית הדפדפן (<strong>ריבוע עם חץ למעלה ⎋</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <span>
                    2. גלול בתפריט ובחר ב-<strong>&quot;הוסף למסך הבית&quot; ➕</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span>
                    3. לחץ על <strong>&quot;הוסף&quot;</strong> בפינה העליונה.
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">
              ניתן להתקין את האפליקציה ישירות דרך תפריט הדפדפן (3 נקודות בפינה העליונה) ולבחור ב-
              <strong>&quot;התקן אפליקציה&quot;</strong> או <strong>&quot;הוסף למסך הבית&quot;</strong>.
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-xs transition text-sm cursor-pointer"
            >
              הבנתי, תודה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
