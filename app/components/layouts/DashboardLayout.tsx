"use client";

import Sidebar from "@/app/components/navigation/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-20 lg:ml-64 flex-1">
        {children}
      </div>
    </div>
  );
}
