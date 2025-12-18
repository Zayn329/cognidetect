from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import shutil
import os
import cv2

# Import services
from database import init_db, save_multimodal_result, get_history
from services.speech import analyze_audio_file
from services.report import create_report

# Import Eye Tracking (We import the functions directly)
# Ensure your eye_tracker.py and scoring.py are in services/
from services.eye_tracker import run_focus_test, run_follow_dot_test
from services.scoring import get_focus_score, get_follow_dot_score

app = FastAPI()

# Allow React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on start
init_db()

# --- DATA MODELS ---
class SaveResultRequest(BaseModel):
    patient_name: str
    speech_score: float
    eye_score: float
    overall_score: float
    notes: str

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "CogniDetect Backend Running"}

@app.get("/api/history/{patient_name}")
def get_patient_history(patient_name: str):
    return get_history(patient_name)

@app.post("/api/analyze-speech")
def analyze_speech(file: UploadFile = File(...)):
    temp_file = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Unpack the tuple (score, details)
        score, details = analyze_audio_file(temp_file)
        
        os.remove(temp_file)
        
        # Return both to frontend
        return {
            "risk_score": score, 
            "details": details 
        }
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-eye/{test_type}")
def run_eye_test(test_type: str):
    """
    This endpoint triggers the LOCAL OpenCV window.
    The HTTP request will 'hang' until the user finishes the test in the window.
    """
    try:
        if test_type == "focus":
            # Direct call to your existing logic
            # This opens the cv2.imshow window on the server machine
            res = run_focus_test(10) # 10 seconds duration
            
            if res:
                avg_std = res.get("avg_std", 0.0)
                avg_dist = res.get("avg_dist")
                near_ratio = res.get("near_ratio")
                score, level, txt = get_focus_score(avg_std, avg_dist, near_ratio)
                return {"score": 100 - score, "details": txt}
            
        elif test_type == "follow":
            res = run_follow_dot_test(10)
            
            if res:
                avg_error = res.get("avg_error", 0.0)
                hit_ratio = res.get("hit_ratio")
                score, level, txt = get_follow_dot_score(avg_error, hit_ratio)
                return {"score": 100 - score, "details": txt}
                
        return {"score": 0, "details": "Test failed or cancelled"}
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-result")
def save_result(data: SaveResultRequest):
    success = save_multimodal_result(
        data.patient_name, 
        data.speech_score, 
        data.eye_score, 
        data.overall_score, 
        data.notes
    )
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail="Database save failed")

@app.get("/api/generate-report/{patient_name}")
def generate_pdf_report(patient_name: str):
    try:
        pdf_path = create_report(patient_name)
        if pdf_path and os.path.exists(pdf_path):
            return FileResponse(pdf_path, media_type='application/pdf', filename=pdf_path)
        else:
            raise HTTPException(status_code=404, detail="Could not generate report or no data found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)