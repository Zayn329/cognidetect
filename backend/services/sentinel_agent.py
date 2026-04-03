import numpy as np
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def calculate_velocity_and_predict(history_data, scan_type="dementia"):
    valid_scores = []
    
    for row in history_data:
        # SQL NULL comes back as Python None. Safely convert to 0 for math.
        if scan_type == "dyslexia":
            p_score = row.get('phonology_score')
            r_score = row.get('reading_score')
            w_score = row.get('writing_score')
            
            active_tests = []
            if p_score is not None and p_score > 0: active_tests.append(((5 - p_score) / 5) * 100)
            if r_score is not None and r_score > 0: active_tests.append(float(r_score))
            if w_score is not None and w_score > 0: active_tests.append(float(w_score))
            
            if active_tests:
                valid_scores.append(sum(active_tests) / len(active_tests))
            elif row.get('risk_score') is not None:
                # 🔥 RESTORED FALLBACK
                valid_scores.append(float(row.get('risk_score')))
                
        elif scan_type == "dementia":
            m_score = row.get('memory_score')
            s_score = row.get('speech_score')
            e_score = row.get('eye_score')
            
            active_tests = []
            if m_score is not None and m_score > 0: active_tests.append(float(m_score))
            if s_score is not None and s_score > 0: active_tests.append(float(s_score))
            if e_score is not None and e_score > 0: active_tests.append(float(e_score))
            
            if active_tests:
                valid_scores.append(sum(active_tests) / len(active_tests))
            elif row.get('risk_score') is not None:
                # 🔥 RESTORED FALLBACK
                valid_scores.append(float(row.get('risk_score')))

    # Reject if less than 2 points (we need 2 points to draw a line!)
    if len(valid_scores) < 2:
        return {
            "prediction": 0,
            "trend": "unknown",
            "advice": f"Insufficient {scan_type.upper()} data. Complete at least 2 specific screenings to unlock forecasting.",
            "insufficientData": True
        }

    # Linear Regression Math
    y = np.array(valid_scores)
    x = np.arange(len(y))
    slope, intercept = np.polyfit(x, y, 1)

    future_index = len(y) + 6
    prediction_6mo = max(0, min(100, round((slope * future_index) + intercept, 2)))
    trend = "increasing" if slope > 0.5 else "decreasing" if slope < -0.5 else "stable"

    advice = get_ai_preventative_advice(y, trend, prediction_6mo, scan_type)

    return {
        "history": [round(float(score), 1) for score in y],
        "slope": round(float(slope), 2),
        "prediction": prediction_6mo,
        "trend": trend,
        "advice": advice,
        "insufficientData": False
    }
def get_ai_preventative_advice(history, trend, prediction, scan_type):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are the 'Sentinel AI' for CogniDetect. 
        A patient's cognitive risk history for {scan_type.upper()} is: {history.tolist()}.
        The calculated trend is '{trend}' with a 6-month risk prediction of {prediction}%.
        
        Provide a 2-sentence 'Preventative Action Plan'. 
        CRITICAL: Make sure the advice matches the condition! 
        If {scan_type} is Dyslexia, suggest phonics training, occupational therapy, or reading specialists.
        If {scan_type} is Dementia, suggest neurological puzzles, memory care, or geriatric consultation.
        Keep it professional and clinical.
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Agent Error: {e}")
        return f"Continue regular {scan_type} monitoring and consult a specialist if risk persists."