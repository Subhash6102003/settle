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
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend and Claude Desktop
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Raw body parser for Stripe webhooks, JSON parser for standard APIs
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/status', statusRouter);
app.use('/api/webhooks', webhooksRouter);

// Health check endpoint (for AWS EC2 load balancer / status checks)
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    product: 'Settle',
    architecture: 'Zero AI Inside (Runs on Claude via MCP)',
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

async function startServer() {
  await initDb();

  // Auto-seed demo proposal and client on first run if database is empty
  try {
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
    console.warn('[SEED] Auto-seed check warning:', err.message);
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Settle Backend running on port ${PORT}`);
      console.log(`🔒 Zero AI Inside | Stripe Test Mode Active`);
      console.log(`⚡ Ready for Claude MCP and Vercel Frontend`);
      console.log(`===============================================`);
    });
  }
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

export default app;
export { app };
