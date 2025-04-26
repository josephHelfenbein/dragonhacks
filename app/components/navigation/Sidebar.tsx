"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/app/providers/ThemeProvider';
import { HomeIcon, PoseIcon, TimerIcon, StatsIcon, MoonIcon, SunIcon, ChevronLeftIcon, ChevronRightIcon } from '@/app/components/ui/Icons';
import Image from 'next/image'; // Import the Image component

// Define navigation items
const navItems = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/posture', label: 'Posture Tracking', icon: PoseIcon },
  { href: '/timer', label: 'Focus Timer', icon: TimerIcon },
  { href: '/stats', label: 'Statistics', icon: StatsIcon },
];

// Define props interface
interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

// Use props instead of internal state
export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className={`bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)] h-screen transition-all duration-300 ease-in-out ${expanded ? 'w-64' : 'w-20'} fixed left-0 top-0 flex flex-col justify-between shadow-lg z-10`}>
      <div>
        {/* Header with Logo and Toggle Button */}
        {/* Increased height from h-16 to h-20 */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)] border-opacity-20 h-20"> 
          {/* Logo visible only when expanded */}
          {expanded && (
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              {/* Replace text with Image component */}
              <Image 
                src="/images/focura.png" // Make sure this path is correct relative to the public folder
                alt="Focura Logo" 
                width={50} // Increased width from 32
                height={50} // Increased height from 32
                className="h-13 w-auto" // Increased height from h-8
              />
              {/* Increased text size from text-xl to text-2xl */}
              <span className="text-[var(--accent)] font-bold text-2xl">Focura</span>
            </Link>
          )}
          {/* Expand/Collapse Button */}
          <button 
            onClick={onToggle} 
            className="p-2 rounded-full text-[var(--sidebar-foreground)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors" // Adjusted hover background
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"} // Add tooltip
          >
            {expanded ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors duration-150 ease-in-out group ${
                      isActive 
                        ? 'bg-[var(--primary)] text-[var(--accent)] font-semibold' 
                        : 'hover:bg-black/10 dark:hover:bg-white/10 hover:text-[var(--sidebar-foreground)]' // Adjusted hover background
                    } ${expanded ? 'justify-start' : 'justify-center'}`}
                    title={expanded ? '' : item.label} // Tooltip when collapsed
                  >
                    <Icon />
                    {expanded && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer with Theme Toggle */}
      <div className="border-t border-[var(--border-color)] border-opacity-20 p-2">
        <button 
          onClick={toggleTheme} 
          className={`flex items-center p-3 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors w-full group ${expanded ? 'justify-start' : 'justify-center'}`} // Adjusted hover background
          title={expanded ? '' : (theme === 'light' ? 'Switch to Night Owl Mode' : 'Switch to Focus Mode')} // Tooltip when collapsed
        >
          {theme === 'light' ? (
            <MoonIcon />
          ) : (
            <SunIcon />
          )}
          {expanded && <span className="ml-3">{theme === 'light' ? 'Night Owl Mode' : 'Focus Mode'}</span>}
        </button>
      </div>
    </div>
  );
}
