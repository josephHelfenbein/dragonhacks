"use client";

import { useState, useEffect } from "react";

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer completed
          clearInterval(interval);
          setIsRunning(false);
          
          if (mode === 'focus') {
            setMode('break');
            setMinutes(5);
            setSeconds(0);
          } else {
            setMode('focus');
            setMinutes(25);
            setSeconds(0);
          }
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, mode]);
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };
  
  const switchMode = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('break');
      setMinutes(5);
    } else {
      setMode('focus');
      setMinutes(25);
    }
    setSeconds(0);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Pomodoro Timer</h3>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold mb-4">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm mb-4">
          {mode === 'focus' ? 'Focus Session' : 'Break Time'}
        </div>
        <div className="flex space-x-2">
          <button onClick={toggleTimer} className="btn-primary">
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer} className="btn-primary">Reset</button>
          <button onClick={switchMode} className="btn-accent">
            Switch to {mode === 'focus' ? 'Break' : 'Focus'}
          </button>
        </div>
      </div>
    </div>
  );
}
