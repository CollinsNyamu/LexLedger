'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { UserProfile, Matter, ActivityEntry, AppView, OnboardingStep } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
  getAttorneyDashboardData,
  updateActivityEntryStatus,
  updateActivityEntry as updateActivityEntryInDb,
  approveAllPendingActivityEntries,
  approvePendingActivityEntriesByMatterName,
} from '@/lib/supabase/dashboard';

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
  approveEntry: (id: string) => Promise<void>;
  discardEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<ActivityEntry>) => Promise<void>;
  approveAllEntries: () => Promise<number>;
  approveFilteredEntries: (matterFilter: string | null) => Promise<{ count: number; matterName: string | null }>;
  signOut: () => Promise<void>;
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

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const data = await getAttorneyDashboardData(session.user.id);

      setState(prev => ({
        ...prev,
        profile: data.profile,
        matters: data.matters,
        entries: data.entries,
        view: 'dashboard',
      }));
    }

    loadDashboardData();
  }, []);

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

  const approveEntry = useCallback(async (id: string) => {
    await updateActivityEntryStatus(id, 'approved');

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, status: 'approved' as const } : e
      ),
    }));
  }, []);

  const discardEntry = useCallback(async (id: string) => {
    await updateActivityEntryStatus(id, 'discarded');

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, status: 'discarded' as const } : e
      ),
    }));
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<ActivityEntry>) => {
    await updateActivityEntryInDb(id, updates);

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const approveAllEntries = useCallback(async () => {
    const count = state.entries.filter(e => e.status === 'pending').length;

    await approveAllPendingActivityEntries();

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.status === 'pending' ? { ...e, status: 'approved' as const } : e
      ),
    }));

    return count;
  }, [state.entries]);

  const approveFilteredEntries = useCallback(async (matterFilter: string | null) => {
    const count = state.entries.filter(e =>
      e.status === 'pending' && (matterFilter === null || e.matterName === matterFilter)
    ).length;

    if (matterFilter === null) {
      await approveAllPendingActivityEntries();
    } else {
      await approvePendingActivityEntriesByMatterName(matterFilter);
    }

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.status === 'pending' && (matterFilter === null || e.matterName === matterFilter)
          ? { ...e, status: 'approved' as const }
          : e
      ),
    }));

    return { count, matterName: matterFilter };
  }, [state.entries]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();

    setState({
      view: 'auth',
      onboardingStep: 1,
      profile: null,
      connectedPlatforms: [],
      matters: [],
      entries: [],
    });

    window.location.href = '/auth';
  }, [supabase]);

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
        approveFilteredEntries,
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