import os
import joblib
import numpy as np
import librosa
import parselmouth 
from parselmouth.praat import call

# Model Path (Ensure this .pkl file is in the root backend folder or adjust path)
MODEL_PATH = "alzheimers_speech_model.pkl"

_speech_model = None

def load_model():
    global _speech_model
    if _speech_model is None and os.path.exists(MODEL_PATH):
        _speech_model = joblib.load(MODEL_PATH)
    return _speech_model

def extract_features(audio_chunk, sr):
    try:
        sound = parselmouth.Sound(audio_chunk, sampling_frequency=sr)
        pitch = sound.to_pitch()
        pulses = parselmouth.praat.call([sound, pitch], "To PointProcess (cc)")
        
        jitter = parselmouth.praat.call(pulses, "Get jitter (local)", 0.0, 0.0, 0.0001, 0.02, 1.3)
        shimmer = parselmouth.praat.call([sound, pulses], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
        harmonicity = sound.to_harmonicity()
        hnr = parselmouth.praat.call(harmonicity, "Get mean", 0, 0)
        
        non_silent_intervals = librosa.effects.split(audio_chunk, top_db=25)
        non_silent = sum([end - start for start, end in non_silent_intervals])
        silence_ratio = 1.0 - (non_silent / len(audio_chunk)) if len(audio_chunk) > 0 else 0
        
        mfccs = librosa.feature.mfcc(y=audio_chunk, sr=sr, n_mfcc=13)
        
        if np.isnan(jitter): jitter = 0
        if np.isnan(shimmer): shimmer = 0
        if np.isnan(hnr): hnr = 0
        
        features = np.hstack([
            jitter, shimmer, hnr, silence_ratio,
            np.mean(mfccs, axis=1), np.var(mfccs, axis=1)
        ])
        return features.reshape(1, -1)
    except:
        return None

def analyze_audio_file(file_path):
    model = load_model()
    if not model:
        raise Exception("Model not found.")

    SAMPLE_RATE = 22050
    CHUNK_SIZE = 5 
    
    audio, sr = librosa.load(file_path, sr=SAMPLE_RATE)
    samples_per_chunk = int(SAMPLE_RATE * CHUNK_SIZE)
    votes = []
    chunk_details = []
    
    for i, start in enumerate(range(0, len(audio), samples_per_chunk)):
        end = start + samples_per_chunk
        chunk = audio[start:end]
        if len(chunk) < SAMPLE_RATE * 2: continue
        
        feats = extract_features(chunk, sr)
        if feats is not None:
            prob = model.predict_proba(feats)[0]
            # Convert NumPy float to Python float
            confidence = float(prob[1]) 
            is_sick = confidence > 0.60
            
            # Convert NumPy bool to Python bool
            votes.append(1 if is_sick else 0)
            
            time_str = f"{start//sr}s - {end//sr}s"
            status = "Signs Detected" if is_sick else "Normal"
            
            chunk_details.append({
                "time": time_str,
                "status": status,
                "confidence": confidence * 100, # Convert to percentage
                "is_sick": bool(is_sick) # Force standard Python boolean
            })
            
    risk_score = 0.0
    if votes:
        risk_score = (sum(votes) / len(votes)) * 100
        
    return float(risk_score), chunk_details