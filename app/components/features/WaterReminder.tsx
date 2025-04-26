"use client";

import { useState } from "react";
import { WaterDropIcon } from "@/app/components/ui/Icons";

export default function WaterReminder() {
  const [lastDrank, setLastDrank] = useState<Date | null>(null);
  const [glasses, setGlasses] = useState(0);
  
  const drinkWater = () => {
    setLastDrank(new Date());
    setGlasses(glasses + 1);
  };

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
