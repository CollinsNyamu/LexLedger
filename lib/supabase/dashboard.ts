import { createClient } from '@/lib/supabase/client';
import type { UserProfile, Matter, ActivityEntry } from '@/lib/types';

const supabase = createClient();

type ProfileRow = {
  full_name: string | null;
  email: string;
  law_firm: string | null;
  hourly_rate: number | null;
  practice_area: string | null;
};

type MatterRow = {
  id: string;
  name: string;
  client_name: string;
  matter_type: string;
  client_email: string;
};

type ActivityEntryRow = {
  id: string;
  source: 'email' | 'meeting' | 'slack' | null;
  timestamp_label: string | null;
  subject: string | null;
  contact: string | null;
  company: string | null;
  hours: number | null;
  narrative: string | null;
  has_attachment: boolean;
  status: 'pending' | 'approved' | 'discarded';
  matters: {
    name: string;
  }[] | null;
};

export async function getAttorneyDashboardData(userId: string): Promise<{
  profile: UserProfile | null;
  matters: Matter[];
  entries: ActivityEntry[];
}> {
  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email, law_firm, hourly_rate, practice_area')
    .eq('id', userId)
    .eq('role', 'attorney')
    .single();

  if (profileError) throw profileError;

  const { data: matterRows, error: mattersError } = await supabase
    .from('matters')
    .select('id, name, client_name, matter_type, client_email')
    .eq('attorney_id', userId)
    .order('created_at', { ascending: false });

  if (mattersError) throw mattersError;

  const { data: entryRows, error: entriesError } = await supabase
    .from('activity_entries')
    .select(`
      id,
      source,
      timestamp_label,
      subject,
      contact,
      company,
      hours,
      narrative,
      has_attachment,
      status,
      matters (
        name
      )
    `)
    .eq('attorney_id', userId)
    .order('created_at', { ascending: false });

  if (entriesError) throw entriesError;

  return {
    profile: mapProfile(profileRow),
    matters: (matterRows ?? []).map(mapMatter),
    entries: (entryRows ?? []).map(mapActivityEntry),
  };
}

export async function updateActivityEntryStatus(
  id: string,
  status: 'pending' | 'approved' | 'discarded'
) {
  const { error } = await supabase
    .from('activity_entries')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function updateActivityEntry(
  id: string,
  updates: Partial<ActivityEntry>
) {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
  if (updates.narrative !== undefined) dbUpdates.narrative = updates.narrative;
  if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
  if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
  if (updates.company !== undefined) dbUpdates.company = updates.company;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.hasAttachment !== undefined) dbUpdates.has_attachment = updates.hasAttachment;
  if (updates.timestamp !== undefined) dbUpdates.timestamp_label = updates.timestamp;
  if (updates.source !== undefined) dbUpdates.source = updates.source;

  const { error } = await supabase
    .from('activity_entries')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
}

export async function approveAllPendingActivityEntries() {
  const { error } = await supabase
    .from('activity_entries')
    .update({ status: 'approved' })
    .eq('status', 'pending');

  if (error) throw error;
}

export async function approvePendingActivityEntriesByMatterName(matterName: string) {
  const { data: matterRows, error: matterError } = await supabase
    .from('matters')
    .select('id')
    .eq('name', matterName);

  if (matterError) throw matterError;

  const matterIds = (matterRows ?? []).map(matter => matter.id);

  if (matterIds.length === 0) return;

  const { error } = await supabase
    .from('activity_entries')
    .update({ status: 'approved' })
    .eq('status', 'pending')
    .in('matter_id', matterIds);

  if (error) throw error;
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    fullName: row.full_name ?? '',
    email: row.email,
    lawFirm: row.law_firm ?? '',
    hourlyRate: Number(row.hourly_rate ?? 0),
    practiceArea: row.practice_area ?? '',
  };
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

function mapActivityEntry(row: ActivityEntryRow): ActivityEntry {
  return {
    id: row.id,
    source: row.source ?? 'email',
    timestamp: row.timestamp_label ?? '',
    subject: row.subject ?? '',
    contact: row.contact ?? '',
    company: row.company ?? '',
    hours: Number(row.hours ?? 0),
    narrative: row.narrative ?? '',
    hasAttachment: row.has_attachment,
    status: row.status,
    matterName: row.matters?.[0]?.name,
  };
}