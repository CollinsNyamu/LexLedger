export interface UserProfile {
  fullName: string;
  email: string;
  lawFirm: string;
  hourlyRate: number;
  practiceArea: string;
}

export interface Matter {
  id: string;
  name: string;
  clientName: string;
  matterType: string;
  clientEmail: string;
}

export interface ConnectedPlatform {
  name: string;
  connected: boolean;
}

export interface ActivityEntry {
  id: string;
  source: 'email' | 'meeting' | 'slack';
  timestamp: string;
  subject: string;
  contact: string;
  company: string;
  hours: number;
  narrative: string;
  hasAttachment: boolean;
  status: 'pending' | 'approved' | 'discarded';
  matterName?: string;
}

export interface OnboardingData {
  profile: UserProfile;
  connectedPlatforms: string[];
  matters: Matter[];
}

export type AppView = 'auth' | 'onboarding' | 'dashboard';
export type AuthTab = 'login' | 'create';
export type OnboardingStep = 1 | 2 | 3 | 4;

export const PRACTICE_AREAS = [
  'Litigation',
  'Corporate',
  'Real Estate',
  'Estate Planning',
  'IP',
  'Employment',
  'Other',
] as const;

export const PLATFORMS = [
  { name: 'Gmail', description: 'Captures sent & received emails', color: '#EA4335', available: true },
  { name: 'Google Calendar', description: 'Logs meetings and call durations', color: '#4F7EF7', available: true },
  { name: 'Slack', description: 'Tracks client messages and threads', color: '#E8A838', available: true },
  { name: 'Microsoft Teams', description: 'Team collaboration platform', color: '#5B5EA6', available: false },
  { name: 'Zoom', description: 'Call duration from meeting.ended events', color: '#2D8CFF', available: false },
  { name: 'WhatsApp', description: 'Business API inbound messages', color: '#25D366', available: false },
] as const;
