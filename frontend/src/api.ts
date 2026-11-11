const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Client {
  id: string;
  name: string;
  email: string;
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
  line_items?: LineItem[];
}

export async function fetchProposals(): Promise<Proposal[]> {
  const res = await fetch(`${API_BASE}/api/proposals`);
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
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error('Failed to fetch status summary');
  return res.json();
}
