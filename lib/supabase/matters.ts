import { createClient } from '@/lib/supabase/client';
import type { Matter } from '@/lib/types';

const supabase = createClient();

type MatterRow = {
  id: string;
  name: string;
  client_name: string;
  matter_type: string;
  client_email: string;
};

export async function createMatter(matter: Matter): Promise<Matter> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('You must be logged in to create a matter.');

  const { data, error } = await supabase
    .from('matters')
    .insert({
      attorney_id: user.id,
      name: matter.name,
      client_name: matter.clientName,
      matter_type: matter.matterType,
      client_email: matter.clientEmail,
      status: 'active',
    })
    .select('id, name, client_name, matter_type, client_email')
    .single();

  if (error) throw error;

  return mapMatter(data);
}

export async function closeMatter(id: string): Promise<void> {
  const { error } = await supabase
    .from('matters')
    .update({ status: 'closed' })
    .eq('id', id);

  if (error) throw error;
}

function mapMatter(row: MatterRow): Matter {
  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    matterType: row.matter_type,
    clientEmail: row.client_email,
  };
}