import os
import sys
import subprocess
import threading
import time
import logging
import asyncio
import json
import cv2
import av
av.logging.set_level(av.logging.ERROR)

import pusher
import pusherclient
from dotenv import load_dotenv
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate

load_dotenv()

http_pusher = pusher.Pusher(
    app_id=os.getenv("PUSHER_APP_ID"),
    key=os.getenv("PUSHER_APP_KEY"),
    secret=os.getenv("PUSHER_APP_SECRET"),
    cluster=os.getenv("PUSHER_APP_CLUSTER"),
    ssl=True
)

cluster = os.getenv("PUSHER_APP_CLUSTER")
pusherclient.Pusher.host = f"ws-{cluster}.pusher.com"
ws_pusher = pusherclient.Pusher(
    os.getenv("PUSHER_APP_KEY"),
    secure=True,
    port=443,
    log_level=logging.INFO
)
ws_pusher.connection.bind('pusher:error', lambda data: print(f"❌ Pusher error: {data}"))

loop = asyncio.new_event_loop()
threading.Thread(target=loop.run_forever, daemon=True).start()

frame_queue = asyncio.Queue()
tcs = set()

webrtc_ready = threading.Event()

os.makedirs("frames", exist_ok=True)
latest_frame_path = os.path.join("frames", "latest_frame.jpg")
webrtc_status_path = os.path.join("frames", "webrtc_ready")

async def handle_offer(data):
    offer = json.loads(data)
    pc = RTCPeerConnection()
    tcs.add(pc)

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            async def recv_frames():
                webrtc_ready.set()
                with open(webrtc_status_path, "w") as f:
                    f.write("ready")
                    
                while True:
                    frame = await track.recv()
                    img = frame.to_ndarray(format="bgr24")
                    
                    cv2.imwrite(latest_frame_path, img)
                    
                    await frame_queue.put(img)
            asyncio.run_coroutine_threadsafe(recv_frames(), loop)

    desc = RTCSessionDescription(offer['sdp'], offer['type'])
    await pc.setRemoteDescription(desc)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    http_pusher.trigger('webrtc-signaling', 'answer', {
        'sdp': pc.localDescription.sdp,
        'type': pc.localDescription.type
    })

async def handle_candidate(data):
    cand = json.loads(data)
    ice = RTCIceCandidate(
        sdpMid=cand.get('sdpMid'),
        sdpMLineIndex=cand.get('sdpMLineIndex'),
        candidate=cand.get('candidate')
    )
    for pc in tcs:
        await pc.addIceCandidate(ice)

def on_connect(data):
    ctrl = ws_pusher.subscribe('control')
    ctrl.bind('start', lambda d: start_agent())
    sig = ws_pusher.subscribe('webrtc-signaling')
    sig.bind('offer', lambda d: asyncio.run_coroutine_threadsafe(handle_offer(d), loop))
    sig.bind('candidate', lambda d: asyncio.run_coroutine_threadsafe(handle_candidate(d), loop))
    print("🔗 Subscribed to 'control' & 'webrtc-signaling'")

ws_pusher.connection.bind('pusher:connection_established', on_connect)
ws_pusher.connect()
print("🚀 Pusher client initialized, awaiting control & signaling...")

frames_received = False

async def webrtc_capture_frame():
    try:
        # Check if WebRTC is ready by looking for the signal file
        if not os.path.exists(webrtc_status_path):
            return {"status": "error", "error": "WebRTC connection not established yet"}
            
        # Try to get frame from the image file
        if os.path.exists(latest_frame_path):
            # Run CV2 image reading in a thread pool to prevent blocking
            frame = await asyncio.to_thread(cv2.imread, latest_frame_path)
            if frame is None:
                return {"status": "error", "error": "Failed to read frame from file"}
            return {"status": "success", "frame": frame}
        else:
            return {"status": "error", "error": "No frames available yet"}
    except Exception as e:
        return {"status": "error", "error": f"WebRTC error: {str(e)}"}
    
agent_thread = None

def start_agent(data=None):
    global agent_thread
    if agent_thread and agent_thread.is_alive():
        print("🔹 Agent already running.")
        return

    def _run():
        webrtc_ready.wait()
        print("🔹 WebRTC ready, starting agent.")
        cmd = [sys.executable, '-u', 'agent.py']
        print(f"⏳ Starting agent subprocess: {cmd}")
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        for raw in proc.stdout:
            line = raw.rstrip()
            print(f"[agent] {line}")
            if(line.startswith("Starting") or line.startswith("Capturing") or line.startswith("✅ Body posture calibrated") or line.startswith("✅ Face angle calibrated") or line.startswith("❌")):
                http_pusher.trigger('logs', 'new_log', {'message': line})
            elif(line.startswith("⚠️ Bad posture detected!")):
                http_pusher.trigger('bad_posture', 'new_log', {'message': line})
            elif(line.startswith("📱 Suspicious!")):
                http_pusher.trigger('phone_suspicion', 'new_log', {'message': line})
            elif(line.startswith("✅ You're no longer")):
                http_pusher.trigger('phone_suspicion', 'new_log', {'message': line})
            elif(line.startswith("✅ Posture corrected!")):
                http_pusher.trigger('bad_posture', 'new_log', {'message': line})
        proc.stdout.close()
        proc.wait()
        print(f"⚠️ Agent exited ({proc.returncode})")

    agent_thread = threading.Thread(target=_run, daemon=True)
    agent_thread.start()
    print("✅ Agent thread started.")

def main():
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("⏹️ Shutting down...")
        if agent_thread and agent_thread.is_alive():
            agent_thread.join()

if __name__ == "__main__":
    main()