"use client";

import { useState, useEffect } from "react";

export default function PhoneAlert() {
  const [isOnPhone, setIsOnPhone] = useState(false);
  const [instances, setInstances] = useState(0);
  
  // For demo purposes, randomly trigger phone detection
  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = Math.random() > 0.7;
      if (newStatus && !isOnPhone) {
        setInstances(prev => prev + 1);
      }
      setIsOnPhone(newStatus);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isOnPhone]);
  
  if (!isOnPhone && instances === 0) {
    return (
      <div className="card bg-[var(--secondary)] bg-opacity-20">
        <h3 className="text-lg font-semibold mb-2">Phone Monitor</h3>
        <p>No phone distractions detected in this session.</p>
      </div>
    );
  }
  
  return (
    <div className={`card ${isOnPhone ? 'bg-[var(--coral)] bg-opacity-30' : 'bg-[var(--secondary)] bg-opacity-20'}`}>
      <h3 className="text-lg font-semibold mb-2">Phone Monitor</h3>
      {isOnPhone ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[var(--coral)]">Phone detected! Stay focused.</p>
            <p className="text-xs mt-1">Put your phone away to continue studying effectively.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[var(--coral)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </div>
        </div>
      ) : (
        <div>
          <p>Phone distractions detected: {instances} times this session</p>
        </div>
      )}
    </div>
  );
}
