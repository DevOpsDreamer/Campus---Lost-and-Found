import React from 'react';
import { QrCode, Download, Plus, ShieldCheck, Server, ArrowLeft } from 'lucide-react';

export default function MyQRAssets({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-900 text-white px-5 py-6 sticky top-0 z-50 shadow-md flex items-start gap-4">
        {onBack && (
          <button onClick={onBack} className="mt-1 p-1 -ml-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <ArrowLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My QR Assets</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your registered Return-Me tags</p>
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto space-y-6">
        
        {/* Asset Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 flex justify-between items-center">
            <h2 className="text-white font-bold tracking-wide">Aniket's Calculator</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck size={12} /> Active
            </span>
          </div>
          
          <div className="p-6 flex flex-col items-center border-b border-slate-100">
            {/* Simulated QR Code */}
            <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm mb-4 relative group">
              {/* Corner markers for QR aesthetic */}
              <div className="absolute top-2 left-2 w-6 h-6 border-4 border-slate-900 rounded-sm"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-4 border-slate-900 rounded-sm"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-4 border-slate-900 rounded-sm"></div>
              
              <QrCode size={120} className="text-slate-900" strokeWidth={1} />
            </div>
            
            <div className="text-center space-y-1 w-full bg-slate-50 py-3 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset UUID</p>
              <p className="font-mono text-sm text-slate-900 font-semibold tracking-tight">
                campustrace.edu/scan/uuid-9876
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50">
            <button className="w-full py-3.5 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <Download size={18} />
              Download Sticker to Print
            </button>
          </div>
        </div>

        {/* Add New Asset Button */}
        <button className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-2">
          <Plus size={20} />
          Register New Asset
        </button>

        {/* Technical Info */}
        <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <Server size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 font-medium leading-relaxed">
            Return-Me tags use cryptographically secure UUIDs. Anyone scanning this tag will be anonymously routed to CampusTrace to report it found, without exposing your personal information.
          </p>
        </div>

      </main>
    </div>
  );
}
