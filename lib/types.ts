// Database types matching Supabase schema
export interface DbProfile {
  id: string
  email: string
  full_name: string | null
  law_firm: string | null
  hourly_rate: number | null
  practice_area: string | null
  role: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface DbMatter {
  id: string
  name: string
  client_name: string | null
  client_email: string | null
  matter_type: string | null
  status: string | null
  budget: number | null
  expected_spend: number | null
  attorney_id: string
  created_at: string
  updated_at: string
}

export interface DbActivityEntry {
  id: string
  source: string | null
  timestamp_label: string | null
  subject: string | null
  contact: string | null
  company: string | null
  hours: number | null
  narrative: string | null
  client_summary: string | null
  has_attachment: boolean | null
  status: string | null
  attorney_id: string
  matter_id: string | null
  client_visible: boolean | null
  created_at: string
  updated_at: string
  matter?: { name: string } | null
}

// Client-side types (used in components)
export interface UserProfile {
  id: string
  fullName: string
  email: string
  lawFirm: string
  hourlyRate: number
  practiceArea: string
  onboardingCompleted: boolean
}

export interface Matter {
  id: string
  name: string
  clientName: string
  clientEmail: string
  matterType: string
}

export interface ActivityEntry {
  id: string
  source: 'email' | 'meeting' | 'slack'
  timestamp: string
  subject: string
  contact: string
  company: string
  hours: number
  narrative: string
  hasAttachment: boolean
  status: 'pending' | 'approved' | 'discarded'
  matterName?: string
  matterId?: string
}

// Transform functions
export function transformProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    fullName: db.full_name || '',
    email: db.email,
    lawFirm: db.law_firm || '',
    hourlyRate: db.hourly_rate || 0,
    practiceArea: db.practice_area || '',
    onboardingCompleted: db.onboarding_completed,
  }
}

export function transformMatter(db: DbMatter): Matter {
  return {
    id: db.id,
    name: db.name,
    clientName: db.client_name || '',
    clientEmail: db.client_email || '',
    matterType: db.matter_type || '',
  }
}

export function transformEntry(db: DbActivityEntry): ActivityEntry {
  return {
    id: db.id,
    source: (db.source as 'email' | 'meeting' | 'slack') || 'email',
    timestamp: db.timestamp_label || '',
    subject: db.subject || '',
    contact: db.contact || '',
    company: db.company || '',
    hours: db.hours || 0,
    narrative: db.narrative || '',
    hasAttachment: db.has_attachment || false,
    status: (db.status as 'pending' | 'approved' | 'discarded') || 'pending',
    matterName: db.matter?.name,
    matterId: db.matter_id || undefined,
  }
}

export interface ConnectedPlatform {
  name: string
  connected: boolean
}

export interface OnboardingData {
  profile: UserProfile
  connectedPlatforms: string[]
  matters: Matter[]
}

export type AppView = 'auth' | 'onboarding' | 'dashboard'
export type AuthTab = 'login' | 'create'
export type OnboardingStep = 1 | 2 | 3 | 4

export const PRACTICE_AREAS = [
  'Litigation',
  'Corporate',
  'Real Estate',
  'Estate Planning',
  'IP',
  'Employment',
  'Other',
] as const

export const PLATFORMS = [
  { name: 'Gmail', description: 'Captures sent & received emails', color: '#EA4335', available: true },
  { name: 'Google Calendar', description: 'Logs meetings and call durations', color: '#4F7EF7', available: true },
  { name: 'Slack', description: 'Tracks client messages and threads', color: '#E8A838', available: true },
  { name: 'Microsoft Teams', description: 'Team collaboration platform', color: '#5B5EA6', available: false },
  { name: 'Zoom', description: 'Call duration from meeting.ended events', color: '#2D8CFF', available: false },
  { name: 'WhatsApp', description: 'Business API inbound messages', color: '#25D366', available: false },
] as const
