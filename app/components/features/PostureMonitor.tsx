"use client";

import { useState, useEffect } from "react";
import Pusher from 'pusher-js';

export default function PostureMonitor() {
  const [status, setStatus] = useState<'good' | 'bad' | 'unknown'>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Connect to Pusher and listen for posture events
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.error("Pusher environment variables not set!");
      return;
    }
    
    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const logsChan = pusher.subscribe('logs');
    
    logsChan.bind('bad_posture', (data: any) => {
      if (data?.message) {
        setStatus('bad');
        setLastChecked(new Date());
      }
    });
    
    // For demo purposes, still keep random status changes
    const interval = setInterval(() => {
      const statuses: ('good' | 'bad' | 'unknown')[] = ['good', 'bad', 'bad', 'good', 'good', 'good'];
      setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      setLastChecked(new Date());
    }, 10000);
    
    return () => {
      clearInterval(interval);
      logsChan.unbind_all();
      pusher.unsubscribe('logs');
      pusher.disconnect();
    };
  }, []);
  
  return (
    <div className={`card ${
      status === 'bad' ? 'bg-[var(--coral)] bg-opacity-20' : 
      status === 'good' ? 'bg-[var(--mint)] bg-opacity-20' : ''
    }`}>
      <h3 className="text-lg font-semibold mb-2">Posture Monitor</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">
            {status === 'good' && 'Your posture looks good!'}
            {status === 'bad' && 'Please correct your posture!'}
            {status === 'unknown' && 'Monitoring your posture...'}
          </div>
          <div className="text-xs mt-1">
            {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </div>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
          status === 'good' ? 'bg-[var(--mint)]' : 
          status === 'bad' ? 'bg-[var(--coral)]' : 
          'bg-[var(--secondary)]'
        }`}>
          {status === 'good' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          {status === 'bad' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {status === 'unknown' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
