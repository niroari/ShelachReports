// components/SettingsTab.tsx
'use client';

import React, { useState } from 'react';
import { TeacherSettings } from '../lib/types';
import { Save, Check } from 'lucide-react';

interface SettingsTabProps {
  settings: TeacherSettings;
  onSave: (settings: TeacherSettings) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<TeacherSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof TeacherSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHourChange = (type: 'shelachHours' | 'schoolHours', index: number, value: string) => {
    setFormData((prev) => {
      const arr = [...prev[type]];
      arr[index] = value;
      return { ...prev, [type]: arr };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const dayLabels = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xs border border-neutral-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">הגדרות ופרטים קבועים</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              הפרטים נשמרים בענן ומוזנים אוטומטית בכל הדוחות החודשיים וטופסי האש&quot;ל
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>נשמר!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'שומר...' : 'שמור שינויים'}</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Teacher Details */}
          <div>
            <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-200 pb-2 mb-4">
              פרטי המורה
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">שם פרטי</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="שם פרטי"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">שם משפחה</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="שם משפחה"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">מספר זהות</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  placeholder="תעודת זהות"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">היקף משרה</label>
                <input
                  type="text"
                  value={formData.jobScope}
                  onChange={(e) => handleChange('jobScope', e.target.value)}
                  placeholder="למשל: 100%"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">כתובת</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="רחוב ומספר"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">במקום מדריך</label>
                <input
                  type="text"
                  value={formData.substituteFor}
                  onChange={(e) => handleChange('substituteFor', e.target.value)}
                  placeholder="אם יש"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: School & Location */}
          <div>
            <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-200 pb-2 mb-4">
              בית ספר ומקומות (לשימוש בדוח ובאש&quot;ל)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">שם בית הספר</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  placeholder="שם ביה&quot;ס"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">מחוז</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="למשל: מרכז"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">מקום מגורים (עיר / יישוב)</label>
                <input
                  type="text"
                  value={formData.homeCity}
                  onChange={(e) => handleChange('homeCity', e.target.value)}
                  placeholder="עיר מגורים לאש&quot;ל"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">מקום עבודה (עיר / יישוב)</label>
                <input
                  type="text"
                  value={formData.workplace}
                  onChange={(e) => handleChange('workplace', e.target.value)}
                  placeholder="מקום עבודה לאש&quot;ל"
                  className="w-full text-sm px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Weekly Hours Matrix */}
          <div>
            <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-200 pb-2 mb-4">
              שעות עבודה שבועיות (מופיעות בטופס ה-PDF)
            </h3>
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                    <th className="p-2.5 text-right w-1/3">מסלול</th>
                    {dayLabels.map((day, idx) => (
                      <th key={idx} className="p-2.5 w-[11%]">יום {day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="p-2.5 text-right font-medium text-xs md:text-sm text-neutral-800">
                      שעות העבודה מסל של&quot;ח (שהייה + פרטני)
                    </td>
                    {formData.shelachHours.map((hour, idx) => (
                      <td key={idx} className="p-1.5">
                        <input
                          type="text"
                          value={hour}
                          onChange={(e) => handleHourChange('shelachHours', idx, e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1.5 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-right font-medium text-xs md:text-sm text-neutral-800">
                      שעות העבודה מסל ביה&quot;ס (שהייה + פרטני)
                    </td>
                    {formData.schoolHours.map((hour, idx) => (
                      <td key={idx} className="p-1.5">
                        <input
                          type="text"
                          value={hour}
                          onChange={(e) => handleHourChange('schoolHours', idx, e.target.value)}
                          placeholder="-"
                          className="w-full text-center py-1.5 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
