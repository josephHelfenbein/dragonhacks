"use client";

import { useState } from "react";
import { CameraIcon } from "@/app/components/ui/Icons";

export default function CameraMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Posture & Focus Monitoring</h2>
      <div className="relative w-full h-[300px] bg-[var(--secondary)] rounded-lg flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CameraIcon />
          <p className="mt-4 text-center">
            {isMonitoring ? 'Monitoring active...' : 'Camera feed will appear here'}
            <br />
            {!isMonitoring && 'Click to start monitoring'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button 
          className="btn-accent"
          onClick={toggleMonitoring}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
    </div>
  );
}
