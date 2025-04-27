
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import PostureMonitor from "@/app/components/features/PostureMonitor";
import PomodoroTimer from "@/app/components/features/PomodoroTimer";
import PhoneAlert from "@/app/components/features/PhoneAlert";
import WaterReminder from "@/app/components/features/WaterReminder";
import CameraMonitor from "@/app/components/features/CameraMonitor";
import Pusher from 'pusher-js'; // Import Pusher
import { toast } from 'sonner'; // Import toast from sonner

// Import motion from framer-motion for animations
import { motion } from "framer-motion";

export default function Dashboard() {
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState("Welcome!");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning 👋");
    } else if (hour < 18) {
      setGreeting("Good afternoon 👋");
    } else {
      setGreeting("Good evening 👋");
    }

    // Request camera access
    const initializeCamera = async () => {
      try {
        // Request access to user's camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // We don't need audio for posture monitoring
        });
        
        // Set the stream in state
        setCameraStream(stream);
        setCameraError(null);
        console.log("Camera initialized successfully");
      } catch (err) {
        // Handle errors (permission denied, no camera found, etc.)
        console.error("Camera access error:", err);
        setCameraError(err instanceof Error ? err.message : "Unknown camera error");
        toast.error("Camera Error", {
          description: "Could not access your camera. Please check permissions.",
          duration: 5000,
        });
      }
    };

    initializeCamera();

    // --- Start of Pusher Logic ---

    // Ensure environment variables are available
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
        console.error("Pusher environment variables not set!");
        return;
    }

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = process.env.NODE_ENV !== 'production';

    const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster
    });

    const channel = pusher.subscribe('my-channel');

    channel.bind('my-event', function(data: any) {
        console.log('Received data:', data); // Log received data for debugging

        let message: string | undefined;
        if (typeof data === 'string') {
            message = data;
        } else if (typeof data === 'object' && data !== null && data.message) {
            message = data.message;
        } else {
            console.error("Received data is not in expected format:", data);
            return; // Exit if data format is unexpected
        }

        if (message === 'drink water') {
            // Use toast for notification
            toast.info('Hydration Reminder', {
              description: 'Time to drink some water!',
              duration: 5000, // Show for 5 seconds
            });
        } else if (message === 'bad posture') {
            // Use toast for notification
            toast.warning('Posture Check', {
              description: 'Sit up straight! Take care of your back.',
              duration: 5000,
            });
        } else {
            console.log("Received unhandled message:", message);
        }
    });

    // Optional: Handle connection states
    pusher.connection.bind('connected', () => {
        console.log('Pusher connected!');
    });

    pusher.connection.bind('error', (err: any) => {
        console.error('Pusher connection error:', err);
        if (err.error?.data?.code === 4004) {
          console.error("Pusher App Key likely incorrect or app disabled.");
        }
    });

    // Cleanup function when component unmounts
    return () => {
      // Stop all camera tracks when component unmounts
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
        });
        console.log("Camera tracks stopped");
      }

      console.log("Cleaning up Pusher connection...");
      channel.unbind_all(); // Unbind all event listeners
      channel.unsubscribe(); // Unsubscribe from the channel
      pusher.disconnect(); // Disconnect Pusher
    };
    // --- End of Pusher Logic ---

  }, []); // Empty dependency array ensures this runs only once on mount

  // Define background styles based on theme for better visual appeal
  const backgroundStyle = theme === 'dark' 
    ? { background: 'radial-gradient(circle, rgba(30,33,50,1) 0%, rgba(18,20,30,1) 100%)' } 
    : { background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ef 100%)' };

  // Animation variants for grid items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger animation
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

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
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ // Container variants for staggering children
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {/* Apply hover effect wrapper and animation to grid items */}
        <motion.div className="lg:col-span-2 card-hover-effect h-[500px]" variants={itemVariants} custom={0}>
          <CameraMonitor cameraStream={cameraStream} cameraError={cameraError} />
        </motion.div>
        
        <div className="space-y-6">
          {/* Wrap each card in motion.div */}
          <motion.div className="card-hover-effect" variants={itemVariants} custom={1}><PomodoroTimer /></motion.div>
          <motion.div className="card-hover-effect" variants={itemVariants} custom={2}><PostureMonitor /></motion.div>
          <motion.div className="card-hover-effect" variants={itemVariants} custom={3}><PhoneAlert /></motion.div>
          <motion.div className="card-hover-effect" variants={itemVariants} custom={4}><WaterReminder /></motion.div>
        </div>
      </motion.div>
      
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
