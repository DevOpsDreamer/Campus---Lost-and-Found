import React, { useState } from 'react';
import { ArrowLeft, QrCode, CheckCircle, Circle, MapPin, AlertTriangle, Clock, Share2 } from 'lucide-react';
import { FoundItem } from '../App';

interface Props {
  item: FoundItem;
  onBack: () => void;
}

export default function PickupTicket({ item, onBack }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'CampusTrace - Pickup Instructions',
      text: `Pickup Authorization for ${item.title}.\nCode: AUTH-9X2B\nLocation: Main Security Desk, Admin Building, Room 101.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\nLink: ${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-800 rounded-md transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight flex-1 uppercase">Pickup Authorization</h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-5 mt-2">
        {/* Top Section: The Claim Ticket */}
        <div className="bg-white border-2 border-slate-900 rounded-md shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white p-4 text-center">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Claim Authorization Code</h2>
            <p className="text-3xl font-mono font-bold tracking-widest text-white">AUTH-9X2B</p>
          </div>
          <div className="p-8 flex flex-col items-center border-b border-slate-100">
            <div className="relative p-4 border-4 border-slate-900 rounded-md mb-5 group bg-white">
              {/* Simulated Scanning Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-70 animate-pulse"></div>
              <QrCode size={180} className="text-slate-900" strokeWidth={1.2} />
            </div>
            <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-4 py-2 rounded-md border border-slate-200">
              <Clock size={16} className="text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Valid for 24 Hours</span>
            </div>
          </div>
        </div>

        {/* Middle Section: The Swiggy-Style Status Timeline */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Chain of Custody</h3>
          <div className="relative pl-3">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-200"></div>
            
            {/* Step 1 */}
            <div className="flex gap-4 mb-7 relative z-10">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 ring-4 ring-white">
                <CheckCircle size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Item Logged by System</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Verified by CampusTrace AI</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 mb-7 relative z-10">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 ring-4 ring-white">
                <CheckCircle size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Ownership Verified</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Secret Key Match Confirmed</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 mb-7 relative z-10">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center mt-0.5 ring-4 ring-indigo-50">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-700">Ready for Pickup at Amnesty Box / Desk</p>
                <p className="text-xs font-medium text-indigo-500 mt-0.5">Awaiting student arrival</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center mt-0.5 ring-4 ring-white border border-slate-300">
                <Circle size={10} className="text-slate-300" fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Item Handed Over</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Pending security scan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Location & Instructions Card */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-start gap-4">
            <div className="bg-slate-100 p-2.5 rounded-md mt-0.5">
              <MapPin size={22} className="text-slate-700" />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pickup Location</h3>
              <p className="text-sm font-bold text-slate-900 leading-snug">Main Security Desk, Admin Building, Room 101</p>
            </div>
          </div>
          <div className="p-5 bg-amber-50">
            <div className="flex gap-3.5">
              <AlertTriangle size={22} className="text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1.5">Mandatory Requirement</h4>
                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                  You MUST present your physical University ID card to the security officer to complete the handover. The name on your ID must match your SSO login.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full py-4 mt-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm"
        >
          <Share2 size={18} />
          {isCopied ? 'Copied to Clipboard!' : 'Share Pickup Instructions'}
        </button>
      </main>
    </div>
  );
}
