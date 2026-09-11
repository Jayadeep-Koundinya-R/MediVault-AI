import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UnifiedRecord, 
  RiskFlag, 
  Summary, 
  ToastMessage, 
  FilterState, 
  FamilyMember,
  RecordType,
  Prescription,
  LabResult,
  Vaccination
} from '../types';
import { authService } from '../services/authService';
import { recordService } from '../services/recordService';
import { summaryService } from '../services/summaryService';
import { ocrService } from '../services/ocrService';
import { supabase } from '../lib/supabase/client';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  records: UnifiedRecord[];
  flags: RiskFlag[];
  summary: Summary | null;
  toasts: ToastMessage[];
  filter: FilterState;
  familyMembers: FamilyMember[];
  ocrMode: 'default' | 'high' | 'low' | 'failed' | 'mismatch';
  
  // Auth
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  signup: (name: string, email: string, pass: string, dob: string) => Promise<void>;
  recordConsent: () => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (name: string, dob: string, email: string) => void;

  // Records & Operations
  addRecord: (params: {
    type: RecordType;
    title: string;
    sourceName: string;
    imageUrl?: string;
    prescription?: Omit<Prescription, 'id' | 'documentId' | 'userId'>;
    labResults?: Omit<LabResult, 'id' | 'documentId' | 'userId'>[];
    vaccination?: Omit<Vaccination, 'id' | 'documentId' | 'userId'>;
  }) => UnifiedRecord;
  deleteRecord: (id: string) => void;
  acknowledgeFlag: (id: string) => void;
  generateSummary: () => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;

  // UI helpers
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;

  // Demo Controls
  loadDemoData: () => void;
  clearDemoData: () => void;
  setOcrMode: (mode: 'default' | 'high' | 'low' | 'failed' | 'mismatch') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [records, setRecords] = useState<UnifiedRecord[]>([]);
  const [flags, setFlags] = useState<RiskFlag[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [ocrMode, setOcrModeState] = useState<'default' | 'high' | 'low' | 'failed' | 'mismatch'>('default');

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: 'fm_01', name: 'Sunita Sharma', dateOfBirth: '1975-04-12', relationship: 'Mother' },
    { id: 'fm_02', name: 'Ramesh Sharma', dateOfBirth: '1972-09-24', relationship: 'Father' }
  ]);

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    types: [],
    dateRange: 'all',
    source: ''
  });

  const refreshData = async () => {
    try {
      await recordService.syncFromRemote();
    } catch (e) {
      console.warn('Sync note:', e);
    }
    const unified = recordService.getUnifiedRecords();
    setRecords(unified);
    setFlags(recordService.getRiskFlags());
    const s = await summaryService.fetchLatestSummary();
    if (s) {
      setSummary(s);
    } else {
      setSummary(summaryService.getSummary());
    }
  };

  useEffect(() => {
    refreshData();

    // Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const { data: consent } = await supabase
            .from('health_consents')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const loggedInUser: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            dateOfBirth: profile?.date_of_birth || '1990-01-01',
            createdAt: session.user.created_at,
            consentGiven: consent?.consented ?? true,
            consentDate: consent?.consented_at || undefined,
          };
          setUser(loggedInUser);
          authService.setCurrentUser(loggedInUser);
        } catch (e) {
          console.warn('Auth sync profile note:', e);
        }
      }
      refreshData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (email: string, pass: string) => {
    const u = await authService.login(email, pass);
    setUser(u);
    await refreshData();
    addToast(`Welcome back, ${u.name.split(' ')[0]}`);
  };

  const loginDemo = async () => {
    const u = await authService.loginDemo();
    setUser(u);
    await refreshData();
    addToast('Logged in as Demo Patient (Rahul Sharma)');
  };

  const signup = async (name: string, email: string, pass: string, dob: string) => {
    const u = await authService.signup(name, email, pass, dob);
    setUser(u);
    addToast('Account created. Please review data consent.');
  };

  const recordConsent = async () => {
    const u = await authService.recordConsent();
    setUser(u);
    addToast('Health data consent granted under DPDP Act');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    addToast('Logged out of HealthVault', 'info');
  };

  const resetPassword = async (email: string) => {
    const res = await authService.resetPassword(email);
    if (res) {
      addToast('Reset instructions sent to your email');
    }
    return res;
  };

  const updateProfile = async (name: string, dob: string, email: string) => {
    if (!user) return;
    const updated: User = { ...user, name, dateOfBirth: dob, email };
    authService.setCurrentUser(updated);
    setUser(updated);

    try {
      const token = await authService.getSessionToken();
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName: name, dateOfBirth: dob }),
      });
    } catch (e) {
      console.warn('Profile remote patch note:', e);
    }

    addToast('Profile updated successfully');
  };

  const addRecord = (params: {
    type: RecordType;
    title: string;
    sourceName: string;
    imageUrl?: string;
    prescription?: Omit<Prescription, 'id' | 'documentId' | 'userId'>;
    labResults?: Omit<LabResult, 'id' | 'documentId' | 'userId'>[];
    vaccination?: Omit<Vaccination, 'id' | 'documentId' | 'userId'>;
  }) => {
    const created = recordService.createRecord(params);
    refreshData();
    addToast('Record added to your timeline');
    return created;
  };

  const deleteRecord = (id: string) => {
    recordService.deleteRecord(id);
    refreshData();
    addToast('Record removed from timeline', 'info');
  };

  const acknowledgeFlag = (id: string) => {
    recordService.acknowledgeFlag(id);
    refreshData();
    addToast('Flag marked as reviewed');
  };

  const generateSummary = async () => {
    try {
      const s = await summaryService.generateSummary(records);
      setSummary(s);
      addToast('Health Summary generated with latest dynamic AI analysis');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast(msg, 'error');
      throw err;
    }
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `fm_${Date.now()}`
    };
    setFamilyMembers(prev => [...prev, newMember]);
    addToast(`Family member ${member.name} added`);
  };

  const loadDemoData = async () => {
    await recordService.resetToDemoData();
    await refreshData();
    addToast('Demo data reloaded successfully');
  };

  const clearDemoData = async () => {
    await recordService.clearAllData();
    summaryService.setSummary(null);
    await refreshData();
    addToast('Timeline cleared for testing', 'warning');
  };

  const setOcrMode = (mode: 'default' | 'high' | 'low' | 'failed' | 'mismatch') => {
    setOcrModeState(mode);
    ocrService.setSimulatedMode(mode);
    addToast(`OCR simulator set to: ${mode.toUpperCase()}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && user.consentGiven),
        records,
        flags,
        summary,
        toasts,
        filter,
        familyMembers,
        ocrMode,
        login,
        loginDemo,
        signup,
        recordConsent,
        logout,
        resetPassword,
        updateProfile,
        addRecord,
        deleteRecord,
        acknowledgeFlag,
        generateSummary,
        setFilter,
        addToast,
        removeToast,
        addFamilyMember,
        loadDemoData,
        clearDemoData,
        setOcrMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
