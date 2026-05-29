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
    subject: 'RE: Indemnification Clause Review',
    contact: 'Sarah Chen',
    company: 'Morrison Partners',
    hours: 1.0,
    narrative: 'Reviewed and responded to opposing counsel\'s inquiry regarding indemnification clause scope and limitations. Addressed concerns about carve-outs for gross negligence and proposed amended language for mutual indemnity provisions.',
    hasAttachment: true,
    status: 'pending',
    matterName: 'Hartwell v. Morrison',
  },
  {
    id: '2',
    source: 'email',
    timestamp: '10:15 AM',
    subject: 'RE: Discovery Extension Request',
    contact: 'James Hartwell',
    company: 'Hartwell LLC',
    hours: 0.3,
    narrative: 'Received and reviewed opposing counsel\'s request for 30-day extension on discovery production deadline. Drafted response agreeing to extension with conditions regarding rolling production schedule.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'Hartwell v. Morrison',
  },
  {
    id: '3',
    source: 'meeting',
    timestamp: '11:30 AM',
    subject: 'Q3 Restructuring Strategy Call',
    contact: 'James Okafor',
    company: 'Meridian Partners',
    hours: 0.75,
    narrative: 'Conference call with client to discuss Q3 restructuring timeline, debt covenant amendments, and creditor negotiation strategy. Outlined next steps for intercreditor agreement revisions.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'Meridian Partners — Q3 Restructuring',
  },
  {
    id: '4',
    source: 'slack',
    timestamp: '2:42 PM',
    subject: 'Associate Question on Filing Deadline',
    contact: 'Lisa Park',
    company: 'Internal',
    hours: 0.1,
    narrative: 'Responded to internal associate inquiry regarding court filing deadline for motion to compel. Confirmed deadline and provided guidance on service requirements.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'Meridian Partners — Q3 Restructuring',
  },
  {
    id: '5',
    source: 'email',
    timestamp: '3:20 PM',
    subject: 'IP Term Sheet Review',
    contact: 'David Lim',
    company: 'NovaTech Inc.',
    hours: 0.3,
    narrative: 'Reviewed IP licensing term sheet and drafted redline comments on royalty calculation methodology, sublicensing restrictions, and audit rights provisions.',
    hasAttachment: true,
    status: 'pending',
    matterName: 'NovaTech IP Licensing',
  },
  {
    id: '6',
    source: 'meeting',
    timestamp: '4:00 PM',
    subject: 'Trust Amendment Discussion',
    contact: 'Elena Vasquez',
    company: 'Rosario Family',
    hours: 0.05,
    narrative: 'Brief call to confirm beneficiary designation changes and discuss timeline for trust amendment execution.',
    hasAttachment: false,
    status: 'pending',
    matterName: 'Rosario Family Trust',
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
