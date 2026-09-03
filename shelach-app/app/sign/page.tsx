// app/sign/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SignaturePad } from '../../components/SignaturePad';
import { SignatureRequestDoc } from '../../lib/types';
import { DAY_NAMES, MONTH_NAMES } from '../../lib/holidays';
import { CheckCircle2, AlertCircle, FileText, Check } from 'lucide-react';

function PrincipalSignContent() {
  const searchParams = useSearchParams();
  const signId = searchParams.get('id') || searchParams.get('sign');

  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState<SignatureRequestDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!signId) {
      setError('לא סופק מזהה דוח לחתימה');
      setLoading(false);
      return;
    }

    const fetchDoc = async () => {
      try {
        const docRef = doc(db, 'signature_requests', signId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as SignatureRequestDoc;
          setDocData(data);
          if (data.status === 'signed') {
            setSuccess(true);
          }
        } else {
          setError('לא נמצא דוח מתאים למזהה זה');
        }
      } catch (e: any) {
        setError('שגיאה בטעינת נתוני הדוח: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [signId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      alert('נא לצייר את חתימתך לפני השליחה');
      return;
    }
    if (!signId) return;

    setSubmitting(true);
    try {
      const docRef = doc(db, 'signature_requests', signId);
      await updateDoc(docRef, {
        status: 'signed',
        principalSignature: signature,
        signedAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (e: any) {
      alert('שגיאה בשליחת החתימה: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="text-sm font-semibold text-neutral-600 animate-pulse">
          טוען את נתוני הדוח...
        </div>
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-neutral-800">שגיאה בגישה לדוח</h2>
          <p className="text-sm text-neutral-600">{error || 'הדוח אינו זמין'}</p>
        </div>
      </div>
    );
  }

  const daysEntries = Object.entries(docData.reportSnapshot || {})
    .filter(([_, v]) => v && (v.hours || v.substitute || v.kita || v.description))
    .sort(([a], [b]) => parseInt(a) - parseInt(b));

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 font-sans" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-neutral-200">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4 mb-4">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">חתימת מנהל/ת על דוח של&quot;ח</h1>
              <p className="text-xs text-neutral-500">
                דוח פעילות ונוכחות חודשי של מורה של&quot;ח
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs md:text-sm bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
            <div>
              <span className="text-neutral-500 block text-[11px]">מורה</span>
              <strong className="text-neutral-800">{docData.teacherName}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">בית ספר</span>
              <strong className="text-neutral-800">{docData.schoolName}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">חודש</span>
              <strong className="text-neutral-800">{MONTH_NAMES[docData.month]}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">שנה</span>
              <strong className="text-neutral-800">{docData.year}</strong>
            </div>
          </div>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl p-8 shadow-xs border border-neutral-200 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-in zoom-in-50 duration-300" />
            <h2 className="text-xl font-bold text-neutral-900">הדוח נחתם בהצלחה!</h2>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto">
              חתימתך נשמרה במערכת ותתווסף אוטומטית לטופס הרשמי של המורה. תודה רבה.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Snapshot of activity */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-neutral-200 space-y-4">
              <h2 className="text-sm font-bold text-neutral-800">פירוט הפעילות החודשית:</h2>
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                      <th className="p-2 w-12 text-center">יום</th>
                      <th className="p-2 w-16 text-center">שעות</th>
                      <th className="p-2 w-16 text-center">ש&quot;נ/מ&quot;מ</th>
                      <th className="p-2 w-16 text-center">כיתה</th>
                      <th className="p-2">תיאור פעילות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {daysEntries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-neutral-400">
                          אין שורות פעילות בדוח זה
                        </td>
                      </tr>
                    ) : (
                      daysEntries.map(([day, entry]) => (
                        <tr key={day} className="hover:bg-neutral-50">
                          <td className="p-2 text-center font-bold text-neutral-800">{day}</td>
                          <td className="p-2 text-center">{entry.hours || '-'}</td>
                          <td className="p-2 text-center">{entry.substitute || '-'}</td>
                          <td className="p-2 text-center">{entry.kita || '-'}</td>
                          <td className="p-2 font-medium">{entry.description || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-neutral-200 space-y-4">
              <SignaturePad
                value={signature}
                onChange={setSignature}
                label="חתימת מנהל/ת בית הספר (צייר בעכבר או באצבע)"
              />

              <button
                type="submit"
                disabled={submitting || !signature}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50 text-sm md:text-base"
              >
                <Check className="w-5 h-5" />
                <span>{submitting ? 'שומר חתימה...' : 'חתום ושלח ✓'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PrincipalSignPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">טוען דוח...</div>}>
      <PrincipalSignContent />
    </Suspense>
  );
}
