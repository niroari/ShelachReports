// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'מילוי דוחות פעילות - מורים ומורות לשל"ח',
  description: 'מילוי דוחות פעילות ונוכחות חודשיים וטופסי אש"ל למורי של״ח',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'דוחות של״ח',
  },
  icons: {
    icon: 'https://www.moked-shelach.co.il/tiyulim/Images/shelach.gif',
    apple: 'https://www.moked-shelach.co.il/tiyulim/Images/shelach.gif',
  },
};

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script defer src="/_vercel/insights/script.js"></script>
      </head>
      <body className="bg-[#f0f2f5] text-neutral-900 min-h-screen antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
