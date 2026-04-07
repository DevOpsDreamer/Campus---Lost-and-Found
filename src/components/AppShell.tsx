import React from 'react';
import { Home, Camera, Search, User, ShieldCheck, LogOut, Inbox, Database, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * AppShell Component
 * 
 * Establishes the Mobile-First Progressive Web Application (PWA) layout.
 * Features a fixed bottom navigation bar for thumb-friendly ergonomics and a 
 * top app bar establishing "Institutional Trust" via the Verified Campus badge.
 */
export default function AppShell({ 
  children, 
  activeTab = 'home',
  onTabChange 
}: { 
  children: React.ReactNode;
  activeTab?: 'home' | 'found' | 'lost' | 'profile' | 'intake' | 'inventory' | 'audit';
  onTabChange?: (tab: 'home' | 'found' | 'lost' | 'profile' | 'intake' | 'inventory' | 'audit') => void;
}) {
  const { userRole, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-20">
      {/* Top App Bar - Institutional Branding */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">CampusTrace</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 shadow-inner">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-xs font-medium text-slate-200">Verified Campus</span>
          </div>
          <button onClick={logout} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Fixed Bottom Navigation Bar - Native App Feel */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {userRole === 'STUDENT' ? (
            <>
              <NavItem 
                icon={<Home size={24} />} 
                label="Home" 
                active={activeTab === 'home'} 
                onClick={() => onTabChange?.('home')} 
              />
              <NavItem 
                icon={<Camera size={24} />} 
                label="Found" 
                active={activeTab === 'found'} 
                onClick={() => onTabChange?.('found')} 
              />
              <NavItem 
                icon={<Search size={24} />} 
                label="Lost" 
                active={activeTab === 'lost'} 
                onClick={() => onTabChange?.('lost')} 
              />
              <NavItem 
                icon={<User size={24} />} 
                label="Profile" 
                active={activeTab === 'profile'} 
                onClick={() => onTabChange?.('profile')} 
              />
            </>
          ) : (
            <>
              <NavItem 
                icon={<Inbox size={24} />} 
                label="Intake" 
                active={activeTab === 'intake'} 
                onClick={() => onTabChange?.('intake')} 
              />
              <NavItem 
                icon={<Database size={24} />} 
                label="Inventory" 
                active={activeTab === 'inventory'} 
                onClick={() => onTabChange?.('inventory')} 
              />
              <NavItem 
                icon={<List size={24} />} 
                label="Audit" 
                active={activeTab === 'audit'} 
                onClick={() => onTabChange?.('audit')} 
              />
              <NavItem 
                icon={<User size={24} />} 
                label="Profile" 
                active={activeTab === 'profile'} 
                onClick={() => onTabChange?.('profile')} 
              />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

/**
 * NavItem Sub-component
 * 
 * Ensures large, thumb-friendly tap targets (min 44px) for mobile accessibility.
 */
function NavItem({ 
  icon, 
  label, 
  active = false,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}
