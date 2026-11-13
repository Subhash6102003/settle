import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initDb, getAllProposals, createClient, createProposal, getCreatorByApiKey, getCreatorById, createInvoice, getAllInvoices } from './db';
import clientsRouter from './routes/clients';
import proposalsRouter from './routes/proposals';
import invoicesRouter from './routes/invoices';
import statusRouter from './routes/status';
import webhooksRouter from './routes/webhooks';
import authRouter from './routes/auth';
import { setupMcpRoutes } from './mcpEndpoint';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all frontends (production, preview branches, and localhost)
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Raw body parser for Stripe webhooks, JSON parser for standard APIs
app.use(['/api/webhooks', '/webhooks'], express.raw({ type: 'application/json' }));
app.use(express.json());

// API Key & MCP Creator Context Middleware
app.use(async (req: any, _res, next) => {
  try {
    const auth = req.headers.authorization;
    const apiKey =
      (req.headers['x-api-key'] as string) ||
      (req.query.key as string) ||
      (req.query.apiKey as string) ||
      (req.query.api_key as string) ||
      (auth && auth.startsWith('Bearer stl_live_') ? auth.replace('Bearer ', '').trim() : null);

    if (apiKey) {
      const creator = await getCreatorByApiKey(apiKey);
      if (creator) {
        req.creator = creator;
        req.query.creator_id = creator.id;
        if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body && typeof req.body === 'object') {
          req.body.creator_id = creator.id;
        }
      }
    }
  } catch {}
  next();
});

// Self Profile Lookup endpoint
app.get(['/api/auth/me', '/auth/me'], async (req: any, res) => {
  if (req.creator) return res.json({ creator: req.creator });
  const id = req.query.creator_id || 'cr_alex_rivera';
  const c = await getCreatorById(id as string);
  res.json({ creator: c });
});

// API Routes (mounted with and without /api prefix for universal proxy compatibility)
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/clients', '/clients'], clientsRouter);
app.use(['/api/proposals', '/proposals'], proposalsRouter);
app.use(['/api/invoices', '/invoices'], invoicesRouter);
app.use(['/api/status', '/status'], statusRouter);
app.use(['/api/webhooks', '/webhooks'], webhooksRouter);

// Mount Remote MCP Server over SSE (Claude Browser Connectors)
setupMcpRoutes(app);

// Health check endpoint
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'healthy',
    product: 'Settle',
    architecture: 'Zero AI Inside (Runs on Claude & MCP)',
    timestamp: new Date().toISOString(),
  });
});

// Root welcome
app.get('/', (_req, res) => {
  res.json({
    name: 'Settle API Engine',
    version: '1.0.0',
    docs: {
      proposals: '/api/proposals',
      clients: '/api/clients',
      invoices: '/api/invoices',
      status: '/api/status',
      health: '/health',
    },
  });
});

async function initializeBackend() {
  try {
    await initDb();
    const existing = await getAllProposals();
    if (existing.length === 0) {
      const client = await createClient({
        id: 'cli_acme_demo',
        creator_id: 'cr_alex_rivera',
        name: 'Commercial Partner #104 (Acme Brands)',
        email: 'ap@acmebrand.com',
        currency: 'USD',
      });
      await createProposal(
        {
          id: 'prop_brand_refresh_demo',
          slug: 'acme-brand-refresh-2026',
          creator_id: 'cr_alex_rivera',
          client_id: client.id,
          title: 'Commercial Video Post-Production & Motion Package',
          body: `Complete post-production, dynamic motion graphics, sound design, and multi-platform social cutdowns for Acme's 2026 Product Launch.\n\nDeliverables:\n- 1x 90-second 4K Master Commercial (16:9 widescreen)\n- 3x 30-second TikTok / Instagram Reels Cutdowns (9:16 vertical with burned-in dynamic captions)\n- 2x 15-second Pre-Roll Teasers\n- Commercial sync license for original audio score\n- Professional DaVinci Resolve color grade calibrated for OLED & mobile displays\n\nPayment Milestone:\n- 50% upfront deposit ($2,400) to lock schedule\n- 50% balance upon final master approval before raw ProRes export`,
          status: 'SENT',
          total_amount: 4800,
          deposit_amount: 2400,
          deposit_paid: 0,
          currency: 'USD',
          revisions_included: 2,
          turnaround_days: 14,
        },
        [
          { description: 'Hero Brand Commercial (90s 4K Master Cut)', quantity: 1, unit_price: 2200, amount: 2200 },
          { description: 'Vertical Social Cutdowns (3x 30s 9:16 with Dynamic Typography)', quantity: 3, unit_price: 450, amount: 1350 },
          { description: 'Dolby Atmos Audio Mastering & Commercial SFX Licensing', quantity: 1, unit_price: 650, amount: 650 },
          { description: 'DaVinci Resolve HDR Color Grading & Look Development', quantity: 1, unit_price: 600, amount: 600 },
        ]
      );
      console.log('[SEED] Demo client and proposal auto-seeded.');
    }

    const existingInvoices = await getAllInvoices();
    if (existingInvoices.length === 0 || !existingInvoices.some(i => i.id === 'inv__ZKOYjGr')) {
      // Ensure Infosys client exists for Subhash / RKM Developments
      await createClient({
        id: 'cli_OIlb5Rpp',
        creator_id: 'cr_jM6U3UuVEB',
        name: 'Infosys Limited',
        email: 'ap@infosys.com',
        phone: '+91 80 2852 0261',
        company: 'Infosys Limited',
        currency: 'INR',
      }).catch(() => {});

      await createInvoice({
        id: 'inv__ZKOYjGr',
        creator_id: 'cr_jM6U3UuVEB',
        client_id: 'cli_OIlb5Rpp',
        amount: 250000,
        currency: 'INR',
        due_date: '2026-12-12',
        status: 'UNPAID',
      }).catch(() => {});

      await createInvoice({
        id: 'inv_demo_acme_deposit',
        creator_id: 'cr_alex_rivera',
        proposal_id: 'prop_brand_refresh_demo',
        client_id: 'cli_acme_demo',
        amount: 2400,
        currency: 'USD',
        due_date: 'Net 14 Milestone Settlement',
        status: 'UNPAID',
      }).catch(() => {});

      await createInvoice({
        id: 'inv_subhash_code_editor',
        creator_id: 'cr_jM6U3UuVEB',
        client_id: 'cli_OIlb5Rpp',
        amount: 180000,
        currency: 'INR',
        due_date: 'Net 14 Milestone Settlement',
        status: 'UNPAID',
      }).catch(() => {});
      console.log('[SEED] Demo invoices auto-seeded.');
    }
  } catch (err: any) {
    console.warn('[INIT] Initialization warning:', err.message);
  }
}

// Start background initialization without blocking handler exports
initializeBackend().catch(err => console.warn('[INIT] Background init warning:', err));

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 Settle Backend running on 0.0.0.0:${PORT}`);
    console.log(`🔒 Zero AI Inside | Stripe Test Mode Active`);
    console.log(`⚡ Ready for Claude MCP, Render and Vercel`);
    console.log(`===============================================`);
  });
}

// Universal export for both Vercel Serverless (CommonJS function) and ES Module imports
const handler = (req: any, res: any) => app(req, res);
(handler as any).default = app;
(handler as any).app = app;

module.exports = handler;
export default app;
export { app };
