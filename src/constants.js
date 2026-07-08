export const BACKEND_URL =
  'https://script.google.com/macros/s/AKfycbw4MTz-SWVvm5PbSkVCAsGS7MKWae63aSF3zalAKqrghSE6h1nD2vieyEo9u1aM16M/exec';

export const MODELS = [
  'Wraith',
  'Elektra',
  'Prisma',
  'Porter',
  'Kryos Zero',
  'Swift Lite',
  'Swift Pro',
  'Township — 4 seater + trunk',
  'Township — 4+2 seat',
  'Township — 6 seater + trunk',
];

export const STAGES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'quote', label: 'Quote' },
  { key: 'testride', label: 'Test Ride' },
  { key: 'negotiating', label: 'Negotiating' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

export const STAGE_KEYS = STAGES.map((s) => s.key);

export const LOST_REASONS = [
  'Price too high',
  'Bought from competitor',
  'No financing available',
  'Not ready to buy',
  'Wrong model / specs',
  'No response / ghosted',
  'Location / delivery issue',
  'Other',
];

export const DEFAULT_SOURCES = ['Facebook', 'Messenger', 'Walk-in', 'Referral', 'Event', 'Website', 'Other'];

export const DEFAULT_SALESPEOPLE = ['Brad'];

export const FOLLOWUP_DUE_DAYS = 2;
export const FOLLOWUP_OVERDUE_DAYS = 5;
