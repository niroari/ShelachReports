// components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { X, Lock, Mail, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const translateAuthError = (code: string) => {
    switch (code) {
      case 'auth/wrong-password':
        return 'סיסמה שגויה';
      case 'auth/invalid-credential':
        return 'אימייל או סיסמה שגויים. אם נרשמת בעבר דרך Google, לחץ למטה על "שכחת סיסמה" כדי לקבוע סיסמה לחשבון.';
      case 'auth/user-not-found':
        return 'לא נמצא משתמש עם אימייל זה';
      case 'auth/email-already-in-use':
        return 'כתובת האימייל הזו כבר רשומה במערכת. עבור ללשונית כניסה, או לחץ למטה על "שכחת סיסמה" אם ברצונך לקבוע סיסמה.';
      case 'auth/weak-password':
        return 'הסיסמה חלשה מדי (נדרשים לפחות 6 תווים)';
      case 'auth/invalid-email':
        return 'כתובת אימייל לא תקינה';
      case 'auth/too-many-requests':
        return 'בוצעו יותר מדי ניסיונות. אנא נסה שוב בעוד מספר דקות.';
      default:
        return code ? `אירעה שגיאה (${code}). נסה שוב.` : 'אירעה שגיאה בהתחברות. נסה שוב.';
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSent(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('יש למלא אימייל וסיסמה');
      return;
    }

    if (emailMode === 'register') {
      if (password.length < 6) {
        setErrorMsg('הסיסמה חייבת להכיל לפחות 6 תווים');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMsg('הסיסמאות אינן תואמות');
        return;
      }
    }

    setLoading(true);
    try {
      if (emailMode === 'login') {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
      }
      onClose();
    } catch (e: any) {
      setErrorMsg(translateAuthError(e.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('יש להזין את כתובת האימייל שלך בשדה למעלה כדי לקבל קישור להגדרת סיסמה.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSent(true);
    } catch (e: any) {
      console.error('Password reset error:', e);
      setErrorMsg(translateAuthError(e.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="https://www.moked-shelach.co.il/tiyulim/Images/shelach.gif"
              alt="לוגו"
              className="h-8 w-auto bg-black p-1 rounded"
            />
            <h2 className="font-bold text-base">
              {emailMode === 'login' ? 'כניסה למערכת' : 'הרשמה למערכת'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher between Login and Register */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setEmailMode('login');
              setErrorMsg('');
              setResetSent(false);
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              emailMode === 'login'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            כניסה
          </button>
          <button
            type="button"
            onClick={() => {
              setEmailMode('register');
              setErrorMsg('');
              setResetSent(false);
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              emailMode === 'register'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            הרשמה חדשה
          </button>
        </div>

        <div className="p-6">
          {resetSent && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 mb-4 font-medium leading-relaxed">
              נשלח קישור להגדרת סיסמה לכתובת <strong>{email}</strong>!
              <br />
              בדוק את תיבת המייל שלך (כולל תיקיית ספאם/קידומי מכירות), לחץ על הקישור וקבע סיסמה. לאחר מכן תוכל להתחבר כאן רגיל עם האימייל והסיסמה.
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4 font-medium leading-relaxed">
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="mt-2 text-blue-600 underline font-semibold cursor-pointer block hover:text-blue-800"
              >
                שכחת סיסמה או נרשמת בעבר דרך Google? לחץ כאן לקבלת קישור להגדרת סיסמה &larr;
              </button>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                כתובת אימייל
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.org.il"
                  className="w-full text-sm px-3 py-2 pl-9 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type="password"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm px-3 py-2 pl-9 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {emailMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  אימות סיסמה
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm px-3 py-2 pl-9 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition cursor-pointer disabled:opacity-60 text-sm"
            >
              {loading
                ? 'טוען...'
                : emailMode === 'login'
                ? 'כניסה למערכת'
                : 'צור חשבון חדש'}
            </button>

            <div className="flex flex-col items-center gap-2.5 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'login' ? 'register' : 'login');
                  setErrorMsg('');
                  setResetSent(false);
                }}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                {emailMode === 'login'
                  ? 'אין לך חשבון? הירשם עכשיו'
                  : 'כבר רשום? היכנס כאן'}
              </button>

              {emailMode === 'login' && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-neutral-500 hover:text-neutral-800 underline cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>שכחת סיסמה / נרשמת בעבר דרך Google?</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
