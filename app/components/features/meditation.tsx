
"use client";

import { useState, useEffect, useRef } from "react";
import { Music2 as MusicIcon, X as CloseIcon } from "lucide-react";

export default function MeditationPrompt({
  durationMinutes = 5,
}: {
  durationMinutes?: number;
}) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const audioRef = useRef<HTMLAudioElement>(null);

  // reset & play/pause audio on modal open/close
  useEffect(() => {
    if (open) {
      setSecondsLeft(durationMinutes * 60);
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [open, durationMinutes]);

  // countdown loop
  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [open, secondsLeft]);

  // auto‐close at end
  useEffect(() => {
    if (open && secondsLeft === 0) setOpen(false);
  }, [open, secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center p-2 rounded-full bg-[var(--mint)] hover:bg-[var(--mint)-hover] transition"
      >
        <MusicIcon className="w-6 h-6 text-black" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative card bg-[var(--primary)] bg-opacity-20 p-6 rounded-2xl shadow-lg w-full max-w-sm">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black">
              Meditate for {durationMinutes} Minutes
            </h2>
            <p className="text-5xl font-mono mb-6 text-black">
              {mm}:{ss}
            </p>
            {/* meditation music file in public/ */}
             <audio
                ref={audioRef}
                src="/images/meditation_music.mp3"
                loop
                preload="auto"
            />

          </div>
        </div>
      )}
    </>
  );
}
