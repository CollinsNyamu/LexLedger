import { AppProvider } from '@/components/app-context';
import { AuthPage } from '@/components/auth-page';

export default function AuthRoute() {
  return (
    <AppProvider>
      <AuthPage />
    </AppProvider>
  );
}