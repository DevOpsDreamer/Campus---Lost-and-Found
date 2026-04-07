import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, MapPin, CheckCircle, Info, Phone, User, Check } from 'lucide-react';
import { FoundItem } from '../App';

interface Props {
  item: FoundItem;
  onBack: () => void;
  onVerify: (id: string, location: string) => void;
}

const LOCATION_DETAILS: Record<string, { address: string; contact: string; phone: string }> = {
  'Main Security Desk': { address: 'Admin Building, Room 101', contact: 'Officer Smith', phone: '555-0101' },
  'Library Lost & Found': { address: 'Central Library, Circulation Desk', contact: 'Sarah', phone: '555-0102' },
  'Student Union Desk': { address: 'Student Union, 1st Floor Info Desk', contact: 'Mike', phone: '555-0103' }
};

const STAGES = [
  'Received by Security',
  'Awaiting Pickup Location Assignment',
  'Ready for Pickup',
  'Collected'
];

export default function ItemVerification({ item, onBack, onVerify }: Props) {
  const [pickupLocation, setPickupLocation] = useState('Main Security Desk');
  const [notes, setNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVerifyClick = () => {
    setIsVerifying(true);
    // Simulate processing time
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccess(true);
      // Wait for success animation to finish before calling parent
      setTimeout(() => {
        onVerify(item.id, pickupLocation);
      }, 1800);
    }, 600);
  };

  const getProgressLevel = () => {
    switch (item.status) {
      case 'Pending Verification': return 0;
      case 'At Security Desk': return 1;
      case 'Verified & Ready for Pickup': return 2;
      case 'Collected': return 3;
      default: return 0;
    }
  };

  const currentLevel = getProgressLevel();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight flex-1">Item Verification</h1>
        <ShieldCheck size={24} className="text-emerald-400" />
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Image */}
        <div className="w-full h-64 bg-slate-200 relative">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Category</p>
            <p className="text-sm font-semibold">{item.category}</p>
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-md mx-auto w-full">
          {/* Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                item.status === 'At Security Desk' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : item.status === 'Verified & Ready for Pickup'
                  ? 'bg-sky-50 text-sky-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {item.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <MapPin size={16} className="text-slate-400" />
              <span>Found at: {item.location}</span>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-5">Verification Progress</h3>
            <div className="space-y-0 relative">
              {/* Vertical line background */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
              
              {STAGES.map((stage, index) => {
                const isCompleted = index < currentLevel;
                const isActive = index === currentLevel;
                
                return (
                  <div key={stage} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    {/* Vertical line fill for completed */}
                    {isCompleted && index !== STAGES.length - 1 && (
                      <div className="absolute left-[11px] top-2 bottom-[-16px] w-0.5 bg-emerald-500 z-0" />
                    )}
                    
                    <div className="relative z-10 flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full bg-sky-50 border-2 border-sky-500 flex items-center justify-center shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-sky-500" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-slate-200" />
                      )}
                    </div>
                    <div className={`text-sm pt-0.5 ${
                      isCompleted ? 'text-slate-900 font-semibold' : 
                      isActive ? 'text-sky-700 font-bold' : 
                      'text-slate-400 font-medium'
                    }`}>
                      {stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Form (Only show if not already verified) */}
          {item.status !== 'Verified & Ready for Pickup' ? (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle size={20} className="text-sky-600" />
                  Security Processing
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    Assign Pickup Location
                  </label>
                  <select 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-base rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                  >
                    <option value="Main Security Desk">Main Security Desk</option>
                    <option value="Library Lost & Found">Library Lost & Found</option>
                    <option value="Student Union Desk">Student Union Desk</option>
                  </select>
                  
                  {LOCATION_DETAILS[pickupLocation] && (
                    <div className="mt-3 bg-sky-50 border border-sky-100 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-sky-900 font-medium">{LOCATION_DETAILS[pickupLocation].address}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-sky-700">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-sky-500" />
                          <span className="font-semibold">{LOCATION_DETAILS[pickupLocation].contact}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-sky-500" />
                          <span className="font-semibold">{LOCATION_DETAILS[pickupLocation].phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-slate-400" />
                  Internal Notes
                </h3>
                <p className="text-sm text-slate-500">Add any private notes for security staff regarding this item.</p>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Item has a scratch on the back, ID was verified..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-base rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium resize-none"
                />
              </div>
            </>
          ) : (
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm text-center space-y-4">
              <div>
                <ShieldCheck size={32} className="text-emerald-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-emerald-900">Item Verified</h3>
                <p className="text-sm text-emerald-700 font-medium">
                  This item is ready for pickup at <span className="font-bold">{item.location}</span>.
                </p>
              </div>

              {LOCATION_DETAILS[item.location] && (
                <div className="bg-white/60 rounded-xl p-3.5 text-left border border-emerald-100 space-y-2.5">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Location Details</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-900 font-medium">{LOCATION_DETAILS[item.location].address}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-emerald-700">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-emerald-500" />
                      <span className="font-semibold">{LOCATION_DETAILS[item.location].contact}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-emerald-500" />
                      <span className="font-semibold">{LOCATION_DETAILS[item.location].phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Action Bar */}
      {item.status !== 'Verified & Ready for Pickup' && (
        <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50 flex gap-3 justify-center">
          <div className="flex gap-3 max-w-md w-full">
            <button 
              onClick={onBack}
              disabled={isVerifying}
              className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleVerifyClick}
              disabled={isVerifying}
              className="flex-[2] py-3.5 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Mark as Verified
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 animate-[bounce_0.5s_ease-out]">
            <Check size={48} className="text-white" strokeWidth={4} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Verified!</h2>
          <p className="text-slate-600 font-medium text-lg">Item is ready for pickup</p>
        </div>
      )}
    </div>
  );
}
