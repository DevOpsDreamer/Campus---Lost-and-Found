import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VerificationModal from './VerificationModal';

export default function VerificationGateway({ children }: { children: React.ReactNode }) {
  const { isVerified } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (isVerified) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden text-center p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-200">
          <Lock size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm mb-8">
          You must complete your profile and verify your identity to access this feature.
        </p>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md hover:bg-slate-800 active:bg-black transition-colors"
        >
          Verify Identity Now
        </button>
      </div>
      <VerificationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
