import cv2
import numpy as np
import time
import random


def _get_gaze_point(gray, frame, face_cascade, eye_cascade):
    """
    Detect face and eyes and return approximate gaze center (x, y) in image coordinates.
    Returns (gaze_x, gaze_y) or (None, None) if not found.
    """
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    gaze_x, gaze_y = None, None

    for (x, y, fw, fh) in faces:
        roi_gray = gray[y:y + fh, x:x + fw]
        roi_color = frame[y:y + fh, x:x + fw]

        eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=5)

        if len(eyes) >= 1:
            eyes_sorted = sorted(eyes, key=lambda e: e[2], reverse=True)[:2]
            centers = []
            for (ex, ey, ew, eh) in eyes_sorted:
                cx = x + ex + ew / 2
                cy = y + ey + eh / 2
                centers.append((cx, cy))
                cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 1)

            if centers:
                gaze_x = float(np.mean([c[0] for c in centers]))
                gaze_y = float(np.mean([c[1] for c in centers]))
        break  # only first face

    return gaze_x, gaze_y


# ================= 1) FOCUS TEST =================

def run_focus_test(test_duration=10):
    """
    Focus test:
    - Shows a big red dot at the center.
    - User keeps looking at it.
    - Returns a dict with:
        avg_std   : average std dev of gaze movement (pixels)
        avg_dist  : average distance of gaze from the red dot (pixels)
        near_ratio: fraction of frames where gaze is near the red dot (0–1)
    """
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    eye_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_eye.xml"
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not open webcam.")
        return None

    eye_positions = []
    dists = []
    near_frames = 0
    total_gaze_frames = 0

    start_time = time.time()

    # Window setup (front/top-most as far as possible)
    window_name = "Focus Test - Eye Tracking"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 960, 720)
    cv2.moveWindow(window_name, 100, 50)
    try:
        if hasattr(cv2, "WND_PROP_TOPMOST"):
            cv2.setWindowProperty(window_name, cv2.WND_PROP_TOPMOST, 1)
    except Exception:
        pass

    while True:
        success, frame = cap.read()
        if not success:
            print("[ERROR] Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # BIG red dot in the centre
        cx, cy = w // 2, h // 2
        cv2.circle(frame, (cx, cy), 35, (0, 0, 255), -1)  # big red circle
        cv2.circle(frame, (cx, cy), 5, (255, 255, 255), -1)  # small white centre

        gaze_x, gaze_y = _get_gaze_point(gray, frame, face_cascade, eye_cascade)

        if gaze_x is not None and gaze_y is not None:
            total_gaze_frames += 1
            eye_positions.append((gaze_x, gaze_y))

            # Distance from gaze to centre dot
            dx = gaze_x - cx
            dy = gaze_y - cy
            dist = float(np.sqrt(dx * dx + dy * dy))
            dists.append(dist)

            # Count as "near" if inside this radius
            focus_radius = 120  # tweak if needed
            if dist < focus_radius:
                near_frames += 1

            cv2.circle(frame, (int(gaze_x), int(gaze_y)), 8, (0, 255, 0), -1)

        elapsed = time.time() - start_time
        remaining = max(0, int(test_duration - elapsed))
        text = (
            f"FOCUS TEST: Look at the RED DOT in the centre | "
            f"Time left: {remaining}s (ESC to exit)"
        )
        cv2.putText(frame, text, (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        cv2.imshow(window_name, frame)

        if elapsed > test_duration:
            break
        if cv2.waitKey(1) & 0xFF == 27:  # ESC
            break

    cap.release()
    cv2.destroyAllWindows()

    if not eye_positions or not dists or total_gaze_frames == 0:
        print("[INFO] No eye data collected in focus test.")
        return None

    eye_positions = np.array(eye_positions)
    std_dev = np.std(eye_positions, axis=0)
    avg_std = float(np.mean(std_dev))         # how much gaze moved around
    avg_dist = float(np.mean(dists))          # how far from center dot on average
    near_ratio = float(near_frames) / float(total_gaze_frames)  # fraction of time near dot

    return {
        "avg_std": avg_std,
        "avg_dist": avg_dist,
        "near_ratio": near_ratio,
    }


# ================= 2) FOLLOW-DOT TEST =================

def run_follow_dot_test(test_duration=10):
    """
    Follow-dot test:
    - A big red dot moves around the screen.
    - User should follow the dot with their eyes.
    - Returns a dict with:
        avg_error : average distance between gaze and dot (pixels)
        hit_ratio : fraction of frames where gaze is close to the dot (0–1)
    """
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    eye_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_eye.xml"
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not open webcam.")
        return None

    start_time = time.time()
    errors = []
    close_hits = 0
    valid_frames = 0

    window_name = "Follow-dot Test - Eye Tracking"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 960, 720)
    cv2.moveWindow(window_name, 100, 50)
    try:
        if hasattr(cv2, "WND_PROP_TOPMOST"):
            cv2.setWindowProperty(window_name, cv2.WND_PROP_TOPMOST, 1)
    except Exception:
        pass

    while True:
        success, frame = cap.read()
        if not success:
            print("[ERROR] Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        elapsed = time.time() - start_time
        t = min(1.0, elapsed / test_duration)

        # Dot path (rectangle-ish path)
        if t < 0.25:
            f = t / 0.25
            tx = int(0.2 * w + 0.6 * w * f)
            ty = int(0.3 * h)
        elif t < 0.5:
            f = (t - 0.25) / 0.25
            tx = int(0.8 * w)
            ty = int(0.3 * h + 0.4 * h * f)
        elif t < 0.75:
            f = (t - 0.5) / 0.25
            tx = int(0.8 * w - 0.6 * w * f)
            ty = int(0.7 * h)
        else:
            f = (t - 0.75) / 0.25
            tx = int(0.2 * w)
            ty = int(0.7 * h - 0.4 * h * f)

        # Big red moving dot
        cv2.circle(frame, (tx, ty), 30, (0, 0, 255), -1)
        cv2.circle(frame, (tx, ty), 6, (255, 255, 255), -1)

        gaze_x, gaze_y = _get_gaze_point(gray, frame, face_cascade, eye_cascade)

        if gaze_x is not None and gaze_y is not None:
            valid_frames += 1
            cv2.circle(frame, (int(gaze_x), int(gaze_y)), 8, (0, 255, 0), -1)

            dx = gaze_x - tx
            dy = gaze_y - ty
            dist = float(np.sqrt(dx * dx + dy * dy))
            errors.append(dist)

            # Count as a "hit" if gaze is close enough to the moving dot
            follow_radius = 120  # tweak if needed
            if dist < follow_radius:
                close_hits += 1

        remaining = max(0, int(test_duration - elapsed))
        text = (
            f"FOLLOW-DOT TEST: Follow the RED DOT with your eyes | "
            f"Time left: {remaining}s (ESC to exit)"
        )
        cv2.putText(frame, text, (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        cv2.imshow(window_name, frame)

        if elapsed > test_duration:
            break
        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

    if not errors or valid_frames == 0:
        print("[INFO] No gaze data collected in follow-dot test.")
        return None

    avg_error = float(np.mean(errors))
    hit_ratio = float(close_hits) / float(valid_frames)

    return {
        "avg_error": avg_error,
        "hit_ratio": hit_ratio,
    }


# ================= 3) READING FOCUS TEST =================

def run_reading_focus_test(test_duration=20, highlight_interval=1.5):
    """
    Reading focus test:
    - Shows a simple paragraph on screen.
    - Every `highlight_interval` seconds, a random word is highlighted in red.
    - User should move eyes to look at that word during that interval.
    - Uses gaze vs highlighted word position to measure focus.
    - Returns focus_accuracy (0.0–1.0) = fraction of highlights where user looked at the word.
    """

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    eye_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_eye.xml"
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not open webcam.")
        return None

    # Read one frame to get width/height for layout
    success, frame = cap.read()
    if not success:
        print("[ERROR] Failed to read initial frame from webcam.")
        cap.release()
        return None

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape

    window_name = "Reading Focus Test - Eye Tracking"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 960, 720)
    cv2.moveWindow(window_name, 100, 50)
    try:
        if hasattr(cv2, "WND_PROP_TOPMOST"):
            cv2.setWindowProperty(window_name, cv2.WND_PROP_TOPMOST, 1)
    except Exception:
        pass

    # Paragraph text (you can change this text)
    paragraph = (
        "Early detection of dementia helps people and families plan better "
        "and start support and treatment at the right time."
    )
    words = paragraph.split()

    # Layout words on the screen: multiple lines
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    thickness = 2

    word_layout = []  # list of dicts: {index, word, x, y, cx, cy}

    max_words_per_line = 7
    start_x = int(w * 0.08)
    start_y = int(h * 0.35)
    line_height = 40

    idx = 0
    line_num = 0
    while idx < len(words):
        line_words = words[idx: idx + max_words_per_line]
        x = start_x
        y = start_y + line_num * line_height
        for w_i in line_words:
            (tw, th), _ = cv2.getTextSize(w_i, font, font_scale, thickness)
            word_layout.append({
                "index": len(word_layout),
                "word": w_i,
                "x": x,
                "y": y,
                "cx": x + tw / 2,
                "cy": y - th / 2
            })
            x += tw + 20  # space between words
        idx += max_words_per_line
        line_num += 1

    if not word_layout:
        print("[ERROR] Failed to layout words.")
        cap.release()
        cv2.destroyAllWindows()
        return None

    # Reading focus logic
    start_time = time.time()
    current_word_idx = random.randint(0, len(word_layout) - 1)
    last_change_time = start_time
    looked_at_current = False
    successes = 0
    intervals = 0

    while True:
        success, frame = cap.read()
        if not success:
            print("[ERROR] Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        now = time.time()
        elapsed = now - start_time
        remaining = max(0, int(test_duration - elapsed))

        # Change highlighted word every `highlight_interval` seconds
        if now - last_change_time >= highlight_interval:
            intervals += 1
            if looked_at_current:
                successes += 1

            current_word_idx = random.randint(0, len(word_layout) - 1)
            last_change_time = now
            looked_at_current = False

        # Draw paragraph with highlighted word
        for i, info in enumerate(word_layout):
            word = info["word"]
            x = int(info["x"])
            y = int(info["y"])

            (tw, th), _ = cv2.getTextSize(word, font, font_scale, thickness)

            if i == current_word_idx:
                # Highlight background in red
                cv2.rectangle(
                    frame,
                    (x - 5, y - th - 10),
                    (x + tw + 5, y + 10),
                    (0, 0, 255),
                    -1
                )
                color = (0, 0, 0)  # black text on red bg
            else:
                color = (255, 255, 255)

            cv2.putText(frame, word, (x, y), font, font_scale, color, thickness, cv2.LINE_AA)

        # Get gaze and check if looking at highlighted word
        gaze_x, gaze_y = _get_gaze_point(gray, frame, face_cascade, eye_cascade)
        if gaze_x is not None and gaze_y is not None:
            cv2.circle(frame, (int(gaze_x), int(gaze_y)), 8, (0, 255, 0), -1)

            target = word_layout[current_word_idx]
            tx = target["cx"]
            ty = target["cy"]
            dx = gaze_x - tx
            dy = gaze_y - ty
            dist = np.sqrt(dx * dx + dy * dy)

            # If gaze is close enough to highlighted word, count as "looked"
            if dist < 80:  # threshold in pixels (adjust if needed)
                looked_at_current = True

        # Overlay text info
        focus_text = (
            f"READING FOCUS TEST: Look at the highlighted (RED) word | "
            f"Time left: {remaining}s (ESC to exit)"
        )
        cv2.putText(frame, focus_text, (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        acc = (successes / intervals) if intervals > 0 else 0.0
        acc_text = f"Current focus hits: {successes} / {max(intervals, 1)}  (~{acc * 100:.0f}% so far)"
        cv2.putText(frame, acc_text, (20, 75),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

        cv2.imshow(window_name, frame)

        if elapsed > test_duration:
            break
        if cv2.waitKey(1) & 0xFF == 27:  # ESC
            break

    cap.release()
    cv2.destroyAllWindows()

    if intervals == 0:
        print("[INFO] No intervals recorded in reading focus test.")
        return None

    focus_accuracy = successes / intervals  # between 0 and 1
    return float(focus_accuracy)
