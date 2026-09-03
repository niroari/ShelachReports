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
  CheckSquare,
  Edit3,
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

  // Multi-day selection state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Modal state: list of days being edited (single day or multiple days)
  const [modalDays, setModalDays] = useState<number[] | null>(null);
  const [formDraft, setFormDraft] = useState<DayReportEntry>({
    hours: '',
    substitute: '',
    kita: '',
    description: '',
    reason: '',
  });

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  // Handle cell input change in table view
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

  // Toggle day selection in calendar
  const toggleDaySelection = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Select all occurrences of a specific day of week (e.g. all Sundays = 0)
  const selectAllWeekday = (targetWeekday: number) => {
    const matchedDays: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() === targetWeekday) {
        matchedDays.push(d);
      }
    }
    setSelectedDays((prev) => {
      const set = new Set([...prev, ...matchedDays]);
      return Array.from(set);
    });
  };

  // Select all working days (Sun-Fri)
  const selectAllWorkdays = () => {
    const allDays: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() !== 6) { // not Saturday
        allDays.push(d);
      }
    }
    setSelectedDays(allDays);
  };

  // Open modal for single day
  const openSingleDayModal = (day: number) => {
    setModalDays([day]);
    const existing = report.days[day] || {};
    const vacation = getVacationLabel(new Date(year, month, day));
    setFormDraft({
      hours: existing.hours || '',
      substitute: existing.substitute || '',
      kita: existing.kita || '',
      description: existing.description || (vacation || ''),
      reason: existing.reason || '',
    });
  };

  // Open modal for multiple selected days
  const openBatchModal = () => {
    if (selectedDays.length === 0) return;
    setModalDays([...selectedDays].sort((a, b) => a - b));
    setFormDraft({
      hours: '',
      substitute: '',
      kita: '',
      description: '',
      reason: '',
    });
  };

  // Save modal draft to all days in modalDays
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDays || modalDays.length === 0) return;

    onUpdateReport((prev) => {
      const updatedDays = { ...prev.days };
      modalDays.forEach((day) => {
        const existing = updatedDays[day] || {};
        updatedDays[day] = {
          ...existing,
          ...(formDraft.hours !== undefined && { hours: formDraft.hours }),
          ...(formDraft.substitute !== undefined && { substitute: formDraft.substitute }),
          ...(formDraft.kita !== undefined && { kita: formDraft.kita }),
          ...(formDraft.description !== undefined && { description: formDraft.description }),
          ...(formDraft.reason !== undefined && { reason: formDraft.reason }),
        };
      });
      return { ...prev, days: updatedDays };
    });

    setModalDays(null);
    setSelectedDays([]);
    setIsMultiSelectMode(false);
  };

  // Clear modal days
  const handleClearModalDays = () => {
    if (!modalDays || modalDays.length === 0) return;
    const confirmMsg =
      modalDays.length === 1
        ? `האם לנקות את יום ${modalDays[0]}?`
        : `האם לנקות את הנתונים מ-${modalDays.length} הימים שנבחרו?`;

    if (confirm(confirmMsg)) {
      onUpdateReport((prev) => {
        const updatedDays = { ...prev.days };
        modalDays.forEach((day) => {
          delete updatedDays[day];
        });
        return { ...prev, days: updatedDays };
      });
      setModalDays(null);
      setSelectedDays([]);
    }
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
                          className="w-full text-center py-1.5 px-2 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.substitute || ''}
                          onChange={(e) => handleCellChange(day, 'substitute', e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1.5 px-2 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.kita || ''}
                          onChange={(e) => handleCellChange(day, 'kita', e.target.value)}
                          placeholder="כיתה"
                          className="w-full text-center py-1.5 px-2 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.description || (vacation ? vacation : '')}
                          onChange={(e) => handleCellChange(day, 'description', e.target.value)}
                          placeholder={vacation ? vacation : 'יום שדה, גיחה, ביס"ש...'}
                          className="w-full py-1.5 px-3 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={entry.reason || ''}
                          onChange={(e) => handleCellChange(day, 'reason', e.target.value)}
                          placeholder="סיבה..."
                          className="w-full py-1.5 px-3 border border-neutral-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
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
        /* Calendar View with Multi-Day Selection */
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xs border border-neutral-200 space-y-4">
          {/* Multi-Select Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  if (isMultiSelectMode) setSelectedDays([]);
                }}
                className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  isMultiSelectMode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isMultiSelectMode ? 'מצב בחירה מרובה פעיל ✓' : 'בחירת מספר ימים'}</span>
              </button>

              {isMultiSelectMode && (
                <div className="flex items-center gap-1 flex-wrap text-xs">
                  <span className="text-neutral-500 font-medium mr-1">בחר ימים:</span>
                  {[0, 1, 2, 3, 4, 5].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => selectAllWeekday(w)}
                      className="px-2 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 rounded text-neutral-700 font-medium cursor-pointer transition"
                    >
                      ימי {DAY_NAMES[w]}&apos;
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={selectAllWorkdays}
                    className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded font-semibold cursor-pointer transition"
                  >
                    כל החודש
                  </button>
                  {selectedDays.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedDays([])}
                      className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded font-medium cursor-pointer transition"
                    >
                      נקה בחירה
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* If days are selected: Action buttons */}
            {selectedDays.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
                  נבחרו {selectedDays.length} ימים
                </span>
                <button
                  type="button"
                  onClick={openBatchModal}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-lg shadow transition active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ערוך ימים אלו במקביל</span>
                </button>
              </div>
            )}
          </div>

          {/* Calendar Grid */}
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
              const isSelected = selectedDays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (isMultiSelectMode) {
                      toggleDaySelection(day);
                    } else {
                      openSingleDayModal(day);
                    }
                  }}
                  className={`min-h-[72px] md:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between text-right transition cursor-pointer relative select-none ${
                    isSelected
                      ? 'ring-2 ring-blue-600 bg-blue-50/90 border-blue-500 shadow-xs'
                      : vacation
                      ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
                      : hasData
                      ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-100/50'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-neutral-800'}`}>
                      {day}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasData && !isSelected && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
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

      {/* Edit Drawer / Modal (Single day or Multiple Selected Days) */}
      {modalDays && modalDays.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalDays(null);
          }}
        >
          <form
            onSubmit={handleSaveModal}
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  {modalDays.length === 1
                    ? `עריכת יום ${modalDays[0]} ב${MONTH_NAMES[month]} ${year}`
                    : `עריכה מרוכזת ל-${modalDays.length} ימים שנבחרו`}
                </h3>
                {modalDays.length > 1 && (
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">
                    ימים: {modalDays.join(', ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setModalDays(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-600 mb-1">שעות היעדרות</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formDraft.hours || ''}
                    onChange={(e) => setFormDraft({ ...formDraft, hours: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-600 mb-1">ש&quot;נ / מ&quot;מ</label>
                  <input
                    type="text"
                    value={formDraft.substitute || ''}
                    onChange={(e) => setFormDraft({ ...formDraft, substitute: e.target.value })}
                    placeholder="שעות נוספות / מילוי מקום"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-600 mb-1">כיתה</label>
                <input
                  type="text"
                  value={formDraft.kita || ''}
                  onChange={(e) => setFormDraft({ ...formDraft, kita: e.target.value })}
                  placeholder="למשל: ח'2"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-600 mb-1">תיאור הפעולה</label>
                <input
                  type="text"
                  value={formDraft.description || ''}
                  onChange={(e) => setFormDraft({ ...formDraft, description: e.target.value })}
                  placeholder="יום שדה, גיחה, ביס&quot;ש..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-600 mb-1">סיבה להיעדרות / שעות נוספות</label>
                <input
                  type="text"
                  value={formDraft.reason || ''}
                  onChange={(e) => setFormDraft({ ...formDraft, reason: e.target.value })}
                  placeholder="סיבה..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between gap-3">
              <button
                type="button"
                onClick={handleClearModalDays}
                className="text-red-600 hover:text-red-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                {modalDays.length === 1 ? 'נקה יום זה' : 'נקה ימים אלו'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalDays(null)}
                  className="px-3.5 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm px-5 py-2 rounded-lg shadow transition cursor-pointer"
                >
                  {modalDays.length === 1 ? 'שמור וסגור' : `החל על כל ${modalDays.length} הימים`}
                </button>
              </div>
            </div>
          </form>
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
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
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
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
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
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
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
              className="w-full text-xs md:text-sm p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
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
            className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-neutral-900"
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
