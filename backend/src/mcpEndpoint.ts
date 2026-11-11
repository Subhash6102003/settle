import { Request, Response, Express } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  createClient,
  getAllClients,
  createProposal,
  getAllProposals,
  createInvoice,
  getAllInvoices,
  getCreatorByApiKey,
  getCreatorById,
} from './db';
import { Creator } from './types';
import { createDepositCheckoutSession } from './stripe';
import { nanoid } from 'nanoid';

// Keep track of active transports by sessionId
const activeTransports = new Map<string, { transport: SSEServerTransport; creator: Creator }>();

const TOOLS: Tool[] = [
  {
    name: 'add_client',
    description: 'Add or register a client in Settle with their name, email, and preferred currency.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client full name or company name (e.g. Acme Studio)' },
        email: { type: 'string', description: 'Client billing email address' },
        currency: { type: 'string', description: '3-letter currency code (e.g. INR, USD, EUR, GBP)', default: 'INR' },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'create_proposal',
    description: 'Draft and publish an interactive proposal with scope, line items, and upfront deposit terms. Returns a public link for the client.',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'string', description: 'ID of the client (from add_client)' },
        title: { type: 'string', description: 'Title of the proposal (e.g. Commercial Brand Video Campaign)' },
        body: { type: 'string', description: 'Full proposal narrative, scope description, deliverables, and payment terms' },
        line_items: {
          type: 'array',
          description: 'Itemized deliverables with descriptions, quantities, and unit prices',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'Deliverable name' },
              quantity: { type: 'number', default: 1 },
              unit_price: { type: 'number', description: 'Price per unit in chosen currency' },
              amount: { type: 'number', description: 'Total line item amount' },
            },
            required: ['description', 'unit_price'],
          },
        },
        deposit_percentage: { type: 'number', description: 'Percentage required upfront (default 50)', default: 50 },
        revisions_included: { type: 'number', description: 'Number of revision rounds included in base scope', default: 2 },
        turnaround_days: { type: 'number', description: 'Expected project completion timeline in days', default: 14 },
        currency: { type: 'string', description: 'Currency code (e.g. INR, USD, EUR)', default: 'INR' },
      },
      required: ['client_id', 'title', 'body', 'line_items'],
    },
  },
  {
    name: 'create_invoice',
    description: 'Generate an invoice with line items and a direct Stripe Checkout payment link.',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'string', description: 'ID of the client to bill' },
        amount: { type: 'number', description: 'Total amount to bill' },
        due_date: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
        items: {
          type: 'array',
          description: 'List of items/services billed',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              amount: { type: 'number' },
            },
            required: ['description', 'amount'],
          },
        },
        proposal_id: { type: 'string', description: 'Optional ID of associated proposal' },
      },
      required: ['client_id', 'amount'],
    },
  },
  {
    name: 'get_status',
    description: 'List all open proposals, accepted proposals, and unpaid/overdue invoices with financial summary.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_clients',
    description: 'List all registered commercial partners and clients in your studio ledger.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_proposals',
    description: 'List all published proposals and agreements with their statuses and amounts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function createMcpServerInstance(creator: Creator): Server {
  const server = new Server(
    {
      name: `settle-mcp-${creator.studio_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as any;

    try {
      switch (name) {
        case 'add_client': {
          const clientId = `cli_${nanoid(8)}`;
          const client = await createClient({
            id: clientId,
            creator_id: creator.id,
            name: a.name,
            email: a.email,
            currency: a.currency || creator.currency || 'INR',
          });
          return {
            content: [{
              type: 'text',
              text: `Client created successfully in your Settle ledger!\n\nClient ID: ${client.id}\nName: ${client.name}\nEmail: ${client.email}\nCurrency: ${client.currency}`,
            }],
          };
        }

        case 'create_proposal': {
          const propId = `prop_${nanoid(10)}`;
          const slug = a.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 30) + `-${nanoid(6)}`;
          
          let total = 0;
          const formattedItems = (a.line_items || []).map((item: any) => {
            const qty = Number(item.quantity) || 1;
            const rate = Number(item.unit_price) || 0;
            const amount = Number(item.amount) || qty * rate;
            total += amount;
            return {
              description: item.description || 'Deliverable',
              quantity: qty,
              unit_price: rate,
              amount,
            };
          });

          const depositPct = Number(a.deposit_percentage) || 50;
          const depositAmount = Math.round((total * depositPct) / 100);
          const currency = a.currency || creator.currency || 'INR';

          const proposal = await createProposal(
            {
              id: propId,
              slug,
              creator_id: creator.id,
              client_id: a.client_id,
              title: a.title,
              body: a.body,
              status: 'SENT',
              total_amount: total,
              deposit_amount: depositAmount,
              deposit_paid: 0,
              currency,
              revisions_included: Number(a.revisions_included) || 2,
              turnaround_days: Number(a.turnaround_days) || 14,
            },
            formattedItems
          );

          const frontendUrl = process.env.FRONTEND_URL || 'https://settle-blond.vercel.app';
          const publicUrl = `${frontendUrl}/p/${slug}`;

          return {
            content: [{
              type: 'text',
              text: `Proposal created in your Settle ledger!\n\nTitle: ${proposal.title}\nPublic Link: ${publicUrl}\nTotal: ${currency} ${proposal.total_amount.toLocaleString()}\n50% Upfront Deposit: ${currency} ${proposal.deposit_amount.toLocaleString()}\nStatus: SENT\n\nThe client can open the link directly in their browser to review terms and pay the deposit via Stripe Checkout.`,
            }],
          };
        }

        case 'create_invoice': {
          const invoiceId = `inv_${nanoid(8)}`;
          const currency = creator.currency || 'INR';
          const invoice = await createInvoice({
            id: invoiceId,
            creator_id: creator.id,
            client_id: a.client_id,
            amount: Number(a.amount),
            currency,
            status: 'UNPAID',
            due_date: a.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            stripe_payment_intent_id: undefined,
            proposal_id: a.proposal_id || undefined,
          });

          return {
            content: [{
              type: 'text',
              text: `Invoice #${invoice.id} created!\n\nAmount: ${currency} ${invoice.amount.toLocaleString()}\nDue Date: ${invoice.due_date}\nStatus: UNPAID`,
            }],
          };
        }

        case 'list_clients': {
          const clients = await getAllClients(creator.id);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(clients, null, 2),
            }],
          };
        }

        case 'list_proposals': {
          const proposals = await getAllProposals(creator.id);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(proposals, null, 2),
            }],
          };
        }

        case 'get_status': {
          const proposals = await getAllProposals(creator.id);
          const invoices = await getAllInvoices(creator.id);
          const clients = await getAllClients(creator.id);

          const totalPipeline = proposals.reduce((acc, p) => acc + Number(p.total_amount), 0);
          const depositCleared = proposals.reduce((acc, p) => acc + (p.deposit_paid ? Number(p.deposit_amount) : 0), 0);

          return {
            content: [{
              type: 'text',
              text: `=== Studio Ledger Summary for ${creator.studio_name} ===\nSettlement Currency: ${creator.currency}\nTotal Commercial Partners: ${clients.length}\nActive Proposals: ${proposals.length} (Total Pipeline: ${creator.currency} ${totalPipeline.toLocaleString()})\nDeposits Cleared: ${creator.currency} ${depositCleared.toLocaleString()}\nOutstanding Invoices: ${invoices.filter(i => i.status === 'UNPAID').length}`,
            }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err: any) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error executing ${name}: ${err.message}`,
        }],
      };
    }
  });

  return server;
}

export function setupMcpRoutes(app: Express) {
  // Remote MCP endpoint over Server-Sent Events (SSE)
  // Claude.ai Browser connects to: https://settle-dbck.onrender.com/sse?key=stl_live_...
  app.get(['/sse', '/mcp'], async (req: Request, res: Response) => {
    try {
      const apiKey = (req.query.key as string) || (req.query.apiKey as string) || (req.headers['x-api-key'] as string);
      
      let creator: Creator | null = null;
      if (apiKey) {
        creator = await getCreatorByApiKey(apiKey);
      }
      if (!creator) {
        creator = await getCreatorById('cr_alex_rivera');
      }
      if (!creator) {
        res.status(401).send('Invalid or missing Settle API key');
        return;
      }

      console.log(`[MCP SSE] Inbound connection for studio: ${creator.studio_name} (${creator.id})`);

      const transport = new SSEServerTransport('/messages', res);
      const server = createMcpServerInstance(creator);

      activeTransports.set(transport.sessionId, { transport, creator });

      transport.onclose = () => {
        console.log(`[MCP SSE] Connection closed for session ${transport.sessionId}`);
        activeTransports.delete(transport.sessionId);
      };

      await server.connect(transport);
    } catch (err: any) {
      console.error('[MCP SSE Error]', err);
      if (!res.headersSent) {
        res.status(500).send(`SSE error: ${err.message}`);
      }
    }
  });

  // Message posting endpoint for Claude.ai
  app.post(['/messages', '/api/messages'], async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        res.status(400).send('Missing sessionId query parameter');
        return;
      }

      const session = activeTransports.get(sessionId);
      if (!session) {
        res.status(404).send('SSE session expired or not found');
        return;
      }

      await session.transport.handlePostMessage(req, res, req.body);
    } catch (err: any) {
      console.error('[MCP Post Message Error]', err);
      if (!res.headersSent) {
        res.status(500).send(`Message error: ${err.message}`);
      }
    }
  });
}
