import React, { useState } from 'react';
import { Inbox, CheckCircle, AlertTriangle, ChevronRight, XCircle, ShieldAlert, FileText, Camera, Clock, Check } from 'lucide-react';

interface Claim {
  erp: string;
  status: 'Provisional Match' | 'Low Confidence' | 'Pending Review';
  timestamp: string;
}

interface PendingItem {
  id: string;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  imageUrl: string;
  claims: Claim[];
}

const PENDING_ITEMS: PendingItem[] = [
  {
    id: 'INT-001',
    title: 'Black MacBook Pro',
    description: 'Found near the library entrance. Has a few stickers on the back.',
    location: 'Amnesty Box - Main Gate',
    timeAgo: '15 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
    claims: [
      { erp: 'ERP-12345678', status: 'Provisional Match', timestamp: '10 mins ago' },
      { erp: 'ERP-87654321', status: 'Low Confidence', timestamp: '5 mins ago' }
    ]
  },
  {
    id: 'INT-002',
    title: 'Blue Hydroflask',
    description: 'Left on a bench near the cafeteria.',
    location: 'Amnesty Box - Student Union',
    timeAgo: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
    claims: [
      { erp: 'ERP-55554444', status: 'Pending Review', timestamp: '30 mins ago' }
    ]
  },
  {
    id: 'INT-003',
    title: 'Student ID Card',
    description: 'Found on the floor in the science building.',
    location: 'Amnesty Box - Science Block',
    timeAgo: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600',
    claims: []
  }
];

export default function IntakeDashboard() {
  const [items, setItems] = useState<PendingItem[]>(PENDING_ITEMS);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVerifyIntake = (id: string) => {
    setIsVerifying(true);
    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccess(true);
      setTimeout(() => {
        setItems(items.filter(item => item.id !== id));
        setSelectedItem(null);
        setShowSuccess(false);
      }, 2000);
    }, 1000);
  };

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24">
        <header className="bg-slate-950 text-white px-5 py-4 sticky top-0 z-40 border-b border-slate-800 flex items-center gap-3">
          <button onClick={() => setSelectedItem(null)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
            <XCircle size={24} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Intake Review</h1>
            <p className="text-slate-400 text-xs font-mono">{selectedItem.id}</p>
          </div>
        </header>

        <main className="p-5 max-w-md mx-auto space-y-6">
          {/* Unblurred Photo */}
          <div className="bg-slate-950 border border-slate-800 rounded-sm overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                <Camera size={14} /> UNRESTRICTED VIEW
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-950/50 text-red-500 px-2 py-0.5 rounded-sm border border-red-900/50">
                CONFIDENTIAL
              </span>
            </div>
            <div className="aspect-square relative">
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 space-y-2">
              <h2 className="text-lg font-bold text-slate-100">{selectedItem.title}</h2>
              <p className="text-sm text-slate-400">{selectedItem.description}</p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-2">
                <span>{selectedItem.location}</span>
                <span>•</span>
                <span>{selectedItem.timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => handleVerifyIntake(selectedItem.id)}
            disabled={isVerifying || showSuccess}
            className={`w-full py-4 font-bold rounded-sm transition-colors uppercase tracking-wider text-sm shadow-lg flex items-center justify-center gap-2 ${
              showSuccess 
                ? 'bg-emerald-600 text-white' 
                : isVerifying
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {showSuccess ? (
              <>
                <CheckCircle size={18} />
                Intake Verified
              </>
            ) : isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Verify Physical Intake & Log to Vault
              </>
            )}
          </button>

          {/* Status Timeline */}
          <div className="bg-slate-950 border border-slate-800 rounded-sm overflow-hidden shadow-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              Item Timeline
            </h3>
            <div className="relative border-l-2 border-slate-800 ml-3 space-y-8">
              {/* Step 1 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-slate-950">
                  <Check size={10} className="text-slate-950 font-bold" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Finder Deposited</h4>
                <p className="text-xs text-slate-500 mt-1">{selectedItem.timeAgo} • {selectedItem.location}</p>
              </div>
              
              {/* Step 2 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-slate-950">
                  <Check size={10} className="text-slate-950 font-bold" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">AI VLV Image Scan</h4>
                <p className="text-xs text-slate-500 mt-1">Image analysis complete. Category assigned.</p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-6">
                <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-slate-950 ${
                  selectedItem.claims.length > 0 ? 'bg-emerald-500' : 'bg-slate-700'
                }`}>
                  {selectedItem.claims.length > 0 && <Check size={10} className="text-slate-950 font-bold" />}
                </div>
                <h4 className={`text-sm font-bold ${selectedItem.claims.length > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                  Owner Secret Key Matched (Provisional)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedItem.claims.length > 0 ? 'Match found in system.' : 'Awaiting owner claim.'}
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative pl-6">
                <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-slate-950 transition-colors duration-500 ${
                  showSuccess ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'
                }`}>
                  {showSuccess && <Check size={10} className="text-slate-950 font-bold" />}
                </div>
                <h4 className={`text-sm font-bold transition-colors duration-500 ${showSuccess ? 'text-slate-200' : 'text-indigo-400'}`}>
                  Pending Physical Intake
                </h4>
                <p className="text-xs text-slate-500 mt-1">Awaiting physical verification by security staff.</p>
              </div>

              {/* Step 5 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center ring-4 ring-slate-950">
                </div>
                <h4 className="text-sm font-bold text-slate-500">Handover Complete</h4>
                <p className="text-xs text-slate-500 mt-1">Pending student pickup and authorization.</p>
              </div>
            </div>
          </div>

          {/* Active Claims Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-sm overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Active Claims</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {selectedItem.claims.length > 0 ? (
                selectedItem.claims.map((claim, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm font-bold text-slate-200">{claim.erp}</span>
                      <span className="text-[10px] font-mono text-slate-500">{claim.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {claim.status === 'Provisional Match' && <CheckCircle size={14} className="text-emerald-500" />}
                      {claim.status === 'Low Confidence' && <AlertTriangle size={14} className="text-red-500" />}
                      {claim.status === 'Pending Review' && <FileText size={14} className="text-amber-500" />}
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        claim.status === 'Provisional Match' ? 'text-emerald-500' :
                        claim.status === 'Low Confidence' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 font-mono text-sm">
                  NO ACTIVE CLAIMS
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24">
      <header className="bg-slate-950 text-white px-5 py-6 sticky top-0 z-40 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Inbox className="text-indigo-400" />
            Intake Triage
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Amnesty Box Processing</p>
        </div>
        <div className="bg-indigo-950/50 border border-indigo-800/50 px-3 py-1 rounded-sm">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{items.length} Pending</span>
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto space-y-4">
        {items.length > 0 ? (
          items.map(item => (
            <button 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="w-full bg-slate-950 border border-slate-800 rounded-sm p-4 flex items-center gap-4 hover:bg-slate-900 transition-colors text-left group"
            >
              <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border border-slate-700">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-200 truncate pr-2">{item.title}</h3>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{item.timeAgo}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mb-2">{item.location}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                    item.claims.length > 0 
                      ? 'bg-amber-950/50 text-amber-500 border-amber-900/50' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {item.claims.length} Claims
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-300">All Caught Up</h3>
            <p className="text-sm text-slate-500 mt-1">No items pending intake.</p>
          </div>
        )}
      </main>
    </div>
  );
}
