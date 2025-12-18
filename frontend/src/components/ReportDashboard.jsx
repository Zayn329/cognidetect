import React, { useEffect, useState } from 'react';
import API from '../api';
import { FileText, Save, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const ReportDashboard = ({ patientName, speechScore, eyeScore }) => {
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  // Calculate Overall Logic
  const sScore = speechScore || 0;
  const eScore = eyeScore || 0;
  let overall = 0;
  let note = "No Data";

  if (speechScore && eyeScore) {
    overall = (sScore + eScore) / 2;
    note = "Multimodal Consensus";
  } else if (speechScore) {
    overall = sScore;
    note = "Speech Only";
  } else if (eyeScore) {
    overall = eScore;
    note = "Eye Only";
  }

  // Fetch History
  useEffect(() => {
    if (patientName) {
      API.get(`/history/${patientName}`)
         .then(res => setHistory(res.data))
         .catch(err => console.error(err));
    }
  }, [patientName]);

  const handleSave = async () => {
    if (!patientName) return alert("Enter patient name first");
    setSaving(true);
    try {
      await API.post('/save-result', {
        patient_name: patientName,
        speech_score: sScore,
        eye_score: eScore,
        overall_score: overall,
        notes: note
      });
      alert("Saved successfully!");
      // Refresh history
      const res = await API.get(`/history/${patientName}`);
      setHistory(res.data);
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if(!patientName) return alert("Please enter a patient name");
    try {
        const response = await API.get(`/generate-report/${patientName}`, {
            responseType: 'blob', // Important for PDF
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Report_${patientName}.pdf`);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error("Download failed", error);
        alert("Failed to generate report. Ensure data exists.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="text-green-600" /> Final Diagnosis
        </h2>

        {!patientName ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
            ⚠️ Please enter a Patient Name in the sidebar first.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-500">Speech Risk</div>
                <div className="text-2xl font-bold text-gray-800">{sScore.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-500">Eye Risk</div>
                <div className="text-2xl font-bold text-gray-800">{eScore.toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                <div className="text-sm text-blue-600 font-semibold">OVERALL RISK</div>
                <div className="text-3xl font-extrabold text-blue-700">{overall.toFixed(1)}%</div>
                <div className="text-xs text-blue-500">{note}</div>
              </div>
            </div>

            <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  disabled={saving || overall === 0}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex justify-center items-center gap-2 disabled:bg-gray-300"
                >
                  <Save className="h-5 w-5" /> Save Diagnosis
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 flex justify-center items-center gap-2"
                >
                  <Download className="h-5 w-5" /> Download PDF Report
                </button>
            </div>
          </>
        )}
      </div>

      {/* History Chart */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">📈 Risk Trend History</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleDateString()} />
                <YAxis domain={[0, 100]} />
                <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
                <ReferenceLine y={70} label="Critical" stroke="red" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="risk_score" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;