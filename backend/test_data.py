import mysql.connector
from datetime import datetime, timedelta

DB_CONFIG = {'user': 'root', 'password': ' ', 'host': 'localhost', 'database': 'alzheimer_db'}

def seed_trend():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # We will create a clear 'Increasing Risk' trend for Zain Pawle
    # Month 1: 30%, Month 2: 45%, Month 3: 60%
    trend_data = [
        ("Zain Pawle", datetime.now() - timedelta(days=90), 30.0, "Baseline"),
        ("Zain Pawle", datetime.now() - timedelta(days=60), 45.0, "Follow up 1"),
        ("Zain Pawle", datetime.now() - timedelta(days=30), 60.0, "Follow up 2"),
    ]
    
    query = "INSERT INTO patient_history (patient_name, timestamp, risk_score, notes) VALUES (%s, %s, %s, %s)"
    cursor.executemany(query, trend_data)
    conn.commit()
    print("✅ Trend data injected for Zain Pawle.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    seed_trend()