import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics - Study Buddy",
  description: "Track your study sessions, posture, and productivity data",
};

export default function StatsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Statistics</h1>
        <p className="mb-4">Content for the statistics page goes here.</p>
      </div>
    </DashboardLayout>
  );
}
