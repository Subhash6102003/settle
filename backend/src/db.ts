import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { Client, Proposal, LineItem, Invoice, Creator } from './types';

const isPostgres = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

let pgPool: Pool | null = null;
const jsonDbPath = path.resolve(__dirname, '..', 'data', 'store.json');

interface SchemaData {
  creators: Creator[];
  clients: Client[];
  proposals: Proposal[];
  line_items: LineItem[];
  invoices: Invoice[];
}

const DEFAULT_CREATORS: Creator[] = [
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

let localData: SchemaData = {
  creators: DEFAULT_CREATORS,
  clients: [],
  proposals: [],
  line_items: [],
  invoices: [],
};

function loadLocalData(): void {
  try {
    if (fs.existsSync(jsonDbPath)) {
      const raw = fs.readFileSync(jsonDbPath, 'utf-8');
      localData = JSON.parse(raw);
    } else {
      saveLocalData();
    }
  } catch (err) {
    console.error('[DB] Error loading local store:', err);
  }
}

function saveLocalData(): void {
  try {
    const dir = path.dirname(jsonDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(jsonDbPath, JSON.stringify(localData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving local store:', err);
  }
}

if (isPostgres) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
  console.log('[DB] Connected to PostgreSQL / AWS RDS');
} else {
  loadLocalData();
  console.log('[DB] Using local file-backed store at', jsonDbPath);
}

export async function initDb(): Promise<void> {
  if (isPostgres && pgPool) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) UNIQUE NOT NULL,
        client_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(32) DEFAULT 'DRAFT',
        total_amount NUMERIC DEFAULT 0,
        deposit_amount NUMERIC DEFAULT 0,
        deposit_paid INTEGER DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        revisions_included INTEGER DEFAULT 2,
        turnaround_days INTEGER DEFAULT 14,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS line_items (
        id VARCHAR(64) PRIMARY KEY,
        proposal_id VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        quantity NUMERIC DEFAULT 1,
        unit_price NUMERIC DEFAULT 0,
        amount NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(64) PRIMARY KEY,
        proposal_id VARCHAR(64),
        client_id VARCHAR(64) NOT NULL,
        amount NUMERIC NOT NULL,
        due_date VARCHAR(64),
        status VARCHAR(32) DEFAULT 'UNPAID',
        stripe_checkout_session_id VARCHAR(255),
        stripe_payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] PostgreSQL schemas verified.');
  } else {
    loadLocalData();
    console.log('[DB] Local store initialized with', localData.proposals.length, 'proposals.');
  }
}

// Client operations
export async function createClient(client: Client): Promise<Client> {
  if (isPostgres && pgPool) {
    await pgPool.query(
      `INSERT INTO clients (id, name, email, currency) VALUES ($1, $2, $3, $4)`,
      [client.id, client.name, client.email, client.currency || 'USD']
    );
    return client;
  }
  localData.clients.push(client);
  saveLocalData();
  return client;
}

export async function getClientById(id: string): Promise<Client | null> {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(`SELECT * FROM clients WHERE id = $1`, [id]);
    return (res.rows[0] as Client) || null;
  }
  return localData.clients.find(c => c.id === id) || null;
}

export async function getAllClients(): Promise<Client[]> {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(`SELECT * FROM clients ORDER BY created_at DESC`);
    return res.rows as Client[];
  }
  return [...localData.clients];
}

// Proposal operations
export async function createProposal(
  proposal: Proposal,
  items: Omit<LineItem, 'id' | 'proposal_id'>[]
): Promise<Proposal> {
  if (isPostgres && pgPool) {
    await pgPool.query(
      `INSERT INTO proposals (id, slug, client_id, title, body, status, total_amount, deposit_amount, deposit_paid, currency, revisions_included, turnaround_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        proposal.id,
        proposal.slug,
        proposal.client_id,
        proposal.title,
        proposal.body,
        proposal.status || 'DRAFT',
        proposal.total_amount,
        proposal.deposit_amount,
        proposal.deposit_paid || 0,
        proposal.currency || 'USD',
        proposal.revisions_included || 2,
        proposal.turnaround_days || 14,
      ]
    );

    for (const item of items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await pgPool.query(
        `INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, amount) VALUES ($1, $2, $3, $4, $5, $6)`,
        [itemId, proposal.id, item.description, item.quantity, item.unit_price, item.amount]
      );
    }

    return getProposalBySlug(proposal.slug) as Promise<Proposal>;
  }

  // Local fallback
  localData.proposals.push(proposal);
  for (const item of items) {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localData.line_items.push({
      id: itemId,
      proposal_id: proposal.id,
      ...item,
    });
  }
  saveLocalData();
  return (await getProposalBySlug(proposal.slug))!;
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  return DEFAULT_CREATORS.find(c => c.id === id) || DEFAULT_CREATORS[0];
}

export async function getProposalBySlug(slug: string): Promise<Proposal | null> {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(`SELECT * FROM proposals WHERE slug = $1`, [slug]);
    if (!res.rows[0]) return null;
    const prop = res.rows[0] as Proposal;
    const client = await getClientById(prop.client_id);
    const creator = await getCreatorById(prop.creator_id || 'cr_alex_rivera');
    const itemsRes = await pgPool.query(`SELECT * FROM line_items WHERE proposal_id = $1`, [prop.id]);
    prop.client = client || undefined;
    prop.creator = creator || undefined;
    prop.line_items = itemsRes.rows as LineItem[];
    return prop;
  }

  const prop = localData.proposals.find(p => p.slug === slug);
  if (!prop) return null;
  const client = localData.clients.find(c => c.id === prop.client_id);
  const creator = await getCreatorById(prop.creator_id || 'cr_alex_rivera');
  const items = localData.line_items.filter(i => i.proposal_id === prop.id);
  return {
    ...prop,
    client: client || undefined,
    creator: creator || undefined,
    line_items: items,
  };
}

export async function getAllProposals(creator_id?: string): Promise<Proposal[]> {
  if (isPostgres && pgPool) {
    let q = `SELECT * FROM proposals`;
    let params: any[] = [];
    if (creator_id) {
      q += ` WHERE creator_id = $1`;
      params.push(creator_id);
    }
    q += ` ORDER BY created_at DESC`;
    const res = await pgPool.query(q, params);
    const proposals: Proposal[] = [];
    for (const p of res.rows) {
      const full = await getProposalBySlug(p.slug);
      if (full) proposals.push(full);
    }
    return proposals;
  }

  let list = localData.proposals;
  if (creator_id) {
    list = list.filter(p => !p.creator_id || p.creator_id === creator_id);
  }

  return list.map(p => ({
    ...p,
    client: localData.clients.find(c => c.id === p.client_id),
    creator: DEFAULT_CREATORS.find(c => c.id === (p.creator_id || 'cr_alex_rivera')) || DEFAULT_CREATORS[0],
    line_items: localData.line_items.filter(i => i.proposal_id === p.id),
  }));
}

export async function updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | null> {
  if (isPostgres && pgPool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      if (['title', 'body', 'status', 'total_amount', 'deposit_amount', 'deposit_paid', 'revisions_included', 'turnaround_days'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }
    if (fields.length > 0) {
      values.push(id);
      await pgPool.query(
        `UPDATE proposals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx}`,
        values
      );
    }
    const res = await pgPool.query(`SELECT slug FROM proposals WHERE id = $1`, [id]);
    return res.rows[0] ? getProposalBySlug(res.rows[0].slug) : null;
  }

  const index = localData.proposals.findIndex(p => p.id === id);
  if (index === -1) return null;
  localData.proposals[index] = {
    ...localData.proposals[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveLocalData();
  return getProposalBySlug(localData.proposals[index].slug);
}

// Invoice operations
export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  if (isPostgres && pgPool) {
    await pgPool.query(
      `INSERT INTO invoices (id, proposal_id, client_id, amount, due_date, status, stripe_checkout_session_id, stripe_payment_intent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        invoice.id,
        invoice.proposal_id || null,
        invoice.client_id,
        invoice.amount,
        invoice.due_date || null,
        invoice.status || 'UNPAID',
        invoice.stripe_checkout_session_id || null,
        invoice.stripe_payment_intent_id || null,
      ]
    );
    return invoice;
  }

  localData.invoices.push(invoice);
  saveLocalData();
  return invoice;
}

export async function getAllInvoices(): Promise<Invoice[]> {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(`SELECT * FROM invoices ORDER BY created_at DESC`);
    const invoices: Invoice[] = [];
    for (const inv of res.rows) {
      const client = await getClientById(inv.client_id);
      invoices.push({ ...inv, client: client || undefined });
    }
    return invoices;
  }

  return localData.invoices.map(inv => ({
    ...inv,
    client: localData.clients.find(c => c.id === inv.client_id),
  }));
}
