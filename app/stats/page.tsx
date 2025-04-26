"use client";

import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { useState } from "react";

export default function StatsPage() {
  // Mocked statistics data
  const [stats] = useState({
    totalStudyTime: 5 * 60 * 60 * 1000, // 5 hours in ms
    postureIssues: 8,
    phoneDistractions: 4,
    focusPercentage: 87,
    waterIntake: 6,
  });

  // Settings state
  const [notificationInterval, setNotificationInterval] = useState(30); // minutes
  const [postureAlerts, setPostureAlerts] = useState(true);

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Statistics</h1>
        {/* Statistics Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Study Session Stats</h2>
            <ul className="space-y-2">
              <li>
                <span className="font-medium">Total Study Time:</span>{" "}
                {(stats.totalStudyTime / 3600000).toFixed(1)} hours
              </li>
              <li>
                <span className="font-medium">Posture Issues:</span> {stats.postureIssues}
              </li>
              <li>
                <span className="font-medium">Phone Distractions:</span> {stats.phoneDistractions}
              </li>
              <li>
                <span className="font-medium">Focus Percentage:</span> {stats.focusPercentage}%
              </li>
              <li>
                <span className="font-medium">Water Intake:</span> {stats.waterIntake} cups
              </li>
            </ul>
          </div>
          {/* Settings Section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-medium mb-1" htmlFor="notification-interval">
                  Notification Interval (minutes)
                </label>
                <input
                  id="notification-interval"
                  type="number"
                  min={5}
                  max={120}
                  value={notificationInterval}
                  onChange={e => setNotificationInterval(Number(e.target.value))}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="posture-alerts"
                  type="checkbox"
                  checked={postureAlerts}
                  onChange={e => setPostureAlerts(e.target.checked)}
                  className="checkbox mr-2"
                />
                <label htmlFor="posture-alerts" className="font-medium">
                  Enable Posture Alerts
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
