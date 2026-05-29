'use client';

import { AppProvider, useApp } from '@/components/app-context';
import { AuthPage } from '@/components/auth-page';
import { OnboardingPage } from '@/components/onboarding-page';
import { DashboardPage } from '@/components/dashboard-page';

function AppContent() {
  const { view } = useApp();

  switch (view) {
    case 'auth':
      return <AuthPage />;
    case 'onboarding':
      return <OnboardingPage />;
    case 'dashboard':
      return <DashboardPage />;
    default:
      return <AuthPage />;
  }
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
