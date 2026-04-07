/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScannerProvider } from './contexts/ScannerContext';
import LoginPortal from './components/LoginPortal';
import AppShell from './components/AppShell';
import FoundItemForm from './components/FoundItemForm';
import LostItemForm from './components/LostItemForm';
import HomeDashboard from './components/HomeDashboard';
import SecureItemDetail from './components/SecureItemDetail';
import MyQRAssets from './components/MyQRAssets';
import SecurityDashboard from './components/SecurityDashboard';
import IntakeDashboard from './components/IntakeDashboard';
import MasterAudit from './components/MasterAudit';
import ProfileHub from './components/ProfileHub';
import FlaggedUsers from './components/FlaggedUsers';
import VerificationGateway from './components/VerificationGateway';

export interface FoundItem {
  id: string;
  title: string;
  category: string;
  location: string;
  timeAgo: string;
  status: string;
  imageUrl: string;
}

export interface Claim {
  erp: string;
  status: 'Provisional Match' | 'Low Confidence' | 'Pending Review';
  timestamp: string;
}

export interface PendingItem {
  id: string;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  imageUrl: string;
  claims: Claim[];
}

export interface ItemHistoryEvent {
  id: string;
  timestamp: string;
  event: string;
  type: 'Success' | 'Failure' | 'Info';
  details: string;
}

export interface InventoryItem {
  uuid: string;
  categories: string[];
  status: 'AWAITING CLAIM' | 'READY FOR PICKUP' | 'RELEASED';
  location: string;
  claimantErp?: string;
  history: ItemHistoryEvent[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  type: 'Handover' | 'Failed Claim' | 'AI Scan' | 'Login' | 'Deposit' | 'Intake';
  uuid?: string;
  actor: string;
  details: string;
}

const INITIAL_ITEMS: FoundItem[] = [
  {
    id: '1',
    title: 'MacBook Pro 14"',
    category: 'Electronics',
    location: 'Library 2nd Floor',
    timeAgo: '10 mins ago',
    status: 'At Security Desk',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: '2',
    title: 'Blue Hydroflask',
    category: 'Other',
    location: 'Student Union',
    timeAgo: '1 hour ago',
    status: 'Pending Verification',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400&h=300',
  },
  {
    id: '3',
    title: 'Student ID Card',
    category: 'ID/Wallet',
    location: 'Science Building',
    timeAgo: '3 hours ago',
    status: 'At Security Desk',
    imageUrl: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=400&h=300',
  },
];

const INITIAL_PENDING_ITEMS: PendingItem[] = [
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

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    uuid: 'UUID-9876',
    categories: ['Electronics', 'Black', 'MacBook'],
    status: 'READY FOR PICKUP',
    location: 'Locker B4',
    claimantErp: 'ERP-12345678',
    history: [
      { id: 'HIST-1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), event: 'Claim Rejected', type: 'Failure', details: 'ERP-9999 failed visual verification.' },
      { id: 'HIST-2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), event: 'Physical Intake Verified', type: 'Info', details: 'Moved from Amnesty Box to Vault' }
    ]
  },
  {
    uuid: 'UUID-4521',
    categories: ['Accessories', 'Blue', 'HydroFlask'],
    status: 'AWAITING CLAIM',
    location: 'Shelf A2',
    history: [
      { id: 'HIST-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), event: 'Physical Intake Verified', type: 'Info', details: 'Moved from Amnesty Box to Vault' }
    ]
  },
  {
    uuid: 'UUID-8832',
    categories: ['ID/Wallet', 'Leather', 'Brown'],
    status: 'AWAITING CLAIM',
    location: 'Safe 1',
    history: [
      { id: 'HIST-4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), event: 'Physical Intake Verified', type: 'Info', details: 'Moved from Amnesty Box to Vault' }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-1001', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), event: 'Item Handover Complete', type: 'Handover', uuid: 'UUID-1122', actor: 'SEC-09', details: 'Verified student ID against ERP-55554444' },
  { id: 'LOG-1002', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), event: 'Claim Rejected', type: 'Failed Claim', uuid: 'UUID-9876', actor: 'SYSTEM', details: 'Low confidence match. Manual review required.' },
  { id: 'LOG-1003', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), event: 'AI Image Scan', type: 'AI Scan', uuid: 'INT-001', actor: 'AI-VLV', details: 'Detected: MacBook, Black, Electronics. Confidence: 98%' },
  { id: 'LOG-1004', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), event: 'Amnesty Box Deposit', type: 'Deposit', uuid: 'INT-001', actor: 'UNKNOWN', details: 'Sensor triggered at Main Gate' },
];

function AppContent() {
  const { userRole, isVerified } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'found' | 'lost' | 'profile' | 'intake' | 'inventory' | 'audit' | 'qr-assets' | 'flagged-users'>('home');
  const [items, setItems] = useState<FoundItem[]>(INITIAL_ITEMS);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(INITIAL_PENDING_ITEMS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);

  useEffect(() => {
    if (userRole === 'SECURITY' && ['home', 'found', 'lost'].includes(activeTab)) {
      setActiveTab('intake');
    } else if (userRole === 'STUDENT' && ['intake', 'inventory', 'audit'].includes(activeTab)) {
      setActiveTab('home');
    }
  }, [userRole, activeTab]);

  const handleVerifyIntake = (id: string) => {
    const item = pendingItems.find(i => i.id === id);
    if (item) {
      setPendingItems(pendingItems.filter(i => i.id !== id));
      const newUuid = `UUID-${Math.floor(1000 + Math.random() * 9000)}`;
      setInventory([{
        uuid: newUuid,
        categories: [item.title.split(' ')[0], 'Other'],
        status: item.claims.length > 0 ? 'READY FOR PICKUP' : 'AWAITING CLAIM',
        location: 'Vault - Shelf ' + Math.floor(Math.random() * 10),
        claimantErp: item.claims[0]?.erp,
        history: [{
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          event: 'Physical Intake Verified',
          type: 'Info',
          details: `Moved from ${item.location} to Vault`
        }]
      }, ...inventory]);
      setAuditLogs([{
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        event: 'Physical Intake Verified',
        type: 'Intake',
        uuid: newUuid,
        actor: 'SEC-09',
        details: `Moved from ${item.location} to Vault`
      }, ...auditLogs]);
    }
  };

  const handleAuthorizeRelease = (uuid: string) => {
    setInventory(inventory.map(item => 
      item.uuid === uuid ? { 
        ...item, 
        status: 'RELEASED',
        history: [{
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          event: 'Handover Complete',
          type: 'Success',
          details: 'Authorized release to student'
        }, ...item.history]
      } : item
    ));
    setAuditLogs([{
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      event: 'Item Handover Complete',
      type: 'Handover',
      uuid: uuid,
      actor: 'SEC-09',
      details: 'Authorized release to student'
    }, ...auditLogs]);
  };

  const handleRejectHandover = (uuid: string, reason: string) => {
    setInventory(inventory.map(item => 
      item.uuid === uuid ? { 
        ...item,
        history: [{
          id: `HIST-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          event: 'Handover Aborted',
          type: 'Failure',
          details: reason
        }, ...item.history]
      } : item
    ));
    // We don't log this to Master Audit per instructions, only to item history.
  };

  const handleVerify = (id: string, newLocation: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, status: 'Verified & Ready for Pickup', location: newLocation } 
        : item
    ));
    setSelectedItem(null);
  };

  if (!userRole) {
    return <LoginPortal />;
  }

  if (selectedItem) {
    return (
      <SecureItemDetail 
        item={selectedItem} 
        onBack={() => setSelectedItem(null)} 
      />
    );
  }

  return (
    <AppShell activeTab={['qr-assets', 'flagged-users'].includes(activeTab) ? 'profile' : activeTab as any} onTabChange={setActiveTab as any}>
      {activeTab === 'home' && <HomeDashboard items={items} onItemClick={setSelectedItem} />}
      {activeTab === 'found' && (
        <VerificationGateway>
          <FoundItemForm />
        </VerificationGateway>
      )}
      {activeTab === 'lost' && (
        <VerificationGateway>
          <LostItemForm />
        </VerificationGateway>
      )}
      {activeTab === 'profile' && <ProfileHub onNavigateToAssets={() => setActiveTab('qr-assets')} onNavigateToFlaggedUsers={() => setActiveTab('flagged-users')} />}
      {activeTab === 'qr-assets' && <MyQRAssets onBack={() => setActiveTab('profile')} />}
      {activeTab === 'flagged-users' && <FlaggedUsers onBack={() => setActiveTab('profile')} />}
      {activeTab === 'intake' && userRole === 'SECURITY' && <IntakeDashboard pendingItems={pendingItems} onVerifyIntake={handleVerifyIntake} />}
      {activeTab === 'inventory' && userRole === 'SECURITY' && <SecurityDashboard inventory={inventory} onAuthorizeRelease={handleAuthorizeRelease} onRejectHandover={handleRejectHandover} />}
      {activeTab === 'audit' && userRole === 'SECURITY' && <MasterAudit logs={auditLogs} pendingCount={pendingItems.length} vaultedCount={inventory.filter(i => i.status !== 'RELEASED').length} releasedCount={inventory.filter(i => i.status === 'RELEASED').length} />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScannerProvider>
        <AppContent />
      </ScannerProvider>
    </AuthProvider>
  );
}
