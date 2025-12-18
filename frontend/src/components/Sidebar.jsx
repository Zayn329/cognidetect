import React from 'react';
import { User, ClipboardList } from 'lucide-react';

const Sidebar = ({ patientName, setPatientName }) => {
  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 p-6 flex flex-col border-r border-gray-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <span className="text-3xl">🧠</span> CogniDetect
        </h1>
        <p className="text-xs text-gray-500 mt-1">Multimodal AI Screening</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Patient Data</h2>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-auto bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
          <ClipboardList className="h-4 w-4" /> Instructions
        </h3>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Run Speech Test</li>
          <li>Run Eye Test</li>
          <li>Save Combined Report</li>
        </ol>
      </div>
    </div>
  );
};

export default Sidebar;