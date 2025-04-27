"use client";

import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import { useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";
import { motion, AnimatePresence } from "framer-motion";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const timeframes = ["Day", "Week", "Month", "Overall"] as const;
type Timeframe = typeof timeframes[number];

const mockStats = {
  Day: {
    totalStudyTime: 2 * 60 * 60 * 1000, // 2 hours
    postureIssues: 1,
    phoneDistractions: 0,
    focusPercentage: 92,
    waterIntake: 3,
    studyHistory: [30, 20, 40, 30, 0, 0, 0], // 7 slots for today (hours)
    focusBreakdown: [92, 4, 4],
    trend: { up: true, change: "+8%" }
  },
  Week: {
    totalStudyTime: 12 * 60 * 60 * 1000, // 12 hours
    postureIssues: 5,
    phoneDistractions: 3,
    focusPercentage: 88,
    waterIntake: 18,
    studyHistory: [90, 120, 100, 80, 110, 70, 130], // minutes per day
    focusBreakdown: [88, 7, 5],
    trend: { up: false, change: "-3%" }
  },
  Month: {
    totalStudyTime: 52 * 60 * 60 * 1000, // 52 hours
    postureIssues: 22,
    phoneDistractions: 11,
    focusPercentage: 85,
    waterIntake: 80,
    studyHistory: [ // minutes per week
      400, 500, 520, 480
    ],
    focusBreakdown: [85, 10, 5],
    trend: { up: true, change: "+5%" }
  },
  Overall: {
    totalStudyTime: 210 * 60 * 60 * 1000, // 210 hours
    postureIssues: 90,
    phoneDistractions: 45,
    focusPercentage: 83,
    waterIntake: 320,
    studyHistory: [ // minutes per month
      1800, 2100, 2000, 2200, 2100, 2050
    ],
    focusBreakdown: [83, 12, 5],
    trend: { up: true, change: "+2%" }
  }
};

const chartLabels = {
  Day: ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm"],
  Week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  Month: ["Week 1", "Week 2", "Week 3", "Week 4"],
  Overall: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
};

export default function StatsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("Week");
  const stats = mockStats[timeframe];

  // Chart Data
  const lineData = {
    labels: chartLabels[timeframe],
    datasets: [
      {
        label: "Study Time",
        data: stats.studyHistory,
        fill: true,
        backgroundColor: "rgba(88,214,141,0.10)",
        borderColor: "#58D68D",
        tension: 0.4,
        pointBackgroundColor: "#58D68D",
        pointBorderColor: "#fff",
        pointRadius: 6,
      },
    ],
  };

  const donutData = {
    labels: ["Focus", "Posture Issues", "Phone Distractions"],
    datasets: [
      {
        data: stats.focusBreakdown,
        backgroundColor: ["#58D68D", "#EC7063", "#5DADE2"],
        borderWidth: 2,
        borderColor: "#212F3D",
        hoverOffset: 8,
      },
    ],
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.10, duration: 0.5, type: "spring" },
    }),
  };

  // Trend arrow
  const TrendArrow = ({ up }: { up: boolean }) => (
    <span className={up ? "text-green-500" : "text-red-500"} style={{ fontSize: 18, marginLeft: 4 }}>
      {up ? "▲" : "▼"}
    </span>
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen bg-[var(--background)]">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-6 text-[var(--foreground)] text-center flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span role="img" aria-label="chart">📊</span>
          Study & Wellness Statistics
        </motion.h1>

        {/* Timeframe Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`px-4 py-2 rounded-full font-semibold transition-colors
                ${tf === timeframe
                  ? "bg-[var(--mint)] text-[var(--background)] shadow"
                  : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--mint)] hover:text-[var(--background)]"}
              `}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Animated Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: "Total Study Time",
              value: `${(stats.totalStudyTime / 3600000).toFixed(1)}h`,
              color: "text-blue-400",
              icon: "⏰",
              trend: stats.trend,
            },
            {
              label: "Focus %",
              value: `${stats.focusPercentage}%`,
              color: "text-green-400",
              icon: "🎯",
              trend: stats.trend,
            },
            {
              label: "Posture Issues",
              value: stats.postureIssues,
              color: "text-red-400",
              icon: "🪑",
              trend: stats.trend,
            },
            {
              label: "Water Intake",
              value: `${stats.waterIntake} cups`,
              color: "text-cyan-400",
              icon: "💧",
              trend: stats.trend,
            },
          ].map((card, i) => (
            <motion.div
              className="card flex flex-col items-center py-7"
              key={card.label}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(52,73,94,0.10)" }}
            >
              <span className="text-3xl md:text-4xl mb-2">{card.icon}</span>
              <span className={`text-xl md:text-2xl font-bold ${card.color}`}>{card.value}</span>
              <span className="text-gray-400 mt-1">{card.label}</span>
              {i === 0 && (
                <span className="flex items-center mt-2 text-xs">
                  <TrendArrow up={card.trend.up} />
                  <span className={card.trend.up ? "text-green-500" : "text-red-500"}>{card.trend.change}</span>
                  <span className="ml-1 text-gray-400">vs last {timeframe.toLowerCase()}</span>
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Study Time Line Chart */}
          <motion.div
            className="card flex flex-col items-center"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-[var(--foreground)]">Study Time Trend</h2>
            <div className="w-full h-64">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: "index", intersect: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(88,214,141,0.10)" },
                      ticks: { color: "#58D68D" },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#58D68D" },
                    },
                  },
                  animation: { duration: 1200, easing: "easeOutQuart" },
                }}
              />
            </div>
          </motion.div>
          {/* Focus/Distraction Donut Chart */}
          <motion.div
            className="card flex flex-col items-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-[var(--foreground)]">Focus & Distractions</h2>
            <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
              <Doughnut
                data={donutData}
                options={{
                  plugins: {
                    legend: {
                      display: true,
                      position: "bottom" as const,
                      labels: { color: "#58D68D", font: { size: 14 } },
                    },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } },
                  },
                  cutout: "70%",
                  animation: { animateRotate: true, duration: 1200 },
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Settings Section */}
        <motion.div
          className="card max-w-xl mx-auto mt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h2 className="text-lg md:text-xl font-semibold mb-4">Personalization</h2>
          <form className="space-y-4">
            <div>
              <label className="block font-medium mb-1" htmlFor="notification-interval">
                Notification Interval (minutes)
              </label>
              <input
                id="notification-interval"
                type="number"
                min={5}
                max={120}
                value={30}
                onChange={() => {}}
                className="input input-bordered w-full"
                disabled
              />
              <span className="text-xs text-gray-400">Demo: Change in settings coming soon</span>
            </div>
            <div className="flex items-center">
              <input
                id="posture-alerts"
                type="checkbox"
                checked={true}
                onChange={() => {}}
                className="checkbox mr-2"
                disabled
              />
              <label htmlFor="posture-alerts" className="font-medium">
                Enable Posture Alerts
              </label>
              <span className="ml-2 text-xs text-gray-400">Demo only</span>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
