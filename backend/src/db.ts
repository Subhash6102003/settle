import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { Client, Proposal, LineItem, Invoice, Creator } from './types';
import { nanoid } from 'nanoid';

const isPostgres = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

let pgPool: Pool | null = null;
const isVercel = Boolean(process.env.VERCEL);
const jsonDbPath = isVercel
  ? path.resolve('/tmp', 'store.json')
  : path.resolve(__dirname, '..', 'data', 'store.json');

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
    description: 'High-end commercial video post-production, 4K HDR color mastering, and broadcast motion design.',
    phone: '+1 (555) 382-9104',
    website: 'https://apexcut.studio',
    address: '1088 Sansome St, Suite 400, San Francisco, CA 94111',
    tax_id: 'US-EIN-84-2910492',
  },
  {
    id: 'cr_elena_vance',
    name: 'Elena Vance',
    email: 'elena@vancefilms.io',
    studio_name: 'Vance Motion Works',
    currency: 'USD',
    api_key: 'stl_live_elena_7c34d9',
    plan: 'Pro',
    description: 'Boutique cinematic visual effects, sound design, and 3D product animation.',
    phone: '+1 (555) 749-2041',
    website: 'https://vancefilms.io',
    address: '420 W 14th St, New York, NY 10014',
    tax_id: 'US-EIN-13-9481023',
  },
  {
    id: 'cr_jM6U3UuVEB',
    name: 'Subhash Maurya',
    email: 'rkm6102003@gmail.com',
    studio_name: 'RKM Developments',
    currency: 'INR',
    api_key: 'stl_live_I13EbVlgh78RS68t',
    plan: 'Pro',
    description: 'Custom software engineering studio specializing in high-performance web applications, desktop tools, and local LLM integrations.',
    phone: '+91 98765 43210',
    website: 'https://settle-blond.vercel.app',
    address: 'Bengaluru, Karnataka, India',
    tax_id: 'IN-GST-29AAAAA0000A1Z5',
  },
];

const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'cli_OIlb5Rpp',
    creator_id: 'cr_jM6U3UuVEB',
    name: 'Infosys Limited',
    email: 'ap@infosys.com',
    phone: '+91 80 2852 0261',
    company: 'Infosys Limited',
    currency: 'INR',
  },
  {
    id: 'cli_acme_demo',
    creator_id: 'cr_alex_rivera',
    name: 'Commercial Partner #104 (Acme Brands)',
    email: 'ap@acmebrand.com',
    phone: '+1 (555) 902-1842',
    company: 'Acme Brands Inc.',
    currency: 'USD',
  },
];

const DEFAULT_PROPOSALS: Proposal[] = [
  {
    id: 'prop_infosys_code_editor',
    slug: 'infosys-ai-code-editor-suite-2026',
    creator_id: 'cr_jM6U3UuVEB',
    client_id: 'cli_OIlb5Rpp',
    title: 'AI Code Editor Desktop Application + Offline LLM Integration Suite',
    body: `Complete software engineering architecture, Electron.js desktop IDE core, Monaco code editor AST bindings, and offline local LLM runtime engine for Infosys engineering teams.\n\nDeliverables:\n- 1x Cross-Platform Desktop IDE with Monaco AST & multi-tab buffer management\n- 1x Offline Local LLM Runtime Engine (Native Ollama / Llama.cpp bridge with zero cloud latency)\n- 1x Autonomous Code Generation & Diff Streaming Engine\n- 1x Model Context Protocol (MCP) Extension Bus & Production Packaging\n\nCommercial Milestones:\n- 50% Upfront Milestone Deposit (₹2,50,000) to lock architecture sprint\n- 50% Settlement upon UAT signoff and binary distribution`,
    status: 'SENT',
    total_amount: 500000,
    deposit_amount: 250000,
    deposit_paid: 0,
    currency: 'INR',
    revisions_included: 3,
    turnaround_days: 21,
    created_at: '2026-11-13T00:00:00.000Z',
    updated_at: '2026-11-13T00:00:00.000Z',
  },
  {
    id: 'prop_brand_refresh_demo',
    slug: 'acme-brand-refresh-2026',
    creator_id: 'cr_alex_rivera',
    client_id: 'cli_acme_demo',
    title: 'Commercial Video Post-Production & Motion Package',
    body: `Complete post-production, dynamic motion graphics, sound design, and multi-platform social cutdowns for Acme's 2026 Product Launch.`,
    status: 'SENT',
    total_amount: 4800,
    deposit_amount: 2400,
    deposit_paid: 0,
    currency: 'USD',
    revisions_included: 2,
    turnaround_days: 14,
    created_at: '2026-11-13T00:00:00.000Z',
    updated_at: '2026-11-13T00:00:00.000Z',
  },
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv__ZKOYjGr',
    creator_id: 'cr_jM6U3UuVEB',
    client_id: 'cli_OIlb5Rpp',
    amount: 250000,
    currency: 'INR',
    due_date: '2026-12-12',
    status: 'UNPAID',
    proposal_id: 'prop_infosys_code_editor',
    created_at: '2026-11-13T00:00:00.000Z',
  },
  {
    id: 'inv_subhash_code_editor',
    creator_id: 'cr_jM6U3UuVEB',
    client_id: 'cli_OIlb5Rpp',
    amount: 180000,
    currency: 'INR',
    due_date: '2026-11-26',
    status: 'UNPAID',
    proposal_id: 'prop_infosys_code_editor',
    created_at: '2026-11-13T00:00:00.000Z',
  },
  {
    id: 'inv_demo_acme_deposit',
    creator_id: 'cr_alex_rivera',
    proposal_id: 'prop_brand_refresh_demo',
    client_id: 'cli_acme_demo',
    amount: 2400,
    currency: 'USD',
    due_date: 'Net 14 Milestone Settlement',
    status: 'UNPAID',
    created_at: '2026-11-13T00:00:00.000Z',
  },
];

let localData: SchemaData = {
  creators: DEFAULT_CREATORS,
  clients: DEFAULT_CLIENTS,
  proposals: DEFAULT_PROPOSALS,
  line_items: [],
  invoices: DEFAULT_INVOICES,
};

function loadLocalData(): void {
  try {
    if (fs.existsSync(jsonDbPath)) {
      const raw = fs.readFileSync(jsonDbPath, 'utf-8');
      const parsed = JSON.parse(raw);
      localData = {
        creators: parsed.creators && parsed.creators.length > 0 ? parsed.creators : DEFAULT_CREATORS,
        clients: parsed.clients && parsed.clients.length > 0 ? parsed.clients : DEFAULT_CLIENTS,
        proposals: parsed.proposals && parsed.proposals.length > 0 ? parsed.proposals : DEFAULT_PROPOSALS,
        line_items: parsed.line_items || [],
        invoices: parsed.invoices && parsed.invoices.length > 0 ? parsed.invoices : DEFAULT_INVOICES,
      };

      for (const defInv of DEFAULT_INVOICES) {
        if (!localData.invoices.some(i => i.id === defInv.id)) {
          localData.invoices.push(defInv);
        }
      }
      for (const defCli of DEFAULT_CLIENTS) {
        if (!localData.clients.some(c => c.id === defCli.id)) {
          localData.clients.push(defCli);
        }
      }
      for (const defProp of DEFAULT_PROPOSALS) {
        if (!localData.proposals.some(p => p.id === defProp.id)) {
          localData.proposals.push(defProp);
        }
      }
    } else {
      localData = {
        creators: [...DEFAULT_CREATORS],
        clients: [...DEFAULT_CLIENTS],
        proposals: [...DEFAULT_PROPOSALS],
        line_items: [],
        invoices: [...DEFAULT_INVOICES],
      };
      saveLocalData();
    }
  } catch (err) {
    console.warn('[DB] Warning loading local store:', err);
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
    console.warn('[DB] Warning saving local store:', err);
  }
}

// Initialize in-memory data
loadLocalData();

if (isPostgres) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 2500,
      query_timeout: 3000,
    });
    pgPool.on('error', (err) => {
      console.warn('[DB] Idle PostgreSQL client error:', err.message);
    });
    console.log('[DB] PostgreSQL pool initialized');
  } catch (err: any) {
    console.warn('[DB] Failed to initialize PostgreSQL pool:', err.message);
    pgPool = null;
  }
}

export function isPostgresEnabled(): string {
  if (!isPostgres) return 'no_database_url_configured';
  if (!pgPool) return 'pool_initialization_failed';
  return 'connected_postgresql';
}

export async function initDb(): Promise<void> {
  loadLocalData();

  if (isPostgres && pgPool) {
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS creators (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) DEFAULT 'demo_pass',
          studio_name VARCHAR(255) NOT NULL,
          currency VARCHAR(10) DEFAULT 'USD',
          api_key VARCHAR(128) UNIQUE NOT NULL,
          plan VARCHAR(32) DEFAULT 'Pro',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS clients (
          id VARCHAR(64) PRIMARY KEY,
          creator_id VARCHAR(64),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          currency VARCHAR(10) DEFAULT 'USD',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS proposals (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(128) UNIQUE NOT NULL,
          creator_id VARCHAR(64),
          client_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          status VARCHAR(32) DEFAULT 'SENT',
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
          creator_id VARCHAR(64),
          proposal_id VARCHAR(64),
          client_id VARCHAR(64) NOT NULL,
          amount NUMERIC NOT NULL,
          due_date VARCHAR(64),
          status VARCHAR(32) DEFAULT 'UNPAID',
          stripe_checkout_session_id VARCHAR(255),
          stripe_payment_intent_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Ensure client extensions
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(64) DEFAULT '';
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS company VARCHAR(255) DEFAULT '';

        -- Ensure creator profile extensions
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS phone VARCHAR(64) DEFAULT '';
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS website VARCHAR(255) DEFAULT '';
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
        ALTER TABLE creators ADD COLUMN IF NOT EXISTS tax_id VARCHAR(64) DEFAULT '';

        -- Backfill any invoices created without creator_id from their clients table
        UPDATE invoices SET creator_id = clients.creator_id FROM clients WHERE invoices.client_id = clients.id AND (invoices.creator_id IS NULL OR invoices.creator_id = '');

        INSERT INTO creators (id, name, email, studio_name, currency, api_key, plan)
        VALUES 
          ('cr_alex_rivera', 'Alex Rivera', 'alex@apexcut.studio', 'Apex Cut Creative Studio', 'USD', 'stl_live_alex_9a82b1', 'Pro'),
          ('cr_elena_vance', 'Elena Vance', 'elena@vancefilms.io', 'Vance Motion Works', 'USD', 'stl_live_elena_7c34d9', 'Pro'),
          ('cr_jM6U3UuVEB', 'Subhash Maurya', 'rkm6102003@gmail.com', 'RKM Developments', 'INR', 'stl_live_I13EbVlgh78RS68t', 'Pro')
        ON CONFLICT (id) DO UPDATE SET studio_name = EXCLUDED.studio_name, currency = EXCLUDED.currency;
      `);
      console.log('[DB] PostgreSQL schemas verified and self-initialized.');
    } catch (e: any) {
      console.warn('[DB] PostgreSQL schema warning, using in-memory store:', e.message);
    }
  }
}

// Client operations
export async function createClient(client: Client): Promise<Client> {
  const existingIdx = localData.clients.findIndex(c => c.id === client.id);
  if (existingIdx >= 0) {
    localData.clients[existingIdx] = client;
  } else {
    localData.clients.push(client);
  }
  saveLocalData();

  if (isPostgres && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO clients (id, creator_id, name, email, phone, company, currency) VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, currency = EXCLUDED.currency`,
        [
          client.id,
          client.creator_id || null,
          client.name,
          client.email,
          client.phone || '',
          client.company || '',
          client.currency || 'INR',
        ]
      );
      return client;
    } catch (err: any) {
      console.warn('[DB] PG createClient initial attempt failed, attempting fallback query:', err.message);
      try {
        await pgPool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS company VARCHAR(255) DEFAULT ''; ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(64) DEFAULT '';`);
        await pgPool.query(
          `INSERT INTO clients (id, creator_id, name, email, currency) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [client.id, client.creator_id || null, client.name, client.email, client.currency || 'INR']
        );
      } catch (e: any) {
        console.warn('[DB] PG createClient fallback failed, saved in memory:', e.message);
      }
    }
  }
  return client;
}

export async function getClientById(id: string): Promise<Client | null> {
  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM clients WHERE id = $1`, [id]);
      if (res.rows[0]) return res.rows[0] as Client;
    } catch (err: any) {
      console.warn('[DB] PG getClientById failed, falling back:', err.message);
    }
  }
  return localData.clients.find(c => c.id === id) || null;
}

export async function getAllClients(creator_id?: string): Promise<Client[]> {
  if (isPostgres && pgPool) {
    try {
      let q = `SELECT * FROM clients`;
      const params: any[] = [];
      if (creator_id) {
        q += ` WHERE creator_id = $1`;
        params.push(creator_id);
      }
      q += ` ORDER BY created_at DESC`;
      const res = await pgPool.query(q, params);
      return res.rows as Client[];
    } catch (err: any) {
      console.warn('[DB] PG getAllClients failed, falling back:', err.message);
    }
  }
  let list = localData.clients;
  if (creator_id) {
    list = list.filter(c => c.creator_id === creator_id);
  }
  return [...list];
}

// Proposal operations
export async function createProposal(
  proposal: Proposal,
  items: Omit<LineItem, 'id' | 'proposal_id'>[]
): Promise<Proposal> {
  const existingIdx = localData.proposals.findIndex(p => p.id === proposal.id || p.slug === proposal.slug);
  if (existingIdx >= 0) {
    localData.proposals[existingIdx] = proposal;
  } else {
    localData.proposals.push(proposal);
  }

  for (const item of items) {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localData.line_items.push({
      id: itemId,
      proposal_id: proposal.id,
      ...item,
    });
  }
  saveLocalData();

  if (isPostgres && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO proposals (id, slug, creator_id, client_id, title, body, status, total_amount, deposit_amount, deposit_paid, currency, revisions_included, turnaround_days)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, total_amount = EXCLUDED.total_amount, deposit_amount = EXCLUDED.deposit_amount`,
        [
          proposal.id,
          proposal.slug,
          proposal.creator_id || null,
          proposal.client_id,
          proposal.title,
          proposal.body,
          proposal.status || 'SENT',
          proposal.total_amount,
          proposal.deposit_amount,
          proposal.deposit_paid || 0,
          proposal.currency || 'INR',
          proposal.revisions_included || 2,
          proposal.turnaround_days || 14,
        ]
      );

      for (const item of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await pgPool.query(
          `INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, amount) VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [itemId, proposal.id, item.description, item.quantity, item.unit_price, item.amount]
        );
      }

      const created = await getProposalBySlug(proposal.slug);
      if (created) return created;
    } catch (err: any) {
      console.warn('[DB] PG createProposal failed, kept in local store:', err.message);
    }
  }

  return (await getProposalBySlug(proposal.slug)) || proposal;
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  const targetId = (id === 'cr_subhash_maurya' || id === 'cr_rkm_dev') ? 'cr_jM6U3UuVEB' : id;
  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM creators WHERE id = $1`, [targetId]);
      if (res.rows[0]) return res.rows[0] as Creator;
    } catch (err: any) {
      console.warn('[DB] PG getCreatorById failed, falling back:', err.message);
    }
  }
  return localData.creators.find(c => c.id === targetId) || localData.creators.find(c => c.id === id) || localData.creators[0] || null;
}

export async function getCreatorByEmail(email: string): Promise<Creator | null> {
  const cleanEmail = email.toLowerCase().trim();
  const isSubhashOrRkm = cleanEmail.includes('subhash') || cleanEmail.includes('rkm');
  const emailAliases = isSubhashOrRkm
    ? ['rkm6102003@gmail.com', 'subhashmaurya6102003@gmail.com', cleanEmail]
    : [cleanEmail];

  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(
        `SELECT * FROM creators WHERE LOWER(TRIM(email)) = ANY($1::text[]) OR (id = 'cr_jM6U3UuVEB' AND $2 = true) LIMIT 1`,
        [emailAliases, isSubhashOrRkm]
      );
      if (res.rows[0]) return res.rows[0] as Creator;
    } catch (err: any) {
      console.warn('[DB] PG getCreatorByEmail failed, falling back:', err.message);
    }
  }
  return localData.creators.find(c => emailAliases.includes(c.email.toLowerCase().trim())) || (isSubhashOrRkm ? localData.creators.find(c => c.id === 'cr_jM6U3UuVEB') : null) || null;
}

export async function getAllCreators(): Promise<Creator[]> {
  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM creators ORDER BY created_at ASC`);
      if (res.rows.length > 0) return res.rows as Creator[];
    } catch (err: any) {
      console.warn('[DB] PG getAllCreators failed, falling back:', err.message);
    }
  }
  return [...localData.creators];
}

export async function createCreator(creator: Creator): Promise<Creator> {
  if (isPostgres && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO creators (id, name, email, password_hash, studio_name, currency, api_key, plan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [creator.id, creator.name, creator.email, (creator as any).password_hash || '', creator.studio_name, creator.currency || 'USD', creator.api_key, creator.plan || 'Pro']
      );
      return creator;
    } catch (err: any) {
      console.warn('[DB] PG createCreator failed, saving to local store:', err.message);
    }
  }
  localData.creators.push(creator);
  saveLocalData();
  return creator;
}

export async function updateCreator(id: string, updates: Partial<Creator>): Promise<Creator | null> {
  if (isPostgres && pgPool) {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const [key, val] of Object.entries(updates)) {
        if (['name', 'email', 'studio_name', 'currency', 'plan', 'description', 'phone', 'website', 'address', 'tax_id'].includes(key)) {
          fields.push(`${key} = $${idx++}`);
          values.push(val);
        }
      }
      if (fields.length > 0) {
        values.push(id);
        await pgPool.query(`UPDATE creators SET ${fields.join(', ')} WHERE id = $${idx}`, values);
      }
      return getCreatorById(id);
    } catch (err: any) {
      console.warn('[DB] PG updateCreator failed, falling back:', err.message);
    }
  }

  const index = localData.creators.findIndex(c => c.id === id);
  if (index === -1) return null;
  localData.creators[index] = {
    ...localData.creators[index],
    ...updates,
  };
  saveLocalData();
  return localData.creators[index];
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  if (isPostgres && pgPool) {
    try {
      await pgPool.query(`
        DELETE FROM line_items;
        DELETE FROM invoices;
        DELETE FROM proposals;
        DELETE FROM clients;
        DELETE FROM creators WHERE id NOT IN ('cr_alex_rivera', 'cr_elena_vance');
      `);
      // Restore default demo creators if missing
      for (const c of DEFAULT_CREATORS) {
        await pgPool.query(
          `INSERT INTO creators (id, name, email, studio_name, currency, api_key, plan, description, phone, website, address, tax_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             studio_name = EXCLUDED.studio_name,
             currency = EXCLUDED.currency,
             description = EXCLUDED.description,
             phone = EXCLUDED.phone,
             website = EXCLUDED.website,
             address = EXCLUDED.address,
             tax_id = EXCLUDED.tax_id`,
          [c.id, c.name, c.email, c.studio_name, c.currency, c.api_key, c.plan, c.description || '', c.phone || '', c.website || '', c.address || '', c.tax_id || '']
        );
      }
    } catch (err: any) {
      console.warn('[DB] PG resetDatabase failed:', err.message);
    }
  }

  localData = {
    creators: [...DEFAULT_CREATORS],
    clients: [],
    proposals: [],
    line_items: [],
    invoices: [],
  };
  saveLocalData();

  return { success: true, message: 'Database reset successfully. Only demo creators preserved.' };
}

export async function getCreatorByApiKey(apiKey: string): Promise<Creator | null> {
  // 1. Check known default creators first (never re-provision a known key)
  const defaultMatch = DEFAULT_CREATORS.find(c => c.api_key === apiKey);
  if (defaultMatch) return defaultMatch;

  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM creators WHERE api_key = $1`, [apiKey]);
      if (res.rows[0]) return res.rows[0] as Creator;
    } catch (err: any) {
      console.warn('[DB] PG getCreatorByApiKey failed, falling back:', err.message);
    }
  }

  const existing = localData.creators.find(c => c.api_key === apiKey);
  if (existing) return existing;

  // If it's a known Subhash / RKM key, return cr_jM6U3UuVEB
  if (apiKey === 'stl_live_I13EbVlgh78RS68t' || apiKey.includes('subhash') || apiKey.includes('rkm')) {
    return DEFAULT_CREATORS.find(c => c.id === 'cr_jM6U3UuVEB') || null;
  }

  if (apiKey.startsWith('stl_live_')) {
    const newLiveCreator: Creator = {
      id: `cr_${nanoid(10)}`,
      name: 'My Creator Studio',
      email: `${apiKey.slice(0, 16)}@settle.studio`,
      studio_name: 'My Creator Studio',
      currency: 'INR',
      api_key: apiKey,
      plan: 'Pro',
    };
    if (isPostgres && pgPool) {
      await createCreator(newLiveCreator).catch(() => {});
    }
    localData.creators.push(newLiveCreator);
    saveLocalData();
    return newLiveCreator;
  }

  return null;
}

export async function getProposalBySlug(slug: string): Promise<Proposal | null> {
  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM proposals WHERE slug = $1`, [slug]);
      if (res.rows[0]) {
        const prop = res.rows[0] as Proposal;
        const client = await getClientById(prop.client_id);
        const creator = await getCreatorById(prop.creator_id || 'cr_alex_rivera');
        const itemsRes = await pgPool.query(`SELECT * FROM line_items WHERE proposal_id = $1`, [prop.id]);
        prop.client = client || undefined;
        prop.creator = creator || undefined;
        prop.line_items = itemsRes.rows as LineItem[];
        return prop;
      }
    } catch (err: any) {
      console.warn('[DB] PG getProposalBySlug failed, falling back:', err.message);
    }
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
  const targetId = (creator_id === 'cr_subhash_maurya' || creator_id === 'cr_rkm_dev') ? 'cr_jM6U3UuVEB' : creator_id;
  if (isPostgres && pgPool) {
    try {
      let q = `SELECT p.* FROM proposals p LEFT JOIN clients c ON p.client_id = c.id`;
      let params: any[] = [];
      if (targetId) {
        q += ` WHERE (p.creator_id = $1 OR c.creator_id = $1)`;
        params.push(targetId);
      }
      q += ` ORDER BY p.created_at DESC`;
      const res = await pgPool.query(q, params);
      const proposals: Proposal[] = [];
      for (const p of res.rows) {
        const full = await getProposalBySlug(p.slug);
        if (full) proposals.push(full);
      }
      if (proposals.length > 0) return proposals;
    } catch (err: any) {
      console.warn('[DB] PG getAllProposals failed, falling back:', err.message);
    }
  }

  let list = localData.proposals;
  if (targetId) {
    list = list.filter(p => {
      if (p.creator_id === targetId) return true;
      const c = localData.clients.find(cl => cl.id === p.client_id);
      return c && c.creator_id === targetId;
    });
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
    try {
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
      if (res.rows[0]) return getProposalBySlug(res.rows[0].slug);
    } catch (err: any) {
      console.warn('[DB] PG updateProposal failed, falling back:', err.message);
    }
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
export async function updateInvoiceStatus(id: string, status: 'UNPAID' | 'PAID' | 'OVERDUE'): Promise<Invoice | null> {
  if (isPostgres && pgPool) {
    try {
      await pgPool.query(`UPDATE invoices SET status = $1 WHERE id = $2`, [status, id]);
      return await getInvoiceById(id);
    } catch (err: any) {
      console.warn('[DB] PG updateInvoiceStatus failed, falling back:', err.message);
    }
  }

  const invoice = localData.invoices.find(inv => inv.id === id);
  if (invoice) {
    invoice.status = status;
    saveLocalData();
    return invoice;
  }
  return null;
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  const existingIdx = localData.invoices.findIndex(inv => inv.id === invoice.id);
  if (existingIdx >= 0) {
    localData.invoices[existingIdx] = invoice;
  } else {
    localData.invoices.push(invoice);
  }
  saveLocalData();

  if (isPostgres && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO invoices (id, creator_id, proposal_id, client_id, amount, due_date, status, stripe_checkout_session_id, stripe_payment_intent_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, status = EXCLUDED.status, due_date = EXCLUDED.due_date`,
        [
          invoice.id,
          invoice.creator_id || null,
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
    } catch (err: any) {
      console.warn('[DB] PG createInvoice failed, kept in local store:', err.message);
    }
  }

  return invoice;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
      if (res.rows[0]) {
        const inv = res.rows[0] as Invoice;
        const client = await getClientById(inv.client_id);
        const creator = await getCreatorById(inv.creator_id || client?.creator_id || 'cr_alex_rivera');
        if (inv.proposal_id) {
          const itemsRes = await pgPool.query(`SELECT * FROM line_items WHERE proposal_id = $1`, [inv.proposal_id]);
          inv.items = itemsRes.rows;
        }
        return { ...inv, client: client || undefined, creator: creator || undefined };
      }
    } catch (err: any) {
      console.warn('[DB] PG getInvoiceById failed, falling back:', err.message);
    }
  }

  const invoice = localData.invoices.find(inv => inv.id === id);
  if (!invoice) return null;

  const client = localData.clients.find(c => c.id === invoice.client_id);
  const creator = localData.creators.find(c => c.id === invoice.creator_id) || localData.creators[0];
  const items = invoice.proposal_id ? localData.line_items.filter(i => i.proposal_id === invoice.proposal_id) : (invoice.items || []);

  return {
    ...invoice,
    client,
    creator,
    items,
  };
}

export async function getAllInvoices(creator_id?: string): Promise<Invoice[]> {
  const targetId = (creator_id === 'cr_subhash_maurya' || creator_id === 'cr_rkm_dev') ? 'cr_jM6U3UuVEB' : creator_id;
  if (isPostgres && pgPool) {
    try {
      let q = `SELECT i.* FROM invoices i LEFT JOIN clients c ON i.client_id = c.id`;
      const params: any[] = [];
      if (targetId) {
        q += ` WHERE (i.creator_id = $1 OR c.creator_id = $1)`;
        params.push(targetId);
      }
      q += ` ORDER BY i.created_at DESC`;
      const res = await pgPool.query(q, params);
      const invoices: Invoice[] = [];
      for (const inv of res.rows) {
        const client = await getClientById(inv.client_id);
        invoices.push({ ...inv, client: client || undefined });
      }
      if (invoices.length > 0) return invoices;
    } catch (err: any) {
      console.warn('[DB] PG getAllInvoices failed, falling back:', err.message);
    }
  }

  let list = localData.invoices;
  if (targetId) {
    list = list.filter(inv => {
      if (inv.creator_id === targetId) return true;
      const c = localData.clients.find(cl => cl.id === inv.client_id);
      return c && c.creator_id === targetId;
    });
  }

  return list.map(inv => ({
    ...inv,
    client: localData.clients.find(c => c.id === inv.client_id),
  }));
}
