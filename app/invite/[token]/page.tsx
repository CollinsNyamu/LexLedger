import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invitation, error } = await supabase
    .from('client_invitations')
    .select(`
      id,
      client_email,
      status,
      expires_at,
      matters (
        id,
        name,
        client_name,
        matter_type,
        budget
      )
    `)
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !invitation) {
    notFound();
  }

  const matter = Array.isArray(invitation.matters)
    ? invitation.matters[0]
    : invitation.matters;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          LexLedger Client Invitation
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          You&apos;ve been invited to a client portal
        </h1>

        <p className="mt-4 text-white/70">
          Your law firm has invited you to view matter transparency updates through LexLedger.
        </p>

        <div className="mt-8 space-y-3 rounded-xl border border-white/10 bg-black/30 p-5">
          <div>
            <p className="text-sm text-white/50">Client email</p>
            <p>{invitation.client_email}</p>
          </div>

          <div>
            <p className="text-sm text-white/50">Matter</p>
            <p>{matter?.name ?? 'Matter'}</p>
          </div>

          <div>
            <p className="text-sm text-white/50">Matter type</p>
            <p>{matter?.matter_type ?? 'Not specified'}</p>
          </div>

          <div>
            <p className="text-sm text-white/50">Budget</p>
            <p>${Number(matter?.budget ?? 0).toLocaleString()}</p>
          </div>
        </div>

        <a
          href={`/auth?mode=create&role=client&token=${encodeURIComponent(token)}&email=${encodeURIComponent(invitation.client_email)}`}
          className="mt-8 block rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-500"
        >
          Accept invitation
        </a>
      </div>
    </main>
  );
}