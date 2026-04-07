import React, { useState } from 'react';
import { ArrowLeft, ShieldAlert, Lock, MapPin, Clock, Tag } from 'lucide-react';
import { FoundItem } from '../App';
import ClaimVerificationModal from './ClaimVerificationModal';
import PickupTicket from './PickupTicket';
import { useAuth } from '../contexts/AuthContext';
import VerificationModal from './VerificationModal';

interface Props {
  item: FoundItem;
  onBack: () => void;
}

export default function SecureItemDetail({ item, onBack }: Props) {
  const [showClaimVerification, setShowClaimVerification] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const { isVerified } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleClaimClick = () => {
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }
    setShowClaimVerification(true);
  };

  // We use the live tags sent by Python VLV Backend!
  const getTags = () => {
    return item.tags && item.tags.length > 0 ? item.tags : [item.category.toUpperCase(), 'UNKNOWN_ATTR'];
  };

  if (showTicket) {
    return <PickupTicket item={item} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight flex-1">Secure Item View</h1>
        <Lock size={20} className="text-slate-400" />
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {/* Blurred Image Section */}
        <div className="w-full h-72 bg-slate-900 relative overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt="Obfuscated item" 
            className="w-full h-full object-cover blur-2xl opacity-40 scale-125" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <ShieldAlert size={48} className="text-white/90 mb-3" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest text-center px-4 drop-shadow-md">
              Image Obfuscated<br/>For Security
            </h2>
            <p className="text-slate-300 text-xs mt-2 max-w-xs text-center">
              Visual details are hidden to prevent fraudulent claims.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-6 max-w-md mx-auto w-full">
          {/* Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <MapPin size={16} className="text-slate-400" />
                <span>Found at: {item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <Clock size={16} className="text-slate-400" />
                <span>Reported: {item.timeAgo}</span>
              </div>
            </div>
          </div>

          {/* GLINER Tags */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Tag size={14} />
              Extracted Item Attributes (GLINER)
            </h3>
            <div className="flex flex-wrap gap-2">
              {getTags().map(tag => (
                <span key={tag} className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-md">
                  [{tag}]
                </span>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock size={14} />
              Status History
            </h3>
            <div className="relative pl-3">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
              
              <div className="flex gap-4 mb-5 relative z-10">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Found & Logged</p>
                  <p className="text-xs font-medium text-slate-500">{item.timeAgo}</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-5 relative z-10">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">AI Verification</p>
                  <p className="text-xs font-medium text-slate-500">Attributes Extracted</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 ring-4 ring-white animate-pulse"></div>
                <div>
                  <p className="text-sm font-bold text-indigo-700">Awaiting Claim</p>
                  <p className="text-xs font-medium text-indigo-500">Ready for owner verification</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <ShieldAlert size={20} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              To claim this item, you must provide the secret key or answer specific challenge questions about its hidden attributes.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50 flex justify-center">
        <div className="max-w-md w-full">
          <button 
            onClick={handleClaimClick}
            className="w-full py-4 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            Initiate Claim Verification (Secret Key)
          </button>
        </div>
      </div>

      {/* Verification Modal */}
      {showClaimVerification && (
        <ClaimVerificationModal 
          assetId={item.id}
          onClose={() => setShowClaimVerification(false)} 
          onSuccess={() => {
            setShowClaimVerification(false);
            setShowTicket(true);
          }}
        />
      )}
      <VerificationModal isOpen={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
    </div>
  );
}
