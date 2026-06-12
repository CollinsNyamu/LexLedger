import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientDashboardPage } from '@/components/client-dashboard-page';

export default async function ClientDashboardRoute() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'client') {
    redirect('/');
  }

  return <ClientDashboardPage />;
}