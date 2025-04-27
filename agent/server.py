import os
import sys
import subprocess
import threading
import time
import logging
import asyncio
import json
import pusher
import pusherclient
from dotenv import load_dotenv
from aiortc import RTCPeerConnection, RTCSessionDescription

del load_dotenv
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

def _on_error(data):
    print(f"❌ Pusher error: {data}")
ws_pusher.connection.bind('pusher:error', _on_error)

loop = asyncio.new_event_loop()
threading.Thread(target=loop.run_forever, daemon=True).start()

frame_queue: asyncio.Queue = asyncio.Queue(loop=loop)
tcs = set()

async def handle_offer(data):
    offer = json.loads(data)
    pc = RTCPeerConnection()
    tcs.add(pc)

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            async def recv_frames():
                while True:
                    frame = await track.recv()
                    img = frame.to_ndarray(format="bgr24")
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
    for pc in tcs:
        await pc.addIceCandidate(cand)

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

async def safely_capture_frame():
    """Safely capture a frame from the camera."""
    try:
        frame = await asyncio.wait_for(frame_queue.get(), timeout=5.0)
        return {"status": "success", "frame": frame}
    except asyncio.TimeoutError:
        return {"status": "error", "error": "No frame received from WebRTC in time"}

agent_thread = None


def start_agent(data=None):
    """Spawn agent.py subprocess and send its output to Pusher 'logs' channel."""
    global agent_thread
    if agent_thread and agent_thread.is_alive():
        print("Agent already running.")
        return

    def _run():
        cmd = [sys.executable, "agent.py"]
        print(f"⏳ Starting agent subprocess: {cmd}")
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        for raw_line in proc.stdout:
            line = raw_line.rstrip()
            print(f"[agent] {line}")
            http_pusher.trigger('logs', 'new_log', {'message': line})
        proc.stdout.close()
        proc.wait()
        print(f"⚠️ Agent subprocess exited with code {proc.returncode}")

    agent_thread = threading.Thread(target=_run, daemon=True)
    agent_thread.start()
    print("✅ Agent thread started.")


try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Shutting down.")
    if agent_thread and agent_thread.is_alive():
        agent_thread.join()
