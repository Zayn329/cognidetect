import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import numpy as np
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
import shutil
import os
from services.eye_tracker import run_focus_test, run_follow_dot_test
from services.scoring import get_focus_score, get_follow_dot_score
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
def get_patient_prediction(patient_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Fetch all historical scores for this patient, oldest to newest
        query = """
            SELECT risk_score, timestamp 
            FROM patient_history 
            WHERE patient_name = %s 
            ORDER BY timestamp ASC
        """
        cursor.execute(query, (patient_name,))
        history = cursor.fetchall()

        if not history:
            raise HTTPException(status_code=404, detail="No history found for this patient.")

        # Run the Math + AI logic
        result = calculate_velocity_and_predict(history)
        
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
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chatbot")
def chat_with_bot(request: ChatRequest):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # MASSIVE SYSTEM PROMPT FOR COGNIDETECT
        system_prompt = """
        You are the official AI Support Assistant for 'CogniDetect'.
        
        --- WHAT IS COGNIDETECT? ---
        CogniDetect is an advanced, multimodal cognitive biomarker screening platform. 
        We bridge the gap between B2C (Patient Consumer App) and B2B (Enterprise Hospital Portals).
        Our goal is early detection of neurological anomalies using non-invasive, accessible tools.
        
        --- OUR SCREENING MODULES ---
        1. DEMENTIA SCREENING:
           - Sequence Memory Game: Tests spatial and pattern memory recall.
           - Number Memory Game: Tests working memory limits.
           - Speech Analysis: Evaluates vocal jitter, shimmer, and acoustic biomarkers using Praat-like analysis.
           - Ocular Tracking: Uses the device camera (OpenCV) to track eye saccades, focus hold, and dot-following accuracy.
           
        2. DYSLEXIA SCREENING (Pediatric/General):
           - Phonology Game: Tests rhyme awareness and auditory processing.
           - Reading Test: Tracks reading flow and regression counts (eyes jumping backwards).
           - Handwriting Test: Analyzes dysgraphia and motor geometric stability via image upload.
           
        --- OUR ENTERPRISE AI AGENTS ---
        1. Omni-Triage Agent (Chief Medical Routing):
           - Used by hospital administrators.
           - Scans the entire patient database to sort patients by critical risk.
           - Detects clinical anomalies (e.g., "Patient has great memory but terrible speech").
           - Automatically routes patients to recommended specialists (e.g., 'Geriatric Neurologist', 'Speech Pathologist').
           
        2. Predictive Sentinel Agent:
           - A forecasting engine that maps patient history.
           - Uses linear regression to predict 6-month risk velocity.
           - It is context-aware: It draws separate trajectories for Dementia (blue) and Dyslexia (purple).
           - Generates preventative Action Plans tailored to the specific condition.
           
        --- TONE & GUIDELINES ---
        - You are helpful, empathetic, and clinical.
        - You must NOT diagnose patients. Remind them that CogniDetect is a 'screening' tool, not a final medical diagnosis.
        - If asked about premium features, mention that our Subscription includes unlimited Sentinel forecasting, PDF clinical reports, and priority specialist routing.
        - Keep your answers concise, formatting with bullet points if explaining multiple features.
        
        Answer the user's question based strictly on the information above.
        """
        
        full_prompt = f"{system_prompt}\n\nUser: {request.message}\nAI:"
        
        response = model.generate_content(full_prompt)
        return {"reply": response.text.strip()}
        
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return {"reply": "I'm experiencing a neural network delay. Please try again in a moment!"}                
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)