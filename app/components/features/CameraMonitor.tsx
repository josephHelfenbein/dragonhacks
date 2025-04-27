"use client";

import { useRef, useEffect } from "react";
import { CameraIcon } from "@/app/components/ui/Icons";

interface CameraMonitorProps {
  cameraStream: MediaStream | null;
  cameraError: string | null;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

export default function CameraMonitor({ cameraStream, cameraError, isMonitoring, onToggleMonitoring }: CameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      if (cameraStream && isMonitoring) {
        videoEl.srcObject = cameraStream;
        const playVideo = () => videoEl.play().catch(console.error);
        videoEl.addEventListener('loadedmetadata', playVideo);
        return () => {
          videoEl.removeEventListener('loadedmetadata', playVideo);
          videoEl.srcObject = null;
        };
      } else {
        videoEl.srcObject = null;
      }
    }
  }, [cameraStream, isMonitoring]);
  
  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Posture & Focus Monitoring</h2>
      <div className="relative flex-grow bg-[var(--secondary)] rounded-lg flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          className={`${isMonitoring ? 'block' : 'hidden'} object-contain max-h-full max-w-full`}
          autoPlay
          playsInline
          muted
        />
        {(!isMonitoring || cameraError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CameraIcon />
            <p className="mt-4 text-center">
              {cameraError ? `Camera error: ${cameraError}` : 'Camera feed will appear here'}
              <br />
              {!cameraError && !isMonitoring && 'Click to start monitoring'}
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button 
          className="btn-accent"
          onClick={onToggleMonitoring}
          disabled={!cameraStream || !!cameraError}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
    </div>
  );
}
