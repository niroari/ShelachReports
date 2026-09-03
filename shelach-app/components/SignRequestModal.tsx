// components/SignRequestModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Send } from 'lucide-react';

interface SignRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  signUrl: string;
  isSigned: boolean;
  principalSig?: string;
  teacherName: string;
  schoolName: string;
  monthName: string;
}

export const SignRequestModal: React.FC<SignRequestModalProps> = ({
  isOpen,
  onClose,
  signUrl,
  isSigned,
  principalSig,
  teacherName,
  schoolName,
  monthName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(signUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = `שלום, מצורף דוח של"ח חודשי עבור ${teacherName} (${schoolName}) לחודש ${monthName} לעיונך וחתימתך הדיגיטלית:\n${signUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGmail = () => {
    const subject = `דוח של"ח לחתימה - ${teacherName} (${monthName})`;
    const body = `שלום רב,\n\nמצורף דוח פעילות ונוכחות של"ח לחודש ${monthName} לעיונך וחתימתך:\n${signUrl}\n\nבברכה,\n${teacherName}`;
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <span>✍ שלח לחתימת מנהל/ת</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-neutral-800">
          {isSigned ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
              <span className="text-emerald-700 font-bold text-sm block">
                ✓ הדוח כבר נחתם על ידי המנהל/ת!
              </span>
              {principalSig && (
                <div className="flex justify-center p-2 bg-white rounded-lg border border-emerald-100">
                  <img src={principalSig} alt="חתימת מנהל" className="h-12 object-contain" />
                </div>
              )}
              <p className="text-xs text-emerald-600">
                החתימה תופיע באופן אוטומטי בעת ייצוא קובץ ה-PDF.
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 leading-relaxed">
              שלח את הקישור הבא למנהל/ת בית הספר. הם יוכלו לעיין בכל שורות הדוח ולחתום דיגיטלית ישירות מהנייד או המחשב ללא צורך בהתחברות.
            </p>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={signUrl}
              className="flex-1 text-xs px-3 py-2.5 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 select-all font-mono"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold px-3 py-2.5 rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'הועתק!' : 'העתק'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 block mb-2.5">
              שיתוף ישיר ומהיר:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-2 px-3 rounded-xl shadow-xs transition active:scale-98 text-xs cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleGmail}
                className="flex items-center justify-center gap-2 bg-[#EA4335] hover:bg-[#d9382b] text-white font-semibold py-2 px-3 rounded-xl shadow-xs transition active:scale-98 text-xs cursor-pointer"
              >
                <span>Gmail</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
