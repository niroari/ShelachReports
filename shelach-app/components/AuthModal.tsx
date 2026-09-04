// components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { X, Lock, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'google' | 'email'>('google');
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
      case 'auth/invalid-credential':
        return 'סיסמה שגויה או אימייל לא קיים';
      case 'auth/user-not-found':
        return 'לא נמצא משתמש עם אימייל זה';
      case 'auth/email-already-in-use':
        return 'כתובת האימייל הזו כבר רשומה במערכת';
      case 'auth/weak-password':
        return 'הסיסמה חלשה מדי (נדרשים לפחות 6 תווים)';
      case 'auth/invalid-email':
        return 'כתובת אימייל לא חוקית';
      case 'auth/popup-blocked':
      case 'auth/cancelled-popup-request':
        return 'חלון ההתחברות נחסם על ידי הדפדפן במכשיר. לחץ על סמל החלונות החסומים בדפדפן ובחר "אפשר תמיד", או התחבר עם אימייל וסיסמה בלשונית למעלה.';
      case 'auth/unauthorized-domain':
        return 'כתובת האתר הנוכחית אינה מורשית ב-Firebase. יש להוסיף את הדומיין ב-Firebase Console תחת Authentication > Settings > Authorized domains.';
      default:
        return code ? `אירעה שגיאה (${code}). נסה שוב.` : 'אירעה שגיאה בהתחברות. נסה שוב.';
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setLoading(true);

    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://'));

    // In PWA standalone mode and modern mobile/desktop, signInWithPopup keeps the user inside the app container
    signInWithPopup(auth, googleProvider)
      .then(() => {
        onClose();
      })
      .catch((e: any) => {
        console.error('Google sign in error:', e);
        if (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-popup-request') {
          if (!isStandalone) {
            signInWithRedirect(auth, googleProvider).catch((redirectErr: any) => {
              setErrorMsg(translateAuthError(redirectErr.code || ''));
            });
            return;
          }
          setErrorMsg(translateAuthError(e.code || ''));
        } else if (e.code !== 'auth/popup-closed-by-user') {
          setErrorMsg(translateAuthError(e.code || ''));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
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
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (e: any) {
      setErrorMsg(translateAuthError(e.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMsg('יש להזין כתובת אימייל כדי לקבל קישור להגדרת סיסמה.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
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
            <h2 className="font-bold text-base">מילוי דוחות של&quot;ח</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setTab('google'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              tab === 'google'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => { setTab('email'); setErrorMsg(''); }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              tab === 'email'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            אימייל וסיסמה
          </button>
        </div>

        <div className="p-6">
          {resetSent && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 mb-4 font-medium leading-relaxed">
              נשלח קישור להגדרת סיסמה לכתובת <strong>{email}</strong>!
              <br />
              בדוק את תיבת המייל שלך (כולל תיקיית ספאם/קידומי מכירות), לחץ על הקישור וקבע סיסמה. לאחר מכן תוכל להתחבר כאן רגיל עם האימייל והסיסמה בכל מכשיר.
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4 font-medium leading-relaxed">
              <p>{errorMsg}</p>
              {tab === 'google' && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setTab('email');
                  }}
                  className="mt-2 text-blue-600 underline font-semibold cursor-pointer block hover:text-blue-800"
                >
                  מעבר להתחברות עם אימייל וסיסמה &larr;
                </button>
              )}
              {tab === 'email' && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="mt-2 text-blue-600 underline font-semibold cursor-pointer block hover:text-blue-800"
                >
                  נרשמת בעבר עם Google או שכחת סיסמה? לחץ כאן לקבלת קישור להגדרת סיסמה &larr;
                </button>
              )}
            </div>
          )}

          {tab === 'google' ? (
            <div className="space-y-4 text-center py-2">
              <p className="text-sm text-neutral-600 leading-relaxed">
                התחבר עם חשבון Google לשמירה וסנכרון מאובטח של הדוחות שלך בכל מכשיר.
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold py-2.5 px-4 rounded-xl shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{loading ? 'מעביר להתחברות...' : 'המשך באמצעות Google'}</span>
              </button>
            </div>
          ) : (
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
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition cursor-pointer disabled:opacity-60 text-sm"
              >
                {loading ? 'טוען...' : emailMode === 'login' ? 'כניסה' : 'צור חשבון חדש'}
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
                    className="text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                  >
                    שכחת סיסמה / נרשמת דרך Google?
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
