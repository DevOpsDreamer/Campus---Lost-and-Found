import React, { useState } from 'react';
import { ShieldCheck, Lock, Building, ShieldAlert, ArrowRight, Eye, EyeOff, MailCheck, PhoneCall } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPortal() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'security'>('student');
  
  // Student State
  const [studentLoginMethod, setStudentLoginMethod] = useState<'email' | 'erp'>('email');
  const [studentEmailPrefix, setStudentEmailPrefix] = useState('');
  const [studentErp, setStudentErp] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  
  // Security State
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);

  // Recovery State
  const [recoveryMode, setRecoveryMode] = useState<'none' | 'student' | 'security'>('none');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = studentLoginMethod === 'email' 
      ? studentEmailPrefix.length > 0 && studentPassword.length > 0
      : studentErp.length === 8 && studentPassword.length > 0;
      
    if (isValid) {
      if (studentLoginMethod === 'email') {
        login('STUDENT', 'EMAIL', `${studentEmailPrefix}@dypvp.edu.in`);
      } else {
        login('STUDENT', 'ERP', studentErp);
      }
    }
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffId && pin) {
      login('SECURITY', 'EMAIL');
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryInput) {
      setRecoverySent(true);
    }
  };

  const isStudentValid = studentLoginMethod === 'email' 
    ? studentEmailPrefix.length > 0 && studentPassword.length > 0
    : studentErp.length === 8 && studentPassword.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header / Branding */}
        <div className="text-center mb-8 flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">CampusTrace</h1>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              <Building size={14} className="text-emerald-700" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Verified Institution Portal</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 flex flex-col">
          {recoveryMode === 'student' ? (
            <div className="p-8 flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Reset Institutional Password</h2>
                <p className="text-sm text-slate-500">Enter your ERP ID or @dypvp.edu.in email to receive a secure password reset link.</p>
              </div>

              {recoverySent ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                  <MailCheck size={24} className="text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-800 font-medium">
                    If this account is registered, a secure recovery link has been dispatched to your institutional email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">ERP ID or Email</label>
                    <input 
                      type="text" 
                      required
                      value={recoveryInput}
                      onChange={(e) => setRecoveryInput(e.target.value)}
                      placeholder="e.g. 12345678 or student@dypvp.edu.in"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-inner font-mono text-sm transition-shadow"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!recoveryInput}
                    className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Recovery Link
                  </button>
                </form>
              )}

              <button
                onClick={() => {
                  setRecoveryMode('none');
                  setRecoverySent(false);
                  setRecoveryInput('');
                }}
                className="w-full bg-white text-slate-700 font-bold text-sm py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Return to Login
              </button>
            </div>
          ) : recoveryMode === 'security' ? (
            <div className="p-8 flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Enterprise Credential Recovery</h2>
                <p className="text-sm text-slate-500">Administrative access requires manual verification.</p>
              </div>

              <div className="bg-red-50 border border-red-200 p-5 rounded-xl flex flex-col items-center text-center gap-3">
                <ShieldAlert size={32} className="text-red-600" />
                <p className="text-sm text-red-900 font-medium leading-relaxed">
                  Security accounts are provisioned centrally. Please contact the Chief Security Officer (CSO) or Campus IT Desk at Extension 404 to request a master credential reset.
                </p>
                <a href="tel:404" className="mt-2 inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors">
                  <PhoneCall size={16} /> Call Ext. 404
                </a>
              </div>

              <button
                onClick={() => setRecoveryMode('none')}
                className="w-full bg-white text-slate-700 font-bold text-sm py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors mt-2"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'student' 
                      ? 'bg-white text-slate-900 border-b-2 border-slate-900' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  Student Portal
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'security' 
                      ? 'bg-white text-slate-900 border-b-2 border-slate-900' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  Security / Admin
                </button>
              </div>

              <div className="p-8 flex flex-col gap-6">
                {activeTab === 'student' ? (
                  <form onSubmit={handleStudentSubmit} className="flex flex-col gap-6 animate-in fade-in duration-300">
                    
                    {/* Login Method Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                      <button 
                        type="button"
                        onClick={() => setStudentLoginMethod('email')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${studentLoginMethod === 'email' ? 'bg-white shadow-sm text-slate-900 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Login with Email
                      </button>
                      <button 
                        type="button"
                        onClick={() => setStudentLoginMethod('erp')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${studentLoginMethod === 'erp' ? 'bg-white shadow-sm text-slate-900 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Login with ERP ID
                      </button>
                    </div>

                    {/* Dynamic ID/Email Input */}
                    {studentLoginMethod === 'email' ? (
                      <div className="flex flex-col gap-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Institutional Email</label>
                        <div className="flex bg-white border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent shadow-inner transition-shadow">
                          <input 
                            type="text" 
                            value={studentEmailPrefix}
                            onChange={(e) => setStudentEmailPrefix(e.target.value)}
                            placeholder="12345678.dit"
                            className="flex-1 px-4 py-3 outline-none text-slate-900 font-mono text-base min-w-0"
                          />
                          <div className="bg-slate-100 px-4 py-3 text-slate-500 border-l border-slate-300 select-none font-mono text-sm sm:text-base flex items-center justify-center whitespace-nowrap">
                            @dypvp.edu.in
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Student ERP ID</label>
                        <input 
                          type="text" 
                          maxLength={8}
                          value={studentErp}
                          onChange={(e) => setStudentErp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 8-digit ERP ID"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-inner font-mono text-lg tracking-[0.2em] transition-shadow text-center"
                        />
                      </div>
                    )}

                    {/* Password Input */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Portal Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock size={18} className="text-slate-400" />
                        </div>
                        <input 
                          type={showStudentPassword ? "text" : "password"} 
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-12 py-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-inner font-mono text-lg tracking-[0.2em] transition-shadow"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showStudentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <div className="flex justify-end mt-1">
                        <button 
                          type="button"
                          onClick={() => setRecoveryMode('student')}
                          className="text-sm text-slate-500 hover:text-blue-500 transition-colors font-medium"
                        >
                          Forgot Portal Password?
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!isStudentValid}
                      className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      Authenticate <ArrowRight size={20} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                      <ShieldAlert size={24} className="text-red-600 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">Restricted Access</h3>
                        <p className="text-xs text-red-700 font-medium mt-1">
                          Unauthorized access attempts are logged and reported to campus administration.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="staffId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Staff ID
                        </label>
                        <input
                          id="staffId"
                          type="text"
                          required
                          value={staffId}
                          onChange={(e) => setStaffId(e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono shadow-inner transition-shadow"
                          placeholder="SEC-001"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label htmlFor="pin" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Secure Access PIN / Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-400" />
                          </div>
                          <input
                            id="pin"
                            type={showSecurityPassword ? "text" : "password"}
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 text-2xl tracking-[0.3em] rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono shadow-inner transition-shadow"
                            placeholder="••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showSecurityPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <div className="flex justify-end mt-1">
                          <button 
                            type="button"
                            onClick={() => setRecoveryMode('security')}
                            className="text-sm text-slate-500 hover:text-blue-500 transition-colors font-medium"
                          >
                            Forgot Staff PIN?
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!staffId || !pin}
                      className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      <ShieldCheck size={22} />
                      Authenticate
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Dr. D.Y. Patil Institute of Technology<br/>
            CampusTrace Core System v2.5.0
          </p>
        </div>
      </div>
    </div>
  );
}
