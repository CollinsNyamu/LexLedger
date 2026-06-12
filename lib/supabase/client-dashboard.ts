import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type ClientMatter = {
  id: string;
  name: string;
  clientName: string;
  matterType: string;
  budget: number;
  expectedSpend: number;
  status: 'active' | 'closed';
};

export type ClientActivityEntry = {
  id: string;
  matterId: string;
  source: 'email' | 'meeting' | 'slack';
  timestamp: string;
  subject: string;
  contact: string;
  company: string;
  hours: number;
  summary: string;
};

export type ClientDashboardData = {
  matters: ClientMatter[];
  entries: ClientActivityEntry[];
};

type AccessRow = {
  matters: {
    id: string;
    name: string;
    client_name: string;
    matter_type: string;
    budget: number | null;
    expected_spend: number | null;
    status: 'active' | 'closed';
  }[] | null;
};

type ActivityRow = {
  id: string;
  matter_id: string;
  source: 'email' | 'meeting' | 'slack' | null;
  timestamp_label: string | null;
  subject: string | null;
  contact: string | null;
  company: string | null;
  hours: number | null;
  client_summary: string | null;
};

export async function getClientDashboardData(clientId: string): Promise<ClientDashboardData> {
  const { data: accessRows, error: accessError } = await supabase
    .from('client_matter_access')
    .select(`
      matters (
        id,
        name,
        client_name,
        matter_type,
        budget,
        expected_spend,
        status
      )
    `)
    .eq('client_id', clientId);

  if (accessError) throw accessError;

  const matters = (accessRows ?? [])
    .flatMap((row: AccessRow) => row.matters ?? [])
    .map((matter) => ({
      id: matter.id,
      name: matter.name,
      clientName: matter.client_name,
      matterType: matter.matter_type,
      budget: Number(matter.budget ?? 0),
      expectedSpend: Number(matter.expected_spend ?? 0),
      status: matter.status,
    }));

  const matterIds = matters.map((matter) => matter.id);

  if (matterIds.length === 0) {
    return {
      matters: [],
      entries: [],
    };
  }

  const { data: entryRows, error: entriesError } = await supabase
    .from('activity_entries')
    .select(`
      id,
      matter_id,
      source,
      timestamp_label,
      subject,
      contact,
      company,
      hours,
      client_summary
    `)
    .in('matter_id', matterIds)
    .eq('status', 'approved')
    .eq('client_visible', true)
    .order('created_at', { ascending: false });

  if (entriesError) throw entriesError;

  const entries = (entryRows ?? []).map((entry: ActivityRow) => ({
    id: entry.id,
    matterId: entry.matter_id,
    source: entry.source ?? 'email',
    timestamp: entry.timestamp_label ?? '',
    subject: entry.subject ?? '',
    contact: entry.contact ?? '',
    company: entry.company ?? '',
    hours: Number(entry.hours ?? 0),
    summary: entry.client_summary ?? 'Work completed on this matter.',
  }));

  return {
    matters,
    entries,
  };
}