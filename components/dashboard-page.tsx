'use client';

import { useState, useEffect } from 'react';
import { useApp } from './app-context';
import { Toast } from './toast';
import { Paperclip } from 'lucide-react';
import type { ActivityEntry, Matter } from '@/lib/types';

interface ToastState {
  message: string;
  type: 'approve' | 'discard' | 'save';
}

function MetricCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
      <p className="text-xs text-[#6B7080] mb-2">{label}</p>
      <p className="text-3xl font-mono mb-1" style={{ color }}>
        {value}
      </p>
      <p className="text-sm text-[#4A4F62]">{subtitle}</p>
    </div>
  );
}

function MatterCard({
  matter,
  onClose,
}: {
  matter: Matter;
  onClose: () => void;
}) {
  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#E8E6DF] font-medium">{matter.name}</p>
          <p className="text-sm text-[#6B7080] mt-1">{matter.clientName}</p>
          <p className="text-xs text-[#4A4F62] mt-1">
            {matter.matterType} · {matter.clientEmail}
          </p>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 px-3 py-1.5 border border-[#2A2D3E] text-[#6B7080] rounded-lg text-xs font-medium hover:border-red-500 hover:text-red-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: 'email' | 'meeting' | 'slack' }) {
  const styles = {
    email: { color: '#4F7EF7', bg: 'rgba(79, 126, 247, 0.12)' },
    meeting: { color: '#22C48A', bg: 'rgba(34, 196, 138, 0.12)' },
    slack: { color: '#E8A838', bg: 'rgba(232, 168, 56, 0.12)' },
  };
  const labels = { email: 'Email', meeting: 'Meeting', slack: 'Slack' };
  const style = styles[source];

  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {labels[source]}
    </span>
  );
}

function ActivityCard({
  entry,
  hourlyRate,
  onApprove,
  onDiscard,
  onSave,
}: {
  entry: ActivityEntry;
  hourlyRate: number;
  onApprove: () => void;
  onDiscard: () => void;
  onSave: (updates: Partial<ActivityEntry>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNarrative, setEditedNarrative] = useState(entry.narrative);
  const [editedHours, setEditedHours] = useState(entry.hours.toString());

  const dollarValue = entry.hours * hourlyRate;

  const handleSave = () => {
    onSave({
      narrative: editedNarrative,
      hours: parseFloat(editedHours) || entry.hours,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNarrative(entry.narrative);
    setEditedHours(entry.hours.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5 hover:bg-[#1A1D28] transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SourceBadge source={entry.source} />
          <span className="text-sm font-mono text-[#6B7080]">{entry.timestamp}</span>
          <span className="text-[#E8E6DF] font-medium">{entry.subject}</span>
          <span className="text-sm text-[#4A4F62]">
            {entry.contact} · {entry.company}
          </span>
          {entry.hasAttachment && (
            <Paperclip size={14} className="text-[#4A4F62]" />
          )}
        </div>
        <div className="text-right shrink-0 ml-4">
          {isEditing ? (
            <input
              type="number"
              step="0.05"
              value={editedHours}
              onChange={(e) => setEditedHours(e.target.value)}
              className="w-20 px-2 py-1 bg-[#0C0E14] border border-[#1E2130] rounded text-right text-lg font-mono text-[#22C48A] focus:border-[#4F7EF7] focus:outline-none"
            />
          ) : (
            <p className="text-2xl font-mono text-[#22C48A]">{entry.hours.toFixed(2)}</p>
          )}
          <p className="text-sm text-[#4A4F62]">
            ${dollarValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Narrative block */}
      <div className="bg-[#0C0E14] border border-[#1A1D28] rounded-lg p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-[#4A4F62] mb-2">
          Draft billing narrative
        </p>
        {isEditing ? (
          <textarea
            value={editedNarrative}
            onChange={(e) => setEditedNarrative(e.target.value)}
            className="w-full bg-transparent text-[#6B7080] text-sm leading-relaxed resize-none focus:outline-none min-h-[60px]"
            rows={3}
          />
        ) : (
          <p className="text-[#6B7080] text-sm leading-relaxed">{entry.narrative}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4F7EF7] text-white rounded-lg text-sm font-medium hover:bg-[#3D6AE0] transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-[#2A2D3E] text-[#B0AFA8] rounded-lg text-sm font-medium hover:border-[#4A4F62] transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-[#0E2E20] text-[#22C48A] rounded-lg text-sm font-medium hover:bg-[#0F3524] transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-[#2A2D3E] text-[#B0AFA8] rounded-lg text-sm font-medium hover:border-[#4A4F62] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDiscard}
              className="px-4 py-2 border border-[#2A2D3E] text-[#4A4F62] rounded-lg text-sm font-medium hover:border-[#4A4F62] transition-colors"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}



export function DashboardPage() {
  const {
    profile,
    matters,
    entries,
    approveEntry,
    discardEntry,
    updateEntry,
    approveFilteredEntries,
    removeMatter,
    signOut,
  } = useApp();

  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);

  const selectedMatter =
    matters.find((matter) => matter.id === selectedMatterId) ?? matters[0] ?? null;

  useEffect(() => {
    if (!selectedMatterId && matters.length > 0) {
      setSelectedMatterId(matters[0].id);
    }
  }, [selectedMatterId, matters]);

  const allPendingEntries = entries.filter((e) => e.status === 'pending');
  const allApprovedEntries = entries.filter((e) => e.status === 'approved');

  const selectedMatterEntries = selectedMatter
    ? entries.filter((e) => e.matterId === selectedMatter.id)
    : [];

  const pendingEntries = selectedMatterEntries.filter((e) => e.status === 'pending');
  const approvedEntries = selectedMatterEntries.filter((e) => e.status === 'approved');

  const pendingHours = allPendingEntries.reduce((sum, e) => sum + e.hours, 0);
  const approvedHours = allApprovedEntries.reduce((sum, e) => sum + e.hours, 0);
  const hourlyRate = profile?.hourlyRate || 0;
  const approvedValue = approvedHours * hourlyRate;
  const totalReviewed = entries.filter((e) => e.status !== 'pending').length;
  const approvalRate = totalReviewed > 0
    ? Math.round((allApprovedEntries.length / totalReviewed) * 100)
    : 0;

  const handleApprove = async (id: string) => {
    await approveEntry(id);
    setToast({ message: 'Entry approved and logged.', type: 'approve' });
  };

  const handleDiscard = async (id: string) => {
    await discardEntry(id);
    setToast({ message: 'Entry discarded.', type: 'discard' });
  };

  const handleSave = async (id: string, updates: Partial<ActivityEntry>) => {
    await updateEntry(id, updates);
    setToast({ message: 'Entry updated.', type: 'save' });
  };

  const handleApproveAll = async () => {
    if (!selectedMatter) return;

    const { count } = await approveFilteredEntries(selectedMatter.id);

    setToast({
      message: `${count} entries approved for ${selectedMatter.name}.`,
      type: 'approve',
    });
  };

  const handleCloseMatter = async (matter: Matter) => {
    const confirmed = window.confirm(
      `Close ${matter.name}? This will remove it from active matters but preserve its history.`
    );

    if (!confirmed) return;

    await removeMatter(matter.id);

    const remainingMatters = matters.filter((m) => m.id !== matter.id);
    setSelectedMatterId(remainingMatters[0]?.id ?? null);

    setToast({ message: `${matter.name} closed.`, type: 'save' });
  };

  const initials = profile?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#0C0E14]">
      <header className="border-b border-[#1E2130] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F7EF7] to-[#22C48A] flex items-center justify-center text-white text-sm font-medium">
              {initials}
            </div>
            <div>
              <p className="text-[#E8E6DF] font-medium">{profile?.fullName}</p>
              <p className="text-sm text-[#4A4F62]">{profile?.lawFirm}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#E8E6DF] font-mono">
              ${profile?.hourlyRate?.toLocaleString()}/hr
            </span>
            <button
              onClick={signOut}
              className="text-sm text-[#4A4F62] hover:text-[#6B7080] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="Pending review"
            value={allPendingEntries.length}
            subtitle={`${pendingHours.toFixed(2)} hours total`}
            color="#4F7EF7"
          />
          <MetricCard
            label="Recovered today"
            value={`${approvedHours.toFixed(2)}h`}
            subtitle={`$${approvedValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            color="#22C48A"
          />
          <MetricCard
            label="Approval rate"
            value={`${approvalRate}%`}
            subtitle={`${allApprovedEntries.length} of ${totalReviewed} reviewed`}
            color="#E8A838"
          />
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#E8E6DF]">Matter workspace</h2>
              <p className="text-sm text-[#4A4F62]">
                {matters.length} active {matters.length === 1 ? 'matter' : 'matters'}
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

          {selectedMatter ? (
            <MatterCard
              matter={selectedMatter}
              onClose={() => void handleCloseMatter(selectedMatter)}
            />
          ) : (
            <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-8 text-center">
              <p className="text-[#4A4F62]">No active matters yet.</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#E8E6DF]">Activity queue</h2>
              <p className="text-sm text-[#4A4F62]">
                {selectedMatter
                  ? `${pendingEntries.length} entries pending for ${selectedMatter.name}`
                  : 'No matter selected'}
              </p>
            </div>

            {pendingEntries.length > 0 && selectedMatter && (
              <button
                onClick={handleApproveAll}
                className="px-4 py-2 bg-[#1A2540] text-[#4F7EF7] border border-[#4F7EF7] rounded-lg text-sm font-medium hover:bg-[#1E2A4A] transition-colors"
              >
                Approve all ({pendingEntries.length})
              </button>
            )}
          </div>

          <div className="space-y-4 mt-4">
            {pendingEntries.map((entry) => (
              <ActivityCard
                key={entry.id}
                entry={entry}
                hourlyRate={hourlyRate}
                onApprove={() => void handleApprove(entry.id)}
                onDiscard={() => void handleDiscard(entry.id)}
                onSave={(updates) => void handleSave(entry.id, updates)}
              />
            ))}

            {pendingEntries.length === 0 && selectedMatter && (
              <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-12 text-center">
                <p className="text-[#6B7080]">All caught up on {selectedMatter.name}.</p>
                <p className="text-sm text-[#4A4F62] mt-1">
                  Switch to another matter or check back soon.
                </p>
              </div>
            )}

            {pendingEntries.length === 0 && !selectedMatter && (
              <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-12 text-center">
                <p className="text-[#4A4F62]">No active matter selected.</p>
              </div>
            )}
          </div>
        </div>

        {approvedEntries.length > 0 && (
          <div className="opacity-70">
            <h3 className="text-xs uppercase tracking-wider text-[#4A4F62] mb-4">
              Approved · {approvedEntries.length}
            </h3>
            <div className="space-y-2">
              {approvedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 px-4 bg-[#13151E] border border-[#1E2130] rounded-lg"
                >
                  <div>
                    <p className="text-sm text-[#6B7080]">{entry.subject}</p>
                    <p className="text-xs text-[#4A4F62]">
                      {entry.source.charAt(0).toUpperCase() + entry.source.slice(1)} · {entry.contact}
                    </p>
                  </div>
                  <span className="font-mono text-[#22C48A]">{entry.hours.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
