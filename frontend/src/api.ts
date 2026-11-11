const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Creator {
  id: string;
  name: string;
  email: string;
  studio_name: string;
  avatar_url?: string;
  currency: string;
  api_key: string;
  plan: 'Free' | 'Pro';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  currency: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Proposal {
  id: string;
  slug: string;
  creator_id?: string;
  client_id: string;
  title: string;
  body: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'PAID';
  total_amount: number;
  deposit_amount: number;
  deposit_paid: number;
  currency: string;
  revisions_included: number;
  turnaround_days: number;
  created_at: string;
  updated_at: string;
  client?: Client;
  creator?: Creator;
  line_items?: LineItem[];
}

export const DEMO_CREATORS: Creator[] = [
  {
    id: 'cr_alex_rivera',
    name: 'Alex Rivera',
    email: 'alex@apexcut.studio',
    studio_name: 'Apex Cut Creative Studio',
    currency: 'USD',
    api_key: 'stl_live_alex_9a82b1',
    plan: 'Pro',
  },
  {
    id: 'cr_elena_vance',
    name: 'Elena Vance',
    email: 'elena@vancefilms.io',
    studio_name: 'Vance Motion Works',
    currency: 'USD',
    api_key: 'stl_live_elena_7c34d9',
    plan: 'Pro',
  },
];

export function getActiveCreator(): Creator {
  const stored = localStorage.getItem('settle_active_creator');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return DEMO_CREATORS[0];
}

export function setActiveCreator(creator: Creator): void {
  localStorage.setItem('settle_active_creator', JSON.stringify(creator));
}

export async function fetchProposals(): Promise<Proposal[]> {
  const creator = getActiveCreator();
  const res = await fetch(`${API_BASE}/api/proposals?creator_id=${creator.id}`);
  if (!res.ok) throw new Error('Failed to fetch proposals');
  const data = await res.json();
  return data.proposals || [];
}

export async function fetchProposalBySlug(slug: string): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${slug}`);
  if (!res.ok) throw new Error('Proposal not found');
  const data = await res.json();
  return data.proposal;
}

export async function updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update proposal');
  const data = await res.json();
  return data.proposal;
}

export async function createCheckout(slug: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/proposals/${slug}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to initialize checkout');
  }
  const data = await res.json();
  return data.checkout_url;
}

export async function fetchStatusSummary(): Promise<any> {
  const creator = getActiveCreator();
  const res = await fetch(`${API_BASE}/api/status?creator_id=${creator.id}`);
  if (!res.ok) throw new Error('Failed to fetch status summary');
  return res.json();
}
