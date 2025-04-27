# agent.py
import asyncio
import time
import sys
import os
import requests
import base64
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from langgraph.graph import StateGraph, END
import cv2
from server import webrtc_capture_frame

@dataclass
class PostureState:
    """State for posture monitoring workflow."""
    posture_calibrated: bool = False
    face_angle_calibrated: bool = False
    bad_posture_count: int = 0
    phone_suspicion_count: int = 0
    posture_notification_shown: bool = False
    phone_notification_shown: bool = False
    last_posture_result: Optional[Dict[str, Any]] = None
    last_face_angle_result: Optional[Dict[str, Any]] = None
    monitor_task: Optional[asyncio.Task] = None
    camera_working: bool = False

graph = StateGraph(PostureState)

async def check_camera(state: PostureState):
    """Check if camera is accessible before proceeding with calibration."""
    print("Checking camera access...")
    
    try:
        
        # Try multiple times with a delay
        for attempt in range(3):
            result = await webrtc_capture_frame()
            
            if result["status"] == "success":
                state.camera_working = True
                print("✅ Camera check successful! Proceeding with calibration.")
                break
            else:
                print(f"❌ Camera check failed (attempt {attempt+1}/3): {result.get('error', 'Unknown error')}")
                if attempt < 2:  # Only wait if more attempts remain
                    print("Waiting 2 seconds before retrying...")
                    await asyncio.sleep(2)
        else:  # This runs if the for loop completed without a break
            state.camera_working = False
            print("\nTroubleshooting tips:")
            print(" 1. Make sure your camera is connected and enabled in the browser")
            print(" 2. Refresh the web page and try again")
            print(" 3. Try closing and reopening the terminal")
    except Exception as e:
        state.camera_working = False
        print(f"❌ Unexpected error during camera check: {str(e)}")
    
    return state

async def calibrate(state: PostureState):
    """Calibrate posture and face angle if camera is working."""
    if not state.camera_working:
        print("⚠️ Skipping calibration due to camera issues.")
        return state
    
    from posture_tools import calibrate_posture_tool, calibrate_face_angle_tool
    
    try:
        print("\n--- Body Posture Calibration ---")
        posture_result = await calibrate_posture_tool()
        if posture_result["status"] == "success":
            state.posture_calibrated = True
            frames_used = posture_result.get("frames_used", "unknown number of")
            print(f"✅ Body posture calibrated successfully using {frames_used} frames!")
        else:
            print(f"❌ Body posture calibration failed: {posture_result.get('error', 'Unknown error')}")
            print("⚠️ You can try calibration again later.")
    except Exception as e:
        print(f"❌ Unexpected error during posture calibration: {str(e)}")
    
    try:
        print("\n--- Face Angle Calibration ---")
        face_result = await calibrate_face_angle_tool()
        if face_result["status"] == "success":
            state.face_angle_calibrated = True
            frames_used = face_result.get("frames_used", "unknown number of")
            print(f"✅ Face angle calibrated successfully using {frames_used} frames!")
        else:
            print(f"❌ Face angle calibration failed: {face_result.get('error', 'Unknown error')}")
            print("⚠️ You can try calibration again later.")
    except Exception as e:
        print(f"❌ Unexpected error during face angle calibration: {str(e)}")
    
    return state

async def check_posture_and_attention(state: PostureState):
    """Check posture and attention if at least one calibration succeeded."""
    from posture_tools import posture_check_tool, check_face_angle_tool
    
    if not state.posture_calibrated and not state.face_angle_calibrated:
        print("\n❌ Error: At least one calibration (posture or face) must succeed to continue.")
        print("Please restart the application and try calibration again.")
        return state
    
    print("\n--- Starting Monitoring ---")
    features_checked = []
    if state.posture_calibrated:
        features_checked.append("posture")
    if state.face_angle_calibrated:
        features_checked.append("face angle")
    
    print(f"✅ Monitoring enabled for: {', '.join(features_checked)}")
    
    try:
        async def continuous_monitoring():
            while True:
                try:
                    if state.posture_calibrated:
                        try:
                            posture_result = await posture_check_tool()
                            if posture_result["status"] == "success":
                                state.last_posture_result = posture_result
                                bad_posture = not posture_result["posture_good"]
                                
                                if bad_posture and not state.posture_notification_shown:
                                    print(f"⚠️ Bad posture detected! Deviation: {posture_result['deviation']:.2f}")
                                    state.posture_notification_shown = True
                                    state.bad_posture_count += 1
                                elif not bad_posture and state.posture_notification_shown:
                                    print(f"✅ Posture corrected! Deviation: {posture_result['deviation']:.2f}")
                                    state.posture_notification_shown = False
                        except Exception as e:
                            print(f"⚠️ Posture check error: {str(e)}")
                    
                    if state.face_angle_calibrated:
                        try:
                            face_result = await check_face_angle_tool()
                            if face_result["status"] == "success":
                                state.last_face_angle_result = face_result
                                looking_at_phone = face_result["looking_down"]
                                


                                if looking_at_phone and not state.phone_notification_shown:
                                    cap_res = await webrtc_capture_frame()
                                    if cap_res["status"] == "success":
                                        frame = cap_res["frame"]
                                        result = await ask_gemini_if_looking_at_phone(frame)

                                        if result == "yes":
                                            print(f"📱 Suspicious! You appear to be looking down at your phone or device.")
                                            print(f"   Vertical deviation: {face_result['vertical_deviation']:.2f}°")
                                            state.phone_notification_shown = True
                                            state.phone_suspicion_count += 1
                                elif not looking_at_phone and state.phone_notification_shown:
                                    cap_res = await webrtc_capture_frame()
                                    if cap_res["status"] == "success":
                                        frame = cap_res["frame"]
                                        result = await ask_gemini_if_looking_at_phone(frame)

                                        if result == "no":
                                            print(f"✅ You're no longer looking down at your phone.")
                                            state.phone_notification_shown = False
                                    
                        except Exception as e:
                            print(f"⚠️ Face angle check error: {str(e)}")
                            
                except Exception as e:
                    print(f"❌ Monitoring error: {str(e)}")
                
                await asyncio.sleep(0.5)
        
        monitor_task = asyncio.create_task(continuous_monitoring())
        
        state.monitor_task = monitor_task
        
    except Exception as e:
        print(f"❌ Error setting up monitoring: {str(e)}")
    
    return state

graph.add_node("check_camera", check_camera)
graph.add_node("calibrate", calibrate)
graph.add_node("check_posture_and_attention", check_posture_and_attention)

graph.set_entry_point("check_camera")
graph.add_edge("check_camera", "calibrate")
graph.add_edge("calibrate", "check_posture_and_attention")
graph.add_edge("check_posture_and_attention", END)

workflow = graph.compile()

async def main():
    print("\n=== Posture and Attention Monitoring System ===\n")
    
    final_state = await workflow.ainvoke({})
    
    
    if not final_state.get("camera_working", False):
        print("\n❌ Exiting due to camera issues. Please fix the camera and try again.")
        return
    
    if not final_state.get("posture_calibrated", False) and not final_state.get("face_angle_calibrated", False):
        print("\n❌ Exiting due to failed calibration. Please try again.")
        return
    
    print("\n👀 Posture and attention monitoring is running in the background.")
    print("📊 Stats will be displayed when posture or attention changes.")
    print("📋 Press Ctrl+C to exit the monitoring system.\n")
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️ Monitoring stopped by user.")
        print(f"📊 Session summary:")
        
        if final_state.get("posture_calibrated", False):
            print(f"   - Bad posture incidents: {final_state.bad_posture_count}")
        
        if final_state.get("face_angle_calibrated", False):
            print(f"   - Phone usage suspicions: {final_state.phone_suspicion_count}")
    finally:
        if final_state.get("monitor_task", None):
            final_state.get("monitor_task").cancel()



GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

async def ask_gemini_if_looking_at_phone(frame):
    ret, buffer = cv2.imencode('.jpg', frame)
    image_base64 = base64.b64encode(buffer).decode()

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Is the person in the image looking at their phone? Respond with only 'yes' or 'no' with no punctuation or other words. Be strict, you need to see a phone in the image to say 'yes'."},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }
        ]
    }

    response = requests.post(GEMINI_URL, json=payload)
    response.raise_for_status()
    data = response.json()

    candidates = data.get("candidates", [])
    if candidates:
        text_response = candidates[0]["content"]["parts"][0]["text"].strip().lower()
        return text_response
    else:
        return None


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        sys.exit(1)