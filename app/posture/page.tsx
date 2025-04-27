"use client";
import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { Metadata } from "next";
import { useState } from "react";

// export const metadata: Metadata = {
//   title: "Posture Tracking - Study Buddy",
//   description: "Monitor and improve your posture during study sessions",
// };

export default function PosturePage() {
  // Customization state
  const [showCustomize, setShowCustomize] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  // Apply theme to body (for demo, real app should use context/provider)
  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  return (
    <DashboardLayout>
      <div className="p-8 min-h-screen bg-[var(--background)]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Posture Tracking</h1>
          <button
            className="btn-primary"
            onClick={() => setShowCustomize(true)}
            aria-label="Customize Dashboard"
          >
            Customize
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 card-hover-effect mb-10">
          {/* Posture Status */}
          <div className="card flex flex-col items-center">
            <span className="text-6xl mb-4">🧑‍💻</span>
            <h2 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Current Posture</h2>
            <span className="text-green-600 font-bold text-lg mb-2">Good</span>
            <p className="text-gray-500 text-sm text-center">
              Keep your back straight and shoulders relaxed.
            </p>
          </div>
          {/* Webcam Preview */}
          <div className="card flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Webcam Preview</h2>
            <div className="w-48 h-36 bg-gray-200 dark:bg-[var(--secondary)] rounded flex items-center justify-center mb-2">
              <span className="text-gray-400">[Webcam Feed]</span>
            </div>
            <p className="text-gray-500 text-sm text-center">
              Your webcam feed will appear here for posture analysis.
            </p>
          </div>
          {/* Posture Tips */}
          {showTips && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Posture Tips</h2>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Sit up straight with your feet flat on the floor.</li>
                <li>Keep your monitor at eye level.</li>
                <li>Take breaks and stretch every 30 minutes.</li>
                <li>Relax your shoulders and keep your back supported.</li>
              </ul>
            </div>
          )}
        </div>
        {/* Stats Section */}
        {showStats && (
          <div className="card mt-4">
            <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Session Stats</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">45 min</span>
                <span className="text-gray-500">Good Posture</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-2xl font-bold text-red-500">5 min</span>
                <span className="text-gray-500">Bad Posture</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600">90%</span>
                <span className="text-gray-500">Posture Score</span>
              </div>
            </div>
          </div>
        )}

        {/* Customization Modal */}
        {showCustomize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl p-8 shadow-lg min-w-[320px] max-w-full">
              <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Customize Dashboard</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTips}
                      onChange={() => setShowTips((v) => !v)}
                      className="accent-[var(--mint)]"
                    />
                    Show Posture Tips
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showStats}
                      onChange={() => setShowStats((v) => !v)}
                      className="accent-[var(--mint)]"
                    />
                    Show Session Stats
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                    />
                    Light Mode
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer ml-6">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                    />
                    Dark Mode
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  className="btn-accent"
                  onClick={() => setShowCustomize(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
