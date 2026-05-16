import type { ActivityTimelineItem } from '../activity'

export const northstarActivityItems = [
  {
    description: 'Belair Capital completed its subscription bulletin.',
    id: 'signed-belair',
    label: 'Subscription package signed',
    timestamp: '8 May 2026, 10:40',
    tone: 'success',
  },
  {
    description: 'Wire confirmation matched Camille Moreau to the SPV account.',
    id: 'wire-camille',
    label: 'Wire received',
    timestamp: '8 May 2026, 09:15',
    tone: 'success',
  },
  {
    description: 'Elise Martin needs a refreshed proof of address before signing.',
    id: 'kyc-elise',
    label: 'KYC evidence requested',
    timestamp: '7 May 2026, 16:20',
    tone: 'warning',
  },
  {
    description: 'Rhine Ventures moved from review to committed capital.',
    id: 'committed-rhine',
    label: 'Commitment accepted',
    timestamp: '7 May 2026, 11:05',
    tone: 'neutral',
  },
] as const satisfies readonly ActivityTimelineItem[]
