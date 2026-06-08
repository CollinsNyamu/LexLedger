import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const token = body?.token;

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const { data: invitation, error: invitationError } = await admin
    .from('client_invitations')
    .select('id, attorney_id, matter_id, client_email, status, expires_at')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

    if (invitationError || !invitation) {
        const { data: debugInvite, error: debugError } = await admin
          .from('client_invitations')
          .select('token, status, client_email, expires_at')
          .eq('token', token)
          .maybeSingle();
      
        return NextResponse.json(
          {
            error: 'Invalid or expired invitation',
            tokenReceived: token,
            debugInvite,
            debugError: debugError?.message ?? null,
            now: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

  if (user.email?.toLowerCase() !== invitation.client_email.toLowerCase()) {
    return NextResponse.json(
      { error: 'This invitation belongs to a different email address.' },
      { status: 403 }
    );
  }

  await admin.from('profiles').upsert({
    id: user.id,
    email: user.email,
    role: 'client',
    onboarding_completed: true,
  });

  const { error: accessError } = await admin
  .from('client_matter_access')
  .upsert(
    {
      client_id: user.id,
      matter_id: invitation.matter_id,
      attorney_id: invitation.attorney_id,
    },
    {
      onConflict: 'client_id,matter_id',
    }
  );

  if (accessError) {
    return NextResponse.json({ error: accessError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from('client_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      client_id: user.id,
    })
    .eq('id', invitation.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}