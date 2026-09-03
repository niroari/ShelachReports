// components/Header.tsx
'use client';

import React from 'react';
import { User } from 'firebase/auth';
import { Download, LogOut, LogIn, Sparkles } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onInstallApp: () => void;
  canInstall: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onInstallApp,
  canInstall,
}) => {
  return (
    <header className="bg-black text-white px-4 md:px-8 py-3 flex items-center justify-between relative shadow-md select-none">
      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-base md:text-lg tracking-wide">
          דוח פעילות ונוכחות — מורה של&quot;ח
        </span>
      </div>

      {/* Center Logo (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-black px-3 py-1 rounded-md items-center pointer-events-none">
        <img
          src="https://www.moked-shelach.co.il/tiyulim/Images/shelach.gif"
          alt='לוגו של"ח'
          className="h-10 w-auto"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Install App Button */}
        {canInstall && (
          <button
            onClick={onInstallApp}
            title="התקנת האפליקציה במסך הבית"
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs md:text-sm font-semibold px-2.5 md:px-3 py-1.5 rounded-lg shadow transition-all transform active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>התקנת אפליקציה</span>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2 md:gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="פרופיל"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/40 object-cover"
              />
            )}
            <span className="hidden sm:inline-block text-xs md:text-sm text-neutral-300 max-w-[130px] truncate">
              {user.displayName || user.email}
            </span>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-neutral-200 border border-white/20 rounded-md px-2.5 py-1 text-xs md:text-sm transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>יציאה</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-white text-black font-semibold text-xs md:text-sm px-3 py-1.5 rounded-md hover:bg-neutral-200 transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>התחברות</span>
          </button>
        )}
      </div>
    </header>
  );
};
