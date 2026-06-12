import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'client') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#0C0E14] text-[#E8E6DF] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Client dashboard</h1>
            <p className="text-[#6B7080]">
              Welcome{profile.full_name ? `, ${profile.full_name}` : ''}.
            </p>
          </div>
  
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-[#2A2D3E] px-4 py-2 text-sm text-[#B0AFA8] hover:border-[#4A4F62] transition-colors">
              Sign out
            </button>
          </form>
        </div>
  
        <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-8">
          <p className="text-[#E8E6DF] font-medium">Client portal coming soon.</p>
          <p className="text-sm text-[#6B7080] mt-2">
            This is where clients will see matter progress, approved work summaries,
            budget burn, and expected spend.
          </p>
        </div>
      </div>
    </main>
  );
}