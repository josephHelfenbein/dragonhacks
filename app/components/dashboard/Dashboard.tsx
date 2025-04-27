
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import PostureMonitor from "@/app/components/features/PostureMonitor";
import PomodoroTimer from "@/app/components/features/PomodoroTimer";
import PhoneAlert from "@/app/components/features/PhoneAlert";
import WaterReminder from "@/app/components/features/WaterReminder";
import CameraMonitor from "@/app/components/features/CameraMonitor";
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { motion } from "framer-motion";

export default function Dashboard() {
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState("Welcome!");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const signallingChannel = useRef<any>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(stream);
      } catch (err) {
        setCameraError(err instanceof Error ? err.message : "Unknown camera error");
        toast.error("Camera Error", { description: "Could not access your camera.", duration: 5000 });
      }
    })();
    
    return () => {
      cameraStream?.getTracks().forEach(t => t.stop());
    };
  }, []);
  
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.error("Pusher environment variables not set!");
      return;
    }
    
    Pusher.logToConsole = process.env.NODE_ENV !== 'production';
    
    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    
    const logsChan = pusher.subscribe('logs');
    logsChan.bind('new_log', (data: any) => {
      if (data?.message) setLogs(prev => [...prev, data.message]);
    });
    logsChan.bind('bad_posture', (data: any) => {
      if (data?.message) {
        toast.warning('Bad Posture Detected', { description: data.message, duration: 5000 });
      }
    });
    logsChan.bind('phone_suspicion', (data: any) => {
      if (data?.message) {
        toast.error('Phone Usage Detected', { description: data.message, duration: 5000 });
      }
    });
    //water reminder
    logsChan.bind('water_reminder', (data: any) => {
      if (data?.message) {
        toast.error('Remember to drink water', { description: data.message, duration: 5000 });
      }
    });
    
    const pendingCandidates: RTCIceCandidateInit[] = [];
    
    signallingChannel.current = pusher.subscribe('webrtc-signaling');
    signallingChannel.current.bind('answer', (data: any) => {
      const pc = pcRef.current;
      if (!pc) return;
      const desc = new RTCSessionDescription(data);
      pc.setRemoteDescription(desc)
      .then(() => {
        for (const candInit of pendingCandidates) {
          pc.addIceCandidate(new RTCIceCandidate(candInit))
          .catch(console.error);
        }
        pendingCandidates.length = 0;
      })
      .catch(console.error);
    });
    signallingChannel.current.bind('candidate', (data: any) => {
      const candInit: RTCIceCandidateInit = {
        candidate: data.candidate,
        sdpMid: data.sdpMid,
        sdpMLineIndex: data.sdpMLineIndex
      };
      const pc = pcRef.current;
      if (pc?.remoteDescription && pc.remoteDescription.type) {
        pc.addIceCandidate(new RTCIceCandidate(candInit)).catch(console.error);
      } else {
        pendingCandidates.push(candInit);
      }
    });
    
    pusher.connection.bind('connected', () => console.log('Pusher connected'));
    pusher.connection.bind('error', (err: any) => console.error('Pusher error', err));
    
    return () => {
      [logsChan, signallingChannel.current].forEach(c => {
        c?.unbind_all();
        c?.unsubscribe();
      });
      pusher.disconnect();
    };
  }, []);
  
  
  useEffect(() => {
    if (!cameraStream || !isMonitoring) return;
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    
    cameraStream.getTracks().forEach(track => pc.addTrack(track, cameraStream));
    
    pc.onicecandidate = event => {
      if (event.candidate) fetch('/api/webrtc-candidate/handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        })
      }).catch(console.error);
    };
    
    pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .then(() => {
      if (pc.localDescription) fetch('/api/webrtc-offer/handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: pc.localDescription.sdp, type: pc.localDescription.type })
      }).catch(console.error);
    })
    .catch(console.error);
    
    return () => { pc.close(); pcRef.current = null; };
  }, [cameraStream, isMonitoring]);
  
  const startAgent = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/start-agent/handler', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('Agent start triggered on server');
    } catch (err) {
      console.error('Start agent failed', err);
      toast.error('Failed to start agent');
    }
    setIsStarting(false);
  };
  
  const backgroundStyle = theme === 'dark'
  ? { background: 'radial-gradient(circle, rgba(30,33,50,1) 0%, rgba(18,20,30,1) 100%)' }
  : { background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ef 100%)' };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i*0.1, duration:0.5, ease:'easeOut' } })
  };
  
  return (
    <motion.div className="p-6 md:p-8 min-h-screen" style={backgroundStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration:0.6, delay:0.2 }}>
    <h1 className="text-3xl font-bold mb-1 text-[var(--foreground)] cursor-default">Focura Dashboard</h1>
    <p className="text-lg font-medium text-[var(--foreground)] opacity-90">{greeting}</p>
    </motion.div>
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration:0.6, delay:0.4 }}>
    <button onClick={startAgent} disabled={!isMonitoring || isStarting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
    {isStarting ? 'Starting…' : 'Start Agent'}
    </button>
    </motion.div>
    </div>
    <motion.div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-48 overflow-y-auto font-mono text-xs">
    {logs.length===0?
      <p className="text-gray-500">No logs yet.</p>:
      logs.map((l,i)=><div key={i}>{l}</div>)}
      </motion.div>
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" initial="hidden" animate="visible" variants={{ visible: { transition:{ staggerChildren:0.1 }}}}>
      <motion.div className="lg:col-span-2 h-[500px] card-hover-effect" variants={itemVariants} custom={0}>
      <CameraMonitor cameraStream={cameraStream} cameraError={cameraError} isMonitoring={isMonitoring} onToggleMonitoring={()=>setIsMonitoring(!isMonitoring)} />
      </motion.div>
      <div className="space-y-6">
      <motion.div className="card-hover-effect" variants={itemVariants} custom={1}><PomodoroTimer /></motion.div>
      <motion.div className="card-hover-effect" variants={itemVariants} custom={2}><PostureMonitor /></motion.div>
      <motion.div className="card-hover-effect" variants={itemVariants} custom={3}><PhoneAlert /></motion.div>
      <motion.div className="card-hover-effect" variants={itemVariants} custom={4}><WaterReminder /></motion.div>
      </div>
      </motion.div>
      </motion.div>
    );
  }
  