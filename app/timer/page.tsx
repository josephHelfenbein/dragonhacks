"use client";

import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { useState, useRef, useEffect } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function TimerPage() {
  // Settings state
  const [sessionLength, setSessionLength] = useState(25); // minutes
  const [breakLength, setBreakLength] = useState(5); // minutes
  const [longBreakLength, setLongBreakLength] = useState(15); // minutes
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  const [autoStartBreak, setAutoStartBreak] = useState(true);
  const [autoStartSession, setAutoStartSession] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(false);
  const [theme, setTheme] = useState<"default" | "mint" | "coral">("default");

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isSession, setIsSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(sessionLength * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update timer when session/break/long break length changes
  useEffect(() => {
    setTimeLeft(isSession ? sessionLength * 60 : breakLength * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLength, breakLength, longBreakLength, isSession]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (isSession) {
            // End of session
            const nextSessionCount = sessionCount + 1;
            setSessionCount(nextSessionCount);
            if (nextSessionCount % sessionsBeforeLongBreak === 0) {
              setIsSession(false);
              setTimeLeft(longBreakLength * 60);
            } else {
              setIsSession(false);
              setTimeLeft(breakLength * 60);
            }
            if (soundOn) {
              // Play sound (placeholder)
              // new Audio('/ding.mp3').play();
            }
            if (vibrationOn && "vibrate" in navigator) {
              navigator.vibrate(500);
            }
            if (autoStartBreak) setIsRunning(true);
            else setIsRunning(false);
            return 1; // Will be replaced by setTimeLeft above
          } else {
            // End of break
            setIsSession(true);
            setTimeLeft(sessionLength * 60);
            if (soundOn) {
              // Play sound (placeholder)
            }
            if (vibrationOn && "vibrate" in navigator) {
              navigator.vibrate(300);
            }
            if (autoStartSession) setIsRunning(true);
            else setIsRunning(false);
            return 1;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isSession, sessionLength, breakLength, longBreakLength, sessionsBeforeLongBreak, autoStartBreak, autoStartSession, soundOn, vibrationOn, sessionCount]);

  // Controls
  const handleStartPause = () => setIsRunning(r => !r);
  const handleReset = () => {
    setIsRunning(false);
    setIsSession(true);
    setSessionCount(0);
    setTimeLeft(sessionLength * 60);
  };

  // Settings UI
  const settingsDisabled = isRunning;

  return (
    <DashboardLayout>
      <div className="p-0 flex flex-col items-center justify-center min-h-[80vh] w-full max-w-full">
        <div className="w-full py-10 px-0 mb-8 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight w-full text-center">
            Focus Timer
          </h1>
        </div>
        {/* Timer Display */}
        <div className={`card w-full max-w-4xl p-8 mb-10 flex flex-col items-center ${theme === "mint" ? "bg-[var(--mint)] bg-opacity-10" : theme === "coral" ? "bg-[var(--coral)] bg-opacity-10" : ""}`}>
          <div className="text-lg font-medium mb-2">
            {isSession ? "Focus Session" : (sessionCount > 0 && sessionCount % sessionsBeforeLongBreak === 0 ? "Long Break" : "Break")}
          </div>
          <div className="text-6xl font-mono mb-4">
            {pad(Math.floor(timeLeft / 60))}:{pad(timeLeft % 60)}
          </div>
          <div className="flex gap-4">
            <button
              className="btn btn-primary"
              onClick={handleStartPause}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Session #{sessionCount + (isSession ? 1 : 0)}
          </div>
        </div>
        {/* Settings */}
        <div className="card w-full max-w-4xl p-8 border border-[var(--secondary)] shadow-sm space-y-8">
          <h2 className="text-xl font-semibold mb-2">Timer Settings</h2>
          {/* Focus Session Settings */}
          <div>
            <h3 className="font-semibold mb-2">Focus Session</h3>
            <label className="block font-medium mb-2" htmlFor="session-length">
              Length <span className="ml-2 text-sm text-gray-500">{sessionLength} min</span>
            </label>
            <input
              id="session-length"
              type="range"
              min={5}
              max={90}
              step={1}
              value={sessionLength}
              onChange={e => setSessionLength(Number(e.target.value))}
              className="w-full accent-[var(--mint)]"
              disabled={settingsDisabled}
            />
          </div>
          {/* Short Break Settings */}
          <div>
            <h3 className="font-semibold mb-2">Short Break</h3>
            <label className="block font-medium mb-2" htmlFor="break-length">
              Length <span className="ml-2 text-sm text-gray-500">{breakLength} min</span>
            </label>
            <input
              id="break-length"
              type="range"
              min={1}
              max={30}
              step={1}
              value={breakLength}
              onChange={e => setBreakLength(Number(e.target.value))}
              className="w-full accent-[var(--coral)]"
              disabled={settingsDisabled}
            />
          </div>
          {/* Long Break Settings */}
          <div>
            <h3 className="font-semibold mb-2">Long Break</h3>
            <label className="block font-medium mb-2" htmlFor="long-break-length">
              Length <span className="ml-2 text-sm text-gray-500">{longBreakLength} min</span>
            </label>
            <input
              id="long-break-length"
              type="range"
              min={5}
              max={60}
              step={1}
              value={longBreakLength}
              onChange={e => setLongBreakLength(Number(e.target.value))}
              className="w-full accent-[var(--secondary)]"
              disabled={settingsDisabled}
            />
            <label className="block font-medium mt-4 mb-2" htmlFor="sessions-before-long-break">
              Sessions before long break
              <span className="ml-2 text-sm text-gray-500">{sessionsBeforeLongBreak}</span>
            </label>
            <input
              id="sessions-before-long-break"
              type="range"
              min={2}
              max={8}
              step={1}
              value={sessionsBeforeLongBreak}
              onChange={e => setSessionsBeforeLongBreak(Number(e.target.value))}
              className="w-full accent-[var(--secondary)]"
              disabled={settingsDisabled}
            />
          </div>
          {/* Automation */}
          <div>
            <h3 className="font-semibold mb-2">Automation</h3>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="auto-start-break"
                type="checkbox"
                checked={autoStartBreak}
                onChange={e => setAutoStartBreak(e.target.checked)}
                className="checkbox"
                disabled={settingsDisabled}
              />
              <label htmlFor="auto-start-break" className="font-medium">
                Auto-start break after session
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="auto-start-session"
                type="checkbox"
                checked={autoStartSession}
                onChange={e => setAutoStartSession(e.target.checked)}
                className="checkbox"
                disabled={settingsDisabled}
              />
              <label htmlFor="auto-start-session" className="font-medium">
                Auto-start session after break
              </label>
            </div>
          </div>
          {/* Notifications */}
          <div>
            <h3 className="font-semibold mb-2">Notifications</h3>
            <div className="flex items-center gap-2 mb-2">
              <input
                id="sound-on"
                type="checkbox"
                checked={soundOn}
                onChange={e => setSoundOn(e.target.checked)}
                className="checkbox"
                disabled={settingsDisabled}
              />
              <label htmlFor="sound-on" className="font-medium">
                Sound
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="vibration-on"
                type="checkbox"
                checked={vibrationOn}
                onChange={e => setVibrationOn(e.target.checked)}
                className="checkbox"
                disabled={settingsDisabled}
              />
              <label htmlFor="vibration-on" className="font-medium">
                Vibration
              </label>
            </div>
          </div>
          {/* Appearance */}
          <div>
            <h3 className="font-semibold mb-2">Appearance</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="theme"
                  value="default"
                  checked={theme === "default"}
                  onChange={() => setTheme("default")}
                  disabled={settingsDisabled}
                />
                Default
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="theme"
                  value="mint"
                  checked={theme === "mint"}
                  onChange={() => setTheme("mint")}
                  disabled={settingsDisabled}
                />
                Mint
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="theme"
                  value="coral"
                  checked={theme === "coral"}
                  onChange={() => setTheme("coral")}
                  disabled={settingsDisabled}
                />
                Coral
              </label>
            </div>
          </div>
          <div className="text-xs text-gray-500 pt-2">
            You can only change settings when the timer is not running.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
