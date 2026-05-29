import type { ActivityEntry, UserProfile, Matter } from './types';

export const PRESET_PROFILE: UserProfile = {
  fullName: 'Sarah K. Oduya',
  email: 'sarah@oduyalegal.com',
  lawFirm: 'Oduya Legal Group',
  hourlyRate: 550,
  practiceArea: 'Litigation',
};

export const PRESET_ENTRIES: ActivityEntry[] = [
  {
    id: '1',
    source: 'email',
    timestamp: '9:47 AM',
    subject: 'RE: Discovery Document Production - Harris v. TechCorp',
    contact: 'Michael Chen',
    company: 'TechCorp Legal',
    hours: 1.0,
    narrative: 'Reviewed and responded to opposing counsel\'s discovery request regarding document production timeline. Addressed concerns about privilege log formatting and proposed amended deadline for third-party subpoena responses.',
    hasAttachment: true,
    status: 'pending',
    matterName: 'Harris v. TechCorp',
  },
  {
    id: '2',
    source: 'meeting',
    timestamp: '10:30 AM',
    subject: 'Merger Strategy Call - Apex Acquisition',
    contact: 'Jennifer Walsh',
    company: 'Apex Industries',
    hours: 0.75,
    narrative: 'Conference call with client to discuss merger timeline, due diligence findings, and regulatory approval strategy. Outlined next steps for Hart-Scott-Rodino filing and addressed antitrust concerns.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'Apex Industries Merger',
  },
  {
    id: '3',
    source: 'meeting',
    timestamp: '2:15 PM',
    subject: 'Estate Planning Review - Morrison Trust',
    contact: 'Robert Morrison',
    company: 'Morrison Family Office',
    hours: 0.3,
    narrative: 'Met with client to review updated trust provisions and discuss beneficiary designation changes following recent family developments. Confirmed charitable remainder trust modifications.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'Morrison Family Trust',
  },
  {
    id: '4',
    source: 'slack',
    timestamp: '3:42 PM',
    subject: 'Patent Filing Status Update',
    contact: 'David Park',
    company: 'InnovateTech Labs',
    hours: 0.1,
    narrative: 'Responded to client inquiry regarding USPTO examination timeline for pending patent application. Provided status update on office action response deadline.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'InnovateTech Patent Portfolio',
  },
  {
    id: '5',
    source: 'email',
    timestamp: '4:20 PM',
    subject: 'Contract Review - Westfield Commercial Lease',
    contact: 'Amanda Torres',
    company: 'Westfield Properties',
    hours: 0.3,
    narrative: 'Reviewed commercial lease agreement amendments and drafted redline comments on tenant improvement allowance, CAM reconciliation provisions, and renewal option terms.',
    hasAttachment: true,
    status: 'pending',
    matterName: 'Westfield Commercial Lease',
  },
  {
    id: '6',
    source: 'meeting',
    timestamp: '5:00 PM',
    subject: 'Closing Call - 425 Oak Street Acquisition',
    contact: 'Thomas Bradley',
    company: 'Bradley Investments',
    hours: 0.05,
    narrative: 'Brief closing coordination call to confirm wire transfer instructions and document execution schedule for commercial property acquisition closing tomorrow.',
    hasAttachment: false,
    status: 'pending',
    matterName: '425 Oak Street Acquisition',
  },
];

export function generateEntriesForMatters(matters: Matter[], hourlyRate: number): ActivityEntry[] {
  const sources: ('email' | 'meeting' | 'slack')[] = ['email', 'meeting', 'email', 'meeting', 'slack', 'email'];
  const durations = [0.1, 0.3, 0.3, 1.0, 0.75, 0.05];
  const times = ['9:15 AM', '10:45 AM', '1:30 PM', '2:45 PM', '4:10 PM', '5:30 PM'];
  
  const subjectTemplates = {
    email: [
      'RE: Document Review Request',
      'Contract Amendment Discussion',
      'Case Status Update',
    ],
    meeting: [
      'Strategy Planning Call',
      'Client Consultation',
      'Settlement Discussion',
    ],
    slack: [
      'Quick Question on Filing',
    ],
  };

  const narrativeTemplates = [
    'Reviewed client documentation and prepared summary memorandum outlining key issues and recommended next steps for matter progression.',
    'Participated in strategy call to discuss case timeline, discovery deadlines, and potential settlement considerations.',
    'Drafted and reviewed correspondence addressing client inquiries regarding procedural requirements and filing deadlines.',
    'Conducted legal research on relevant precedents and statutory requirements applicable to current matter posture.',
    'Coordinated with client regarding document production and addressed questions about privilege designations.',
    'Brief communication to clarify procedural question and confirm upcoming deadline.',
  ];

  return matters.slice(0, 6).map((matter, index) => {
    const source = sources[index % sources.length];
    const subjectOptions = subjectTemplates[source];
    
    return {
      id: `new-${index + 1}`,
      source,
      timestamp: times[index],
      subject: `${subjectOptions[index % subjectOptions.length]} - ${matter.name}`,
      contact: matter.clientName,
      company: matter.clientName,
      hours: durations[index],
      narrative: narrativeTemplates[index],
      hasAttachment: index % 3 === 0,
      status: 'pending' as const,
      matterName: matter.name,
    };
  });
}
