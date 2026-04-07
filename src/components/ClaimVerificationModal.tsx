import React, { useState } from 'react';
import { Shield, Lock, Loader2, CheckCircle, X, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  assetId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimVerificationModal({ assetId, onClose, onSuccess }: Props) {
  const [secretKey, setSecretKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'provisional' | 'failed'>('idle');
  const [scoreInfo, setScoreInfo] = useState('');

  const handleVerify = async () => {
    if (!secretKey.trim()) return;
    setIsVerifying(true);
    
    try {
      const resp = await fetch(`http://127.0.0.1:5000/api/claims/${assetId}/verify-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey })
      });

      if (!resp.ok) throw new Error('Verification failed.');

      const data = await resp.json();
      setScoreInfo(`[Verified Score: ${data.confidenceScore.toFixed(2)}]`);

      if (data.status === 'APPROVED') {
        setResult('success');
      } else if (data.status === 'PROVISIONAL') {
        setResult('provisional');
      } else {
        setResult('failed');
      }
    } catch {
      alert("Failed to reach mathematical logic engine. Is Python VLV running?");
      setResult('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-md shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center gap-3">
          <Shield className="text-indigo-400" size={24} />
          <h2 className="text-lg font-bold tracking-wide uppercase">Ownership Verification</h2>
          <button 
            onClick={onClose} 
            disabled={isVerifying}
            className="ml-auto text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {result === 'idle' && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  To protect campus property, you must prove ownership. Describe a unique, hidden, or highly specific detail about this item that is not visible in the blurred preview.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="e.g., There is a faded Batman sticker on the bottom left casing, or the screen has a deep scratch near the camera."
                  className="w-full border-2 border-slate-300 rounded-md p-4 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none transition-colors font-medium"
                  disabled={isVerifying}
                />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-start gap-1.5 mt-2">
                  <Lock size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Our AI will compare your description against the finder's secure log. Be as specific as possible.</span>
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !secretKey.trim()}
                  className="w-full py-4 bg-indigo-700 text-white font-bold rounded-md hover:bg-indigo-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing Semantic Match...
                    </>
                  ) : (
                    'Run AI Verification Match'
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isVerifying}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>


            </>
          )}

          {result === 'success' && (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Match Confirmed</h3>
              <p className="text-xs font-bold text-emerald-600 mb-2">{scoreInfo}</p>
              <p className="text-sm text-slate-600 font-medium max-w-[280px]">
                Your description semantically matches the secure log. You have successfully verified ownership.
              </p>
              <button
                onClick={onSuccess}
                className="mt-6 w-full py-4 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 transition-colors text-sm uppercase tracking-wider shadow-sm"
              >
                View Pickup Instructions
              </button>
            </div>
          )}

          {result === 'provisional' && (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle size={32} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Provisional Match</h3>
              <p className="text-xs font-bold text-amber-600 mb-2">{scoreInfo}</p>
              <p className="text-sm text-slate-600 font-medium max-w-[280px]">
                Visual Verification Required. The AI could not definitively confirm your detail. You may proceed, but you must physically demonstrate this detail to the security officer.
              </p>
              <button
                onClick={onSuccess}
                className="mt-6 w-full py-4 bg-amber-600 text-white font-bold rounded-md hover:bg-amber-700 transition-colors text-sm uppercase tracking-wider shadow-sm"
              >
                View Provisional Pickup Instructions
              </button>
            </div>
          )}

          {result === 'failed' && (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <XCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Verification Failed</h3>
              <p className="text-xs font-bold text-red-600 mb-2">{scoreInfo}</p>
              <p className="text-sm text-slate-600 font-medium max-w-[280px]">
                Security Alert: The detail provided does not match the secure visual log. Your claim has been rejected and flagged.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-md hover:bg-slate-200 transition-colors text-sm uppercase tracking-wider shadow-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
