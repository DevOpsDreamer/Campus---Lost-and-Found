import React, { createContext, useContext, useState, ReactNode } from 'react';
import LiveScannerModal from '../components/LiveScannerModal';

interface ScannerContextType {
  openScanner: (onScan: (result: string) => void, title?: string, description?: string) => void;
  closeScanner: () => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export function ScannerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanCallback, setScanCallback] = useState<((result: string) => void) | null>(null);
  const [title, setTitle] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();

  const openScanner = (onScan: (result: string) => void, t?: string, d?: string) => {
    setScanCallback(() => onScan);
    setTitle(t);
    setDescription(d);
    setIsOpen(true);
  };

  const closeScanner = () => {
    setIsOpen(false);
    setScanCallback(null);
  };

  return (
    <ScannerContext.Provider value={{ openScanner, closeScanner }}>
      {children}
      {isOpen && scanCallback && (
        <LiveScannerModal
          onScan={(res) => {
            scanCallback(res);
            closeScanner();
          }}
          onClose={closeScanner}
          title={title}
          description={description}
        />
      )}
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  const context = useContext(ScannerContext);
  if (context === undefined) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
}
