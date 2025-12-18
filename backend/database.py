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
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patient_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_name VARCHAR(255),
                timestamp DATETIME,
                risk_score FLOAT,
                notes TEXT
            )
        """)
        
        # Migration checks
        cursor.execute("DESCRIBE patient_history")
        columns = [column[0] for column in cursor.fetchall()]
        
        if 'speech_score' not in columns:
            cursor.execute("ALTER TABLE patient_history ADD COLUMN speech_score FLOAT DEFAULT NULL")
        
        if 'eye_score' not in columns:
            cursor.execute("ALTER TABLE patient_history ADD COLUMN eye_score FLOAT DEFAULT NULL")
            
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Database Initialization Error: {e}")

def save_multimodal_result(name, speech_s, eye_s, overall_s, notes=""):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # --- MERGE LOGIC (Preserved from integrated_app.py) ---
        # Look for a recent "Game" record to update
        check_query = """
            SELECT id, risk_score, notes FROM patient_history 
            WHERE patient_name = %s 
              AND notes LIKE 'Game:%' 
              AND speech_score IS NULL
              AND timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)
            ORDER BY timestamp DESC LIMIT 1
        """
        cursor.execute(check_query, (name,))
        row = cursor.fetchone()
        
        if row:
            # Update existing Game record
            record_id, game_risk, game_notes = row
            final_risk = (float(game_risk) + float(overall_s)) / 2
            new_notes = f"{game_notes} | {notes}"
            
            update_sql = """
                UPDATE patient_history 
                SET risk_score = %s, speech_score = %s, eye_score = %s, notes = %s, timestamp = %s
                WHERE id = %s
            """
            val = (final_risk, speech_s, eye_s, new_notes, datetime.now(), record_id)
            cursor.execute(update_sql, val)
        else:
            # Insert new record
            sql = """
                INSERT INTO patient_history 
                (patient_name, timestamp, risk_score, speech_score, eye_score, notes) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            val = (name, datetime.now(), overall_s, speech_s, eye_s, notes)
            cursor.execute(sql, val)

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Save Error: {e}")
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