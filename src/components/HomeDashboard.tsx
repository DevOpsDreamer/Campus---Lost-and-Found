import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, ChevronRight, ShieldCheck, QrCode, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { FoundItem } from '../App';
import { useAuth } from '../contexts/AuthContext';
import VerificationModal from './VerificationModal';
import LiveScannerModal from './LiveScannerModal';

interface Props {
  items: FoundItem[];
  onItemClick: (item: FoundItem) => void;
}

export default function HomeDashboard({ items, onItemClick }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'timeAgo' | 'location'>('timeAgo');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const { isVerified } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleScanClick = () => {
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }
    setShowScanner(true);
  };

  const handleScanResult = (result: string) => {
    // Mock action: successfully read QR code
    setShowScanner(false);
    setScanSuccess(true);
  };

  const parseTimeAgo = (timeStr: string) => {
    const [val, unit] = timeStr.split(' ');
    const num = parseInt(val) || 0;
    if (unit.includes('min')) return num;
    if (unit.includes('hour')) return num * 60;
    if (unit.includes('day')) return num * 1440;
    return num;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
    const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'timeAgo') {
      return parseTimeAgo(a.timeAgo) - parseTimeAgo(b.timeAgo);
    } else {
      return a.location.localeCompare(b.location);
    }
  });

  if (scanSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-50 shadow-inner">
          <CheckCircle size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Registered Asset Detected</h2>
        <p className="text-slate-600 mb-8 max-w-sm leading-relaxed">
          Thank you for scanning the Return-Me tag. The owner has been securely notified of your location.
        </p>
        <button 
          onClick={() => setScanSuccess(false)}
          className="w-full max-w-xs py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md active:scale-95"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto w-full pb-24">
      {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campus Feed</h1>
            <p className="text-sm text-slate-500 mt-1">
              Recently found items across campus.
            </p>
          </div>
          <button 
            onClick={handleScanClick}
            className="bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition-colors active:scale-95"
          >
            <QrCode size={24} className="text-white" />
          </button>
        </div>

      {/* Search Bar */}
      <div className="relative mb-6 flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm shadow-sm transition-shadow"
            placeholder="Search for lost items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
            className={`h-full px-3 border rounded-xl flex items-center justify-center transition-colors ${activeStatus !== 'All' || sortBy !== 'timeAgo' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
          >
            <Filter size={20} />
          </button>
          
          {isStatusMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsStatusMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Filter by Status
                </div>
                {['All', 'At Security Desk', 'Pending Verification', 'Verified & Ready for Pickup'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setActiveStatus(status);
                      setIsStatusMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${activeStatus === status ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
                  >
                    {status}
                  </button>
                ))}
                
                <div className="px-4 py-2.5 bg-slate-50 border-y border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Sort by
                </div>
                <button
                  onClick={() => {
                    setSortBy('timeAgo');
                    setIsStatusMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === 'timeAgo' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
                >
                  Recently Found
                </button>
                <button
                  onClick={() => {
                    setSortBy('location');
                    setIsStatusMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === 'location' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
                >
                  Location (A-Z)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amnesty Box Status Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Library Desk: Active</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Student Union: Active</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Science Bldg: Offline</span>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {['All', 'Electronics', 'ID/Wallet', 'Clothing', 'Books', 'Other'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {sortedItems.length > 0 ? (
          sortedItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onItemClick(item)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition-transform cursor-pointer"
            >
            <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover blur-md opacity-50 scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <ShieldAlert size={24} className="text-white/90 mb-1.5" />
                <span className="text-[11px] font-bold text-white uppercase tracking-widest text-center px-4 drop-shadow-md">
                  Image Obfuscated<br/>For Security
                </span>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm z-20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
              </div>
              
              <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[11px] font-bold border border-indigo-100">
                <MapPin size={12} />
                <span>Found near your location</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin size={14} className="mr-1.5 text-slate-400" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock size={14} className="mr-1.5 text-slate-400" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  item.status === 'At Security Desk' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : item.status === 'Verified & Ready for Pickup'
                    ? 'bg-sky-50 text-sky-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {item.status}
                </span>
                {item.status === 'At Security Desk' ? (
                  <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <ShieldCheck size={14} /> Verify Item
                  </span>
                ) : (
                  <button className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1.5 transition-colors">
                    <Lock size={12} />
                    Initiate Claim Verification
                  </button>
                )}
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium">No items found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
                setActiveStatus('All');
                setSortBy('timeAgo');
              }}
              className="mt-3 text-sky-600 font-semibold text-sm hover:text-sky-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* QR Quick Scanner FAB */}
      <div className="fixed bottom-20 right-4 z-40">
        <button 
          onClick={handleScanClick}
          className="bg-slate-900 text-white px-4 py-3.5 rounded-full shadow-xl font-bold flex items-center gap-2.5 hover:bg-slate-800 transition-transform active:scale-95 border-2 border-slate-700"
        >
          <QrCode size={20} className="text-sky-400" />
          <span className="text-sm tracking-wide">Scan Return-Me Tag</span>
        </button>
      </div>
      <VerificationModal isOpen={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
      
      {showScanner && (
        <LiveScannerModal 
          onScan={handleScanResult} 
          onClose={() => setShowScanner(false)} 
          title="Scan Return-Me Tag"
          description="Position the asset's QR code within the frame to notify the owner."
        />
      )}
    </div>
  );
}
