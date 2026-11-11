export interface Creator {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  studio_name: string;
  currency: string;
  api_key: string;
  plan: 'Free' | 'Pro';
}

export interface Client {
  id: string;
  creator_id?: string;
  name: string;
  email: string;
  currency: string;
  created_at?: string;
}

export interface LineItem {
  id: string;
  proposal_id: string;
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
  deposit_paid: number; // 0 or 1
  currency: string;
  revisions_included: number;
  turnaround_days: number;
  created_at?: string;
  updated_at?: string;
  client?: Client;
  creator?: Creator;
  line_items?: LineItem[];
}

export interface Invoice {
  id: string;
  creator_id?: string;
  proposal_id?: string;
  client_id: string;
  amount: number;
  due_date?: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  created_at?: string;
  client?: Client;
}
