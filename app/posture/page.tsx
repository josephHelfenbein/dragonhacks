import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posture Tracking - Study Buddy",
  description: "Monitor and improve your posture during study sessions",
};

export default function PosturePage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Posture Tracking</h1>
        <p className="mb-4">Content for the posture page goes here.</p>
      </div>
    </DashboardLayout>
  );
}
