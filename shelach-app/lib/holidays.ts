// lib/holidays.ts

export interface VacationRange {
  start: Date;
  end: Date;
  label: string;
}

export const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export const MONTH_NAMES: { [key: number]: string } = {
  8: 'ספטמבר',
  9: 'אוקטובר',
  10: 'נובמבר',
  11: 'דצמבר',
  0: 'ינואר',
  1: 'פברואר',
  2: 'מרץ',
  3: 'אפריל',
  4: 'מאי',
  5: 'יוני',
  6: 'יולי',
  7: 'אוגוסט',
};

// Official Israeli Ministry of Education vacations for High Schools (תשפ"ה–תשפ"א)
export const VACATIONS: VacationRange[] = [
  // תשפ"ה (2024–2025)
  { start: new Date(2024,  9,  2), end: new Date(2024,  9,  4), label: 'ראש השנה' },
  { start: new Date(2024,  9, 11), end: new Date(2024,  9, 12), label: 'יום כיפור' },
  { start: new Date(2024,  9, 16), end: new Date(2024,  9, 24), label: 'סוכות' },
  { start: new Date(2024,  9, 25), end: new Date(2024,  9, 25), label: 'אסרו חג סוכות' },
  { start: new Date(2024, 11, 26), end: new Date(2025,  0,  2), label: 'חנוכה' },
  { start: new Date(2025,  2, 14), end: new Date(2025,  2, 15), label: 'פורים' },
  { start: new Date(2025,  3,  5), end: new Date(2025,  3, 19), label: 'פסח' },
  { start: new Date(2025,  4,  1), end: new Date(2025,  4,  1), label: 'יום העצמאות' },
  { start: new Date(2025,  4, 16), end: new Date(2025,  4, 16), label: 'ל"ג בעומר' },
  { start: new Date(2025,  5,  1), end: new Date(2025,  5,  3), label: 'שבועות' },
  { start: new Date(2025,  5, 20), end: new Date(2025,  7, 31), label: 'חופשת קיץ' },

  // תשפ"ו (2025–2026)
  { start: new Date(2025,  8, 22), end: new Date(2025,  8, 24), label: 'ראש השנה' },
  { start: new Date(2025,  9,  1), end: new Date(2025,  9,  2), label: 'יום כיפור' },
  { start: new Date(2025,  9,  3), end: new Date(2025,  9,  5), label: 'גשר' },
  { start: new Date(2025,  9,  6), end: new Date(2025,  9, 14), label: 'סוכות' },
  { start: new Date(2025,  9, 15), end: new Date(2025,  9, 15), label: 'אסרו חג סוכות' },
  { start: new Date(2025, 11, 16), end: new Date(2025, 11, 22), label: 'חנוכה' },
  { start: new Date(2026,  2,  3), end: new Date(2026,  2,  4), label: 'פורים' },
  { start: new Date(2026,  2, 24), end: new Date(2026,  3,  8), label: 'פסח' },
  { start: new Date(2026,  3, 22), end: new Date(2026,  3, 22), label: 'יום העצמאות' },
  { start: new Date(2026,  4,  5), end: new Date(2026,  4,  5), label: 'ל"ג בעומר' },
  { start: new Date(2026,  4, 21), end: new Date(2026,  4, 22), label: 'שבועות' },
  { start: new Date(2026,  5, 20), end: new Date(2026,  7, 31), label: 'חופשת קיץ' },

  // תשפ"ז (2026–2027)
  { start: new Date(2026,  8, 11), end: new Date(2026,  8, 13), label: 'ראש השנה' },
  { start: new Date(2026,  8, 20), end: new Date(2026,  8, 21), label: 'יום כיפור' },
  { start: new Date(2026,  8, 25), end: new Date(2026,  9,  4), label: 'סוכות' },
  { start: new Date(2026,  9,  5), end: new Date(2026,  9,  5), label: 'אסרו חג סוכות' },
  { start: new Date(2026, 11,  5), end: new Date(2026, 11, 11), label: 'חנוכה' },
  { start: new Date(2027,  2, 22), end: new Date(2027,  2, 24), label: 'פורים' },
  { start: new Date(2027,  3, 14), end: new Date(2027,  3, 29), label: 'פסח' },
  { start: new Date(2027,  4, 12), end: new Date(2027,  4, 12), label: 'יום העצמאות' },
  { start: new Date(2027,  4, 25), end: new Date(2027,  4, 25), label: 'ל"ג בעומר' },
  { start: new Date(2027,  5, 10), end: new Date(2027,  5, 12), label: 'שבועות' },
  { start: new Date(2027,  5, 20), end: new Date(2027,  7, 31), label: 'חופשת קיץ' },

  // תשפ"ח (2027–2028)
  { start: new Date(2027,  9,  1), end: new Date(2027,  9,  3), label: 'ראש השנה' },
  { start: new Date(2027,  9, 10), end: new Date(2027,  9, 11), label: 'יום כיפור' },
  { start: new Date(2027,  9, 15), end: new Date(2027,  9, 24), label: 'סוכות' },
  { start: new Date(2027,  9, 25), end: new Date(2027,  9, 25), label: 'אסרו חג סוכות' },
  { start: new Date(2027, 11, 25), end: new Date(2027, 11, 31), label: 'חנוכה' },
  { start: new Date(2028,  2, 11), end: new Date(2028,  2, 13), label: 'פורים' },
  { start: new Date(2028,  3,  3), end: new Date(2028,  3, 18), label: 'פסח' },
  { start: new Date(2028,  4,  3), end: new Date(2028,  4,  3), label: 'יום העצמאות' },
  { start: new Date(2028,  4, 14), end: new Date(2028,  4, 14), label: 'ל"ג בעומר' },
  { start: new Date(2028,  4, 31), end: new Date(2028,  5,  1), label: 'שבועות' },
  { start: new Date(2028,  5, 20), end: new Date(2028,  7, 31), label: 'חופשת קיץ' },

  // תשפ"ט (2028–2029)
  { start: new Date(2028,  8, 20), end: new Date(2028,  8, 22), label: 'ראש השנה' },
  { start: new Date(2028,  8, 29), end: new Date(2028,  8, 30), label: 'יום כיפור' },
  { start: new Date(2028,  9,  4), end: new Date(2028,  9, 13), label: 'סוכות' },
  { start: new Date(2028,  9, 14), end: new Date(2028,  9, 14), label: 'אסרו חג סוכות' },
  { start: new Date(2028, 11, 13), end: new Date(2028, 11, 19), label: 'חנוכה' },
  { start: new Date(2029,  2,  1), end: new Date(2029,  2,  2), label: 'פורים' },
  { start: new Date(2029,  2, 23), end: new Date(2029,  3,  7), label: 'פסח' },
  { start: new Date(2029,  3, 19), end: new Date(2029,  3, 19), label: 'יום העצמאות' },
  { start: new Date(2029,  4,  3), end: new Date(2029,  4,  3), label: 'ל"ג בעומר' },
  { start: new Date(2029,  4, 19), end: new Date(2029,  4, 20), label: 'שבועות' },
  { start: new Date(2029,  5, 20), end: new Date(2029,  7, 31), label: 'חופשת קיץ' },

  // תש"פ (2029–2030)
  { start: new Date(2029,  8,  9), end: new Date(2029,  8, 11), label: 'ראש השנה' },
  { start: new Date(2029,  8, 18), end: new Date(2029,  8, 19), label: 'יום כיפור' },
  { start: new Date(2029,  8, 23), end: new Date(2029,  9,  2), label: 'סוכות' },
  { start: new Date(2029,  9,  3), end: new Date(2029,  9,  3), label: 'אסרו חג סוכות' },
  { start: new Date(2029, 11,  2), end: new Date(2029, 11,  8), label: 'חנוכה' },
  { start: new Date(2030,  2, 18), end: new Date(2030,  2, 20), label: 'פורים' },
  { start: new Date(2030,  3, 10), end: new Date(2030,  3, 25), label: 'פסח' },
  { start: new Date(2030,  4,  8), end: new Date(2030,  4,  8), label: 'יום העצמאות' },
  { start: new Date(2030,  4, 21), end: new Date(2030,  4, 21), label: 'ל"ג בעומר' },
  { start: new Date(2030,  5,  6), end: new Date(2030,  5,  8), label: 'שבועות' },
  { start: new Date(2030,  5, 20), end: new Date(2030,  7, 31), label: 'חופשת קיץ' },

  // תשפ"א (2030–2031)
  { start: new Date(2030,  8, 27), end: new Date(2030,  8, 29), label: 'ראש השנה' },
  { start: new Date(2030,  9,  6), end: new Date(2030,  9,  7), label: 'יום כיפור' },
  { start: new Date(2030,  9, 11), end: new Date(2030,  9, 20), label: 'סוכות' },
  { start: new Date(2030,  9, 21), end: new Date(2030,  9, 21), label: 'אסרו חג סוכות' },
  { start: new Date(2030, 11, 21), end: new Date(2030, 11, 27), label: 'חנוכה' },
  { start: new Date(2031,  2,  8), end: new Date(2031,  2, 10), label: 'פורים' },
  { start: new Date(2031,  2, 29), end: new Date(2031,  3, 13), label: 'פסח' },
  { start: new Date(2031,  3, 29), end: new Date(2031,  3, 29), label: 'יום העצמאות' },
  { start: new Date(2031,  4, 11), end: new Date(2031,  4, 11), label: 'ל"ג בעומר' },
  { start: new Date(2031,  4, 27), end: new Date(2031,  4, 28), label: 'שבועות' },
  { start: new Date(2031,  5, 20), end: new Date(2031,  7, 31), label: 'חופשת קיץ' },
];

export function getVacationLabel(date: Date): string | null {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  for (const v of VACATIONS) {
    if (d >= v.start && d <= v.end) return v.label;
  }
  // Summer vacation fallback for any year: June 20 to August 31
  const m = d.getMonth();
  const day = d.getDate();
  if ((m === 5 && day >= 20) || m === 6 || m === 7) {
    return 'חופשת קיץ';
  }
  return null;
}

export const RIGHT_NOTES: { [key: number]: string } = {
  1:  'פרט נושאים, דרכי ביצוע ודרכי פעולה',
  2:  'שכבת כתות: ח',
  7:  'שכבת כתות: ט',
  11: 'שכבת כתות: ___',
  16: 'מסעות ומפעלים',
  21: 'מש"צים',
  24: 'הערות המנחה _______________________',
  27: 'חתימה ___________________________',
  28: 'הערות ממונה מחוזי ________________',
  30: 'חתימה ___________________________',
};
