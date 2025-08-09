export interface EmergencyResource {
  id: string;
  name: string;
  phone: string;
  description: string;
  available: string;
  website?: string;
}

export const emergencyResources: EmergencyResource[] = [
  {
    id: 'crisis-text-line',
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free, 24/7 crisis support via text message',
    available: '24/7',
    website: 'https://www.crisistextline.org'
  },
  {
    id: 'national-suicide-prevention',
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'Free and confidential emotional support',
    available: '24/7',
    website: 'https://suicidepreventionlifeline.org'
  },
  {
    id: 'cancer-support-helpline',
    name: 'Cancer Support Helpline',
    phone: '1-888-793-9355',
    description: 'Emotional support for cancer patients and families',
    available: 'Mon-Fri 9AM-9PM EST',
    website: 'https://www.cancersupportcommunity.org/cancer-support-helpline'
  },
  {
    id: 'american-cancer-society',
    name: 'American Cancer Society Helpline',
    phone: '1-800-227-2345',
    description: 'Cancer information and support services',
    available: '24/7',
    website: 'https://www.cancer.org'
  },
  {
    id: 'livestrong-navigator',
    name: 'LIVESTRONG Cancer Navigation',
    phone: '1-855-220-7777',
    description: 'Free one-on-one support for cancer challenges',
    available: 'Mon-Fri 9AM-5PM CST',
    website: 'https://www.livestrong.org'
  }
];