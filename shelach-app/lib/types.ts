// lib/types.ts

export interface TeacherSettings {
  firstName: string;
  lastName: string;
  idNumber: string;
  jobScope: string;
  address: string;
  substituteFor: string;
  homeCity: string;
  workplace: string;
  schoolName: string;
  district: string;
  shelachHours: string[]; // 6 days (Sunday to Friday)
  schoolHours: string[];  // 6 days (Sunday to Friday)
}

export interface DayReportEntry {
  hours?: string;
  substitute?: string;
  kita?: string;
  description?: string;
  reason?: string;
  weekday?: string;
}

export interface ReportNotes {
  chet: string;
  tet: string;
  masaot: string;
  mishatzim: string;
}

export interface MonthlyReportData {
  days: { [day: string]: DayReportEntry };
  notes: ReportNotes;
  date: string;
  signature: string; // base64
}

export interface EshelRow {
  date: string;
  dayname: string;
  fromTime: string;
  toTime: string;
  fromPlace: string;
  toPlace: string;
  purpose: string;
  beinIri: boolean;
  iri: boolean;
  boker: boolean;
  tsaharaim: boolean;
  erev: boolean;
  lina: string; // "מבנה" | "שטח" | ""
  total: string;
}

export interface EshelReportData {
  rows: EshelRow[];
  date: string;
  signature: string; // base64
}

export interface SignatureRequestDoc {
  teacherUid: string;
  teacherName: string;
  schoolName: string;
  month: number; // 0-indexed or 1-12
  year: number;
  status: 'pending' | 'signed';
  reportSnapshot: { [day: string]: DayReportEntry };
  principalSignature?: string;
  createdAt: any;
  signedAt?: any;
}
