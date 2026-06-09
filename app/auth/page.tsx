import { Suspense } from 'react';
import { AppProvider } from '@/components/app-context';
import { AuthPage } from '@/components/auth-page';

export default function AuthRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0E14] text-[#E8E6DF] flex items-center justify-center">
        Loading...
      </div>}>
      <AppProvider>
        <AuthPage />
      </AppProvider>
    </Suspense>
  );
}