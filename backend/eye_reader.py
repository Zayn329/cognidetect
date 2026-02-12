import cv2
import numpy as np

def detect_pupil_x(frame):
    """
    Robust method: Finds the darkest point (pupil) within the eye region.
    Returns relative X position (0.0 = Left, 1.0 = Right).
    """
    try:
        # 1. Convert to Grayscale & Enhance Contrast
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray) # Increases contrast automatically

        # 2. Detect Eyes
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        eyes = eye_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(eyes) == 0:
            return None 

        # 3. Focus on the FIRST eye found
        (ex, ey, ew, eh) = eyes[0]
        eye_roi = gray[ey:ey+eh, ex:ex+ew]
        
        # 4. Blur to remove noise (eyelashes)
        blur = cv2.GaussianBlur(eye_roi, (7, 7), 0)
        
        # 5. Find the Darkest Point (The Pupil)
        # minMaxLoc returns the coordinates of the minimum (darkest) value
        (minVal, maxVal, minLoc, maxLoc) = cv2.minMaxLoc(blur)
        
        # minLoc is (x, y) of the darkest pixel
        pupil_x = minLoc[0]
        
        # 6. Normalize (0.0 to 1.0)
        relative_x = pupil_x / ew
        return round(relative_x, 2)
        
    except Exception as e:
        print(f"Tracking Error: {e}")
        return None