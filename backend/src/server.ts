import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import clientsRouter from './routes/clients';
import proposalsRouter from './routes/proposals';
import invoicesRouter from './routes/invoices';
import statusRouter from './routes/status';
import webhooksRouter from './routes/webhooks';

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
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Settle Backend running on port ${PORT}`);
    console.log(`🔒 Zero AI Inside | Stripe Test Mode Active`);
    console.log(`⚡ Ready for Claude MCP and Vercel Frontend`);
    console.log(`===============================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
