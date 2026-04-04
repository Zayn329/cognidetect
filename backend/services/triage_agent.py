import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import mysql.connector

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def run_triage_agent(real_patient_data):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        db_string = json.dumps(real_patient_data)
        
        prompt = f"""
        You are an expert Chief Neurologist and autonomous triage agent at Spandan Hospital.
        I am giving you a REAL dataset of patients with multimodal screening scores.
        
        Your tasks:
        1. Sort patients from HIGHEST risk_score to LOWEST risk_score.
        2. Assign a 'status' (Critical if risk >= 80, Warning if 50-79, Stable if < 50).
        3. ASSIGN SPECIALIST: Based on their worst scores, assign a 'recommended_specialist' (e.g., 'Speech Pathologist', 'Geriatric Neurologist', 'Pediatric Dyslexia Specialist').
        4. ANOMALY DETECTION: Look for contradictions. If memory is great but speech is terrible, or reading is fine but writing is terrible, flag it in a 'clinical_anomaly' field. If normal, write "None".
        5. Write a 1-sentence 'summary'.
        
        Dataset:
        {db_string}
        
        Return ONLY a raw JSON array of objects, exactly like this:
        [
          {{"id": 1, "name": "Patient Name", "risk_score": 95, "status": "Critical", "recommended_specialist": "Neurologist", "clinical_anomaly": "Severe Speech/Memory mismatch", "summary": "..."}}
        ]
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
        
    except Exception as e:
        print(f"🤖 AI Agent Failed: {e}")
        return fallback_triage_sort(real_patient_data)

def fallback_triage_sort(patients):
    """Fallback now includes the new fields so the React UI never crashes."""
    print("⚠️ Using Fallback Mathematical Sort")
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
            "recommended_specialist": "General Assessment",
            "clinical_anomaly": "None",
            "summary": p.get('notes', 'Awaiting full AI review.')
        })
    return formatted_list