// components/EshelTab.tsx
'use client';

import React, { useState } from 'react';
import { TeacherSettings, EshelReportData, EshelRow } from '../lib/types';
import { DAY_NAMES, MONTH_NAMES } from '../lib/holidays';
import { SignaturePad } from './SignaturePad';
import {
  FileText,
  FileSpreadsheet,
  Trash2,
  Table as TableIcon,
  Compass,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface EshelTabProps {
  settings: TeacherSettings;
  eshel: EshelReportData;
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onUpdateEshel: (updater: (prev: EshelReportData) => EshelReportData) => void;
  onClearEshel: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export const EshelTab: React.FC<EshelTabProps> = ({
  settings,
  eshel,
  month,
  year,
  onMonthChange,
  onYearChange,
  onUpdateEshel,
  onClearEshel,
  onExportPdf,
  onExportExcel,
}) => {
  const [mode, setMode] = useState<'table' | 'wizard'>('table');
  const [wizardIndex, setWizardIndex] = useState(0);

  const handleRowChange = (index: number, field: keyof EshelRow, value: any) => {
    onUpdateEshel((prev) => {
      const rows = [...prev.rows];
      const existing = rows[index] || {
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
      };
      const updated = { ...existing, [field]: value };

      // If date changed, auto-compute dayname
      if (field === 'date' && value) {
        const d = new Date(value + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          updated.dayname = DAY_NAMES[d.getDay()] || '';
        }
      }

      rows[index] = updated;
      return { ...prev, rows };
    });
  };

  const years = Array.from({ length: 12 }, (_, i) => 2024 + i);

  // 30-min interval times for wizard
  const timeOptions: string[] = [];
  for (let h = 6; h <= 22; h++) {
    const hh = String(h).padStart(2, '0');
    timeOptions.push(`${hh}:00`);
    timeOptions.push(`${hh}:30`);
  }

  const currentRow = eshel.rows[wizardIndex] || ({} as EshelRow);

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

        {/* View Mode Switcher */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setMode('table')}
            className={`flex items-center gap-1 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              mode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>טבלה</span>
          </button>
          <button
            onClick={() => setMode('wizard')}
            className={`flex items-center gap-1 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              mode === 'wizard' ? 'bg-white text-blue-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>אשף יומי</span>
          </button>
        </div>

        {/* Export & Action Buttons */}
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
            onClick={onClearEshel}
            className="flex items-center gap-1 text-neutral-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer text-xs"
            title="נקה נתוני אש&quot;ל"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Read-Only Info Card */}
      <div className="bg-neutral-50 rounded-xl p-3 md:p-4 border border-neutral-200 text-xs text-neutral-600 flex flex-wrap items-center justify-between gap-3">
        <div><strong>מ.זהות:</strong> {settings.idNumber || '-'}</div>
        <div><strong>שם:</strong> {settings.firstName} {settings.lastName}</div>
        <div><strong>מקום מגורים:</strong> {settings.homeCity || '-'}</div>
        <div><strong>מקום עבודה:</strong> {settings.workplace || '-'}</div>
        <div className="text-neutral-400 text-[11px]">* ניתן לעדכן פרטים אלו בלשונית &quot;הגדרות&quot;</div>
      </div>

      {/* Main Mode: Table or Wizard */}
      {mode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold">
                  <th className="p-2 w-8 text-center">#</th>
                  <th className="p-2 w-28 text-center">תאריך</th>
                  <th className="p-2 w-10 text-center">יום</th>
                  <th className="p-2 w-16 text-center">משעה</th>
                  <th className="p-2 w-16 text-center">עד שעה</th>
                  <th className="p-2 min-w-[100px]">ממקום</th>
                  <th className="p-2 min-w-[100px]">למקום</th>
                  <th className="p-2 min-w-[160px]">מטרת הפעולה</th>
                  <th className="p-2 w-10 text-center">בינעירוני</th>
                  <th className="p-2 w-10 text-center">עירוני</th>
                  <th className="p-2 w-10 text-center">בוקר</th>
                  <th className="p-2 w-10 text-center">צהריים</th>
                  <th className="p-2 w-10 text-center">ערב</th>
                  <th className="p-2 w-20 text-center">לינה</th>
                  <th className="p-2 w-16 text-center">סה&quot;כ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {Array.from({ length: 20 }, (_, idx) => {
                  const r = eshel.rows[idx] || ({} as EshelRow);
                  return (
                    <tr key={idx} className="hover:bg-neutral-50 transition">
                      <td className="p-1.5 text-center font-bold text-neutral-400">{idx + 1}</td>
                      <td className="p-1">
                        <input
                          type="date"
                          value={r.date || ''}
                          onChange={(e) => handleRowChange(idx, 'date', e.target.value)}
                          className="w-full text-center px-1.5 py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                      <td className="p-1 text-center font-semibold text-neutral-700">
                        {r.dayname || '-'}
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={r.fromTime || ''}
                          onChange={(e) => handleRowChange(idx, 'fromTime', e.target.value)}
                          placeholder="08:00"
                          className="w-full text-center py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={r.toTime || ''}
                          onChange={(e) => handleRowChange(idx, 'toTime', e.target.value)}
                          placeholder="16:00"
                          className="w-full text-center py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={r.fromPlace || ''}
                          onChange={(e) => handleRowChange(idx, 'fromPlace', e.target.value)}
                          placeholder="מקום יציאה"
                          className="w-full px-2 py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={r.toPlace || ''}
                          onChange={(e) => handleRowChange(idx, 'toPlace', e.target.value)}
                          placeholder="יעד"
                          className="w-full px-2 py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={r.purpose || ''}
                          onChange={(e) => handleRowChange(idx, 'purpose', e.target.value)}
                          placeholder="מטרת הפעולה..."
                          className="w-full px-2 py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.beinIri}
                          onChange={(e) => handleRowChange(idx, 'beinIri', e.target.checked)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.iri}
                          onChange={(e) => handleRowChange(idx, 'iri', e.target.checked)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.boker}
                          onChange={(e) => handleRowChange(idx, 'boker', e.target.checked)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.tsaharaim}
                          onChange={(e) => handleRowChange(idx, 'tsaharaim', e.target.checked)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!r.erev}
                          onChange={(e) => handleRowChange(idx, 'erev', e.target.checked)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={r.lina || ''}
                          onChange={(e) => handleRowChange(idx, 'lina', e.target.value)}
                          className="w-full text-center py-1 border border-neutral-200 rounded text-xs bg-white cursor-pointer"
                        >
                          <option value="">-</option>
                          <option value="מבנה">מבנה</option>
                          <option value="שטח">שטח</option>
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={r.total || ''}
                          onChange={(e) => handleRowChange(idx, 'total', e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1 border border-neutral-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-xs bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Wizard Mode */
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-neutral-200 space-y-5">
          {/* Progress dots */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div className="font-bold text-sm text-neutral-800">
              רשומה {wizardIndex + 1} מתוך 20
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: 20 }, (_, i) => {
                const filled = !!(
                  eshel.rows[i]?.date ||
                  eshel.rows[i]?.purpose ||
                  eshel.rows[i]?.total
                );
                return (
                  <button
                    key={i}
                    onClick={() => setWizardIndex(i)}
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition cursor-pointer ${
                      i === wizardIndex
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : filled
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form fields for current row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">תאריך</label>
              <input
                type="date"
                value={currentRow.date || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'date', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">משעה</label>
              <select
                value={currentRow.fromTime || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'fromTime', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="">בחר שעה</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">עד שעה</label>
              <select
                value={currentRow.toTime || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'toTime', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="">בחר שעה</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">לינה</label>
              <select
                value={currentRow.lina || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'lina', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="">ללא לינה</option>
                <option value="מבנה">לינה במבנה</option>
                <option value="שטח">לינה בשטח</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">ממקום</label>
              <input
                type="text"
                value={currentRow.fromPlace || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'fromPlace', e.target.value)}
                placeholder="עיר יציאה"
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">למקום</label>
              <input
                type="text"
                value={currentRow.toPlace || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'toPlace', e.target.value)}
                placeholder="עיר יעד"
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-600 mb-1">מטרת הפעולה</label>
              <input
                type="text"
                value={currentRow.purpose || ''}
                onChange={(e) => handleRowChange(wizardIndex, 'purpose', e.target.value)}
                placeholder="סיור של&quot;ח, גיחה, הדרכה..."
                className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <span className="block text-xs font-bold text-neutral-700 mb-2">זכאויות אש&quot;ל:</span>
            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!currentRow.beinIri}
                  onChange={(e) => handleRowChange(wizardIndex, 'beinIri', e.target.checked)}
                />
                <span>בין עירוני</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!currentRow.iri}
                  onChange={(e) => handleRowChange(wizardIndex, 'iri', e.target.checked)}
                />
                <span>עירוני</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!currentRow.boker}
                  onChange={(e) => handleRowChange(wizardIndex, 'boker', e.target.checked)}
                />
                <span>בוקר</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!currentRow.tsaharaim}
                  onChange={(e) => handleRowChange(wizardIndex, 'tsaharaim', e.target.checked)}
                />
                <span>צהריים</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!currentRow.erev}
                  onChange={(e) => handleRowChange(wizardIndex, 'erev', e.target.checked)}
                />
                <span>ערב</span>
              </label>
            </div>
          </div>

          {/* Wizard Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setWizardIndex((i) => Math.max(0, i - 1))}
              disabled={wizardIndex === 0}
              className="flex items-center gap-1 text-xs md:text-sm font-semibold px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition cursor-pointer disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
              <span>הקודם</span>
            </button>
            <button
              onClick={() => setWizardIndex((i) => Math.min(19, i + 1))}
              disabled={wizardIndex === 19}
              className="flex items-center gap-1 text-xs md:text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40"
            >
              <span>הבא</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Signature & Date */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="md:col-span-2">
          <SignaturePad
            value={eshel.signature}
            onChange={(base64) => onUpdateEshel((prev) => ({ ...prev, signature: base64 }))}
            label="חתימת עובד על טופס אש&quot;ל (מצוירת בעכבר או באצבע)"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">תאריך מילוי האש&quot;ל</label>
          <input
            type="date"
            value={eshel.date}
            onChange={(e) => onUpdateEshel((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
          />
        </div>
      </div>
    </div>
  );
};
