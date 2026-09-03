// components/ReportTab.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { TeacherSettings, MonthlyReportData, DayReportEntry } from '../lib/types';
import { DAY_NAMES, MONTH_NAMES, getVacationLabel } from '../lib/holidays';
import { SignaturePad } from './SignaturePad';
import {
  FileText,
  FileSpreadsheet,
  Send,
  Trash2,
  Calendar as CalendarIcon,
  Table as TableIcon,
  X,
  Check,
} from 'lucide-react';

interface ReportTabProps {
  settings: TeacherSettings;
  report: MonthlyReportData;
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onUpdateReport: (updater: (prev: MonthlyReportData) => MonthlyReportData) => void;
  onClearReport: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onRequestSignature: () => void;
  hasPrincipalSig: boolean;
  principalSigImg?: string;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  settings,
  report,
  month,
  year,
  onMonthChange,
  onYearChange,
  onUpdateReport,
  onClearReport,
  onExportPdf,
  onExportExcel,
  onRequestSignature,
  hasPrincipalSig,
  principalSigImg,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [activeDayPanel, setActiveDayPanel] = useState<number | null>(null);

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  // Handle cell input change
  const handleCellChange = (day: number, field: keyof DayReportEntry, value: string) => {
    onUpdateReport((prev) => {
      const existing = prev.days[day] || {};
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: { ...existing, [field]: value },
        },
      };
    });
  };

  // Calculate totals
  const totalHours = useMemo(() => {
    let sum = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const entry = report.days[d];
      if (entry?.hours) {
        const val = parseFloat(entry.hours);
        if (!isNaN(val)) sum += val;
      }
    }
    return sum;
  }, [report, daysInMonth]);

  const totalSubstitute = useMemo(() => {
    let sum = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const entry = report.days[d];
      if (entry?.substitute) {
        const val = parseFloat(entry.substitute);
        if (!isNaN(val)) sum += val;
      }
    }
    return sum;
  }, [report, daysInMonth]);

  const years = Array.from({ length: 12 }, (_, i) => 2024 + i);

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-4">
      {/* Top Controls Card */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs md:text-sm font-semibold text-neutral-600">חודש:</label>
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="text-xs md:text-sm font-semibold border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {[8, 9, 10, 11, 0, 1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  {MONTH_NAMES[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs md:text-sm font-semibold text-neutral-600">שנה:</label>
            <select
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="text-xs md:text-sm font-semibold border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>טבלה</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>לוח שנה</span>
          </button>
        </div>

        {/* Export and Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm px-3.5 py-1.5 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>ייצא PDF ⬇</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs md:text-sm px-3.5 py-1.5 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ייצא אקסל ⬇</span>
          </button>
          <button
            onClick={onRequestSignature}
            className={`flex items-center gap-1.5 font-semibold text-xs md:text-sm px-3.5 py-1.5 rounded-lg shadow-xs transition active:scale-95 cursor-pointer ${
              hasPrincipalSig
                ? 'bg-purple-700 text-white hover:bg-purple-800'
                : 'bg-neutral-800 hover:bg-neutral-900 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{hasPrincipalSig ? 'נחתם ע"י מנהל/ת ✓' : 'שלח לחתימת מנהל/ת'}</span>
          </button>
          <button
            onClick={onClearReport}
            className="flex items-center gap-1 text-neutral-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer text-xs"
            title="נקה נתוני חודש נוכחי"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Table or Calendar */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold text-xs md:text-sm">
                  <th className="p-2.5 text-center w-12">יום</th>
                  <th className="p-2.5 text-center w-12">בשבוע</th>
                  <th className="p-2.5 w-24 text-center">שעות היעדרות</th>
                  <th className="p-2.5 w-20 text-center">ש&quot;נ / מ&quot;מ</th>
                  <th className="p-2.5 w-24 text-center">כיתה</th>
                  <th className="p-2.5 min-w-[220px]">תיאור הפעולה</th>
                  <th className="p-2.5 min-w-[180px]">סיבה להיעדרות / שעות נוספות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs md:text-sm">
                {Array.from({ length: daysInMonth }, (_, idx) => {
                  const day = idx + 1;
                  const date = new Date(year, month, day);
                  const weekday = date.getDay();
                  if (weekday === 6) return null; // Saturdays hidden

                  const vacation = getVacationLabel(date);
                  const entry = report.days[day] || {};
                  const isWeekendEnd = weekday === 5; // Friday separator

                  return (
                    <tr
                      key={day}
                      className={`hover:bg-neutral-50 transition ${
                        vacation ? 'bg-amber-50/50 text-amber-900 font-medium' : ''
                      } ${isWeekendEnd ? 'border-b-2 border-neutral-300' : ''}`}
                    >
                      <td className="p-2 text-center font-bold text-neutral-800">{day}</td>
                      <td className="p-2 text-center font-semibold text-neutral-600">
                        {DAY_NAMES[weekday]}
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={entry.hours || ''}
                          onChange={(e) => handleCellChange(day, 'hours', e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1.5 px-2 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.substitute || ''}
                          onChange={(e) => handleCellChange(day, 'substitute', e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1.5 px-2 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.kita || ''}
                          onChange={(e) => handleCellChange(day, 'kita', e.target.value)}
                          placeholder="כיתה"
                          className="w-full text-center py-1.5 px-2 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.description || (vacation ? vacation : '')}
                          onChange={(e) => handleCellChange(day, 'description', e.target.value)}
                          placeholder={vacation ? vacation : 'יום שדה, גיחה, ביס"ש...'}
                          className="w-full py-1.5 px-3 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.reason || ''}
                          onChange={(e) => handleCellChange(day, 'reason', e.target.value)}
                          placeholder="סיבה..."
                          className="w-full py-1.5 px-3 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 font-bold text-neutral-900 border-t-2 border-neutral-300">
                  <td colSpan={2} className="p-3 text-right">
                    סה&quot;כ שעות:
                  </td>
                  <td className="p-3 text-center text-blue-700 font-extrabold">{totalHours}</td>
                  <td className="p-3 text-center text-blue-700 font-extrabold">{totalSubstitute || '-'}</td>
                  <td colSpan={3} className="p-3 text-neutral-500 text-xs">
                    * שבתות מסוננות אוטומטית • ימי חופשה צבועים וניתנים לעריכה
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xs border border-neutral-200">
          <div className="grid grid-cols-6 gap-2 md:gap-3 text-center">
            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map((name, i) => (
              <div key={i} className="font-bold text-xs md:text-sm text-neutral-600 py-2 border-b border-neutral-200">
                {name}
              </div>
            ))}
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const day = idx + 1;
              const date = new Date(year, month, day);
              const weekday = date.getDay();
              if (weekday === 6) return null; // No Saturday

              const vacation = getVacationLabel(date);
              const entry = report.days[day] || {};
              const hasData = !!(entry.hours || entry.substitute || entry.kita || entry.description);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayPanel(day)}
                  className={`min-h-[70px] md:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between text-right transition cursor-pointer relative ${
                    vacation
                      ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
                      : hasData
                      ? 'bg-blue-50/60 border-blue-200 hover:bg-blue-100/50'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm text-neutral-800">{day}</span>
                    {hasData && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </div>
                  <div className="text-[10px] md:text-xs text-neutral-600 truncate w-full">
                    {vacation ? (
                      <span className="text-amber-800 font-semibold">{vacation}</span>
                    ) : entry.description ? (
                      <span>{entry.description}</span>
                    ) : entry.hours ? (
                      <span>{entry.hours} שעות</span>
                    ) : (
                      <span className="text-neutral-300">-</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Day Edit Drawer / Modal */}
      {activeDayPanel && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDayPanel(null);
          }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-base text-neutral-800">
                עריכת יום {activeDayPanel} ב{MONTH_NAMES[month]} {year}
              </h3>
              <button
                onClick={() => setActiveDayPanel(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">שעות היעדרות</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={report.days[activeDayPanel]?.hours || ''}
                  onChange={(e) => handleCellChange(activeDayPanel, 'hours', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">ש&quot;נ / מ&quot;מ</label>
                <input
                  type="text"
                  value={report.days[activeDayPanel]?.substitute || ''}
                  onChange={(e) => handleCellChange(activeDayPanel, 'substitute', e.target.value)}
                  placeholder="שעות נוספות או מילוי מקום"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">כיתה</label>
                <input
                  type="text"
                  value={report.days[activeDayPanel]?.kita || ''}
                  onChange={(e) => handleCellChange(activeDayPanel, 'kita', e.target.value)}
                  placeholder="למשל: ח'2"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">תיאור הפעולה</label>
                <input
                  type="text"
                  value={report.days[activeDayPanel]?.description || ''}
                  onChange={(e) => handleCellChange(activeDayPanel, 'description', e.target.value)}
                  placeholder="יום שדה, גיחה, ביס&quot;ש..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">סיבה להיעדרות / שעות נוספות</label>
                <input
                  type="text"
                  value={report.days[activeDayPanel]?.reason || ''}
                  onChange={(e) => handleCellChange(activeDayPanel, 'reason', e.target.value)}
                  placeholder="סיבה..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateReport((prev) => {
                    const copy = { ...prev.days };
                    delete copy[activeDayPanel];
                    return { ...prev, days: copy };
                  });
                  setActiveDayPanel(null);
                }}
                className="text-red-600 hover:text-red-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                נקה יום זה
              </button>
              <button
                type="button"
                onClick={() => setActiveDayPanel(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm px-5 py-2 rounded-lg shadow transition cursor-pointer"
              >
                שמור וסגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pedagogical Notes Section */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-neutral-200 space-y-4">
        <h3 className="font-bold text-sm md:text-base text-neutral-900 border-b border-neutral-200 pb-2.5">
          פרט נושאים, דרכי ביצוע ודרכי פעולה (מוזרק לעמודת ההערות ב-PDF)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              שכבת כיתות ח&apos; (מוזרק לשורה 2)
            </label>
            <textarea
              rows={2}
              value={report.notes.chet}
              onChange={(e) =>
                onUpdateReport((prev) => ({
                  ...prev,
                  notes: { ...prev.notes, chet: e.target.value },
                }))
              }
              placeholder="פירוט נושאים ודרכי פעולה לשכבת ח'..."
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              שכבת כיתות ט&apos; (מוזרק לשורה 7)
            </label>
            <textarea
              rows={2}
              value={report.notes.tet}
              onChange={(e) =>
                onUpdateReport((prev) => ({
                  ...prev,
                  notes: { ...prev.notes, tet: e.target.value },
                }))
              }
              placeholder="פירוט נושאים ודרכי פעולה לשכבת ט'..."
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              מסעות ומפעלים (מוזרק לשורה 16)
            </label>
            <textarea
              rows={2}
              value={report.notes.masaot}
              onChange={(e) =>
                onUpdateReport((prev) => ({
                  ...prev,
                  notes: { ...prev.notes, masaot: e.target.value },
                }))
              }
              placeholder="פירוט מסעות, מפעלים, גיחות..."
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              מש&quot;צים (מוזרק לשורה 21)
            </label>
            <textarea
              rows={2}
              value={report.notes.mishatzim}
              onChange={(e) =>
                onUpdateReport((prev) => ({
                  ...prev,
                  notes: { ...prev.notes, mishatzim: e.target.value },
                }))
              }
              placeholder="פירוט פעילות מועדון מש&quot;צים..."
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Signature & Date */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="md:col-span-2">
          <SignaturePad
            value={report.signature}
            onChange={(base64) => onUpdateReport((prev) => ({ ...prev, signature: base64 }))}
            label="חתימת מורה דיגיטלית (מצוירת בעכבר או באצבע)"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">תאריך מילוי הדוח</label>
          <input
            type="date"
            value={report.date}
            onChange={(e) => onUpdateReport((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
          />
          {hasPrincipalSig && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-2.5 text-xs text-purple-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
              <span>דוח זה כולל חתימת מנהל/ת דיגיטלית שתתווסף ל-PDF</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
