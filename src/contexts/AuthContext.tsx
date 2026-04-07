import React, { createContext, useContext, useState } from 'react';

export type Role = 'STUDENT' | 'SECURITY' | null;
export type LoginMethod = 'EMAIL' | 'ERP' | null;

interface UserProfile {
  name: string;
  erp: string;
  email: string;
}

interface AuthContextType {
  userRole: Role;
  loginMethod: LoginMethod;
  isVerified: boolean;
  profile: UserProfile;
  ocrAttempts: number;
  login: (role: Role, method?: LoginMethod) => void;
  logout: () => void;
  verifyUser: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  incrementOcrAttempts: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [ocrAttempts, setOcrAttempts] = useState<number>(0);
  const [profile, setProfile] = useState<UserProfile>({ name: '', erp: '', email: '' });

  const login = (role: Role, method: LoginMethod = 'EMAIL', explicitId: string = '') => {
    setUserRole(role);
    setLoginMethod(method);
    setIsVerified(false);
    setOcrAttempts(0);
    setProfile({ 
      name: '', 
      erp: method === 'ERP' ? (explicitId || '12345678') : '', 
      email: method === 'EMAIL' ? (explicitId || 'student@dypvp.edu.in') : '' 
    });
  };

  const logout = () => {
    setUserRole(null);
    setLoginMethod(null);
    setIsVerified(false);
    setOcrAttempts(0);
    setProfile({ name: '', erp: '', email: '' });
  };

  const verifyUser = () => setIsVerified(true);
  
  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const incrementOcrAttempts = () => setOcrAttempts(prev => prev + 1);

  return (
    <AuthContext.Provider value={{ userRole, loginMethod, isVerified, profile, ocrAttempts, login, logout, verifyUser, updateProfile, incrementOcrAttempts }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
