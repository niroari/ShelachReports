// lib/storage.ts
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { TeacherSettings, MonthlyReportData, EshelReportData } from './types';

export const DEFAULT_SETTINGS: TeacherSettings = {
  firstName: '',
  lastName: '',
  idNumber: '',
  jobScope: '',
  address: '',
  substituteFor: '',
  homeCity: '',
  workplace: '',
  schoolName: '',
  district: '',
  shelachHours: ['', '', '', '', '', ''],
  schoolHours: ['', '', '', '', '', ''],
};

export async function saveToCloud(collection: string, docId: string, data: any, uid: string) {
  if (!uid) return;
  try {
    const docRef = doc(db, 'users', uid, collection, docId);
    await setDoc(docRef, data);
  } catch (e) {
    console.error(`Error saving ${collection}/${docId} to cloud:`, e);
  }
}

export async function loadFromCloud<T>(collection: string, docId: string, uid: string): Promise<T | null> {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'users', uid, collection, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
  } catch (e) {
    console.error(`Error loading ${collection}/${docId} from cloud:`, e);
  }
  return null;
}

export async function getSettings(uid?: string): Promise<TeacherSettings> {
  if (uid) {
    const cloud = await loadFromCloud<TeacherSettings>('settings', 'main', uid);
    if (cloud) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shelach_settings', JSON.stringify(cloud));
      }
      return cloud;
    }
  }
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('shelach_settings');
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettingsData(settings: TeacherSettings, uid?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('shelach_settings', JSON.stringify(settings));
  }
  if (uid) {
    await saveToCloud('settings', 'main', settings, uid);
  }
}

export function reportStorageKey(year: number, month: number) {
  return `shelach_report_${year}_${month}`;
}

export async function getMonthlyReport(year: number, month: number, uid?: string): Promise<MonthlyReportData | null> {
  const key = reportStorageKey(year, month);
  if (uid) {
    const cloud = await loadFromCloud<any>('reports', key, uid);
    if (cloud) {
      // Cloud format matches what we store
      const data: MonthlyReportData = {
        days: cloud.days || {},
        notes: cloud.notes || { chet: '', tet: '', masaot: '', mishatzim: '' },
        date: cloud.date || '',
        signature: cloud.signature || '',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(cloud));
      }
      return data;
    }
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // support both legacy format (_notes, _date, _signature) and new clean format
        const days: { [day: string]: any } = parsed.days || {};
        if (!parsed.days) {
          for (let d = 1; d <= 31; d++) {
            if (parsed[d]) days[d] = parsed[d];
          }
        }
        return {
          days,
          notes: parsed.notes || parsed._notes || { chet: '', tet: '', masaot: '', mishatzim: '' },
          date: parsed.date || parsed._date || '',
          signature: parsed.signature || parsed._signature || '',
        };
      } catch (e) {}
    }
  }
  return null;
}

export async function saveMonthlyReport(year: number, month: number, data: MonthlyReportData, uid?: string) {
  const key = reportStorageKey(year, month);
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
  if (uid) {
    await saveToCloud('reports', key, data, uid);
  }
}

export function eshelStorageKey(year: number, month: number) {
  return `eshel_report_${year}_${month}`;
}

export async function getEshelReport(year: number, month: number, uid?: string): Promise<EshelReportData | null> {
  const key = eshelStorageKey(year, month);
  if (uid) {
    const cloud = await loadFromCloud<EshelReportData>('eshel', key, uid);
    if (cloud) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(cloud));
      }
      return cloud;
    }
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(key);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
  }
  return null;
}

export async function saveEshelReport(year: number, month: number, data: EshelReportData, uid?: string) {
  const key = eshelStorageKey(year, month);
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
  if (uid) {
    await saveToCloud('eshel', key, data, uid);
  }
}
