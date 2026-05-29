'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { UserProfile, Matter, ActivityEntry, AppView, OnboardingStep } from '@/lib/types';
import { PRESET_PROFILE, PRESET_ENTRIES, generateEntriesForMatters } from '@/lib/mock-data';

interface AppState {
  view: AppView;
  onboardingStep: OnboardingStep;
  profile: UserProfile | null;
  connectedPlatforms: string[];
  matters: Matter[];
  entries: ActivityEntry[];
}

interface AppContextValue extends AppState {
  setView: (view: AppView) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setProfile: (profile: UserProfile) => void;
  connectPlatform: (platform: string) => void;
  disconnectPlatform: (platform: string) => void;
  addMatter: (matter: Matter) => void;
  removeMatter: (id: string) => void;
  approveEntry: (id: string) => void;
  discardEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<ActivityEntry>) => void;
  approveAllEntries: () => number;
  loginWithPreset: () => void;
  finishOnboarding: () => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    view: 'auth',
    onboardingStep: 1,
    profile: null,
    connectedPlatforms: [],
    matters: [],
    entries: [],
  });

  const setView = useCallback((view: AppView) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const setOnboardingStep = useCallback((onboardingStep: OnboardingStep) => {
    setState(prev => ({ ...prev, onboardingStep }));
  }, []);

  const setProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const connectPlatform = useCallback((platform: string) => {
    setState(prev => ({
      ...prev,
      connectedPlatforms: [...prev.connectedPlatforms, platform],
    }));
  }, []);

  const disconnectPlatform = useCallback((platform: string) => {
    setState(prev => ({
      ...prev,
      connectedPlatforms: prev.connectedPlatforms.filter(p => p !== platform),
    }));
  }, []);

  const addMatter = useCallback((matter: Matter) => {
    setState(prev => ({
      ...prev,
      matters: [...prev.matters, matter],
    }));
  }, []);

  const removeMatter = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      matters: prev.matters.filter(m => m.id !== id),
    }));
  }, []);

  const approveEntry = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, status: 'approved' as const } : e
      ),
    }));
  }, []);

  const discardEntry = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, status: 'discarded' as const } : e
      ),
    }));
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<ActivityEntry>) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const approveAllEntries = useCallback(() => {
    let count = 0;
    setState(prev => {
      const pendingEntries = prev.entries.filter(e => e.status === 'pending');
      count = pendingEntries.length;
      return {
        ...prev,
        entries: prev.entries.map(e =>
          e.status === 'pending' ? { ...e, status: 'approved' as const } : e
        ),
      };
    });
    return count;
  }, []);

  const loginWithPreset = useCallback(() => {
    setState(prev => ({
      ...prev,
      profile: PRESET_PROFILE,
      entries: PRESET_ENTRIES,
      view: 'dashboard',
    }));
  }, []);

  const finishOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      entries: generateEntriesForMatters(prev.matters, prev.profile?.hourlyRate || 0),
      view: 'dashboard',
    }));
  }, []);

  const signOut = useCallback(() => {
    setState({
      view: 'auth',
      onboardingStep: 1,
      profile: null,
      connectedPlatforms: [],
      matters: [],
      entries: [],
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setView,
        setOnboardingStep,
        setProfile,
        connectPlatform,
        disconnectPlatform,
        addMatter,
        removeMatter,
        approveEntry,
        discardEntry,
        updateEntry,
        approveAllEntries,
        loginWithPreset,
        finishOnboarding,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
