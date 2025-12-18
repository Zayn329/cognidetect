# # import pandas as pd
# # import numpy as np
# # import matplotlib.pyplot as plt
# # from fpdf import FPDF
# # from datetime import datetime
# # import os
# # from database import get_db_connection

# # class PDFReport(FPDF):
# #     def header(self):
# #         self.set_font('Arial', 'B', 24)
# #         self.set_text_color(0, 102, 204) 
# #         self.cell(0, 10, 'CogniDetect', 0, 1, 'C')
        
# #         self.set_font('Arial', 'B', 14)
# #         self.set_text_color(0, 0, 0)
# #         self.cell(0, 10, 'Predictive Cognitive Analysis Report', 0, 1, 'C')
# #         self.line(10, 30, 200, 30)
# #         self.ln(10)

# #     def footer(self):
# #         self.set_y(-15)
# #         self.set_font('Arial', 'I', 8)
# #         self.set_text_color(128)
# #         self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

# # def generate_trend_chart(df, patient_name):
# #     dates = pd.to_datetime(df['timestamp'])
# #     scores = df['risk_score']
    
# #     plt.figure(figsize=(10, 4))
# #     plt.plot(dates, scores, marker='o', linestyle='-', color='#0066cc', label='Patient Risk', linewidth=2)
# #     plt.axhline(y=70, color='r', linestyle='--', label='Danger Threshold (70%)')
    
# #     if len(df) > 1:
# #         # Simple linear trend line
# #         z = np.polyfit(range(len(df)), scores, 1)
# #         p = np.poly1d(z)
# #         plt.plot(dates, p(range(len(df))), "g:", label='Trend Projection')

# #     plt.title(f"Risk Trend Analysis: {patient_name}")
# #     plt.xlabel("Date/Time")
# #     plt.ylabel("Risk Score (%)")
# #     plt.grid(True, linestyle='--', alpha=0.5)
# #     plt.legend()
# #     plt.tight_layout()
    
# #     chart_filename = f"temp_chart_{datetime.now().timestamp()}.png"
# #     plt.savefig(chart_filename)
# #     plt.close()
# #     return chart_filename

# # def analyze_trend(df):
# #     if len(df) < 2: return "Insufficient Data", 0
# #     df['time_ordinal'] = pd.to_datetime(df['timestamp']).map(datetime.toordinal)
# #     slope, _ = np.polyfit(df['time_ordinal'], df['risk_score'], 1)
# #     return slope

# # def create_report(patient_name):
# #     # Fetch Data
# #     conn = get_db_connection()
# #     query = f"SELECT risk_score, speech_score, eye_score, timestamp, notes FROM patient_history WHERE patient_name = '{patient_name}' ORDER BY timestamp ASC"
# #     df = pd.read_sql(query, conn)
# #     conn.close()

# #     if df.empty:
# #         return None

# #     # Logic from final_report_app2.py
# #     latest = df.iloc[-1]
# #     memory_score = df[df['notes'].str.contains("Game:", na=False)]['risk_score'].mean() or 0
# #     speech_score = latest['speech_score'] if pd.notnull(latest['speech_score']) else 0
# #     eye_score = latest['eye_score'] if pd.notnull(latest['eye_score']) else 0
    
# #     slope_val = analyze_trend(df)
    
# #     # Determine status strings
# #     if slope_val == "Insufficient Data": 
# #         trend_status = "Insufficient Data"
# #         slope_val = 0
# #     elif slope_val > 0.5: trend_status = "Rapidly Deteriorating (Risk Increasing)"
# #     elif slope_val > 0:   trend_status = "Slowly Deteriorating"
# #     elif slope_val < 0:   trend_status = "Improving (Risk Decreasing)"
# #     else:                 trend_status = "Stable"

# #     current_risk = latest['risk_score']
    
# #     if current_risk > 60:
# #         advice = "URGENT: Immediate Doctor Visit Required." if slope_val >= -0.1 else "High Risk, but improving. Monitor Closely."
# #     elif current_risk > 40:
# #         advice = "WARNING: Condition worsening. Schedule appointment." if slope_val > 0.5 else "Moderate Risk. Maintain routine."
# #     else:
# #         advice = "Healthy. No immediate doctor visit required."

# #     # Generate PDF
# #     chart_img = generate_trend_chart(df, patient_name)
    
# #     pdf = PDFReport()
# #     pdf.add_page()
    
# #     pdf.set_font('Arial', '', 12)
# #     pdf.cell(0, 10, f'Date: {datetime.now().strftime("%Y-%m-%d")}', 0, 1, 'R')
# #     pdf.cell(0, 10, f'Patient Name: {patient_name}', 0, 1, 'L')
# #     pdf.ln(5)
    
# #     # Scores Table
# #     pdf.set_font('Arial', 'B', 14)
# #     pdf.cell(0, 10, 'Current Risk Snapshot:', 0, 1, 'L')
# #     pdf.set_font('Arial', 'B', 12)
# #     pdf.set_fill_color(230, 240, 255)
# #     pdf.cell(130, 12, 'Assessment Type', 1, 0, 'C', 1)
# #     pdf.cell(60, 12, 'Risk Score (%)', 1, 1, 'C', 1)
# #     pdf.set_font('Arial', '', 12)
# #     pdf.cell(130, 12, 'Memory (Cognitive Games)', 1, 0, 'L')
# #     pdf.cell(60, 12, f'{memory_score:.1f}%', 1, 1, 'C')
# #     pdf.cell(130, 12, 'Speech (AI Voice Detection)', 1, 0, 'L')
# #     pdf.cell(60, 12, f'{speech_score:.1f}%', 1, 1, 'C')
# #     pdf.cell(130, 12, 'Concentration (Eye Movement)', 1, 0, 'L')
# #     pdf.cell(60, 12, f'{eye_score:.1f}%', 1, 1, 'C')
# #     pdf.ln(10)
    
# #     # Chart
# #     try:
# #         pdf.image(chart_img, x=10, w=190)
# #         os.remove(chart_img)
# #     except:
# #         pass
    
# #     pdf.ln(5)
# #     pdf.set_font('Arial', 'B', 12)
# #     pdf.multi_cell(0, 8, f"Status: {trend_status}")
# #     pdf.ln(2)
    
# #     pdf.set_font('Arial', 'B', 14)
# #     pdf.cell(0, 10, 'Clinical Recommendation:', 0, 1, 'L')
# #     pdf.set_font('Arial', '', 12)
# #     pdf.multi_cell(0, 10, advice, 1, 'L')
    
# #     output_path = f"report_{patient_name}.pdf"
# #     pdf.output(output_path)
# #     return output_path
# import pandas as pd
# import numpy as np
# import matplotlib.pyplot as plt
# import matplotlib.dates as mdates
# from fpdf import FPDF
# from datetime import datetime
# import os
# from database import get_db_connection

# class PDFReport(FPDF):
#     def header(self):
#         self.set_font('Arial', 'B', 24)
#         self.set_text_color(0, 102, 204) 
#         self.cell(0, 10, 'CogniDetect', 0, 1, 'C')
        
#         self.set_font('Arial', 'B', 14)
#         self.set_text_color(0, 0, 0)
#         self.cell(0, 10, 'Predictive Cognitive Analysis Report', 0, 1, 'C')
#         self.line(10, 30, 200, 30)
#         self.ln(10)

#     def footer(self):
#         self.set_y(-15)
#         self.set_font('Arial', 'I', 8)
#         self.set_text_color(128)
#         self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

# def generate_trend_chart(df, patient_name):
#     dates = pd.to_datetime(df['timestamp'])
#     scores = df['risk_score']
    
#     plt.figure(figsize=(10, 4))
    
#     # 1. Fix Y-Axis to 0-100 (prevents weird zooming on small data)
#     plt.ylim(0, 105) 
    
#     # 2. Plot the actual Patient Data (Blue Line)
#     plt.plot(dates, scores, marker='o', linestyle='-', color='#0066cc', label='Patient Risk', linewidth=2)
    
#     # 3. Add Threshold Line
#     plt.axhline(y=70, color='r', linestyle='--', label='Danger Threshold (70%)')
    
#     # 4. Improved Trend Line Logic: Only show if we have > 2 points
#     if len(df) > 2:
#         # Create a numerical representation of dates for polyfit
#         date_nums = mdates.date2num(dates)
#         z = np.polyfit(date_nums, scores, 1)
#         p = np.poly1d(z)
        
#         # Plot trend line using the date range
#         plt.plot(dates, p(date_nums), "g:", label='Trend Projection')

#     # 5. Better Date Formatting on X-Axis
#     plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
#     plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())
#     plt.gcf().autofmt_xdate() # Rotate dates slightly so they don't overlap

#     plt.title(f"Risk Trend Analysis: {patient_name}")
#     plt.ylabel("Risk Score (%)")
#     plt.grid(True, linestyle='--', alpha=0.5)
#     plt.legend()
#     plt.tight_layout()
    
#     chart_filename = f"temp_chart_{datetime.now().timestamp()}.png"
#     plt.savefig(chart_filename)
#     plt.close()
#     return chart_filename

# def analyze_trend(df):
#     if len(df) < 2: return "Insufficient Data", 0
#     df['time_ordinal'] = pd.to_datetime(df['timestamp']).map(datetime.toordinal)
#     slope, _ = np.polyfit(df['time_ordinal'], df['risk_score'], 1)
#     return slope

# def format_score(value):
#     """Helper to handle NaN/None values cleanly"""
#     if pd.isna(value) or value is None:
#         return "N/A"
#     return f"{value:.1f}%"

# def create_report(patient_name):
#     """
#     Generates the final PDF report by pulling data directly from the 
#     dedicated multimodal columns in the database.
#     """
#     # 1. Fetch Data from MariaDB
#     conn = get_db_connection()
#     # We select the specific columns to ensure we aren't relying on 'notes'
#     query = """
#         SELECT risk_score, memory_score, speech_score, eye_score, timestamp, notes 
#         FROM patient_history 
#         WHERE patient_name = %s 
#         ORDER BY timestamp ASC
#     """
#     df = pd.read_sql(query, conn, params=(patient_name,))
#     conn.close()

#     if df.empty:
#         return None

#     # 2. Get the most recent session data
#     latest = df.iloc[-1]
    
#     # 3. Direct Column Mapping (Fixes the NaN/notes search bug)
#     # We pull from the dedicated columns created in the database migration
#     memory_val = latest['memory_score'] if pd.notnull(latest['memory_score']) else None
#     speech_val = latest['speech_score'] if pd.notnull(latest['speech_score']) else None
#     eye_val    = latest['eye_score']    if pd.notnull(latest['eye_score']) else None
#     current_risk = latest['risk_score']

#     # 4. Analyze Trend based on history
#     slope_val = analyze_trend(df)
    
#     # Determine trend status strings
#     if slope_val == "Insufficient Data": 
#         trend_status = "Insufficient Data (Need more tests)"
#         slope_val = 0
#     elif slope_val > 0.5: trend_status = "Rapidly Deteriorating (Risk Increasing)"
#     elif slope_val > 0:   trend_status = "Slowly Deteriorating"
#     elif slope_val < 0:   trend_status = "Improving (Risk Decreasing)"
#     else:                 trend_status = "Stable"

#     # 5. Clinical Recommendation Logic
#     if current_risk > 60:
#         advice = "URGENT: Immediate Doctor Visit Required." if slope_val >= -0.1 else "High Risk, but improving. Monitor Closely."
#     elif current_risk > 40:
#         advice = "WARNING: Condition worsening. Schedule appointment." if slope_val > 0.5 else "Moderate Risk. Maintain routine."
#     else:
#         advice = "Healthy. No immediate doctor visit required."

#     # 6. Generate the Visual Trend Chart
#     chart_img = generate_trend_chart(df, patient_name)
    
#     # 7. Construct the PDF
#     pdf = PDFReport()
#     pdf.add_page()
    
#     pdf.set_font('Arial', '', 12)
#     pdf.cell(0, 10, f'Date: {datetime.now().strftime("%Y-%m-%d")}', 0, 1, 'R')
#     pdf.cell(0, 10, f'Patient Name: {patient_name}', 0, 1, 'L')
#     pdf.ln(5)
    
#     # Score Snapshot Table
#     pdf.set_font('Arial', 'B', 14)
#     pdf.cell(0, 10, 'Current Risk Snapshot:', 0, 1, 'L')
#     pdf.set_font('Arial', 'B', 12)
#     pdf.set_fill_color(230, 240, 255)
#     pdf.cell(130, 12, 'Assessment Type', 1, 0, 'C', 1)
#     pdf.cell(60, 12, 'Risk Score (%)', 1, 1, 'C', 1)
    
#     pdf.set_font('Arial', '', 12)
#     # Use the format_score helper to prevent "nan%" from appearing
#     pdf.cell(130, 12, 'Memory (Cognitive Games)', 1, 0, 'L')
#     pdf.cell(60, 12, format_score(memory_val), 1, 1, 'C') 
    
#     pdf.cell(130, 12, 'Speech (AI Voice Detection)', 1, 0, 'L')
#     pdf.cell(60, 12, format_score(speech_val), 1, 1, 'C')
    
#     pdf.cell(130, 12, 'Concentration (Eye Movement)', 1, 0, 'L')
#     pdf.cell(60, 12, format_score(eye_val), 1, 1, 'C')
#     pdf.ln(10)
    
#     # Insert Graph
#     try:
#         pdf.image(chart_img, x=10, w=190)
#         os.remove(chart_img)
#     except Exception as e:
#         print(f"Chart Image Error: {e}")
    
#     pdf.ln(5)
#     pdf.set_font('Arial', 'B', 12)
#     pdf.multi_cell(0, 8, f"Status: {trend_status}")
#     pdf.ln(2)
    
#     pdf.set_font('Arial', 'B', 14)
#     pdf.cell(0, 10, 'Clinical Recommendation:', 0, 1, 'L')
#     pdf.set_font('Arial', '', 12)
#     pdf.multi_cell(0, 10, advice, 1, 'L')
    
#     # Save PDF locally and return path
#     output_path = f"report_{patient_name}.pdf"
#     pdf.output(output_path)
#     return output_path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from fpdf import FPDF
from datetime import datetime
import os
import time  # Added for DB consistency sync
from database import get_db_connection

# --- PDF GENERATOR CLASS ---
class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 24)
        self.set_text_color(0, 102, 204) 
        self.cell(0, 10, 'CogniDetect', 0, 1, 'C')
        
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, 'Predictive Cognitive Analysis Report', 0, 1, 'C')
        self.line(10, 30, 200, 30)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

# --- HELPER FUNCTIONS ---

def format_score(value):
    """Safely formats numerical scores or returns N/A if missing."""
    if pd.isna(value) or value is None:
        return "N/A"
    return f"{value:.1f}%"

def generate_trend_chart(df, patient_name):
    """Generates a Matplotlib chart with fixed Y-axis and clear trend lines."""
    dates = pd.to_datetime(df['timestamp'])
    scores = df['risk_score']
    
    plt.figure(figsize=(10, 4))
    plt.ylim(0, 105) 
    
    plt.plot(dates, scores, marker='o', linestyle='-', color='#0066cc', label='Patient Risk', linewidth=2)
    plt.axhline(y=70, color='r', linestyle='--', label='Danger Threshold (70%)')
    
    # Only show trend projection if more than 2 historical points exist
    if len(df) > 2:
        date_nums = mdates.date2num(dates)
        z = np.polyfit(date_nums, scores, 1)
        p = np.poly1d(z)
        plt.plot(dates, p(date_nums), "g:", label='Trend Projection')

    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())
    plt.gcf().autofmt_xdate()

    plt.title(f"Risk Trend Analysis: {patient_name}")
    plt.ylabel("Risk Score (%)")
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.legend()
    plt.tight_layout()
    
    chart_filename = f"temp_chart_{datetime.now().timestamp()}.png"
    plt.savefig(chart_filename)
    plt.close()
    return chart_filename

def analyze_trend(df):
    """Calculates the slope of risk change over time."""
    if len(df) < 2: return "Insufficient Data", 0
    df['time_ordinal'] = pd.to_datetime(df['timestamp']).map(datetime.toordinal)
    slope, _ = np.polyfit(df['time_ordinal'], df['risk_score'], 1)
    return slope

# --- MAIN REPORT GENERATION LOGIC ---

def create_report(patient_name):
    # 1. Sync Delay: Wait for MariaDB to finalize the 'Save' operation
    time.sleep(1.2) 
    
    # 2. Fetch the absolute latest record for the snapshot
    conn = get_db_connection()
    latest_query = """
        SELECT risk_score, memory_score, speech_score, eye_score, timestamp 
        FROM patient_history 
        WHERE patient_name = %s 
        ORDER BY timestamp DESC LIMIT 1
    """
    latest_df = pd.read_sql(latest_query, conn, params=(patient_name,))
    
    # 3. Fetch full history for the trend graph
    history_query = """
        SELECT risk_score, timestamp 
        FROM patient_history 
        WHERE patient_name = %s 
        ORDER BY timestamp ASC
    """
    history_df = pd.read_sql(history_query, conn, params=(patient_name,))
    conn.close()

    if latest_df.empty:
        return None

    latest = latest_df.iloc[0]
    
    # 4. Direct Mapping: Pull values directly from the DB columns
    memory_val = latest['memory_score']
    speech_val = latest['speech_score']
    eye_val    = latest['eye_score']
    current_risk = latest['risk_score']

    # 5. Trend and Recommendation Logic
    slope_val = analyze_trend(history_df)
    
    if slope_val == "Insufficient Data": 
        trend_status = "Insufficient Data (Need more tests)"
        slope_val = 0
    elif slope_val > 0.5: trend_status = "Rapidly Deteriorating (Risk Increasing)"
    elif slope_val > 0:   trend_status = "Slowly Deteriorating"
    elif slope_val < 0:   trend_status = "Improving (Risk Decreasing)"
    else:                 trend_status = "Stable"

    if current_risk > 60:
        advice = "URGENT: Immediate Doctor Visit Required." if slope_val >= -0.1 else "High Risk, but improving. Monitor Closely."
    elif current_risk > 40:
        advice = "WARNING: Condition worsening. Schedule appointment." if slope_val > 0.5 else "Moderate Risk. Maintain routine."
    else:
        advice = "Healthy. No immediate doctor visit required."

    # 6. PDF Construction
    chart_img = generate_trend_chart(history_df, patient_name)
    
    pdf = PDFReport()
    pdf.add_page()
    
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f'Date: {datetime.now().strftime("%Y-%m-%d")}', 0, 1, 'R')
    pdf.cell(0, 10, f'Patient Name: {patient_name}', 0, 1, 'L')
    pdf.ln(5)
    
    # Risk Snapshot Table
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Current Risk Snapshot:', 0, 1, 'L')
    pdf.set_font('Arial', 'B', 12)
    pdf.set_fill_color(230, 240, 255)
    pdf.cell(130, 12, 'Assessment Type', 1, 0, 'C', 1)
    pdf.cell(60, 12, 'Risk Score (%)', 1, 1, 'C', 1)
    
    pdf.set_font('Arial', '', 12)
    # Memory Score correctly pulls the '54' (or other value) from your DB
    pdf.cell(130, 12, 'Memory (Cognitive Games)', 1, 0, 'L')
    pdf.cell(60, 12, format_score(memory_val), 1, 1, 'C') 
    
    pdf.cell(130, 12, 'Speech (AI Voice Detection)', 1, 0, 'L')
    pdf.cell(60, 12, format_score(speech_val), 1, 1, 'C')
    
    pdf.cell(130, 12, 'Concentration (Eye Movement)', 1, 0, 'L')
    pdf.cell(60, 12, format_score(eye_val), 1, 1, 'C')
    pdf.ln(10)
    
    # Visualization and Recommendation
    try:
        pdf.image(chart_img, x=10, w=190)
        os.remove(chart_img)
    except:
        pass
    
    pdf.ln(5)
    pdf.set_font('Arial', 'B', 12)
    pdf.multi_cell(0, 8, f"Status: {trend_status}")
    pdf.ln(2)
    
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Clinical Recommendation:', 0, 1, 'L')
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, advice, 1, 'L')
    
    output_path = f"report_{patient_name}.pdf"
    pdf.output(output_path)
    return output_path