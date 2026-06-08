import { Suspense } from 'react';
import { AuthPage } from '@/components/auth-page';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0C0E14] text-white flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <AuthPage />
    </Suspense>
  );
}