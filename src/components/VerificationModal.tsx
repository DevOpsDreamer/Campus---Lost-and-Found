import React, { useState } from 'react';
import { Lock, Mail, UploadCloud, ShieldAlert, CheckCircle, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function VerificationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { isVerified, userRole, loginMethod, verifyUser, ocrAttempts, incrementOcrAttempts, profile } = useAuth();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [overrideCode, setOverrideCode] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || isVerified) return null;

  const handleSendOtp = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email })
      });
      if (response.ok) {
        setEmailSent(true);
      } else {
        alert('Authentication microservice is down. Please check backend logs.');
      }
    } catch {
      alert('Cannot connect to authentication backend.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setOtpError(false);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, otp: otp })
      });
      if (response.ok) {
        verifyUser();
        onClose();
      } else {
        setOtpError(true);
      }
    } catch {
      alert('Verification server timeout.');
      setOtpError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOcrScan = (success: boolean) => {
    if (success) {
      verifyUser();
      onClose();
    } else {
      incrementOcrAttempts();
    }
  };

  const handleSecurityVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideCode === '0000') {
      verifyUser();
      onClose();
    } else {
      alert('Invalid Override Code. Use 0000 for demo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <Lock size={20} className="text-slate-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Verification Required</h2>
              <p className="text-slate-400 text-xs">Zero-Trust Access Control</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {userRole === 'SECURITY' ? (
            <form onSubmit={handleSecurityVerify} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Security personnel must enter the daily Administrative Override Code to activate their session.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Administrative Override Code</label>
                <input 
                  type="password" 
                  value={overrideCode}
                  onChange={(e) => setOverrideCode(e.target.value)}
                  placeholder="Enter Code (0000)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-center tracking-[0.3em] text-lg"
                />
              </div>

              <button 
                type="submit"
                disabled={!overrideCode}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors disabled:opacity-50"
              >
                Verify Authorization
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {loginMethod === 'EMAIL' ? (
                <div className="space-y-6">
                  {!emailSent ? (
                    <div className="text-center space-y-4">
                      <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
                        <Mail size={32} className="text-slate-400 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-900 mb-1">Email Verification</h3>
                        <p className="text-xs text-slate-500 font-medium break-words px-2">
                          We need to verify your institutional email address: <br/>
                          <strong className="text-slate-800">{profile.email}</strong>
                        </p>
                      </div>
                      <button 
                        onClick={handleSendOtp}
                        disabled={isVerifying}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Mail size={18} />
                        {isVerifying ? 'Generating OTP...' : 'Send OTP to Email'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col items-center gap-2 mb-2">
                        <CheckCircle size={24} className="text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-800 break-all text-center">OTP Sent to {profile.email}</p>
                      </div>
                      
                      <div className="space-y-2 text-left">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Enter 4-Digit OTP</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ''));
                            setOtpError(false);
                          }}
                          placeholder="1234"
                          className={`w-full bg-slate-50 border ${otpError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'} rounded-xl px-4 py-3 outline-none focus:ring-2 focus:border-transparent font-mono text-center tracking-[0.5em] text-2xl`}
                        />
                        {otpError && <p className="text-xs font-bold text-red-600 mt-1">Access Denied: Invalid OTP</p>}
                      </div>

                      <button 
                        type="submit"
                        disabled={otp.length !== 4 || isVerifying}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors disabled:opacity-50"
                      >
                        {isVerifying ? 'Verifying Identity...' : 'Verify OTP'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
                    <h3 className="font-bold text-slate-900 mb-1">Secure ID Upload</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Upload your Student ID Card for AI Verification.
                    </p>
                  </div>

                  {ocrAttempts >= 3 ? (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center space-y-3">
                      <ShieldAlert size={32} className="text-red-600 mx-auto" />
                      <h3 className="font-bold text-red-900">Verification Locked</h3>
                      <p className="text-sm text-red-800 font-medium">
                        Manual Verification Required. Proceed to the Main Security Desk for in-person physical verification.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                        <UploadCloud size={32} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">Upload Student ID Card</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attempts Remaining: {3 - ocrAttempts}</span>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleOcrScan(false)}
                          className="flex-1 bg-red-100 text-red-700 font-bold py-3 rounded-xl hover:bg-red-200 transition-colors text-sm"
                        >
                          Simulate Failed Scan
                        </button>
                        <button 
                          onClick={() => handleOcrScan(true)}
                          className="flex-1 bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-200 transition-colors text-sm"
                        >
                          Simulate Successful Scan
                        </button>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <ShieldAlert size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed uppercase tracking-wider">
                          <strong>DPDP Privacy Disclaimer:</strong> Your ID card is processed locally via our AI to verify your ERP ID and Name. The image is encrypted and destroyed immediately after verification. It is never stored on public servers.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
