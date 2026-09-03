// lib/excel-export.ts
import * as XLSX from 'xlsx';
import { MonthlyReportData, EshelReportData } from './types';
import { MONTH_NAMES } from './holidays';

export function exportMonthlyReportToExcel(report: MonthlyReportData, month: number, year: number) {
  const monthName = MONTH_NAMES[month] || `חודש_${month + 1}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const rows: any[][] = [
    ['יום בחודש', 'יום בשבוע', 'שעות היעדרות', 'ש"נ/מ"מ', 'כיתה', 'תיאור פעילות', 'סיבת היעדרות']
  ];

  for (let day = 1; day <= 31; day++) {
    if (day > daysInMonth) continue;
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    if (weekday === 6) continue; // skip Saturday

    const entry = report.days[day] || {};
    rows.push([
      day,
      dayNames[weekday],
      entry.hours || '',
      entry.substitute || '',
      entry.kita || '',
      entry.description || '',
      entry.reason || '',
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [8, 10, 14, 10, 10, 30, 20].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, monthName);
  XLSX.writeFile(wb, `דוח-שלח-${monthName}-${year}.xlsx`);
}

export function exportEshelToExcel(eshel: EshelReportData, month: number, year: number) {
  const monthName = MONTH_NAMES[month] || `חודש_${month + 1}`;
  const rows: any[][] = [
    ['תאריך', 'יום', 'משעה', 'עד שעה', 'ממקום', 'למקום', 'מטרת הפעולה', 'בין-עירוני', 'עירוני', 'בוקר', 'צהריים', 'ערב', 'לינה', 'סה"כ']
  ];

  eshel.rows.forEach(r => {
    if (!r) return;
    rows.push([
      r.date || '',
      r.dayname || '',
      r.fromTime || '',
      r.toTime || '',
      r.fromPlace || '',
      r.toPlace || '',
      r.purpose || '',
      r.beinIri ? 'כן' : '',
      r.iri ? 'כן' : '',
      r.boker ? 'כן' : '',
      r.tsaharaim ? 'כן' : '',
      r.erev ? 'כן' : '',
      r.lina || '',
      r.total || '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [12, 8, 8, 8, 14, 14, 24, 10, 8, 8, 8, 8, 8, 8].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, monthName);
  XLSX.writeFile(wb, `אשל-${monthName}-${year}.xlsx`);
}
