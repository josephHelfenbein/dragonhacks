# **Focura**  
![focura-icon](https://github.com/user-attachments/assets/d8c01bb0-e3b2-4bb7-a228-90311fdf15f3)

*A body-aware study companion*

Focura is a privacy-first focus app that monitors your posture and phone-gaze in real time, sending gentle nudges whenever you slouch, drift to your screen, or need a break—helping you stay comfortable, distraction-free, and locked into productive Pomodoro sessions.

---

## 💡 Inspiration  
Hours of exam prep left us stiff-necked and scatter-brained. Posture gadgets felt clunky, and “study-with-me” timers ignored biomechanics. We envisioned a **software-only coach**—one tab, one camera, zero data leaks—that guards both productivity and wellness.

---

## 🎯 What It Does  
* **Posture Sentinel** – MediaPipe Pose flags ≥ 15° shoulder-ear drift and issues toast alerts.  
* **Phone-Gaze Detector** – Downward face angle triggers “looking-down” events to curb doom-scrolling.  
* **Pomodoro & Hydration Coach** – Classic 25 / 5-minute cycles with streak badges.  
* **Pair-Focus Mode** – WebRTC mirrors posture tiles with friends for mutual accountability, signalled via Pusher Channels.  
* **Privacy First** – All computer-vision inference runs locally; only lightweight JSON deltas leave the machine.

---

## 🏗️ How We Built It  
* **LangChain-agent** – Python 3.11 orchestrated by **LangGraph** continuously captures webcam frames with **OpenCV**, applies **MediaPipe Pose** landmarks, and converts posture or phone-gaze deviations into compact events.  
* **Realtime transport** – Events publish to **Pusher Channels**; tiny **Go** serverless endpoints on **Vercel** act as authenticated triggers and also relay WebRTC SDP/candidates for optional peer video.  
* **Web dashboard** – A **Next.js 14** front-end, styled with **Tailwind CSS** and **shadcn/ui**, subscribes to Pusher streams, animates toast notifications, runs a Pomodoro timer, and embeds the WebRTC `<video>` element—all in **TypeScript React**.  

---

## 🧰 Tech Stack & Tools  
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org)  [![MediaPipe](https://img.shields.io/badge/MediaPipe-F76710?logo=google&logoColor=white)](https://developers.google.com/mediapipe)   [![LangGraph](https://img.shields.io/badge/LangGraph-FFCC00?logo=langchain&logoColor=black)](https://python.langchain.com)  [![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white)](https://go.dev)  [![Pusher](https://img.shields.io/badge/Pusher-664CC2?logo=pusher&logoColor=white)](https://pusher.com)  [![WebRTC](https://img.shields.io/badge/WebRTC-008000?logo=webrtc&logoColor=white)](https://webrtc.org)  [![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)  [![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev)  [![TypeScript](https://img.shields.io/badge/Tailwind-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)  [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-FF6363?logo=react&logoColor=white)](https://ui.shadcn.com) [![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

---

## How to Run

First, have the correct API keys in the global .env and in the /agent .env. Then, go to the agent folder and run `pip install -r requirements.txt` and `python server.py`. In a separate terminal, run `vercel dev` on the root folder and go to `http://localhost:3000/`.

---

## 🧗‍♂️ Challenges  
* **Camera permissions** on macOS required a three-retry safety wrapper to avoid false negatives.  
* **Threshold tuning** balanced user comfort vs. nag frequency by averaging five calibration frames and applying adaptive ± 15° bands.  
* **Serverless signalling**—writing minimal Go handlers beat spinning up Socket.IO infrastructure during a 24-hour hackathon.

---

## 🏆 Accomplishments  
* **Autonomous computer-vision agent** – Designed and implemented a self-calibrating posture agent that maintains a rolling baseline, recovers from camera errors, streams JSON-only events, and stays cross-platform.
* **Sub-200 ms feedback loop** – Achieved end-to-end alert latency fast enough to correct posture before discomfort sets in.  
* **Inclusive UI design** – Delivered a colour-blind-safe interface without sacrificing clarity, aided by utility-first styling.

---

## 🔮 What’s Next  
* Guided stretch routines after repeated bad-posture events.  
* React Native companion app leveraging on-device Pose for mobile study sessions.  
* Leaderboards and streaks to gamify consistency and build a posture-proud community.
