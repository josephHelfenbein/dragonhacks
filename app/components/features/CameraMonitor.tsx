"use client";

import { useState, useRef, useEffect } from "react";
import { CameraIcon } from "@/app/components/ui/Icons";

interface CameraMonitorProps {
  cameraStream: MediaStream | null;
  cameraError: string | null;
}

export default function CameraMonitor({ cameraStream, cameraError }: CameraMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Connect or disconnect the camera stream based on monitoring state
  useEffect(() => {
    if (videoRef.current && cameraStream && isMonitoring) {
      videoRef.current.srcObject = cameraStream;
      
      // Play the video when it's loaded
      const playVideo = () => {
        videoRef.current?.play().catch(error => {
          console.error("Error playing video:", error);
        });
      };
      
      videoRef.current.addEventListener('loadedmetadata', playVideo);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', playVideo);
          videoRef.current.srcObject = null;
        }
      };
    } else if (videoRef.current && !isMonitoring) {
      videoRef.current.srcObject = null;
    }
  }, [isMonitoring, cameraStream]);
  
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };
  
  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Posture & Focus Monitoring</h2>
      <div className="relative flex-grow bg-[var(--secondary)] rounded-lg flex items-center justify-center overflow-hidden">
        {/* Video element - displaying at original scale */}
        <video 
          ref={videoRef}
          className={`${isMonitoring ? 'block' : 'hidden'} object-contain max-h-full max-w-full`}
          autoPlay
          playsInline
          muted
        />
        
        {/* Display placeholder or error when not monitoring or there's an error */}
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
          onClick={toggleMonitoring}
          disabled={!cameraStream || !!cameraError}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
    </div>
  );
}
