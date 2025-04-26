"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/app/providers/ThemeProvider";
import { HomeIcon, PoseIcon, TimerIcon, StatsIcon, MoonIcon, SunIcon } from "@/app/components/ui/Icons";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`bg-[var(--sidebar-bg)] h-screen transition-width duration-300 ${expanded ? 'w-64' : 'w-20'} fixed left-0 top-0 flex flex-col justify-between`}>
      <div>
        <div className="p-4 flex items-center justify-between">
          {expanded && (
            <div className="flex items-center">
              <span className="text-[var(--accent)] font-bold text-xl">StudyBuddy</span>
            </div>
          )}
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-2 rounded-full hover:bg-[var(--secondary)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {expanded ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2 px-2">
            <li>
              <Link href="/" className={`flex items-center p-3 rounded-lg hover:bg-[var(--primary)] transition-colors ${expanded ? 'px-4' : 'justify-center'}`}>
                <HomeIcon />
                {expanded && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link href="/posture" className={`flex items-center p-3 rounded-lg hover:bg-[var(--primary)] transition-colors ${expanded ? 'px-4' : 'justify-center'}`}>
                <PoseIcon />
                {expanded && <span className="ml-3">Posture Tracking</span>}
              </Link>
            </li>
            <li>
              <Link href="/timer" className={`flex items-center p-3 rounded-lg hover:bg-[var(--primary)] transition-colors ${expanded ? 'px-4' : 'justify-center'}`}>
                <TimerIcon />
                {expanded && <span className="ml-3">Focus Timer</span>}
              </Link>
            </li>
            <li>
              <Link href="/stats" className={`flex items-center p-3 rounded-lg hover:bg-[var(--primary)] transition-colors ${expanded ? 'px-4' : 'justify-center'}`}>
                <StatsIcon />
                {expanded && <span className="ml-3">Statistics</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="p-4 mb-4">
        <button 
          onClick={toggleTheme} 
          className={`flex items-center p-3 rounded-lg hover:bg-[var(--secondary)] transition-colors w-full ${expanded ? 'justify-start' : 'justify-center'}`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          {expanded && <span className="ml-3">{theme === 'light' ? 'Night Owl Mode' : 'Focus Mode'}</span>}
        </button>
      </div>
    </div>
  );
}
