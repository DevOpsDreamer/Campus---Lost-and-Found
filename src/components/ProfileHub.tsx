import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, QrCode, FileText, KeyRound, Shield, Clock, ScanLine, FileBarChart, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VerificationModal from './VerificationModal';

export default function ProfileHub({ onNavigateToAssets, onNavigateToFlaggedUsers }: { onNavigateToAssets: () => void, onNavigateToFlaggedUsers?: () => void }) {
  const { userRole, loginMethod, isVerified, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(!profile.name || !profile.erp || !profile.email);
  const [formData, setFormData] = useState(profile);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleAction = (action?: () => void) => {
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }
    if (action) action();
  };

  if (userRole === 'SECURITY') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans pb-24">
        {/* Header */}
        <header className="bg-slate-900 text-white px-5 py-6 sticky top-0 z-50 shadow-md">
          <h1 className="text-2xl font-bold tracking-tight">Security Command</h1>
          <p className="text-slate-400 text-sm mt-1">Manage institutional assets and audits</p>
        </header>

        <main className="p-5 max-w-md mx-auto space-y-6">
          {/* Section A: Identity & Shift Card */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-inner">
                  <ShieldCheck size={28} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Desk Warden</h2>
                  <div className="text-sm text-slate-600 font-mono mt-0.5">Staff ID: SEC-8472</div>
                  <div className="text-sm text-slate-600 font-mono">Assigned Post: Main Gate</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl flex items-center justify-center gap-2">
              <Shield size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Status: On-Duty</span>
            </div>
          </div>

          {/* Section B: Security Action Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white p-5 rounded-2xl shadow-sm border border-slate-300 flex flex-col items-start text-left hover:bg-slate-50 transition-colors active:scale-95">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mb-3">
                <ScanLine size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">Scan Claimant QR</h3>
            </button>

            <button className="bg-white p-5 rounded-2xl shadow-sm border border-slate-300 flex flex-col items-start text-left hover:bg-slate-50 transition-colors active:scale-95">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                <FileBarChart size={20} className="text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">Shift Summary Report</h3>
            </button>

            <button 
              onClick={onNavigateToFlaggedUsers}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-300 flex flex-col items-start text-left hover:bg-slate-50 transition-colors active:scale-95 col-span-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Flagged Users</h3>
              </div>
            </button>
          </div>

          {/* Section C: Institutional Audit Ledger */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
              <Clock size={14} />
              Desk Audit Trail
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden">
              <div className="divide-y divide-slate-200">
                
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-slate-900">[Handover Authorized]</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">2026-03-19 09:15 IST</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono font-medium">Asset UUID-9876 to ERP-12345678</p>
                </div>

                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-slate-900">[Intake Verified]</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">2026-03-19 11:30 IST</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono font-medium">Black MacBook Logged</p>
                </div>

                <div className="p-4 hover:bg-slate-50 transition-colors bg-red-50/30">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-red-800">[Provisional Hold]</span>
                    <span className="text-[10px] font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-200">2026-03-19 14:00 IST</span>
                  </div>
                  <p className="text-xs text-red-800 font-mono font-medium">Failed UI Verification</p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-900 text-white px-5 py-6 sticky top-0 z-50 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your identity and assets</p>
      </header>

      <main className="p-5 max-w-md mx-auto space-y-6">
        {/* Section A: Identity & Trust Card / Profile Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Complete Your Profile</h2>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Aniket Ingale"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ERP ID</label>
                <input 
                  type="text" 
                  required
                  disabled={loginMethod === 'ERP'}
                  value={formData.erp}
                  onChange={(e) => setFormData({...formData, erp: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono ${loginMethod === 'ERP' ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  placeholder="8-digit ERP"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional Email</label>
                <input 
                  type="email" 
                  required
                  disabled={loginMethod === 'EMAIL'}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono ${loginMethod === 'EMAIL' ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  placeholder="@dypvp.edu.in"
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-2 hover:bg-slate-800 transition-colors">
                Save Profile
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                      <User size={28} className="text-slate-400" />
                    </div>
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <CheckCircle size={18} className="text-emerald-500 fill-emerald-100" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{profile.name || 'Student Name'}</h2>
                    <div className="text-sm text-slate-500 font-mono mt-0.5">ERP: {profile.erp || 'Pending'}</div>
                    <div className="text-sm text-slate-500 font-mono">{profile.email || 'Pending'}</div>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">Edit</button>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center justify-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Trust Score: Optimal</span>
              </div>
            </>
          )}
        </div>

        {/* Section B: The Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onNavigateToAssets}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start text-left hover:bg-slate-50 transition-colors active:scale-95"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mb-3">
              <QrCode size={20} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Registered Assets (QR)</h3>
          </button>

          <button className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start text-left hover:bg-slate-50 transition-colors relative active:scale-95">
            <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              1 Pending
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <FileText size={20} className="text-slate-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Active Claims</h3>
          </button>

          <button className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start text-left hover:bg-slate-50 transition-colors active:scale-95">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <KeyRound size={20} className="text-slate-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Security Desk PIN</h3>
          </button>

          <button className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start text-left hover:bg-slate-50 transition-colors active:scale-95">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <Shield size={20} className="text-slate-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Privacy & Consent</h3>
          </button>
        </div>

        {/* Section C: Digital Chain of Custody / Activity Log */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
            <Clock size={14} />
            System Activity Log
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              
              <div className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-slate-900">[Found Item Deposited]</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">14:30 IST</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Liability Transferred to Amnesty Box</p>
              </div>

              <div className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-slate-900">[Asset Registered]</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Yesterday</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Aniket's Calculator (UUID-9876)</p>
              </div>

              <div className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-slate-900">[Claim Verified]</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Last Week</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Black MacBook</p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
