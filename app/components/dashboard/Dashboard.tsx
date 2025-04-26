"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import PostureMonitor from "@/app/components/features/PostureMonitor";
import PomodoroTimer from "@/app/components/features/PomodoroTimer";
import PhoneAlert from "@/app/components/features/PhoneAlert";
import WaterReminder from "@/app/components/features/WaterReminder";
import CameraMonitor from "@/app/components/features/CameraMonitor";

// Import motion from framer-motion for animations
import { motion } from "framer-motion";

export default function Dashboard() {
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState("Welcome!");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning 👋");
    } else if (hour < 18) {
      setGreeting("Good afternoon 👋");
    } else {
      setGreeting("Good evening 👋");
    }
  }, []);

  // Define background styles based on theme for better visual appeal
  const backgroundStyle = theme === 'dark' 
    ? { background: 'radial-gradient(circle, rgba(30,33,50,1) 0%, rgba(18,20,30,1) 100%)' } 
    : { background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ef 100%)' };

  return (
    // Apply background style and padding
    <motion.div 
      className="p-6 md:p-8 min-h-screen" 
      style={backgroundStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-1 text-[var(--foreground)] transition-transform duration-300 ease-in-out hover:scale-105 cursor-default">
            Focura Dashboard
          </h1>
          <p className="text-[var(--foreground)] opacity-90">
            <span className="font-semibold text-[var(--accent)]"></span>your all-in-one productivity and wellness companion.
          </p>
        </motion.div>
        <motion.div 
          className="text-left sm:text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className="text-lg font-medium text-[var(--foreground)] opacity-90">{greeting}</span>
        </motion.div>
      </div>

      {/* Motivational Quote */}
      <motion.p 
        className="mb-8 italic text-[var(--foreground)] opacity-80 text-center text-sm md:text-base"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        "Stay focused, stay healthy. Let Focura guide your study journey!"
      </motion.p>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apply hover effect wrapper to grid items */}
        <div className="lg:col-span-2 card-hover-effect">
          <CameraMonitor />
        </div>
        
        <div className="space-y-6">
          <div className="card-hover-effect"><PomodoroTimer /></div>
          <div className="card-hover-effect"><PostureMonitor /></div>
          <div className="card-hover-effect"><PhoneAlert /></div>
          <div className="card-hover-effect"><WaterReminder /></div>
        </div>
      </div>
      
      {/* Add CSS directly for card styles if needed, or rely on global.css */}
      <style jsx>{`
        .card {
          /* Styles are now primarily in globals.css */
        }
        .card-hover-effect .card:hover {
          /* Styles are now primarily in globals.css */
        }
        /* Ensure CameraMonitor container takes full height potentially */
        .lg\\:col-span-2 > div { 
          /* Styles moved to globals.css for consistency */
          /* Consider adding height: 100%; if needed */
        }
      `}</style>
    </motion.div>
  );
}
