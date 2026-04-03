import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import mysql.connector

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def run_triage_agent(real_patient_data):
    """
    Takes the REAL patient data from MySQL, feeds it to Gemini, 
    and forces a structured JSON response for the React frontend.
    """
    try:
        # Gemini 1.5 Flash is the fastest and cheapest for JSON generation
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # We convert the MySQL dictionary to a JSON string for the prompt
        db_string = json.dumps(real_patient_data)
        
        prompt = f"""
        You are an expert Chief Neurologist and autonomous triage agent at Spandan Hospital.
        I am giving you a REAL dataset of patients with multimodal screening scores.
        
        Your tasks:
        1. Analyze the scores (speech_score, eye_score, writing_score, risk_score).
        2. Sort the patients from HIGHEST risk_score to LOWEST risk_score.
        3. Assign a 'status' to each (Critical if risk >= 80, Warning if 50-79, Stable if < 50).
        4. Write a 1-sentence 'summary' for each patient explaining exactly WHY they received that status based on their specific speech, eye, or writing scores.
        
        Real Patient Dataset:
        {db_string}
        
        Format your response as a raw JSON array of objects, exactly like this:
        [
          {{"id": 1, "name": "Patient Name", "risk_score": 95, "status": "Critical", "summary": "High acoustic jitter detected..."}}
        ]
        """
        
        # Force JSON output at the API level so it doesn't break React
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        print(f"🤖 AI Agent Failed: {e}")
        # HACKATHON MAGIC: The "Fallback"
        # If the API limits out or Wi-Fi drops on stage, we sort the real DB data mathematically.
        return fallback_triage_sort(real_patient_data)

def fallback_triage_sort(patients):
    """If the LLM fails, standard Python takes over to save the demo."""
    print("⚠️ Using Fallback Mathematical Sort on Real Data")
    
    # Sort the real DB array by risk_score descending
    sorted_patients = sorted(patients, key=lambda x: x.get('risk_score', 0), reverse=True)
    
    formatted_list = []
    for p in sorted_patients:
        risk = p.get('risk_score', 0)
        status = "Critical" if risk >= 80 else "Warning" if risk >= 50 else "Stable"
        formatted_list.append({
            "id": p.get('id', 0),
            "name": p.get('patient_name', 'Unknown'),
            "risk_score": risk,
            "status": status,
            "summary": p.get('notes', 'Awaiting full AI review.')
        })
    return formatted_list