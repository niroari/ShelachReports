// lib/pdf-export.ts
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TeacherSettings, MonthlyReportData, EshelReportData } from './types';
import { MONTH_NAMES, RIGHT_NOTES } from './holidays';

export interface PdfExportResult {
  imgData: string;
  savePdf: () => void;
}

export async function generateMonthlyReportPdf(
  settings: TeacherSettings,
  report: MonthlyReportData,
  month: number,
  year: number,
  principalSig?: string
): Promise<PdfExportResult> {
  // Create off-screen container matching exact dimensions and styles
  const container = document.createElement('div');
  container.id = 'pdfPage-render';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.background = '#ffffff';
  container.style.fontFamily = "'Times New Roman', Times, serif";
  container.style.direction = 'rtl';
  container.style.padding = '20px 23px 20px 78px'; // Exact margins from original form
  container.style.boxSizing = 'border-box';
  container.style.color = '#000000';
  container.style.fontSize = '8.5pt';

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  let totalHours = 0;
  const rowsHtml: string[] = [];

  for (let day = 1; day <= 31; day++) {
    if (day > daysInMonth) continue;
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    if (weekday === 6) continue; // Skip Saturday

    const entry = report.days[day] || {};
    const h = parseFloat(entry.hours || '0');
    if (!isNaN(h)) totalHours += h;

    const rightNote = RIGHT_NOTES[day] || '';
    let extraNote = '';
    if (day === 2) extraNote = report.notes.chet || '';
    else if (day === 7) extraNote = report.notes.tet || '';
    else if (day === 16) extraNote = report.notes.masaot || '';
    else if (day === 21) extraNote = report.notes.mishatzim || '';

    const combinedNote = extraNote ? `${rightNote}: ${extraNote}` : rightNote;

    rowsHtml.push(`
      <tr style="height:20px;font-size:8pt;">
        <td style="border:1px solid #000;padding:0px 2px 4px 2px;text-align:center;vertical-align:top;">${day}</td>
        <td style="border:1px solid #000;padding:0px 2px 4px 2px;text-align:center;vertical-align:top;">${dayNames[weekday]}</td>
        <td style="border:1px solid #000;padding:0px 2px 4px 2px;text-align:center;vertical-align:top;">${entry.hours || ''}</td>
        <td style="border:1px solid #000;padding:0px 2px 4px 2px;text-align:center;vertical-align:top;">${entry.substitute || ''}</td>
        <td style="border:1px solid #000;padding:0px 2px 4px 2px;text-align:center;vertical-align:top;">${entry.kita || ''}</td>
        <td style="border:1px solid #000;padding:0px 4px 4px 4px;text-align:right;vertical-align:top;">${entry.description || ''}</td>
        <td style="border:1px solid #000;padding:0px 4px 4px 4px;text-align:right;vertical-align:top;">${entry.reason || ''}</td>
        <td style="border:1px solid #000;padding:0px 4px 4px 4px;text-align:right;font-size:7pt;vertical-align:top;">${combinedNote}</td>
      </tr>
    `);
  }

  // Workdays string
  const activeDays: string[] = [];
  const dayLabels = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
  settings.shelachHours.forEach((h, idx) => {
    if (h && h.trim() !== '') activeDays.push(dayLabels[idx]);
  });
  const workdaysText = activeDays.join(', ');

  container.innerHTML = `
    <style>
      #pdfPage-render * {
        box-sizing: border-box;
        line-height: normal;
      }
    </style>

    <!-- כותרת עליונה -->
    <table style="width:100%;border-collapse:collapse;border:1px solid #000;">
      <tr>
        <td style="text-align:right;padding:6px 10px;vertical-align:top;line-height:1.7;">
          <div style="font-size:14pt;font-weight:bold;">משרד החינוך התרבות, והספורט</div>
          <div style="font-size:11pt;font-weight:bold;">מינהל חברה ונוער</div>
          <div style="font-size:11pt;font-weight:bold;">גף של"ח וידיעת הארץ</div>
        </td>
        <td style="text-align:right;padding:6px 10px;vertical-align:top;border-right:1px solid #000;width:200px;font-size:9pt;line-height:1.8;">
          <div>מחוז: <span>${settings.district}</span></div>
          <div>שם ביה"ס: <span>${settings.schoolName}</span></div>
          <div>חודש: <span>${MONTH_NAMES[month] || ''}</span></div>
          <div>שנה: <span>${year}</span></div>
        </td>
      </tr>
    </table>

    <!-- כותרת ראשית -->
    <div style="text-align:center;font-weight:bold;font-size:15pt;border:1px solid #000;border-top:none;padding:5px;">
      דוח פעילות ונוכחות של מורה של"ח בעבודה
    </div>

    <!-- פרטי מורה -->
    <div style="font-weight:bold;font-size:9pt;margin-top:8px;margin-bottom:3px;">פרטי המורה</div>
    <table style="width:100%;border-collapse:collapse;margin-top:3px;">
      <tr>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:95px;vertical-align:top;"><div style="margin-top:-2px;">מספר זהות</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;vertical-align:top;"><div style="margin-top:-2px;">שם משפחה</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;vertical-align:top;"><div style="margin-top:-2px;">שם פרטי</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:95px;vertical-align:top;"><div style="margin-top:-2px;">היקף משרה</div></th>
        <td rowspan="4" style="border:1px solid #000;width:88px;font-size:7.5pt;vertical-align:top;text-align:right;padding:2px 3px;line-height:1.2;">
          <div style="margin-top:-1px;">
            האפשרויות<br>ב"תיאור הפעולה":<br>
            יום שדה, גיחה,<br>
            שירות לאומי, מסע<br>
            ביס"ש
          </div>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:0px 3px 6px 3px;font-size:8.5pt;text-align:center;height:22px;vertical-align:top;">${settings.idNumber}</td>
        <td style="border:1px solid #000;padding:0px 3px 6px 3px;font-size:8.5pt;text-align:center;vertical-align:top;">${settings.lastName}</td>
        <td style="border:1px solid #000;padding:0px 3px 6px 3px;font-size:8.5pt;text-align:center;vertical-align:top;">${settings.firstName}</td>
        <td style="border:1px solid #000;padding:0px 3px 6px 3px;font-size:8.5pt;text-align:center;vertical-align:top;">${settings.jobScope}</td>
      </tr>
      <tr>
        <th colspan="2" style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;vertical-align:top;"><div style="margin-top:-2px;">כתובת פרטית</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;vertical-align:top;"><div style="margin-top:-2px;">במקום מדריך</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;vertical-align:top;"></th>
      </tr>
      <tr>
        <td colspan="2" style="border:1px solid #000;padding:0px 4px 6px 4px;font-size:8.5pt;height:22px;vertical-align:top;text-align:right;">${settings.address}</td>
        <td style="border:1px solid #000;padding:0px 3px 6px 3px;font-size:8.5pt;vertical-align:top;">${settings.substituteFor}</td>
        <td style="border:1px solid #000;padding:0px 3px 6px 3px;font-size:8.5pt;vertical-align:top;"></td>
      </tr>
    </table>

    <!-- שעות עבודה -->
    <table style="width:100%;border-collapse:collapse;margin-top:3px;">
      <tr>
        <td style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;text-align:right;width:210px;vertical-align:top;"><div style="margin-top:-2px;font-weight:bold;">שעות העבודה מסל של"ח (כולל שהייה ופרטני)</div></td>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:38px;text-align:center;vertical-align:top;"><div style="margin-top:-2px;">א</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:38px;text-align:center;vertical-align:top;"><div style="margin-top:-2px;">ב</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:38px;text-align:center;vertical-align:top;"><div style="margin-top:-2px;">ג</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:38px;text-align:center;vertical-align:top;"><div style="margin-top:-2px;">ד</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:38px;text-align:center;vertical-align:top;"><div style="margin-top:-2px;">ה</div></th>
        <th style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;width:38px;text-align:center;vertical-align:top;"><div style="margin-top:-2px;">ו</div></th>
        <td rowspan="2" style="border:1px solid #000;font-size:7.5pt;text-align:right;vertical-align:top;padding:1px 3px 3px 3px;line-height:1.2;">
          <div style="margin-top:-1px;">
            השעות השבועיות ניתנות בימים:<br><span>${workdaysText}</span>
          </div>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;height:20px;vertical-align:top;"></td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.shelachHours[0] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.shelachHours[1] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.shelachHours[2] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.shelachHours[3] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.shelachHours[4] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.shelachHours[5] || ''}</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:0px 3px 5px 3px;font-size:8.5pt;text-align:right;vertical-align:top;"><div style="margin-top:-2px;font-weight:bold;">שעות העבודה מסל ביה"ס (כולל שהייה ופרטני)</div></td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.schoolHours[0] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.schoolHours[1] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.schoolHours[2] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.schoolHours[3] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.schoolHours[4] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;text-align:center;vertical-align:top;">${settings.schoolHours[5] || ''}</td>
        <td style="border:1px solid #000;padding:0px 3px 4px 3px;"></td>
      </tr>
    </table>

    <!-- טבלת ימים -->
    <table style="width:100%;border-collapse:collapse;margin-top:4px;table-layout:fixed;direction:rtl;">
      <colgroup>
        <col style="width:50px;">
        <col style="width:47px;">
        <col style="width:56px;">
        <col style="width:32px;">
        <col style="width:53px;">
        <col style="width:86px;">
        <col style="width:107px;">
        <col>
      </colgroup>
      <thead>
        <tr style="background:#e0e0e0;">
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">היום<br>בחודש</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">היום<br>בשבוע</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">שעות<br>היעדרות</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">ש"נ/<br>מ"מ</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">הכיתה</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">תיאור<br>הפעולה</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"><div style="margin-top:-2px;line-height:1.15;">סיבה להיעדרות<br>או שעות נוספות</div></th>
          <th style="border:1px solid #000;padding:0px 2px 5px 2px;font-size:8pt;text-align:center;vertical-align:top;"></th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml.join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="border:1px solid #000;padding:2px 3px;font-weight:bold;text-align:right;">סה"כ שעות:</td>
          <td style="border:1px solid #000;padding:2px 3px;text-align:center;font-weight:bold;">${totalHours || ''}</td>
          <td colspan="4" style="border:1px solid #000;padding:2px 3px;text-align:right;">
            ${
              principalSig
                ? `חתימת המנהל: <img src="${principalSig}" style="height:48px;vertical-align:middle;display:inline-block;margin-right:8px;" />`
                : 'חתימת המנהל: ___________________________'
            }
          </td>
          <td style="border:1px solid #000;padding:2px 3px;"></td>
        </tr>
      </tfoot>
    </table>

    <!-- כותרת תחתונה -->
    <div style="margin-top:8px;font-size:8.5pt;line-height:2;">
      <div>מצ"ב המסמכים הבאים: א.__________________ ב.__________________ ג.__________________</div>
      <div>אני מצהיר בזה שהפרטים לעיל נכונים.</div>
    </div>

    <!-- שורת חתימה -->
    <table style="width:100%;margin-top:10px;font-size:8.5pt;">
      <tr>
        <td style="text-align:right;vertical-align:middle;">
          ${
            report.signature
              ? `חתימת המורה: <img src="${report.signature}" style="height:60px;vertical-align:middle;display:inline-block;margin-right:8px;" />`
              : 'חתימת המורה: ____________________'
          }
        </td>
        <td style="text-align:left;width:160px;vertical-align:middle;">
          תאריך: ${report.date ? new Date(report.date + 'T00:00:00').toLocaleDateString('he-IL') : '___________'}
        </td>
      </tr>
    </table>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

    return {
      imgData,
      savePdf: () => pdf.save(`דוח-שלח-${MONTH_NAMES[month] || ''}-${year}.pdf`),
    };
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateEshelPdf(
  settings: TeacherSettings,
  eshel: EshelReportData,
  month: number,
  year: number
): Promise<PdfExportResult> {
  // Create off-screen container matching exact Landscape A4 dimensions (1123px x 794px)
  const container = document.createElement('div');
  container.id = 'eshelPdfPage-render';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1123px';
  container.style.minHeight = '794px';
  container.style.background = '#ffffff';
  container.style.fontFamily = "'Times New Roman', Times, serif";
  container.style.direction = 'rtl';
  container.style.boxSizing = 'border-box';
  container.style.color = '#000000';
  container.style.fontSize = '8pt';

  const rowsHtml: string[] = [];
  for (let i = 0; i < 20; i++) {
    const r = eshel.rows[i] || ({} as any);
    const dateFormatted = r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('he-IL') : '';
    rowsHtml.push(`
      <tr style="height:20px;font-size:7.5pt;">
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${dateFormatted}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.dayname || ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.fromTime || ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.toTime || ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.fromPlace || ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.toPlace || ''}</td>
        <td style="border:1px solid #000;padding:2px 4px;text-align:right;vertical-align:top;line-height:1.15;">${r.purpose || ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.beinIri ? '✓' : ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.iri ? '✓' : ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.boker ? '✓' : ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.tsaharaim ? '✓' : ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.erev ? '✓' : ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.lina || ''}</td>
        <td style="border:1px solid #000;padding:2px;text-align:center;vertical-align:top;line-height:1.15;">${r.total || ''}</td>
      </tr>
    `);
  }

  container.innerHTML = `
    <!-- שורת כותרת + פרטי עובד -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px;table-layout:fixed;">
      <colgroup>
        <col style="width:170px;">
        <col style="width:110px;">
        <col style="width:148px;">
        <col style="width:110px;">
        <col style="width:200px;">
        <col style="width:200px;">
        <col style="width:178px;">
      </colgroup>
      <tr>
        <td rowspan="2" style="border:2px solid #000;padding:4px 6px;text-align:center;background:#e8e8e8;vertical-align:middle;">
          <div style="font-size:10pt;font-weight:bold;line-height:1.3;">טופס אש"ל</div>
          <div style="font-size:7pt;margin-top:2px;">משרד החינוך / מינהל חברה ונוער / מורי של"ח</div>
        </td>
        <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:7.5pt;background:#e8e8e8;">מ.זהות</th>
        <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:7.5pt;background:#e8e8e8;">שם משפחה</th>
        <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:7.5pt;background:#e8e8e8;">שם פרטי</th>
        <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:7.5pt;background:#e8e8e8;">מקום מגורים</th>
        <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:7.5pt;background:#e8e8e8;">מקום עבודה</th>
        <th style="border:1px solid #000;padding:2px 4px;text-align:center;font-size:7.5pt;background:#e8e8e8;">חודש / שנה</th>
      </tr>
      <tr>
        <td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9pt;height:24px;background:#fff;">${settings.idNumber}</td>
        <td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9pt;background:#fff;">${settings.lastName}</td>
        <td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9pt;background:#fff;">${settings.firstName}</td>
        <td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9pt;background:#fff;">${settings.homeCity}</td>
        <td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9pt;background:#fff;">${settings.workplace}</td>
        <td style="border:1px solid #000;padding:3px 4px;text-align:center;font-size:9pt;background:#fff;">
          ${MONTH_NAMES[month] || ''} / ${year}
        </td>
      </tr>
    </table>

    <!-- טבלת פעולות — 20 שורות סטטיות -->
    <table style="width:calc(100% - 64px);margin:0 32px;border-collapse:collapse;table-layout:fixed;">
      <colgroup>
        <col style="width:80px;">
        <col style="width:36px;">
        <col style="width:40px;">
        <col style="width:40px;">
        <col style="width:108px;">
        <col style="width:108px;">
        <col style="width:255px;">
        <col style="width:48px;">
        <col style="width:42px;">
        <col style="width:38px;">
        <col style="width:44px;">
        <col style="width:38px;">
        <col style="width:53px;">
        <col style="width:38px;">
      </colgroup>
      <thead>
        <tr style="background:#d0d0d0;">
          <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7.5pt;">תאריך</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">יום</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">משעה</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">עד שעה</th>
          <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7.5pt;">ממקום</th>
          <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7.5pt;">למקום</th>
          <th style="border:1px solid #000;padding:3px 2px;text-align:center;font-size:7.5pt;">מטרת הפעולה</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:6.5pt;">בין עירוני</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">עירוני</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">בוקר</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">צהריים</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">ערב</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:6.5pt;">לינה במבנה/ שטח</th>
          <th style="border:1px solid #000;padding:3px 1px;text-align:center;font-size:7.5pt;">סה"כ</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml.join('')}
      </tbody>
    </table>

    <!-- תחתית: הצהרה + 4 ריבועי אישור -->
    <table style="width:calc(100% - 64px);margin:4px 32px 0 32px;border-collapse:collapse;">
      <tr>
        <!-- הצהרת עובד -->
        <td style="border:1px solid #000;padding:5px 7px;width:32%;vertical-align:top;background:#fff;">
          <div style="font-weight:bold;font-size:8pt;text-align:center;margin-bottom:3px;">הצהרת עובד</div>
          <div style="font-size:7pt;line-height:1.4;">אני הח"מ מצהיר/ה בזה כי עבדתי בשעות ולנתי במקומות המפורטים לעיל וכי הפרטים הנ"ל נכונים ומדויקים. ידוע לי כי אם אמסור פרטים כוזבים אהיה צפוי/ה לאחריות פלילית.</div>
          <div style="margin-top:8px;font-size:7.5pt;">
            ${
              eshel.signature
                ? `חתימת העובד: <img src="${eshel.signature}" style="height:44px;vertical-align:middle;display:inline-block;margin-right:6px;" />`
                : 'חתימת העובד: ____________________________'
            }
          </div>
          <div style="margin-top:5px;font-size:7.5pt;">
            תאריך: ${eshel.date ? new Date(eshel.date + 'T00:00:00').toLocaleDateString('he-IL') : '_______________'}
          </div>
        </td>
        <!-- אישור ממונה ישיר -->
        <td style="border:1px solid #000;padding:5px 7px;width:26%;vertical-align:top;background:#fff;">
          <div style="font-weight:bold;font-size:8pt;text-align:center;margin-bottom:3px;">אישור ממונה ישיר</div>
          <div style="font-size:7pt;line-height:1.4;">הריני מאשר/ת בזה כי:</div>
          <div style="font-size:7pt;margin-top:3px;">☐ הפעולות המפורטות לעיל בוצעו בפועל ע"י העובד/ת</div>
          <div style="font-size:7pt;margin-top:2px;">☐ ביצוע הפעולות היה הכרחי לצורך התפקיד</div>
          <div style="margin-top:6px;font-size:7.5pt;">שם: ____________________</div>
          <div style="margin-top:4px;font-size:7.5pt;">חתימה: _________________</div>
          <div style="margin-top:4px;font-size:7.5pt;">תאריך: _______________</div>
        </td>
        <!-- אישור אמרכל היחידה -->
        <td style="border:1px solid #000;padding:5px 7px;width:26%;vertical-align:top;background:#fff;">
          <div style="font-weight:bold;font-size:8pt;text-align:center;margin-bottom:3px;">אישור אמרכל היחידה</div>
          <div style="font-size:7pt;line-height:1.4;">בדקתי את הרישומים ומצאתי אותם תואמים את הדיווח.</div>
          <div style="font-size:7pt;margin-top:3px;line-height:1.4;">לעובד/ת אושר לתשלום: _________ ₪</div>
          <div style="margin-top:6px;font-size:7.5pt;">שם: ____________________</div>
          <div style="margin-top:4px;font-size:7.5pt;">חתימה: _________________</div>
          <div style="margin-top:4px;font-size:7.5pt;">תאריך: _______________</div>
        </td>
        <!-- אישור בוחן חשבות -->
        <td style="border:1px solid #000;padding:5px 7px;width:16%;vertical-align:top;background:#fff;">
          <div style="font-weight:bold;font-size:8pt;text-align:center;margin-bottom:3px;">אישור בוחן חשבות</div>
          <div style="margin-top:8px;font-size:7.5pt;">שם: ____________________</div>
          <div style="margin-top:4px;font-size:7.5pt;">חתימה: _________________</div>
          <div style="margin-top:4px;font-size:7.5pt;">תאריך: _______________</div>
        </td>
      </tr>
    </table>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

    return {
      imgData,
      savePdf: () => pdf.save(`אשל-${MONTH_NAMES[month] || ''}-${year}.pdf`),
    };
  } finally {
    document.body.removeChild(container);
  }
}
