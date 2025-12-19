import React from 'react';
import { LayoutDashboard, History, Info, Brain } from 'lucide-react';

const Sidebar = ({ patientName }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#020817] border-r border-slate-800 flex flex-col transition-colors duration-300 z-50">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <Brain className="text-[#3b82f6] h-7 w-7" />
          <h2 className="font-black text-2xl text-white tracking-tighter">CogniDetect</h2>
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-10">
          Multimodal AI Screening
        </p>
      </div>

      {/* Patient Data Section (Matches your layout) */}
      <div className="px-6 py-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">
          Patient Data
        </p>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="text-slate-500 text-xs">👤</span>
          </div>
          <input
            type="text"
            readOnly
            value={patientName || "Loading..."}
            className="w-full bg-[#020817] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Simplified Navigation */}
      <nav className="flex-1 px-4 mt-8 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl font-bold text-sm transition-all group">
          <LayoutDashboard size={18} className="group-hover:text-[#3b82f6]" /> 
          Dashboard
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl font-bold text-sm transition-all group">
          <History size={18} className="group-hover:text-[#3b82f6]" /> 
          Past Reports
        </button>
      </nav>

      {/* Action Footer */}
      <div className="p-6">
        <button className="w-full flex items-center gap-3 px-5 py-4 bg-[#f1f5f9] text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white transition-all">
          <Info size={16} className="text-[#3b82f6]" />
          Instructions
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;