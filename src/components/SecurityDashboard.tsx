import React, { useState } from 'react';
import { ShieldCheck, Search, Camera, CheckCircle, AlertTriangle, XCircle, QrCode, Lock, ChevronRight, Clock, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LiveScannerModal from './LiveScannerModal';
import { InventoryItem } from '../App';

interface Props {
  inventory: InventoryItem[];
  onAuthorizeRelease: (uuid: string) => void;
  onRejectHandover: (uuid: string, reason: string) => void;
}

export default function SecurityDashboard({ inventory, onAuthorizeRelease, onRejectHandover }: Props) {
  const { userRole, isVerified } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLiveScanner, setShowLiveScanner] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [scanResult, setScanResult] = useState<InventoryItem | null>(null);
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<InventoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string, type: 'error' | 'success' } | null>(null);

  // Strict Rule: Invisible to STUDENT
  if (userRole === 'STUDENT' || !isVerified) {
    return null;
  }

  const filteredInventory = inventory.filter(item => 
    item.status !== 'RELEASED' && (
      item.uuid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.claimantErp && item.claimantErp.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const handleScanResult = (result: string) => {
    // Mock action: find item by UUID or just pick the first READY FOR PICKUP
    const itemToRelease = inventory.find(i => i.uuid === result || i.status === 'READY FOR PICKUP');
    if (itemToRelease) {
      setScanResult(itemToRelease);
      setShowLiveScanner(false);
      setShowHandoverModal(true);
    } else {
      // Handle not found case if needed, for now just close scanner
      setShowLiveScanner(false);
    }
  };

  const handleAuthorizeRelease = () => {
    if (scanResult && idConfirmed) {
      onAuthorizeRelease(scanResult.uuid);
      setScanResult(null);
      setShowHandoverModal(false);
      setIdConfirmed(false);
    }
  };

  const handleReject = () => {
    if (scanResult) {
      onRejectHandover(scanResult.uuid, 'Physical ID did not match ERP profile.');
      setToastMessage({ message: 'Handover Aborted: Logged to Item History', type: 'error' });
      setScanResult(null);
      setShowHandoverModal(false);
      setIdConfirmed(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-950 text-white px-5 py-6 sticky top-0 z-40 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" />
            Admin Inventory
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">SEC-OPS TERMINAL</p>
        </div>
        <div className="bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-sm">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">System Active</span>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-sm shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toastMessage.type === 'error' ? 'bg-red-950/90 border-red-800/50 text-red-200' : 'bg-emerald-950/90 border-emerald-800/50 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
          <span className="text-sm font-bold uppercase tracking-wider">{toastMessage.message}</span>
        </div>
      )}

      <main className="p-5 max-w-3xl mx-auto space-y-6">
        {/* Top Actions */}
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setShowLiveScanner(true)}
            className="w-full py-6 bg-emerald-600 text-white font-bold rounded-sm hover:bg-emerald-500 transition-colors shadow-lg flex flex-col items-center justify-center gap-3 border border-emerald-500"
          >
            <QrCode size={32} />
            <span className="text-lg tracking-wider uppercase">Scan Student Pickup QR</span>
          </button>
        </div>

        {/* Inventory Section */}
        <div className="bg-slate-950 border border-slate-800 rounded-sm overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} /> Active Inventory Ledger
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search exact UUID or ERP ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-sm text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono placeholder:text-slate-600 placeholder:font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset UUID</th>
                  <th className="px-4 py-3 font-medium">GLiNER Categories</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredInventory.map((item) => (
                  <tr 
                    key={item.uuid} 
                    onClick={() => setSelectedItemDetails(item)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 font-mono text-emerald-400 font-medium">{item.uuid}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map(cat => (
                          <span key={cat} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-sm border border-slate-700">
                            [{cat}]
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${
                        item.status === 'READY FOR PICKUP' 
                          ? 'bg-amber-950/50 text-amber-500 border-amber-900/50' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-300">{item.location}</td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-mono text-sm">
                      NO MATCHING RECORDS FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Live Scanner Modal */}
      {showLiveScanner && (
        <LiveScannerModal
          onScan={handleScanResult}
          onClose={() => setShowLiveScanner(false)}
          title="Scan Student Pickup QR"
          description="Position the student's pickup QR code within the frame to validate."
        />
      )}

      {/* Handover Authorization Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-sm w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm flex items-center gap-2">
                <Camera size={16} className="text-emerald-500" />
                Handover Authorization
              </h3>
              <button onClick={() => { setShowHandoverModal(false); setScanResult(null); setIdConfirmed(false); }} className="text-slate-500 hover:text-slate-300">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {scanResult && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-sm">
                    <div className="flex items-center gap-2 text-emerald-400 mb-3">
                      <CheckCircle size={18} />
                      <span className="font-bold uppercase tracking-wider text-sm">Valid Ticket Detected</span>
                    </div>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Asset:</span>
                        <span className="text-slate-200 font-bold">{scanResult.uuid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Claimant:</span>
                        <span className="text-slate-200 font-bold">{scanResult.claimantErp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-200">{scanResult.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-sm space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-500" />
                      Legal Gate
                    </h4>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={idConfirmed}
                          onChange={(e) => setIdConfirmed(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded-sm checked:bg-emerald-600 checked:border-emerald-600 transition-colors"
                        />
                        <CheckCircle size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors leading-snug">
                        I confirm I have physically inspected the claimant's D.Y. Patil University ID and it matches the ERP profile.
                      </span>
                    </label>
                  </div>

                  <button 
                    onClick={handleAuthorizeRelease}
                    disabled={!idConfirmed}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-lg"
                  >
                    Authorize Release & Transfer Liability
                  </button>
                  <button 
                    onClick={handleReject}
                    className="w-full py-4 bg-red-950/50 text-red-500 border border-red-900/50 font-bold rounded-sm hover:bg-red-900/50 transition-colors uppercase tracking-wider text-sm shadow-lg flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={18} />
                    Reject / ID Mismatch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail & History Modal */}
      {selectedItemDetails && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-sm w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                Item Detail & History
              </h3>
              <button onClick={() => setSelectedItemDetails(null)} className="text-slate-500 hover:text-slate-300">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Overarching Status */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-sm text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Current Status</span>
                <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm border inline-block ${
                  selectedItemDetails.status === 'READY FOR PICKUP' 
                    ? 'bg-amber-950/50 text-amber-500 border-amber-900/50' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {selectedItemDetails.status === 'READY FOR PICKUP' ? 'AWAITING CLAIM / PENDING HANDOVER' : selectedItemDetails.status}
                </span>
              </div>

              {/* Item Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asset UUID</span>
                  <span className="font-mono text-sm text-emerald-400">{selectedItemDetails.uuid}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</span>
                  <span className="font-mono text-sm text-slate-300">{selectedItemDetails.location}</span>
                </div>
                {selectedItemDetails.claimantErp && (
                  <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Claimant ERP</span>
                    <span className="font-mono text-sm text-slate-300">{selectedItemDetails.claimantErp}</span>
                  </div>
                )}
              </div>

              {/* Claim Attempts & Processes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-indigo-400" />
                  Claim Attempts & Processes
                </h4>
                <div className="space-y-3">
                  {selectedItemDetails.history && selectedItemDetails.history.length > 0 ? (
                    selectedItemDetails.history.map((event) => (
                      <div key={event.id} className="bg-slate-950 border border-slate-800 rounded-sm p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {event.type === 'Failure' && <AlertTriangle size={14} className="text-red-500" />}
                            {event.type === 'Success' && <CheckCircle size={14} className="text-emerald-500" />}
                            {event.type === 'Info' && <ShieldCheck size={14} className="text-indigo-400" />}
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              event.type === 'Failure' ? 'text-red-500' : 
                              event.type === 'Success' ? 'text-emerald-500' : 'text-slate-300'
                            }`}>
                              [{event.event}]
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed ml-6">
                          {event.details}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-slate-950 border border-slate-800 border-dashed rounded-sm">
                      <p className="text-slate-500 font-mono text-xs">NO HISTORY LOGGED</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
