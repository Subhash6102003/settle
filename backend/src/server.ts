import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initDb, getAllProposals, createClient, createProposal } from './db';
import clientsRouter from './routes/clients';
import proposalsRouter from './routes/proposals';
import invoicesRouter from './routes/invoices';
import statusRouter from './routes/status';
import webhooksRouter from './routes/webhooks';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for frontend and Claude Desktop
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Raw body parser for Stripe webhooks, JSON parser for standard APIs
app.use(['/api/webhooks', '/webhooks'], express.raw({ type: 'application/json' }));
app.use(express.json());

// API Routes (mounted with and without /api prefix for universal proxy compatibility)
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/clients', '/clients'], clientsRouter);
app.use(['/api/proposals', '/proposals'], proposalsRouter);
app.use(['/api/invoices', '/invoices'], invoicesRouter);
app.use(['/api/status', '/status'], statusRouter);
app.use(['/api/webhooks', '/webhooks'], webhooksRouter);

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
        name: 'Commercial Partner #104 (Acme Brands)',
        email: 'ap@acmebrand.com',
        currency: 'USD',
      });
      await createProposal(
        {
          id: 'prop_brand_refresh_demo',
          slug: 'acme-brand-refresh-2026',
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
