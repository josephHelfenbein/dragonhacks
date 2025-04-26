# posture_tools.py
import asyncio
import numpy as np
import cv2
import mediapipe as mp
import os
import math
import time

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
calibrated_features = None
calibrated_face_angle = None

def capture_pose_features():
    """Capture a frame from the camera and extract pose features."""
    
    cap = cv2.VideoCapture(1)

    if not cap.isOpened():
        raise RuntimeError("Camera could not be accessed.")
    
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise RuntimeError("Failed to capture frame from camera.")
    
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = pose.process(frame_rgb)
    
    if not result.pose_landmarks:
        raise RuntimeError("No pose landmarks detected. Make sure your face and upper body are visible.")
    
    landmarks = result.pose_landmarks.landmark
    features = extract_relevant_features(landmarks)
    
    return features

def extract_relevant_features(landmarks):
    """Extract key posture indicators from pose landmarks."""
    important_points = [
        mp_pose.PoseLandmark.NOSE,
        mp_pose.PoseLandmark.LEFT_SHOULDER,
        mp_pose.PoseLandmark.RIGHT_SHOULDER,
        mp_pose.PoseLandmark.LEFT_EAR,
        mp_pose.PoseLandmark.RIGHT_EAR,
        mp_pose.PoseLandmark.LEFT_HIP,
        mp_pose.PoseLandmark.RIGHT_HIP
    ]
    
    features = []
    for point in important_points:
        landmark = landmarks[point]
        features.append((landmark.x, landmark.y, landmark.z if landmark.HasField('z') else 0))
    
    return np.array(features).flatten()

def save_calibration(features, path="calibration.npy"):
    """Save calibration data to a file."""
    try:
        np.save(path, features)
        return True
    except Exception as e:
        print(f"Error saving calibration: {e}")
        return False

def load_calibration(path="calibration.npy"):
    """Load calibration data from file if available."""
    if os.path.exists(path):
        try:
            return np.load(path)
        except Exception as e:
            print(f"Error loading calibration: {e}")
    return None

async def calibrate_posture_tool():
    """Tool for calibrating the user's correct posture."""
    global calibrated_features
    
    try:
        print("Starting posture calibration. Please sit straight for a few seconds...")
        features_list = []
        
        for i in range(5):
            print(f"Capturing pose {i+1}/5...")
            try:
                features = await asyncio.to_thread(capture_pose_features)
                features_list.append(features)
            except Exception as e:
                return {"status": "error", "error": f"Capture failed: {str(e)}"}
            
            await asyncio.sleep(0.5)
        
        calibrated_features = np.mean(features_list, axis=0)
        
        if save_calibration(calibrated_features):
            return {"status": "success", "message": "Calibration complete and saved."}
        else:
            return {"status": "success", "message": "Calibration complete but not saved."}
            
    except Exception as e:
        return {"status": "error", "error": f"Calibration failed: {str(e)}"}

async def posture_check_tool():
    """Tool for checking current posture against the calibrated baseline."""
    global calibrated_features
    
    try:
        if calibrated_features is None:
            calibrated_features = load_calibration()
            if calibrated_features is None:
                return {"status": "error", "error": "No calibration data available."}
        
        try:
            current_features = await asyncio.to_thread(capture_pose_features)
        except Exception as e:
            return {"status": "error", "error": f"Posture capture failed: {str(e)}"}
        
        difference = np.linalg.norm(current_features - calibrated_features) / np.linalg.norm(calibrated_features)
        posture_good = difference < 0.15
        
        return {
            "status": "success",
            "posture_good": posture_good,
            "deviation": float(difference),
            "threshold": 0.15
        }
        
    except Exception as e:
        return {"status": "error", "error": f"Posture check failed: {str(e)}"}

def extract_face_angle(landmarks):
    """Extract face angle from MediaPipe pose landmarks with error handling."""
    try:
        required_landmarks = [
            mp_pose.PoseLandmark.NOSE,
            mp_pose.PoseLandmark.LEFT_EYE,
            mp_pose.PoseLandmark.RIGHT_EYE,
            mp_pose.PoseLandmark.LEFT_EAR, 
            mp_pose.PoseLandmark.RIGHT_EAR
        ]
        
        for point in required_landmarks:
            if not landmarks[point]:
                return None
        
        nose = landmarks[mp_pose.PoseLandmark.NOSE]
        left_eye = landmarks[mp_pose.PoseLandmark.LEFT_EYE]
        right_eye = landmarks[mp_pose.PoseLandmark.RIGHT_EYE]
        left_ear = landmarks[mp_pose.PoseLandmark.LEFT_EAR]
        right_ear = landmarks[mp_pose.PoseLandmark.RIGHT_EAR]
        
        eye_midpoint = ((left_eye.x + right_eye.x) / 2, (left_eye.y + right_eye.y) / 2)
        
        ear_midpoint = ((left_ear.x + right_ear.x) / 2, (left_ear.y + right_ear.y) / 2)
        
        face_vector = (eye_midpoint[0] - ear_midpoint[0], eye_midpoint[1] - ear_midpoint[1])
        
        vertical_angle = math.degrees(math.atan2(face_vector[1], abs(face_vector[0])))
        
        horizontal_angle = math.degrees(math.atan2(face_vector[0], 0.001))
        
        return {
            "vertical_angle": vertical_angle,
            "horizontal_angle": horizontal_angle,
            "nose_position": (nose.x, nose.y),
            "eye_midpoint": eye_midpoint,
            "ear_midpoint": ear_midpoint
        }
    except Exception as e:
        print(f"Error extracting face angle: {e}")
        return None

def save_face_calibration(face_data, path="face_calibration.npy"):
    """Save face angle calibration data to a file."""
    try:
        np.save(path, face_data)
        return True
    except Exception as e:
        print(f"Error saving face calibration: {e}")
        return False

def load_face_calibration(path="face_calibration.npy"):
    """Load face angle calibration data from file if available."""
    if os.path.exists(path):
        try:
            return np.load(path, allow_pickle=True).item()
        except Exception as e:
            print(f"Error loading face calibration: {e}")
    return None

async def calibrate_face_angle_tool():
    """Tool for calibrating the user's normal face angle."""
    global calibrated_face_angle
    
    print("Starting face angle calibration. Please look directly at the screen...")
    face_angle_samples = []
    
    for i in range(5):
        print(f"Capturing face angle {i+1}/5...")
        
        capture_result = await asyncio.to_thread(safely_capture_frame)
        if capture_result["status"] != "success":
            print(f"❌ Camera error: {capture_result.get('error', 'Unknown error')}")
            if i > 0 and face_angle_samples:
                print("⚠️ Using partial calibration data from successful captures.")
                break
            else:
                return {"status": "error", "error": capture_result.get('error', 'Camera access failed')}
        
        frame = capture_result["frame"]
        
        try:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(frame_rgb)
            
            if not result.pose_landmarks:
                print("⚠️ No face landmarks detected in this frame. Retrying...")
                continue
            
            landmarks = result.pose_landmarks.landmark
            face_angles = extract_face_angle(landmarks)
            
            if face_angles is None:
                print("⚠️ Could not extract face angles from this frame. Retrying...")
                continue
                
            face_angle_samples.append(face_angles)
            
        except Exception as e:
            print(f"⚠️ Error processing frame: {str(e)}")
            continue
            
        await asyncio.sleep(0.5)
    
    if not face_angle_samples:
        return {"status": "error", "error": "Failed to capture any valid face angle data"}
    
    avg_vertical = sum(sample["vertical_angle"] for sample in face_angle_samples) / len(face_angle_samples)
    avg_horizontal = sum(sample["horizontal_angle"] for sample in face_angle_samples) / len(face_angle_samples)
    
    calibrated_face_angle = {
        "vertical_angle": avg_vertical,
        "horizontal_angle": avg_horizontal,
        "tolerance_vertical": 15.0,
        "tolerance_horizontal": 20.0
    }
    
    if save_face_calibration(calibrated_face_angle):
        return {"status": "success", "message": "Face angle calibration complete and saved.", "frames_used": len(face_angle_samples)}
    else:
        return {"status": "success", "message": "Face angle calibration complete but not saved.", "frames_used": len(face_angle_samples)}

async def check_face_angle_tool():
    """Tool for checking if the user is looking down at their phone or away from screen."""
    global calibrated_face_angle
    
    try:
        if calibrated_face_angle is None:
            calibrated_face_angle = load_face_calibration()
            if calibrated_face_angle is None:
                return {"status": "error", "error": "No face angle calibration data available."}
        
        capture_result = await asyncio.to_thread(safely_capture_frame)
        if capture_result["status"] != "success":
            return {"status": "error", "error": capture_result.get('error', 'Camera access failed')}
        
        frame = capture_result["frame"]
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(frame_rgb)
        
        if not result.pose_landmarks:
            return {"status": "error", "error": "No face landmarks detected."}
        
        landmarks = result.pose_landmarks.landmark
        current_face_angles = extract_face_angle(landmarks)
        
        if current_face_angles is None:
            return {"status": "error", "error": "Could not extract face angles from frame."}
        
        vertical_deviation = abs(current_face_angles["vertical_angle"] - calibrated_face_angle["vertical_angle"])
        horizontal_deviation = abs(current_face_angles["horizontal_angle"] - calibrated_face_angle["horizontal_angle"])
        
        looking_down = current_face_angles["vertical_angle"] > (calibrated_face_angle["vertical_angle"] + calibrated_face_angle["tolerance_vertical"])
        
        looking_away = horizontal_deviation > calibrated_face_angle["tolerance_horizontal"]
        
        face_position_good = not (looking_down or looking_away)
        
        attention_status = "focused"
        if looking_down:
            attention_status = "looking_down"
        elif looking_away:
            attention_status = "looking_away"
        
        return {
            "status": "success",
            "face_position_good": face_position_good,
            "attention_status": attention_status,
            "looking_down": looking_down,
            "looking_away": looking_away,
            "vertical_deviation": float(vertical_deviation),
            "horizontal_deviation": float(horizontal_deviation),
            "current_angles": {
                "vertical": float(current_face_angles["vertical_angle"]),
                "horizontal": float(current_face_angles["horizontal_angle"])
            },
            "calibrated_angles": {
                "vertical": float(calibrated_face_angle["vertical_angle"]),
                "horizontal": float(calibrated_face_angle["horizontal_angle"])
            }
        }
        
    except Exception as e:
        return {"status": "error", "error": f"Face angle check failed: {str(e)}"}


def safely_capture_frame():
    """Safely capture a frame with better error handling."""
    try:
        for attempt in range(3):
            cap = cv2.VideoCapture(1)
            if cap.isOpened():
                ret, frame = cap.read()
                cap.release()
                
                if ret:
                    return {"status": "success", "frame": frame}
                else:
                    print(f"⚠️ Warning: Camera opened but frame capture failed (attempt {attempt+1}/3)")
            else:
                print(f"⚠️ Warning: Failed to open camera (attempt {attempt+1}/3)")
            
            time.sleep(1)
        
        return {"status": "error", "error": "Failed to access camera after multiple attempts"}
    
    except Exception as e:
        return {"status": "error", "error": f"Camera error: {str(e)}"}
    finally:
        try:
            if 'cap' in locals() and cap.isOpened():
                cap.release()
        except:
            pass

async def calibrate_posture_tool():
    """Tool for calibrating the user's correct posture with improved camera handling."""
    global calibrated_features
    
    print("Starting posture calibration. Please sit straight for a few seconds...")
    features_list = []
    
    for i in range(5):
        print(f"Capturing pose {i+1}/5...")
        
        capture_result = await asyncio.to_thread(safely_capture_frame)
        if capture_result["status"] != "success":
            print(f"❌ Camera error: {capture_result.get('error', 'Unknown error')}")
            if i > 0 and features_list:
                print("⚠️ Using partial calibration data from successful captures.")
                break
            else:
                return {"status": "error", "error": capture_result.get('error', 'Camera access failed')}
        
        frame = capture_result["frame"]
        
        try:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(frame_rgb)
            
            if not result.pose_landmarks:
                print("⚠️ No pose landmarks detected in this frame. Retrying...")
                continue
            
            landmarks = result.pose_landmarks.landmark
            features = extract_relevant_features(landmarks)
            features_list.append(features)
            
        except Exception as e:
            print(f"⚠️ Error processing frame: {str(e)}")
            continue
            
        await asyncio.sleep(0.5)
    
    if not features_list:
        return {"status": "error", "error": "Failed to capture any valid pose data"}
    
    calibrated_features = np.mean(features_list, axis=0)
    
    if save_calibration(calibrated_features):
        return {"status": "success", "message": "Calibration complete and saved.", "frames_used": len(features_list)}
    else:
        return {"status": "success", "message": "Calibration complete but not saved.", "frames_used": len(features_list)}