import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const matterId = body?.matterId;
  const clientEmail = body?.clientEmail;
  console.log('INVITE DEBUG user.id:', user.id);
  console.log('INVITE DEBUG matterId:', matterId);
  console.log('INVITE DEBUG clientEmail:', clientEmail);

  if (!matterId || !clientEmail) {
    return NextResponse.json(
      { error: 'matterId and clientEmail are required' },
      { status: 400 }
    );
  }

  const { data: matter, error: matterError } = await supabase
    .from('matters')
    .select('id, attorney_id, client_email')
    .eq('id', matterId)
    .eq('attorney_id', user.id)
    .single();

    if (matterError || !matter) {
        const { data: existingMatter } = await supabase
          .from('matters')
          .select('id, attorney_id, name, client_email')
          .eq('id', matterId)
          .maybeSingle();
      
        console.log('INVITE DEBUG existingMatter:', existingMatter);
        console.log('INVITE DEBUG matterError:', matterError);
      
        return NextResponse.json(
          {
            error: 'Matter not found or not accessible',
            loggedInUserId: user.id,
            existingMatter,
            matterError: matterError?.message ?? null,
          },
          { status: 404 }
        );
      }

  const { data: invitation, error: invitationError } = await supabase
    .from('client_invitations')
    .insert({
      attorney_id: user.id,
      matter_id: matter.id,
      client_email: clientEmail,
    })
    .select('id, token, client_email, expires_at, status')
    .single();

  if (invitationError || !invitation) {
    return NextResponse.json(
      { error: invitationError?.message ?? 'Could not create invitation' },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const inviteUrl = `${appUrl}/invite/${invitation.token}`;

  return NextResponse.json({
    invitation,
    inviteUrl,
  });
}