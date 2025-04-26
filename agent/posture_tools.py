# posture_tools.py
import asyncio
import numpy as np
import cv2
import mediapipe as mp
import os

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
calibrated_features = None

def capture_pose_features():
    """Capture a frame from the camera and extract pose features."""
    cap = cv2.VideoCapture(0)
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