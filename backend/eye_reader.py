# import cv2
# import numpy as np

# def detect_pupil_x(frame):
#     """
#     Robust method: Finds the darkest point (pupil) within the eye region.
#     Returns relative X position (0.0 = Left, 1.0 = Right).
#     """
#     try:
#         # 1. Convert to Grayscale & Enhance Contrast
#         gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         gray = cv2.equalizeHist(gray) # Increases contrast automatically

#         # 2. Detect Eyes
#         eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
#         eyes = eye_cascade.detectMultiScale(gray, 1.1, 4)
        
#         if len(eyes) == 0:
#             return None 

#         # 3. Focus on the FIRST eye found
#         (ex, ey, ew, eh) = eyes[0]
#         eye_roi = gray[ey:ey+eh, ex:ex+ew]
        
#         # 4. Blur to remove noise (eyelashes)
#         blur = cv2.GaussianBlur(eye_roi, (7, 7), 0)
        
#         # 5. Find the Darkest Point (The Pupil)
#         # minMaxLoc returns the coordinates of the minimum (darkest) value
#         (minVal, maxVal, minLoc, maxLoc) = cv2.minMaxLoc(blur)
        
#         # minLoc is (x, y) of the darkest pixel
#         pupil_x = minLoc[0]
        
#         # 6. Normalize (0.0 to 1.0)
#         relative_x = pupil_x / ew
#         return round(relative_x, 2)
        
#     except Exception as e:
#         print(f"Tracking Error: {e}")
#         return None
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import math
import time
import urllib.request
import os

# ──────────────────────────────────────────────
# MODEL DOWNLOAD
# ──────────────────────────────────────────────
MODEL_PATH = "face_landmarker.task"
if not os.path.exists(MODEL_PATH):
    print("Downloading face landmarker model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        MODEL_PATH
    )

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

# ──────────────────────────────────────────────
# LANDMARK INDICES
# ──────────────────────────────────────────────
LEFT_IRIS  = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]
LEFT_EYE_CORNERS  = [33, 133]   
RIGHT_EYE_CORNERS = [362, 263]  
LEFT_EYE_TOP    = [159, 158, 157]
LEFT_EYE_BOTTOM = [145, 153, 154]
RIGHT_EYE_TOP   = [386, 385, 384]
RIGHT_EYE_BOTTOM= [374, 380, 381]

# ──────────────────────────────────────────────
# SMOOTHING  (Exponential Moving Average)
# ──────────────────────────────────────────────
class EMAFilter:
    def __init__(self, alpha=0.25):
        self.alpha = alpha
        self.value = None

    def update(self, new_val):
        if new_val is None:
            return self.value
        if self.value is None:
            self.value = new_val
        else:
            self.value = self.alpha * new_val + (1 - self.alpha) * self.value
        return self.value

    def reset(self):
        self.value = None

gaze_x_filter = EMAFilter(alpha=0.25)
gaze_y_filter = EMAFilter(alpha=0.25)

# ──────────────────────────────────────────────
# CALIBRATION STATE
# ──────────────────────────────────────────────
class GazeCalibration:
    def __init__(self):
        self.reset()

    def reset(self):
        self.left_x   = None  
        self.center_x = None  
        self.right_x  = None  
        self.top_y    = None
        self.center_y = None
        self.bottom_y = None
        self.is_calibrated = False

    def normalize_x(self, raw_x):
        if not self.is_calibrated:
            return (raw_x - 0.5) * 2.0  
        if raw_x <= self.center_x:
            span = max(self.center_x - self.left_x, 1e-6)
            return -1.0 * (self.center_x - raw_x) / span
        else:
            span = max(self.right_x - self.center_x, 1e-6)
            return 1.0 * (raw_x - self.center_x) / span

    def normalize_y(self, raw_y):
        if not self.is_calibrated or self.center_y is None:
            return (raw_y - 0.5) * 2.0
        if raw_y <= self.center_y:
            span = max(self.center_y - self.top_y, 1e-6)
            return -1.0 * (self.center_y - raw_y) / span
        else:
            span = max(self.bottom_y - self.center_y, 1e-6)
            return 1.0 * (raw_y - self.center_y) / span

calibration = GazeCalibration()

# ──────────────────────────────────────────────
# BLINK DETECTION
# ──────────────────────────────────────────────
BLINK_EAR_THRESHOLD = 0.20  

def eye_aspect_ratio(landmarks, top_ids, bottom_ids, corner_ids, img_w, img_h):
    top    = np.mean([(landmarks[i].x * img_w, landmarks[i].y * img_h) for i in top_ids], axis=0)
    bottom = np.mean([(landmarks[i].x * img_w, landmarks[i].y * img_h) for i in bottom_ids], axis=0)
    left   = np.array([landmarks[corner_ids[0]].x * img_w, landmarks[corner_ids[0]].y * img_h])
    right  = np.array([landmarks[corner_ids[1]].x * img_w, landmarks[corner_ids[1]].y * img_h])
    vertical   = np.linalg.norm(top - bottom)
    horizontal = np.linalg.norm(left - right)
    return vertical / (horizontal + 1e-6)

def is_blinking(landmarks, img_w, img_h):
    left_ear  = eye_aspect_ratio(landmarks, LEFT_EYE_TOP,  LEFT_EYE_BOTTOM,  LEFT_EYE_CORNERS,  img_w, img_h)
    right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM, RIGHT_EYE_CORNERS, img_w, img_h)
    avg_ear   = (left_ear + right_ear) / 2.0
    return avg_ear < BLINK_EAR_THRESHOLD, avg_ear

# ──────────────────────────────────────────────
# CORE GAZE ENGINE
# ──────────────────────────────────────────────
def get_raw_gaze(landmarks, img_w, img_h):
    l_iris = np.array([(landmarks[i].x * img_w, landmarks[i].y * img_h) for i in LEFT_IRIS], dtype=np.float32)
    (l_cx, l_cy), _ = cv2.minEnclosingCircle(l_iris)
    l_outer = landmarks[LEFT_EYE_CORNERS[0]].x * img_w
    l_inner = landmarks[LEFT_EYE_CORNERS[1]].x * img_w
    l_ratio_x = (l_cx - l_outer) / (l_inner - l_outer + 1e-6)

    r_iris = np.array([(landmarks[i].x * img_w, landmarks[i].y * img_h) for i in RIGHT_IRIS], dtype=np.float32)
    (r_cx, r_cy), _ = cv2.minEnclosingCircle(r_iris)
    r_inner = landmarks[RIGHT_EYE_CORNERS[0]].x * img_w
    r_outer = landmarks[RIGHT_EYE_CORNERS[1]].x * img_w
    r_ratio_x = (r_cx - r_inner) / (r_outer - r_inner + 1e-6)

    raw_x = np.clip((l_ratio_x + r_ratio_x) / 2.0, 0.0, 1.0)

    l_top    = landmarks[LEFT_EYE_TOP[1]].y * img_h
    l_bottom = landmarks[LEFT_EYE_BOTTOM[1]].y * img_h
    l_ratio_y = (l_cy - l_top) / (l_bottom - l_top + 1e-6)

    r_top    = landmarks[RIGHT_EYE_TOP[1]].y * img_h
    r_bottom = landmarks[RIGHT_EYE_BOTTOM[1]].y * img_h
    r_ratio_y = (r_cy - r_top) / (r_bottom - r_top + 1e-6)

    raw_y = np.clip((l_ratio_y + r_ratio_y) / 2.0, 0.0, 1.0)
    return float(raw_x), float(raw_y)

def detect_pupil_x(frame):
    try:
        rgb  = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w = frame.shape[:2]
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result   = detector.detect(mp_image)

        if not result.face_landmarks:
            return None
        lm = result.face_landmarks[0]
        blink, _ = is_blinking(lm, w, h)
        if blink:
            return None 

        raw_x, _ = get_raw_gaze(lm, w, h)
        norm_x   = calibration.normalize_x(raw_x)         
        smooth_x = gaze_x_filter.update(norm_x)
        return round(np.clip((smooth_x + 1.0) / 2.0, 0.0, 1.0), 3)

    except Exception as e:
        print(f"Ocular Error: {e}")
        return None

# ──────────────────────────────────────────────
# FOCUS TEST
# ──────────────────────────────────────────────
def run_focus_test(duration=10):
    cap        = cv2.VideoCapture(0)
    start_time = time.time()
    gaze_x_hist, gaze_y_hist = [], []

    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret: break

        frame   = cv2.flip(frame, 1)
        h, w    = frame.shape[:2]
        elapsed = time.time() - start_time

        cx, cy = w // 2, h // 2
        cv2.line(frame, (cx - 20, cy), (cx + 20, cy), (0, 255, 0), 2)
        cv2.line(frame, (cx, cy - 20), (cx, cy + 20), (0, 255, 0), 2)
        cv2.circle(frame, (cx, cy), 6, (0, 255, 0), -1)
        cv2.putText(frame, f"Stare at center: {int(duration - elapsed)}s", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result   = detector.detect(mp_image)

        if result.face_landmarks:
            lm = result.face_landmarks[0]
            blink, ear = is_blinking(lm, w, h)

            if not blink:
                raw_x, raw_y = get_raw_gaze(lm, w, h)
                norm_x = calibration.normalize_x(raw_x) 
                norm_y = calibration.normalize_y(raw_y)
                sx = gaze_x_filter.update(norm_x)
                sy = gaze_y_filter.update(norm_y)

                gaze_x_hist.append(sx)
                gaze_y_hist.append(sy)

                gaze_px = int(np.clip((sx + 1) / 2, 0, 1) * w)
                gaze_py = int(np.clip((sy + 1) / 2, 0, 1) * h)
                cv2.circle(frame, (gaze_px, gaze_py), 8, (255, 50, 50), -1)

        cv2.imshow("CogniDetect Focus Test", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"): break

    cap.release()
    cv2.destroyAllWindows()

    if len(gaze_x_hist) < 10: return None

    gx = np.array(gaze_x_hist)
    gy = np.array(gaze_y_hist)
    dist_from_center = np.sqrt(gx**2 + gy**2)

    # REWIRED TO MATCH MAIN.PY EXPECTATIONS
    return {
        "avg_std": float(np.std(dist_from_center)), 
        "avg_dist": float(np.mean(dist_from_center)),
        "near_ratio": float(np.mean(dist_from_center < 0.25))
    }

# REWIRED SIGNATURE TO MATCH MAIN.PY
def get_focus_score(avg_std, avg_dist, near_ratio):
    raw = (avg_std * 60) + (avg_dist * 30) + ((1.0 - near_ratio) * 10)
    score = min(100.0, max(0.0, raw))

    if score > 60: return score, "High Risk", "Severe gaze instability — abnormal microsaccade frequency."
    elif score > 30: return score, "Moderate",  "Mild focal drift observed. Recommend follow-up."
    else: return score, "Normal",    "Stable fixation. No abnormal ocular tremors detected."

# ──────────────────────────────────────────────
# SMOOTH PURSUIT TEST
# ──────────────────────────────────────────────
def run_follow_dot_test(duration=10):
    cap        = cv2.VideoCapture(0)
    start_time = time.time()
    x_filt = EMAFilter(alpha=0.3)
    errors       = []

    FREQ_SLOW = 0.4  
    FREQ_FAST = 0.8

    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret: break

        frame   = cv2.flip(frame, 1)
        h, w    = frame.shape[:2]
        elapsed = time.time() - start_time

        freq = FREQ_SLOW if elapsed < duration / 2 else FREQ_FAST
        target_norm = math.sin(2 * math.pi * freq * elapsed)
        target_x    = int(np.clip((target_norm + 1) / 2, 0, 1) * w)

        cv2.circle(frame, (target_x, h // 2), 20, (0, 165, 255), -1)
        cv2.putText(frame, f"Follow dot: {int(duration - elapsed)}s", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 165, 255), 2)

        rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result   = detector.detect(mp_image)

        if result.face_landmarks:
            lm = result.face_landmarks[0]
            blink, _ = is_blinking(lm, w, h)

            if not blink:
                raw_x, _ = get_raw_gaze(lm, w, h)
                norm_x = calibration.normalize_x(raw_x)   
                sx     = x_filt.update(norm_x)
                
                error = abs(sx - target_norm)
                errors.append(error)

                gaze_px = int(np.clip((sx + 1) / 2, 0, 1) * w)
                cv2.circle(frame, (gaze_px, h // 2), 10, (255, 50, 50), -1)

        cv2.imshow("CogniDetect Pursuit Test", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"): break

    cap.release()
    cv2.destroyAllWindows()

    if len(errors) < 10: return None

    err_arr = np.array(errors)
    
    # REWIRED TO MATCH MAIN.PY EXPECTATIONS
    return {
        "avg_error": float(np.mean(err_arr)),
        "hit_ratio": float(np.mean(err_arr < 0.25))
    }

# REWIRED SIGNATURE TO MATCH MAIN.PY
def get_follow_dot_score(avg_error, hit_ratio):
    raw = (avg_error * 60) + ((1.0 - hit_ratio) * 40)
    score = min(100.0, max(0.0, raw))

    if score > 60: return score, "High Risk", "Smooth pursuit breakdown — saccadic interruptions present."
    elif score > 30: return score, "Moderate",  "Slight lag in visual tracking. Reduced pursuit gain."
    else: return score, "Normal",    "Smooth, accurate visual pursuit."