'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getClientDashboardData,
  type ClientActivityEntry,
  type ClientMatter,
} from '@/lib/supabase/client-dashboard';

type ClientProfile = {
  fullName: string;
  email: string;
};

function ClientMetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
      <p className="text-xs text-[#6B7080] mb-2">{label}</p>
      <p className="text-3xl font-mono text-[#E8E6DF] mb-1">{value}</p>
      <p className="text-sm text-[#4A4F62]">{subtitle}</p>
    </div>
  );
}

function ClientMatterCard({ matter }: { matter: ClientMatter }) {
  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
      <p className="text-xs uppercase tracking-wider text-[#4A4F62] mb-2">
        Selected matter
      </p>
      <h2 className="text-xl font-semibold text-[#E8E6DF]">{matter.name}</h2>
      <p className="text-sm text-[#6B7080] mt-1">{matter.matterType}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div>
          <p className="text-xs text-[#4A4F62]">Client</p>
          <p className="text-sm text-[#E8E6DF] mt-1">{matter.clientName}</p>
        </div>
        <div>
          <p className="text-xs text-[#4A4F62]">Budget</p>
          <p className="text-sm text-[#E8E6DF] mt-1">
            ${matter.budget.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#4A4F62]">Expected spend</p>
          <p className="text-sm text-[#E8E6DF] mt-1">
            ${matter.expectedSpend.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ClientActivityCard({ entry }: { entry: ClientActivityEntry }) {
  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-[#E8E6DF] font-medium">{entry.subject}</p>
          <p className="text-sm text-[#4A4F62] mt-1">
            {entry.source.charAt(0).toUpperCase() + entry.source.slice(1)}
            {entry.timestamp ? ` · ${entry.timestamp}` : ''}
          </p>
        </div>
        <span className="font-mono text-[#22C48A]">{entry.hours.toFixed(2)}h</span>
      </div>

      <p className="text-sm text-[#6B7080] leading-relaxed">{entry.summary}</p>
    </div>
  );
}

export function ClientDashboardPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [matters, setMatters] = useState<ClientMatter[]>([]);
  const [entries, setEntries] = useState<ClientActivityEntry[]>([]);
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClientDashboard() {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        window.location.href = '/auth';
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .eq('role', 'client')
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const data = await getClientDashboardData(user.id);

      setProfile({
        fullName: profileRow.full_name ?? '',
        email: profileRow.email,
      });
      setMatters(data.matters);
      setEntries(data.entries);
      setSelectedMatterId(data.matters[0]?.id ?? null);
      setLoading(false);
    }

    loadClientDashboard();
  }, []);

  const selectedMatter =
    matters.find((matter) => matter.id === selectedMatterId) ?? matters[0] ?? null;

  const selectedMatterEntries = selectedMatter
    ? entries.filter((entry) => entry.matterId === selectedMatter.id)
    : [];

  const visibleHours = selectedMatterEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalVisibleHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0C0E14] text-[#E8E6DF] flex items-center justify-center">
        <p className="text-[#6B7080]">Loading client dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0C0E14] text-[#E8E6DF] flex items-center justify-center px-6">
        <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-8 max-w-lg">
          <p className="text-red-400 font-medium">Could not load client dashboard.</p>
          <p className="text-sm text-[#6B7080] mt-2">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0C0E14] text-[#E8E6DF]">
      <header className="border-b border-[#1E2130] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[#E8E6DF] font-medium">
              {profile?.fullName || profile?.email || 'Client'}
            </p>
            <p className="text-sm text-[#4A4F62]">Client portal</p>
          </div>

          <button
            onClick={handleSignOut}
            className="rounded-lg border border-[#2A2D3E] px-4 py-2 text-sm text-[#B0AFA8] hover:border-[#4A4F62] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Matter transparency</h1>
            <p className="text-[#6B7080] mt-2">
              View approved work summaries and matter spend visibility.
            </p>
          </div>

          {matters.length > 1 && (
            <select
              value={selectedMatter?.id ?? ''}
              onChange={(e) => setSelectedMatterId(e.target.value)}
              className="bg-[#13151E] border border-[#1E2130] text-[#E8E6DF] rounded-lg px-3 py-2 text-sm focus:border-[#4F7EF7] focus:outline-none"
            >
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {matters.length === 0 ? (
          <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-12 text-center">
            <p className="text-[#E8E6DF] font-medium">No matters available yet.</p>
            <p className="text-sm text-[#6B7080] mt-2">
              Once your attorney gives you access to a matter, it will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <ClientMetricCard
                label="Visible hours"
                value={`${visibleHours.toFixed(2)}h`}
                subtitle={selectedMatter ? `For ${selectedMatter.name}` : 'Selected matter'}
              />
              <ClientMetricCard
                label="Total visible hours"
                value={`${totalVisibleHours.toFixed(2)}h`}
                subtitle="Across accessible matters"
              />
              <ClientMetricCard
                label="Approved updates"
                value={selectedMatterEntries.length}
                subtitle="Client-visible work summaries"
              />
            </div>

            {selectedMatter && (
              <div className="mb-8">
                <ClientMatterCard matter={selectedMatter} />
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">Completed work</h2>

              {selectedMatterEntries.length > 0 ? (
                <div className="space-y-4">
                  {selectedMatterEntries.map((entry) => (
                    <ClientActivityCard key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-10 text-center">
                  <p className="text-[#6B7080]">
                    No client-visible work summaries for this matter yet.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}