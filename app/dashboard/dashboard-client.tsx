'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toast } from '@/components/toast'
import { Paperclip } from 'lucide-react'
import type { UserProfile, Matter, ActivityEntry } from '@/lib/types'
import { 
  signOut as signOutAction, 
  updateEntry as updateEntryAction,
  approveAllEntries as approveAllEntriesAction 
} from '@/app/actions'

interface ToastState {
  message: string
  type: 'approve' | 'discard' | 'save'
}

interface DashboardClientProps {
  initialProfile: UserProfile
  initialMatters: Matter[]
  initialEntries: ActivityEntry[]
}

function MetricCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string
  value: string | number
  subtitle: string
  color: string
}) {
  return (
    <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-5">
      <p className="text-xs text-[#6B7080] mb-2">{label}</p>
      <p className="text-3xl font-mono mb-1" style={{ color }}>
        {value}
      </p>
      <p className="text-sm text-[#4A4F62]">{subtitle}</p>
    </div>
  )
}

function SourceBadge({ source }: { source: 'email' | 'meeting' | 'slack' }) {
  const styles = {
    email: { color: '#4F7EF7', bg: 'rgba(79, 126, 247, 0.12)' },
    meeting: { color: '#22C48A', bg: 'rgba(34, 196, 138, 0.12)' },
    slack: { color: '#E8A838', bg: 'rgba(232, 168, 56, 0.12)' },
  }
  const labels = { email: 'Email', meeting: 'Meeting', slack: 'Slack' }
  const style = styles[source]

  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {labels[source]}
    </span>
  )
}

function ActivityCard({
  entry,
  hourlyRate,
  onApprove,
  onDiscard,
  onSave,
  isPending,
}: {
  entry: ActivityEntry
  hourlyRate: number
  onApprove: () => void
  onDiscard: () => void
  onSave: (updates: Partial<ActivityEntry>) => void
  isPending: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedNarrative, setEditedNarrative] = useState(entry.narrative)
  const [editedHours, setEditedHours] = useState(entry.hours.toString())

  const dollarValue = entry.hours * hourlyRate

  const handleSave = () => {
    onSave({
      narrative: editedNarrative,
      hours: parseFloat(editedHours) || entry.hours,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedNarrative(entry.narrative)
    setEditedHours(entry.hours.toString())
    setIsEditing(false)
  }

  return (
    <div className={`bg-[#13151E] border border-[#1E2130] rounded-xl p-5 hover:bg-[#1A1D28] transition-colors ${isPending ? 'opacity-50' : ''}`}>
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
              disabled={isPending}
              className="px-4 py-2 bg-[#4F7EF7] text-white rounded-lg text-sm font-medium hover:bg-[#3D6AE0] transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-4 py-2 border border-[#2A2D3E] text-[#B0AFA8] rounded-lg text-sm font-medium hover:border-[#4A4F62] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onApprove}
              disabled={isPending}
              className="px-4 py-2 bg-[#0E2E20] text-[#22C48A] rounded-lg text-sm font-medium hover:bg-[#0F3524] transition-colors disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="px-4 py-2 border border-[#2A2D3E] text-[#B0AFA8] rounded-lg text-sm font-medium hover:border-[#4A4F62] transition-colors disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={onDiscard}
              disabled={isPending}
              className="px-4 py-2 border border-[#2A2D3E] text-[#4A4F62] rounded-lg text-sm font-medium hover:border-[#4A4F62] transition-colors disabled:opacity-50"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

interface MatterTab {
  name: string
  count: number
}

function MatterFilterTabs({
  matters,
  activeMatter,
  onSelectMatter,
  totalCount,
}: {
  matters: MatterTab[]
  activeMatter: string | null
  onSelectMatter: (matter: string | null) => void
  totalCount: number
}) {
  return (
    <div 
      className="flex gap-2 overflow-x-auto pb-1 mb-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* All tab */}
      <button
        onClick={() => onSelectMatter(null)}
        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-[20px] text-[13px] font-medium transition-all duration-150 ${
          activeMatter === null
            ? 'bg-[#4F7EF7] text-white'
            : 'bg-transparent border border-[#2A2D3E] text-[#6B7080] hover:border-[#4F7EF7] hover:text-[#B0AFA8]'
        }`}
      >
        All
        <span
          className={`px-1.5 py-0.5 rounded-[10px] text-[10px] font-mono ${
            activeMatter === null
              ? 'bg-white/20 text-white'
              : 'bg-[#1E2130] text-[#6B7080]'
          }`}
        >
          {totalCount}
        </span>
      </button>
      
      {/* Matter tabs */}
      {matters.map((matter) => {
        const isActive = activeMatter === matter.name
        const isEmpty = matter.count === 0
        
        return (
          <button
            key={matter.name}
            onClick={() => onSelectMatter(matter.name)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-[20px] text-[13px] font-medium transition-all duration-150 ${
              isActive
                ? 'bg-[#4F7EF7] text-white'
                : 'bg-transparent border border-[#2A2D3E] text-[#6B7080] hover:border-[#4F7EF7] hover:text-[#B0AFA8]'
            } ${isEmpty && !isActive ? 'opacity-60' : ''}`}
          >
            {matter.name}
            <span
              className={`px-1.5 py-0.5 rounded-[10px] text-[10px] font-mono ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1E2130] text-[#6B7080]'
              }`}
            >
              {matter.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function DashboardClient({ 
  initialProfile, 
  initialMatters, 
  initialEntries 
}: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [entries, setEntries] = useState(initialEntries)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [activeMatter, setActiveMatter] = useState<string | null>(null)

  const profile = initialProfile
  const pendingEntries = entries.filter((e) => e.status === 'pending')
  const approvedEntries = entries.filter((e) => e.status === 'approved')

  // Build matter tabs from entries
  const matterTabs = useMemo(() => {
    const matterCounts = new Map<string, number>()
    const matterOrder: string[] = []
    
    entries.forEach((e) => {
      if (e.matterName && !matterCounts.has(e.matterName)) {
        matterCounts.set(e.matterName, 0)
        matterOrder.push(e.matterName)
      }
    })
    
    pendingEntries.forEach((e) => {
      if (e.matterName) {
        matterCounts.set(e.matterName, (matterCounts.get(e.matterName) || 0) + 1)
      }
    })
    
    return matterOrder.map((name) => ({
      name,
      count: matterCounts.get(name) || 0,
    }))
  }, [entries, pendingEntries])

  const filteredPendingEntries = useMemo(() => {
    if (activeMatter === null) {
      return pendingEntries
    }
    return pendingEntries.filter((e) => e.matterName === activeMatter)
  }, [pendingEntries, activeMatter])

  const pendingHours = pendingEntries.reduce((sum, e) => sum + e.hours, 0)
  const approvedHours = approvedEntries.reduce((sum, e) => sum + e.hours, 0)
  const hourlyRate = profile?.hourlyRate || 0
  const approvedValue = approvedHours * hourlyRate
  const totalReviewed = entries.filter((e) => e.status !== 'pending').length
  const approvalRate = totalReviewed > 0 
    ? Math.round((approvedEntries.length / totalReviewed) * 100) 
    : 0

  const handleApprove = (id: string) => {
    // Optimistic update
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, status: 'approved' as const } : e
    ))
    setToast({ message: 'Entry approved and logged.', type: 'approve' })
    
    startTransition(async () => {
      await updateEntryAction(id, { status: 'approved' })
      router.refresh()
    })
  }

  const handleDiscard = (id: string) => {
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, status: 'discarded' as const } : e
    ))
    setToast({ message: 'Entry discarded.', type: 'discard' })
    
    startTransition(async () => {
      await updateEntryAction(id, { status: 'discarded' })
      router.refresh()
    })
  }

  const handleSave = (id: string, updates: Partial<ActivityEntry>) => {
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ))
    setToast({ message: 'Entry updated.', type: 'save' })
    
    startTransition(async () => {
      await updateEntryAction(id, { 
        narrative: updates.narrative, 
        hours: updates.hours 
      })
      router.refresh()
    })
  }

  const handleApproveAll = () => {
    const entriesToApprove = filteredPendingEntries.map(e => e.id)
    const count = entriesToApprove.length
    
    // Optimistic update
    setEntries(prev => prev.map(e => 
      entriesToApprove.includes(e.id) ? { ...e, status: 'approved' as const } : e
    ))
    
    if (activeMatter) {
      setToast({ message: `${count} entries approved for ${activeMatter}.`, type: 'approve' })
    } else {
      setToast({ message: `${count} entries approved and logged.`, type: 'approve' })
    }
    
    startTransition(async () => {
      await approveAllEntriesAction(activeMatter)
      router.refresh()
    })
  }

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction()
      router.push('/')
      router.refresh()
    })
  }

  const initials = profile?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#0C0E14]">
      {/* Header */}
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
              onClick={handleSignOut}
              className="text-sm text-[#4A4F62] hover:text-[#6B7080] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="Pending review"
            value={pendingEntries.length}
            subtitle={`${pendingHours.toFixed(2)} hours total`}
            color="#4F7EF7"
          />
          <MetricCard
            label="Recovered today"
            value={`${approvedHours.toFixed(2)}h`}
            subtitle={`$${approvedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="#22C48A"
          />
          <MetricCard
            label="Approval rate"
            value={`${approvalRate}%`}
            subtitle={`${approvedEntries.length} of ${totalReviewed} reviewed`}
            color="#E8A838"
          />
        </div>

        {/* Activity Queue */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#E8E6DF]">Activity queue</h2>
              <p className="text-sm text-[#4A4F62]">{pendingEntries.length} entries pending review</p>
            </div>
            {filteredPendingEntries.length > 0 && (
              <button
                onClick={handleApproveAll}
                disabled={isPending}
                className="px-4 py-2 bg-[#1A2540] text-[#4F7EF7] border border-[#4F7EF7] rounded-lg text-sm font-medium hover:bg-[#1E2A4A] transition-colors disabled:opacity-50"
              >
                Approve all ({filteredPendingEntries.length})
              </button>
            )}
          </div>

          {/* Matter filter tabs */}
          <MatterFilterTabs
            matters={matterTabs}
            activeMatter={activeMatter}
            onSelectMatter={setActiveMatter}
            totalCount={pendingEntries.length}
          />

          <div className="space-y-4 mt-4">
            {filteredPendingEntries.map((entry) => (
              <ActivityCard
                key={entry.id}
                entry={entry}
                hourlyRate={hourlyRate}
                onApprove={() => handleApprove(entry.id)}
                onDiscard={() => handleDiscard(entry.id)}
                onSave={(updates) => handleSave(entry.id, updates)}
                isPending={isPending}
              />
            ))}
            {filteredPendingEntries.length === 0 && activeMatter !== null && (
              <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-12 text-center">
                <p className="text-[#6B7080]">All caught up on {activeMatter}.</p>
                <p className="text-sm text-[#4A4F62] mt-1">Switch to another matter or check back soon.</p>
              </div>
            )}
            {filteredPendingEntries.length === 0 && activeMatter === null && (
              <div className="bg-[#13151E] border border-[#1E2130] rounded-xl p-12 text-center">
                <p className="text-[#4A4F62]">All caught up! No pending entries.</p>
              </div>
            )}
          </div>
        </div>

        {/* Approved Section */}
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

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
