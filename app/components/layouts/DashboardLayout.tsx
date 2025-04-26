"use client"; // Ensure this is a client component

import { useState } from 'react'; // Import useState
import Sidebar from "@/app/components/navigation/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [expanded, setExpanded] = useState(true); // Manage expanded state here

  const toggleSidebar = () => {
    setExpanded(!expanded); // Function to toggle state
  };

  return (
    <div className="flex min-h-screen"> {/* Ensure flex container takes full height */}
      {/* Pass state and toggle function to Sidebar */}
      <Sidebar expanded={expanded} onToggle={toggleSidebar} /> 
      {/* Apply dynamic margin and transition to main content area */}
      <main className={`flex-1 transition-all duration-300 ease-in-out ${expanded ? 'ml-64' : 'ml-20'}`}>
        {children}
      </main>
    </div>
  );
}
