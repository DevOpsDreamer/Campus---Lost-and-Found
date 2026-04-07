import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { XCircle, Camera, Keyboard, AlertTriangle } from 'lucide-react';

interface LiveScannerModalProps {
  onScan: (result: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function LiveScannerModal({ onScan, onClose, title = "Scan QR Code", description = "Position the QR code within the frame." }: LiveScannerModalProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
          <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm flex items-center gap-2">
            <Camera size={16} className="text-emerald-500" />
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto flex flex-col">
          <p className="text-slate-400 text-sm text-center mb-6">{description}</p>
          
          <div className="flex-1 flex flex-col justify-center relative min-h-[300px]">
            {!manualMode ? (
              <div className="rounded-xl overflow-hidden border-2 border-slate-700 relative bg-black aspect-square w-full max-w-[300px] mx-auto">
                {error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900">
                    <AlertTriangle size={32} className="text-amber-500 mb-3" />
                    <p className="text-sm text-slate-300 font-medium">Camera Access Denied</p>
                    <p className="text-xs text-slate-500 mt-1">Please allow camera permissions in your browser settings to use the scanner.</p>
                  </div>
                ) : (
                  <Scanner
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        onScan(result[0].rawValue);
                      }
                    }}
                    onError={(err) => {
                      console.error(err);
                      setError(err instanceof Error ? err.message : "Failed to access camera");
                    }}
                    components={{
                      finder: false,
                    }}
                    styles={{
                      container: { width: '100%', height: '100%' },
                    }}
                  />
                )}
                {/* Scanning Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-950/50">
                  <div className="w-full h-full border-2 border-emerald-500/50 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5" />
                    <div className="w-full h-0.5 bg-emerald-500/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="w-full max-w-[300px] mx-auto space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manual Entry</label>
                  <input 
                    type="text" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. UUID-9876 or AUTH-9X2B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                >
                  Submit Code
                </button>
              </form>
            )}
          </div>

          <button 
            onClick={() => {
              setManualMode(!manualMode);
              setError(null);
            }}
            className="mt-6 w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 flex items-center justify-center gap-2 uppercase tracking-wider text-xs shrink-0"
          >
            {manualMode ? (
              <>
                <Camera size={16} />
                Switch to Camera
              </>
            ) : (
              <>
                <Keyboard size={16} />
                Toggle Camera / Type UUID Manually
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
