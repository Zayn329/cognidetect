import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import numpy as np
from pydantic import BaseModel
from typing import Optional
import shutil
import os
import cv2

# --- SERVICES ---
from eye_reader import detect_pupil_x
from database import get_db_connection, init_db, get_history
from services.speech import analyze_audio_file
from services.handwriting import analyze_handwriting
from services.report import create_report as create_dementia_report
from services.report_dyslexia import create_dyslexia_report # The new file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# --- MODELS ---
class SaveResultRequest(BaseModel):
    patient_name: str
    memory_score: Optional[float] = 0.0
    speech_score: Optional[float] = 0.0
    eye_score: Optional[float] = 0.0
    overall_score: float
    phonology_score: Optional[float] = 0.0
    reading_score: Optional[float] = 0.0
    writing_score: Optional[float] = 0.0  
    dyslexia_risk: Optional[float] = 0.0 
    notes: str

# --- SAVE ENDPOINT ---
@app.post("/api/save-result")
def save_result(data: SaveResultRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # If this is a Dyslexia test, use the Dyslexia Risk as the main score
    final_risk_score = data.overall_score
    if data.dyslexia_risk > 0:
        final_risk_score = data.dyslexia_risk

    # Ensure w_score isn't None
    w_score = data.writing_score if data.writing_score is not None else 0.0

    query = """
    INSERT INTO patient_history (
        patient_name, timestamp, 
        memory_score, speech_score, eye_score, 
        risk_score,       
        phonology_score, reading_score, writing_score,   
        notes
    ) 
    VALUES (%s, NOW(), %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    values = (
        data.patient_name,
        data.memory_score,
        data.speech_score,
        data.eye_score,
        final_risk_score,      
        data.phonology_score,
        data.reading_score,
        w_score, 
        data.notes
    )
    
    try:
        cursor.execute(query, values)
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"DB Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# --- REPORT GENERATOR ---
@app.get("/api/generate-report/{patient_name}")
def generate_pdf_report(patient_name: str, type: str = "dementia"):
    try:
        if type == "dyslexia":
            pdf_path = create_dyslexia_report(patient_name)
        else:
            pdf_path = create_dementia_report(patient_name)
            
        if pdf_path and os.path.exists(pdf_path):
            return FileResponse(pdf_path, media_type='application/pdf', filename=pdf_path)
        else:
            raise HTTPException(status_code=404, detail="No report found.")
    except Exception as e:
        print(f"PDF Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- DYSLEXIA SERVICES ---
class HandwritingRequest(BaseModel):
    image: str 

@app.post("/api/dyslexia/analyze-handwriting")
def analyze_handwriting_endpoint(data: HandwritingRequest):
    try:
        if "," in data.image:
            header, encoded = data.image.split(",", 1)
        else:
            encoded = data.image
        img_data = base64.b64decode(encoded)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        score, details = analyze_handwriting(frame)
        return {"writing_score": score, "details": details}
    except Exception as e:
        return {"writing_score": 0, "details": "Error"}

# --- EXTRAS ---
class EyeFrame(BaseModel):
    image: str 

@app.post("/api/dyslexia/track-eye")
def track_eye_endpoint(data: EyeFrame):
    try:
        if "," in data.image: header, encoded = data.image.split(",", 1)
        else: encoded = data.image
        img_data = base64.b64decode(encoded)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return {"x": detect_pupil_x(frame)}
    except: return {"x": None}

@app.get("/")
def read_root(): return {"status": "Running"}

@app.get("/api/history/{patient_name}")
def get_patient_history(patient_name: str): return get_history(patient_name)

@app.post("/api/analyze-speech")
def analyze_speech(file: UploadFile = File(...)):
    # ... (Keep existing logic)
    return {"risk_score": 0, "details": "Speech analysis placeholder"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)