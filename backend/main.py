import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import numpy as np
from pydantic import BaseModel
from typing import Optional
import shutil
import os
from services.triage_agent import run_triage_agent
import cv2
import mysql.connector


# --- SERVICES ---
from eye_reader import detect_pupil_x
from database import DB_CONFIG, get_db_connection, init_db, get_history
from services.speech import analyze_audio_file
from services.handwriting import analyze_handwriting
from services.report import create_report as create_dementia_report
from services.report_dyslexia import create_dyslexia_report # The new file
from services.sentinel_agent import calculate_velocity_and_predict
from fastapi import Query 
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
async def analyze_speech(file: UploadFile = File(...)):
    try:
        # Save file temporarily
        temp_path = f"temp_{file.filename}"

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 🔥 THIS IS THE MISSING LINE
        risk_score, details = analyze_audio_file(temp_path)

        # Delete temp file
        os.remove(temp_path)

        return {
            "risk_score": risk_score,
            "details": details
        }

    except Exception as e:
        print(f"Speech Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/api/agent/triage")
def trigger_omni_triage():
    try:
        # 1. Connect to your actual MySQL Database
        conn = mysql.connector.connect(**DB_CONFIG) 
        
        # dictionary=True is crucial! It makes the data easy for Gemini to read
        cursor = conn.cursor(dictionary=True) 
        
        # 2. Fetch the latest 10 real patients 
        # (We limit to 10 so the AI generates the JSON instantly for the demo)
        query = """
            SELECT id, patient_name, risk_score, speech_score, eye_score, writing_score, notes 
            FROM patient_history 
            ORDER BY timestamp DESC 
            LIMIT 10
        """
        cursor.execute(query)
        real_patients = cursor.fetchall()
        
        if not real_patients:
            return {"status": "error", "message": "No patients in DB. Run seed_db.py!"}

        # 3. Hand the REAL data to the Agent
        ai_sorted_queue = run_triage_agent(real_patients)
        
        # 4. Return to React
        return ai_sorted_queue

    except Exception as e:
        print(f"Triage Endpoint Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()
@app.get("/api/agent/predict/{patient_name}")
def get_patient_prediction(patient_name: str, type: str = Query("dementia")):
    conn = mysql.connector.connect(**DB_CONFIG) # Ensure your DB connection matches your setup
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Fetch all columns so the Python math script can sort it out
        # Fetch all columns so the Python math script can sort it out
        query = """
            SELECT 
                risk_score, memory_score, speech_score, eye_score, 
                phonology_score, reading_score, writing_score, 
                timestamp 
            FROM patient_history 
            WHERE patient_name = %s 
            ORDER BY timestamp ASC
        """
        cursor.execute(query, (patient_name,))
        history = cursor.fetchall()

        if not history:
            return {
                "patient_name": patient_name,
                "history": [],
                "prediction": 0,
                "trend": "unknown",
                "advice": "No history found for this patient."
            }

        # Hand off the data AND the requested type to the Sentinel Agent
        result = calculate_velocity_and_predict(history, scan_type=type)
        
        return {
            "patient_name": patient_name,
            **result
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)