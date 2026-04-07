import React, { useState } from 'react';
import { List, Search, Filter, ShieldCheck, Clock, User, AlertTriangle, Fingerprint, Activity, Inbox, Database, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../App';

interface Props {
  logs: AuditLog[];
  pendingCount: number;
  vaultedCount: number;
  releasedCount: number;
}

export default function MasterAudit({ logs, pendingCount, vaultedCount, releasedCount }: Props) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Handover' | 'Intake'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Only show overarching system events
  const overarchingLogs = logs.filter(log => ['Handover', 'Intake'].includes(log.type));

  const filteredLogs = overarchingLogs.filter(log => {
    const matchesFilter = activeFilter === 'All' || log.type === activeFilter;
    const matchesSearch = log.uuid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Handover': return <ShieldCheck size={16} className="text-emerald-500" />;
      case 'Failed Claim': return <AlertTriangle size={16} className="text-red-500" />;
      case 'AI Scan': return <Fingerprint size={16} className="text-indigo-500" />;
      case 'Deposit': return <Inbox size={16} className="text-sky-500" />;
      case 'Intake': return <Database size={16} className="text-amber-500" />;
      default: return <Activity size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-950 text-white px-5 py-6 sticky top-0 z-40 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <List className="text-indigo-400" />
            Master Audit
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">SYSTEM LEDGER</p>
        </div>
        <div className="bg-indigo-950/50 border border-indigo-800/50 px-3 py-1 rounded-sm">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{logs.length} Records</span>
        </div>
      </header>

      <main className="p-5 max-w-3xl mx-auto space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 flex flex-col items-center justify-center text-center shadow-lg">
            <Inbox size={20} className="text-amber-500 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{pendingCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending Intake</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 flex flex-col items-center justify-center text-center shadow-lg">
            <Database size={20} className="text-indigo-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{vaultedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Vaulted</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 flex flex-col items-center justify-center text-center shadow-lg">
            <CheckCircle2 size={20} className="text-emerald-500 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{releasedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Completed</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 space-y-4 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by UUID, Actor, or Event..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-sm text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono placeholder:text-slate-600 placeholder:font-sans"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Handover', 'Intake'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log List */}
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-sm p-4 hover:bg-slate-900/80 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getIconForType(log.type)}
                  <span className="font-bold text-slate-200 text-sm">{log.event}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-sm border border-slate-800">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Log ID</span>
                  <span className="font-mono text-xs text-slate-300">{log.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Actor</span>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    <span className="font-mono text-xs text-slate-300">{log.actor}</span>
                  </div>
                </div>
              </div>

              {log.uuid && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Asset UUID</span>
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-950/30 px-2 py-1 rounded-sm border border-indigo-900/50 inline-block">
                    {log.uuid}
                  </span>
                </div>
              )}

              <div className="bg-slate-900 p-3 rounded-sm border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Details</span>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">{log.details}</p>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 bg-slate-950 border border-slate-800 border-dashed rounded-sm">
              <p className="text-slate-500 font-mono text-sm">NO AUDIT LOGS FOUND</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper icons removed as they are now imported from lucide-react
