"use client";

import { useState } from "react";
import { WaterDropIcon } from "@/app/components/ui/Icons";

const HYDRATION_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in ms

export default function WaterReminder() {
  const [lastDrank, setLastDrank] = useState<Date | null>(null);
  const [glasses, setGlasses] = useState(0);
  
  const drinkWater = () => {
    setLastDrank(new Date());
    setGlasses(glasses + 1);
  };

////WATER TIMER 
   // Whenever lastDrank changes, reset the 2-hour timer
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const elapsed = lastDrank ? Date.now() - lastDrank.getTime() : 0;
    const delay = lastDrank
      ? Math.max(0, HYDRATION_INTERVAL - elapsed)
      : HYDRATION_INTERVAL;

    timerRef.current = setTimeout(() => {
      alert("It’s been 2 hours since your last water break. Time to hydrate!");
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastDrank]);
    

  return (
    <div className="card bg-[var(--primary)] bg-opacity-20">
      <h3 className="text-lg font-semibold mb-2">Hydration Tracker</h3>
      <p className="text-sm mb-3">
        {lastDrank 
          ? `Last hydrated: ${lastDrank.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Remember to drink water regularly!'
        }
      </p>
      <div className="flex items-center justify-between">
        <div className="text-sm">Glasses today: {glasses}</div>
        <button 
          onClick={drinkWater} 
          className="flex items-center gap-2 py-1 px-3 rounded-full bg-[var(--mint)] text-black text-sm"
        >
          <WaterDropIcon />
          Log water
        </button>
      </div>
    </div>
  );
}
