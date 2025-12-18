import mysql.connector
from datetime import datetime
import pandas as pd

DB_CONFIG = {
    'user': 'root',
    'password': ' ',       # Your MariaDB password (keep empty string if none)
    'host': 'localhost',
    'database': 'alzheimer_db'
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create table with all required columns including memory_score
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patient_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_name VARCHAR(255),
                timestamp DATETIME,
                risk_score FLOAT,
                memory_score FLOAT DEFAULT NULL,
                speech_score FLOAT DEFAULT NULL,
                eye_score FLOAT DEFAULT NULL,
                notes TEXT
            )
        """)
        
        # Migration check: Ensure memory_score exists if the table was old
        cursor.execute("DESCRIBE patient_history")
        columns = [column[0] for column in cursor.fetchall()]
        
        if 'memory_score' not in columns:
            cursor.execute("ALTER TABLE patient_history ADD COLUMN memory_score FLOAT DEFAULT NULL")
            print("Migration: Added memory_score column.")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database Error: {e}")

def save_multimodal_result(name, memory_s, speech_s, eye_s, overall_s, notes=""):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # We now explicitly save all three biomarkers in one row
        sql = """
            INSERT INTO patient_history 
            (patient_name, timestamp, risk_score, memory_score, speech_score, eye_score, notes) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        val = (name, datetime.now(), overall_s, memory_s, speech_s, eye_s, notes)
        cursor.execute(sql, val)
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Failed to save to DB: {e}")
        return False

def get_history(patient_name):
    try:
        conn = get_db_connection()
        query = f"SELECT timestamp, risk_score, speech_score, eye_score, notes FROM patient_history WHERE patient_name = '{patient_name}' ORDER BY timestamp ASC"
        df = pd.read_sql(query, conn)
        conn.close()
        df = df.replace({np.nan: None})
        # Convert timestamp to string for JSON serialization
        df['timestamp'] = df['timestamp'].astype(str)
        return df.to_dict(orient='records')
    except Exception as e:
        print(f"History Fetch Error: {e}")
        return []