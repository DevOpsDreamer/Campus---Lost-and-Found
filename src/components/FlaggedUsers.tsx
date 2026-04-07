import React from 'react';
import { ArrowLeft, AlertTriangle, ShieldAlert, UserX } from 'lucide-react';

export default function FlaggedUsers({ onBack }: { onBack: () => void }) {
  const flaggedUsers = [
    {
      id: '1',
      name: 'Rahul Sharma',
      erp: '87654321',
      score: 32,
      level: 'Critical',
      reason: 'Multiple unverified claims in 24h',
      timestamp: '10:45 IST'
    },
    {
      id: '2',
      name: 'Priya Patel',
      erp: '11223344',
      score: 45,
      level: 'Warning',
      reason: 'Mismatched ID during physical handover',
      timestamp: 'Yesterday'
    },
    {
      id: '3',
      name: 'Amit Kumar',
      erp: '99887766',
      score: 50,
      level: 'Warning',
      reason: 'Repeated OTP failures at Security Desk',
      timestamp: '2 Days Ago'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-900 text-white px-5 py-6 sticky top-0 z-50 shadow-md flex items-start gap-4">
        <button onClick={onBack} className="mt-1 p-1 -ml-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flagged Users</h1>
          <p className="text-slate-400 text-sm mt-1">Trust Score Monitoring & Audits</p>
        </div>
      </header>

      <main className="p-5 max-w-md mx-auto space-y-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 mb-6">
          <ShieldAlert size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 font-medium leading-relaxed">
            Users listed below have triggered automated security heuristics. Verify physical ID before processing any claims or asset registrations for these individuals.
          </p>
        </div>

        {flaggedUsers.map(user => (
          <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.level === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <UserX size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <p className="text-xs font-mono text-slate-500">ERP: {user.erp}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${user.level === 'Critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                Score: {user.score}
              </div>
            </div>
            <div className="p-4 bg-slate-50">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-700 font-medium">{user.reason}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Flagged: {user.timestamp}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
