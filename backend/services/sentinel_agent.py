import numpy as np
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def calculate_velocity_and_predict(history_data):
    """
    history_data: List of dicts [{'timestamp': ..., 'risk_score': ...}]
    Returns: { 'current_trend': 'increasing/decreasing', 'prediction_6mo': float, 'advice': str }
    """
    if len(history_data) < 2:
        return {
            "prediction": None,
            "advice": "Insufficient data. Complete at least 3 screenings to unlock predictive forecasting."
        }

    # 1. Prepare data for Linear Regression (y = mx + c)
    # x = time (index 0, 1, 2...), y = risk_score
    y = np.array([float(p['risk_score']) for p in history_data])
    x = np.arange(len(y))

    # Perform Linear Regression: returns [slope (m), intercept (c)]
    slope, intercept = np.polyfit(x, y, 1)

    # 2. Predict 6 months (6 units) into the future
    # Using the formula: y = mx + c
    future_index = len(y) + 6
    prediction_6mo = (slope * future_index) + intercept
    prediction_6mo = max(0, min(100, round(prediction_6mo, 2))) # Clamp between 0-100

    # 3. Determine Trend Direction
    trend = "increasing" if slope > 0.5 else "decreasing" if slope < -0.5 else "stable"

    # 4. Use Gemini for Clinical Advice based on math
    advice = get_ai_preventative_advice(y, trend, prediction_6mo)

    return {
        "history": y.tolist(),
        "slope": round(float(slope), 2),
        "prediction": prediction_6mo,
        "trend": trend,
        "advice": advice
    }

def get_ai_preventative_advice(history, trend, prediction):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are the 'Sentinel AI' for CogniDetect. 
        A patient's cognitive risk history is: {history.tolist()}.
        The calculated trend is '{trend}' with a 6-month risk prediction of {prediction}%.
        
        Provide a 2-sentence 'Preventative Action Plan'. 
        If the trend is increasing, suggest specific neurological exercises or clinical consultations.
        If stable, suggest maintenance habits.
        Keep it professional, clinical, and encouraging.
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "Continue regular monitoring and consult a specialist if symptoms persist."