import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Focus Timer - Study Buddy",
  description: "Boost your productivity with our Pomodoro focus timer",
};

export default function TimerPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Focus Timer</h1>
        <p className="mb-4">Content for the timer page goes here.</p>
      </div>
    </DashboardLayout>
  );
}
