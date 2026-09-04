// app/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, User, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  TeacherSettings,
  MonthlyReportData,
  EshelReportData,
  SignatureRequestDoc,
} from '../lib/types';
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettingsData,
  getMonthlyReport,
  saveMonthlyReport,
  getEshelReport,
  saveEshelReport,
} from '../lib/storage';
import { MONTH_NAMES } from '../lib/holidays';
import { generateMonthlyReportPdf, generateEshelPdf } from '../lib/pdf-export';
import {
  exportMonthlyReportToExcel,
  exportEshelToExcel,
} from '../lib/excel-export';

import { Header } from '../components/Header';
import { AuthModal } from '../components/AuthModal';
import { SettingsTab } from '../components/SettingsTab';
import { ReportTab } from '../components/ReportTab';
import { EshelTab } from '../components/EshelTab';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { SignRequestModal } from '../components/SignRequestModal';
import { PwaGuideModal } from '../components/PwaGuideModal';
import { User as UserIcon, Calendar, ReceiptText } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  const [activeTab, setActiveTab] = useState<'settings' | 'report' | 'eshel'>('settings');

  // Date selections: default to current date
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth());
  const [year, setYear] = useState<number>(now.getFullYear());

  // Data states
  const [settings, setSettings] = useState<TeacherSettings>(DEFAULT_SETTINGS);
  const [report, setReport] = useState<MonthlyReportData>({
    days: {},
    notes: { chet: '', tet: '', masaot: '', mishatzim: '' },
    date: '',
    signature: '',
  });
  const [eshel, setEshel] = useState<EshelReportData>({
    rows: Array.from({ length: 20 }, () => ({
      date: '',
      dayname: '',
      fromTime: '',
      toTime: '',
      fromPlace: '',
      toPlace: '',
      purpose: '',
      beinIri: false,
      iri: false,
      boker: false,
      tsaharaim: false,
      erev: false,
      lina: '',
      total: '',
    })),
    date: '',
    signature: '',
  });

  // Principal Signature Modal State
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signDocStatus, setSignDocStatus] = useState<'pending' | 'signed'>('pending');
  const [principalSigImg, setPrincipalSigImg] = useState<string | undefined>();
  const [signUrl, setSignUrl] = useState('');

  // PDF Preview Modal State
  const [pdfPreviewImg, setPdfPreviewImg] = useState<string | null>(null);
  const [pdfSaveAction, setPdfSaveAction] = useState<(() => void) | null>(null);

  // Initialize PWA and OS detection
  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      setCanInstall(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Auth State Listener & Initial Settings Load
  useEffect(() => {
    // Process redirect sign-in result (mobile flow)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.error('Redirect sign-in error:', err);
      });

    // 1. Immediately load from localStorage on initial render before auth is resolved
    getSettings().then((localSettings) => {
      setSettings((prev) => {
        // Only set if prev is empty/default
        if (!prev.firstName && !prev.lastName && !prev.idNumber) {
          return localSettings;
        }
        return prev;
      });
    });

    // 2. Listen to Firebase auth changes and load cloud settings
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const loadedSettings = await getSettings(currentUser?.uid);
      setSettings(loadedSettings);
    });
    return () => unsubscribe();
  }, []);

  // Load Monthly Report whenever month, year, or user changes
  useEffect(() => {
    const fetchReport = async () => {
      const data = await getMonthlyReport(year, month, user?.uid);
      if (data) {
        setReport(data);
      } else {
        setReport({
          days: {},
          notes: { chet: '', tet: '', masaot: '', mishatzim: '' },
          date: '',
          signature: '',
        });
      }
    };
    fetchReport();
  }, [month, year, user]);

  // Load Eshel Report whenever month, year, or user changes
  useEffect(() => {
    const fetchEshel = async () => {
      const data = await getEshelReport(year, month, user?.uid);
      if (data && data.rows && data.rows.length > 0) {
        setEshel(data);
      } else {
        setEshel({
          rows: Array.from({ length: 20 }, () => ({
            date: '',
            dayname: '',
            fromTime: '',
            toTime: '',
            fromPlace: '',
            toPlace: '',
            purpose: '',
            beinIri: false,
            iri: false,
            boker: false,
            tsaharaim: false,
            erev: false,
            lina: '',
            total: '',
          })),
          date: '',
          signature: '',
        });
      }
    };
    fetchEshel();
  }, [month, year, user]);

  // Check Principal Signature status for current month/year
  useEffect(() => {
    if (!user) {
      setSignDocStatus('pending');
      setPrincipalSigImg(undefined);
      return;
    }

    const docId = `${user.uid}_${year}_${month}`;
    const checkSign = async () => {
      try {
        const docRef = doc(db, 'signature_requests', docId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const d = snap.data() as SignatureRequestDoc;
          setSignDocStatus(d.status);
          setPrincipalSigImg(d.principalSignature);
        } else {
          setSignDocStatus('pending');
          setPrincipalSigImg(undefined);
        }
      } catch (e) {
        console.error('Error checking signature request:', e);
      }
    };
    checkSign();
  }, [user, year, month]);

  // Save Settings handler
  const handleSaveSettings = async (newSettings: TeacherSettings) => {
    setSettings(newSettings);
    await saveSettingsData(newSettings, user?.uid);
  };

  // Update & auto-save report
  const handleUpdateReport = useCallback(
    (updater: (prev: MonthlyReportData) => MonthlyReportData) => {
      setReport((prev) => {
        const next = updater(prev);
        saveMonthlyReport(year, month, next, user?.uid);
        return next;
      });
    },
    [year, month, user]
  );

  // Delete Principal Signature
  const handleDeletePrincipalSig = async (showConfirm = true) => {
    if (showConfirm && !confirm('האם אתה בטוח שברצונך למחוק את חתימת המנהל/ת עבור חודש זה?')) {
      return;
    }

    setSignDocStatus('pending');
    setPrincipalSigImg(undefined);

    if (user) {
      const docId = `${user.uid}_${year}_${month}`;
      try {
        const docRef = doc(db, 'signature_requests', docId);
        await deleteDoc(docRef);
      } catch (e) {
        console.error('Error deleting signature request:', e);
      }
    }
  };

  // Clear Report
  const handleClearReport = async () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל נתוני החודש הנוכחי?')) {
      const empty: MonthlyReportData = {
        days: {},
        notes: { chet: '', tet: '', masaot: '', mishatzim: '' },
        date: '',
        signature: '',
      };
      setReport(empty);
      saveMonthlyReport(year, month, empty, user?.uid);
      // Also delete any existing principal signature for this month
      await handleDeletePrincipalSig(false);
    }
  };

  // Update & auto-save Eshel
  const handleUpdateEshel = useCallback(
    (updater: (prev: EshelReportData) => EshelReportData) => {
      setEshel((prev) => {
        const next = updater(prev);
        saveEshelReport(year, month, next, user?.uid);
        return next;
      });
    },
    [year, month, user]
  );

  // Clear Eshel
  const handleClearEshel = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל נתוני טופס האש"ל?')) {
      const empty: EshelReportData = {
        rows: Array.from({ length: 20 }, () => ({
          date: '',
          dayname: '',
          fromTime: '',
          toTime: '',
          fromPlace: '',
          toPlace: '',
          purpose: '',
          beinIri: false,
          iri: false,
          boker: false,
          tsaharaim: false,
          erev: false,
          lina: '',
          total: '',
        })),
        date: '',
        signature: '',
      };
      setEshel(empty);
      saveEshelReport(year, month, empty, user?.uid);
    }
  };

  // Export Monthly Report PDF with preview
  const handleExportMonthlyPdf = async () => {
    // Check for warnings
    const warnings: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const missingDesc: number[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const entry = report.days[d];
      if (entry && (entry.hours || entry.substitute || entry.kita) && !entry.description) {
        missingDesc.push(d);
      }
    }
    if (missingDesc.length > 0) {
      warnings.push(`חסר תיאור פעולה בימים: ${missingDesc.join(', ')}`);
    }
    if (!report.signature) {
      warnings.push('חסרה חתימת המורה');
    }
    if (!principalSigImg) {
      warnings.push('חסרה חתימת המנהל/ת');
    }

    if (warnings.length > 0) {
      const proceed = confirm(
        `שים לב לפני הייצוא:\n\n• ${warnings.join('\n• ')}\n\nהאם להמשיך בכל זאת?`
      );
      if (!proceed) return;
    }

    try {
      const { imgData, savePdf } = await generateMonthlyReportPdf(
        settings,
        report,
        month,
        year,
        principalSigImg
      );
      setPdfPreviewImg(imgData);
      setPdfSaveAction(() => savePdf);
    } catch (e: any) {
      alert('שגיאה ביצירת PDF: ' + e.message);
    }
  };

  // Export Eshel PDF with preview
  const handleExportEshelPdf = async () => {
    if (!eshel.signature) {
      const proceed = confirm('שים לב: טופס האש"ל אינו כולל חתימת עובד. האם להמשיך בכל זאת?');
      if (!proceed) return;
    }

    try {
      const { imgData, savePdf } = await generateEshelPdf(settings, eshel, month, year);
      setPdfPreviewImg(imgData);
      setPdfSaveAction(() => savePdf);
    } catch (e: any) {
      alert('שגיאה ביצירת PDF: ' + e.message);
    }
  };

  // Create Principal Signature Link
  const handleRequestSignature = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const docId = `${user.uid}_${year}_${month}`;
    const url = `${window.location.origin}/sign?id=${docId}`;
    setSignUrl(url);

    try {
      const docRef = doc(db, 'signature_requests', docId);
      await setDoc(
        docRef,
        {
          teacherUid: user.uid,
          teacherName: `${settings.firstName} ${settings.lastName}`.trim() || user.displayName || user.email,
          schoolName: settings.schoolName || '',
          month,
          year,
          status: signDocStatus,
          reportSnapshot: report.days,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSignModalOpen(true);
    } catch (e: any) {
      alert('שגיאה ביצירת קישור החתימה: ' + e.message);
    }
  };

  // PWA Install Prompt Trigger
  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          setCanInstall(false);
        }
        setDeferredPrompt(null);
      });
      return;
    }
    setPwaModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* App Header */}
      <Header
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={() => signOut(auth)}
        onInstallApp={handleInstallApp}
        canInstall={canInstall}
      />

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-around md:justify-start md:gap-4 px-2 sm:px-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs md:text-sm border-b-2 transition cursor-pointer select-none ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>פרטים אישיים</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs md:text-sm border-b-2 transition cursor-pointer select-none ${
              activeTab === 'report'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>דוח חודשי</span>
          </button>
          <button
            onClick={() => setActiveTab('eshel')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs md:text-sm border-b-2 transition cursor-pointer select-none ${
              activeTab === 'eshel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>אש&quot;ל</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'settings' && (
          <SettingsTab settings={settings} onSave={handleSaveSettings} />
        )}
        {activeTab === 'report' && (
          <ReportTab
            settings={settings}
            report={report}
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onUpdateReport={handleUpdateReport}
            onClearReport={handleClearReport}
            onExportPdf={handleExportMonthlyPdf}
            onExportExcel={() => exportMonthlyReportToExcel(report, month, year)}
            onRequestSignature={handleRequestSignature}
            hasPrincipalSig={signDocStatus === 'signed'}
            principalSigImg={principalSigImg}
            onDeletePrincipalSig={handleDeletePrincipalSig}
          />
        )}
        {activeTab === 'eshel' && (
          <EshelTab
            settings={settings}
            eshel={eshel}
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onUpdateEshel={handleUpdateEshel}
            onClearEshel={handleClearEshel}
            onExportPdf={handleExportEshelPdf}
            onExportExcel={() => exportEshelToExcel(eshel, month, year)}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <SignRequestModal
        isOpen={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        signUrl={signUrl}
        isSigned={signDocStatus === 'signed'}
        principalSig={principalSigImg}
        teacherName={`${settings.firstName} ${settings.lastName}`}
        schoolName={settings.schoolName}
        monthName={MONTH_NAMES[month]}
        onDeletePrincipalSig={handleDeletePrincipalSig}
      />

      <PdfPreviewModal
        imgData={pdfPreviewImg}
        onDownload={() => {
          if (pdfSaveAction) pdfSaveAction();
          setPdfPreviewImg(null);
        }}
        onClose={() => setPdfPreviewImg(null)}
      />

      <PwaGuideModal
        isOpen={pwaModalOpen}
        onClose={() => setPwaModalOpen(false)}
        isIOS={isIOS}
      />
    </div>
  );
}
