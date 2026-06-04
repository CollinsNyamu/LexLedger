import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,onboarding_completed')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-4">LexLedger</h1>

      <p>Successfully authenticated.</p>
      <p className="mt-4">User: {user.email}</p>
      <p>Role: {profile?.role ?? 'missing profile'}</p>
      <p>Onboarding complete: {profile?.onboarding_completed ? 'yes' : 'no'}</p>

      <form action="/auth/signout" method="post" className="mt-8">
        <button className="rounded bg-white px-4 py-2 text-black">
          Sign out
        </button>
      </form>
    </main>
  );
}