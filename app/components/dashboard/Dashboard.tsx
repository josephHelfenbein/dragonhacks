"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider"; // Change the import to come directly from the provider
import PostureMonitor from "@/app/components/features/PostureMonitor";
import PomodoroTimer from "@/app/components/features/PomodoroTimer";
import PhoneAlert from "@/app/components/features/PhoneAlert";
import WaterReminder from "@/app/components/features/WaterReminder";
import CameraMonitor from "@/app/components/features/CameraMonitor";

export default function Dashboard() {
  const { theme } = useTheme();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Study Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CameraMonitor />
        </div>
        
        <div className="space-y-6">
          <PomodoroTimer />
          <PostureMonitor />
          <PhoneAlert />
          <WaterReminder />
        </div>
      </div>
    </div>
  );
}
