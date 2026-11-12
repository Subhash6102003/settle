import { Request, Response, Express, Router } from 'express';
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
  getCreatorByEmail,
  getCreatorById,
  createCreator,
  updateCreator,
} from './db';
import { Creator } from './types';
import { nanoid } from 'nanoid';
import { sendMcpConnectedEmail, sendInvoiceReceiptEmail } from './email';

// Keep track of active transports, connection heartbeat, and notification state
const activeTransports = new Map<string, { transport: SSEServerTransport; creator: Creator }>();
const creatorMcpActivity = new Map<string, { lastSeen: Date; client: string }>();
const notifiedMcpCreators = new Set<string>();

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
        client_id: { type: 'string', description: 'ID of the client (from add_client or list_clients)' },
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
  {
    name: 'get_studio_profile',
    description: 'Retrieve current creator studio business profile, bio/description, creative capabilities, settlement currency, and business contact information.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_studio_profile',
    description: 'Update creator studio business profile, description (what we do / services offered), phone, website, address, or tax ID so it appears on official invoices and client receipts.',
    inputSchema: {
      type: 'object',
      properties: {
        studio_name: { type: 'string', description: 'Studio or agency business name' },
        description: { type: 'string', description: 'What we do: studio description, creative capabilities, equipment, and specialization' },
        phone: { type: 'string', description: 'Business phone contact' },
        website: { type: 'string', description: 'Studio portfolio or official website' },
        address: { type: 'string', description: 'Physical or business address' },
        tax_id: { type: 'string', description: 'Business tax registration, GSTIN, or EIN number' },
      },
    },
  },
];

async function handleToolExecution(name: string, a: any, creator: Creator) {
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
      const currency = a.currency || creator.currency || 'INR';

      // Auto-resolve or register client if AI passed name instead of ID
      let resolvedClientId = a.client_id;
      const existingClients = await getAllClients(creator.id);
      let matchedClient = existingClients.find(c =>
        c.id === a.client_id ||
        c.name.toLowerCase().includes((a.client_id || '').toLowerCase()) ||
        c.email.toLowerCase().includes((a.client_id || '').toLowerCase())
      );

      if (!matchedClient) {
        const newClient = await createClient({
          id: `cli_${nanoid(8)}`,
          creator_id: creator.id,
          name: a.client_name || a.client_id || 'Commercial Partner',
          email: a.client_email || 'billing@partner.io',
          currency,
        });
        resolvedClientId = newClient.id;
      } else {
        resolvedClientId = matchedClient.id;
      }
      
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

      const proposal = await createProposal(
        {
          id: propId,
          slug,
          creator_id: creator.id,
          client_id: resolvedClientId,
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
          text: `Proposal created in your Settle ledger!\n\nTitle: ${proposal.title}\nPublic Executive Link: ${publicUrl}\nTotal: ${currency} ${proposal.total_amount.toLocaleString()}\n50% Upfront Deposit: ${currency} ${proposal.deposit_amount.toLocaleString()}\nStatus: SENT\n\nThe client can open the link directly in their browser to review executive scope terms and pay the deposit via Stripe.`,
        }],
      };
    }

    case 'create_invoice': {
      const invoiceId = `inv_${nanoid(8)}`;
      const currency = a.currency || creator.currency || 'INR';

      // Auto-resolve or register client if AI passed name instead of ID
      let resolvedClientId = a.client_id;
      const existingClients = await getAllClients(creator.id);
      let matchedClient = existingClients.find(c =>
        c.id === a.client_id ||
        c.name.toLowerCase().includes((a.client_id || '').toLowerCase()) ||
        c.email.toLowerCase().includes((a.client_id || '').toLowerCase())
      );

      if (!matchedClient) {
        const newClient = await createClient({
          id: `cli_${nanoid(8)}`,
          creator_id: creator.id,
          name: a.client_name || a.client_id || 'Commercial Partner',
          email: a.client_email || 'billing@partner.io',
          currency,
        });
        resolvedClientId = newClient.id;
      } else {
        resolvedClientId = matchedClient.id;
      }

      const invoice = await createInvoice({
        id: invoiceId,
        creator_id: creator.id,
        client_id: resolvedClientId,
        amount: Number(a.amount),
        currency,
        status: 'UNPAID',
        due_date: a.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        stripe_payment_intent_id: undefined,
        proposal_id: a.proposal_id || undefined,
      });

      const frontendUrl = process.env.FRONTEND_URL || 'https://settle-blond.vercel.app';
      const receiptUrl = `${frontendUrl}/invoices/${invoice.id}`;

      // Dispatch client email notification with receipt link
      sendInvoiceReceiptEmail(
        invoice,
        matchedClient || { name: a.client_name || a.client_id, email: a.client_email || 'billing@partner.com' },
        creator,
        receiptUrl
      ).catch(err => console.warn('[EMAIL] Invoice receipt dispatch error:', err.message));

      let profileGuidance = '';
      if (!creator.description) {
        profileGuidance = `\n\nTip: You can ask the creator for their studio bio/description and services using update_studio_profile so it renders permanently on their executive receipts.`;
      }

      const clientName = matchedClient?.name || a.client_name || a.client_id;
      const clientEmail = matchedClient?.email || a.client_email || 'billing@partner.com';
      const waText = encodeURIComponent(`Hello! Here is the official invoice & payment receipt for #${invoice.id} (${currency} ${invoice.amount.toLocaleString()}) from ${creator.studio_name}:\n${receiptUrl}`);
      const waLink = `https://api.whatsapp.com/send?text=${waText}`;

      return {
        content: [{
          type: 'text',
          text: `Official Invoice #${invoice.id} created successfully in your Settle ledger!\n\n• Partner: ${clientName} (${clientEmail})\n• Amount: ${currency} ${invoice.amount.toLocaleString()}\n• Due Date: ${invoice.due_date}\n• Status: UNPAID\n\nOfficial Executive Receipt & Stripe Payment Link:\n${receiptUrl}\n\nClient Delivery Rail Options:\n1. Direct Email: Official receipt notification is prepared for ${clientEmail} via Settle SMTP rail.\n2. WhatsApp Share: ${waLink}\n3. Direct Link: ${receiptUrl}${profileGuidance}`,
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

    case 'get_studio_profile': {
      return {
        content: [{
          type: 'text',
          text: `=== Commercial Studio Profile ===\nStudio Name: ${creator.studio_name}\nPrincipal: ${creator.name}\nEmail: ${creator.email}\nPhone: ${creator.phone || 'Not set'}\nWebsite: ${creator.website || 'Not set'}\nAddress: ${creator.address || 'Not set'}\nTax/EIN ID: ${creator.tax_id || 'Not set'}\nCurrency: ${creator.currency}\nDescription / What We Do: ${creator.description || 'Not set'}\n\nAll these details appear automatically on your official invoices and executive receipts.`,
        }],
      };
    }

    case 'update_studio_profile': {
      const updated = await updateCreator(creator.id, {
        ...(a.studio_name ? { studio_name: a.studio_name } : {}),
        ...(a.description ? { description: a.description } : {}),
        ...(a.phone ? { phone: a.phone } : {}),
        ...(a.website ? { website: a.website } : {}),
        ...(a.address ? { address: a.address } : {}),
        ...(a.tax_id ? { tax_id: a.tax_id } : {}),
      });
      return {
        content: [{
          type: 'text',
          text: `Studio profile updated successfully! These details will now appear on all official client receipts and milestone agreements.\n\nStudio Name: ${updated?.studio_name || creator.studio_name}\nDescription: ${updated?.description || a.description || 'Updated'}\nAddress: ${updated?.address || a.address || 'Updated'}\nPhone: ${updated?.phone || a.phone || 'Updated'}`,
        }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function sendJson(res: Response, statusCode: number, data: any) {
  const payload = Buffer.from(JSON.stringify(data), 'utf-8');
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
  });
  return res.end(payload);
}

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
    return await handleToolExecution(name, args || {}, creator);
  });

  return server;
}

async function resolveCreatorFromReq(req: Request): Promise<Creator | null> {
  const auth = req.headers.authorization;
  const apiKey =
    (req.query.key as string) ||
    (req.query.apiKey as string) ||
    (req.query.api_key as string) ||
    (req.headers['x-api-key'] as string) ||
    (auth && auth.startsWith('Bearer ') ? auth.replace('Bearer ', '').trim() : null);

  const emailParam =
    (req.query.email as string) ||
    (req.query.creator_email as string) ||
    (req.headers['x-creator-email'] as string);

  // 1. Direct Email binding (e.g. /mcp?email=Subhashmaurya6102003@gmail.com)
  if (emailParam) {
    const cleanEmail = emailParam.toLowerCase().trim();
    const creatorByEmail = await getCreatorByEmail(cleanEmail);
    if (creatorByEmail) return creatorByEmail;

    // Auto-provision an isolated studio account tied to this exact email
    const studioName = (req.query.studio as string) || 'RKM Developments';
    const newStudio = await createCreator({
      id: `cr_${nanoid(10)}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      password_hash: 'demo_pass',
      studio_name: studioName,
      currency: 'INR',
      api_key: `stl_live_${nanoid(16)}`,
      plan: 'Pro',
      description: 'Custom software engineering studio specializing in high-performance web applications, desktop tools, and local LLM integrations.',
    });
    console.log(`[MCP] Auto-provisioned isolated studio for email ${cleanEmail}: ${newStudio.id}`);
    return newStudio;
  }

  // 2. Direct API Key binding (e.g. /mcp?key=stl_live_...)
  if (apiKey) {
    const creator = await getCreatorByApiKey(apiKey);
    if (creator) return creator;

    if (apiKey.startsWith('stl_live_')) {
      const studioName = (req.query.studio as string) || 'My Creator Studio';
      const newLiveCreator = await createCreator({
        id: `cr_${nanoid(10)}`,
        name: 'Studio Owner',
        email: `${apiKey.slice(0, 16)}@settle.studio`,
        password_hash: 'live',
        studio_name: studioName,
        currency: 'INR',
        api_key: apiKey,
        plan: 'Pro',
      });
      console.log(`[MCP] Provisioned clean isolated studio for key ${apiKey}: ${newLiveCreator.id}`);
      return newLiveCreator;
    }

    return null;
  }

  // Only unauthenticated test probes without any API key fall back to demo
  return await getCreatorById('cr_alex_rivera');
}

export function setupMcpRoutes(app: Express) {
  // Real-time MCP connectivity status API for the frontend dashboard
  app.get(['/api/mcp/status', '/mcp/status'], async (req: Request, res: Response) => {
    const creatorId = (req.query.creator_id as string) || 'cr_alex_rivera';
    const activity = creatorMcpActivity.get(creatorId);

    // Active SSE sessions for this creator
    const activeSessionCount = Array.from(activeTransports.values()).filter(s => s.creator.id === creatorId).length;

    const isConnected = activeSessionCount > 0 || (activity && (Date.now() - activity.lastSeen.getTime()) < 300000); // within 5 mins

    res.json({
      connected: Boolean(isConnected),
      activeSessions: activeSessionCount,
      lastSeen: activity ? activity.lastSeen.toISOString() : null,
      client: activity ? activity.client : null,
      transports: ['http-post', 'sse'],
      toolsCount: TOOLS.length,
      tools: TOOLS.map(t => t.name),
    });
  });

  // Universal MCP Endpoint: Handles both Streamable HTTP (modern) and SSE (legacy)
  app.all(['/mcp', '/sse', '/api/mcp'], async (req: Request, res: Response) => {
    const creator = await resolveCreatorFromReq(req);
    if (!creator) {
      res.status(401).json({ error: 'Unauthorized: Valid Settle API key required' });
      return;
    }

    // Record activity
    creatorMcpActivity.set(creator.id, {
      lastSeen: new Date(),
      client: req.headers['user-agent'] || 'Claude / Universal MCP Agent',
    });

    if (!notifiedMcpCreators.has(creator.id)) {
      notifiedMcpCreators.add(creator.id);
      sendMcpConnectedEmail(creator, (req.headers['user-agent'] as string) || 'Claude / Universal MCP Agent')
        .catch(err => console.warn('[EMAIL] MCP connected send error:', err.message));
    }

    // 1. Handle HTTP GET request
    if (req.method === 'GET') {
      const acceptsEventStream = req.headers.accept && req.headers.accept.includes('text/event-stream');

      // If client requests SSE stream (or hits /sse directly)
      if (acceptsEventStream || req.path === '/sse') {
        try {
          console.log(`[MCP SSE] Inbound connection for studio: ${creator.studio_name} (${creator.id})`);
          const transport = new SSEServerTransport('/messages', res);
          const server = createMcpServerInstance(creator);

          activeTransports.set(transport.sessionId, { transport, creator });

          transport.onclose = () => {
            console.log(`[MCP SSE] Connection closed for session ${transport.sessionId}`);
            activeTransports.delete(transport.sessionId);
          };

          await server.connect(transport);
          return;
        } catch (err: any) {
          console.error('[MCP SSE Error]', err);
          if (!res.headersSent) res.status(500).send(`SSE error: ${err.message}`);
          return;
        }
      }

      // If browser/healthcheck probes GET /mcp
      return sendJson(res, 200, {
        name: 'Settle MCP Server',
        version: '1.0.0',
        status: 'ready',
        protocolVersion: '2024-11-05',
        transports: ['http-post', 'sse'],
        creator: {
          id: creator.id,
          studio_name: creator.studio_name,
          currency: creator.currency,
        },
        tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
      });
    }

    // 2. Handle HTTP POST request (Streamable HTTP / JSON-RPC)
    if (req.method === 'POST') {
      const sessionId = req.query.sessionId as string;

      // If it's a message targeting an existing SSE session
      if (sessionId && activeTransports.has(sessionId)) {
        const session = activeTransports.get(sessionId)!;
        await session.transport.handlePostMessage(req, res, req.body);
        return;
      }

      // Direct Streamable HTTP JSON-RPC Handling
      const { jsonrpc, id, method, params } = req.body || {};

      if (!method) {
        return sendJson(res, 400, { jsonrpc: '2.0', id: id || null, error: { code: -32600, message: 'Invalid Request: Missing method' } });
      }

      console.log(`[MCP HTTP] Method: ${method} from ${creator.studio_name}`);

      switch (method) {
        case 'initialize': {
          return sendJson(res, 200, {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: 'settle-mcp-server',
                version: '1.0.0',
              },
            },
          });
        }

        case 'notifications/initialized': {
          return sendJson(res, 200, { jsonrpc: '2.0', result: {} });
        }

        case 'ping': {
          return sendJson(res, 200, { jsonrpc: '2.0', id, result: {} });
        }

        case 'tools/list': {
          return sendJson(res, 200, {
            jsonrpc: '2.0',
            id,
            result: {
              tools: TOOLS,
            },
          });
        }

        case 'tools/call': {
          try {
            const toolName = params?.name;
            const toolArgs = params?.arguments || {};
            const result = await handleToolExecution(toolName, toolArgs, creator);
            return sendJson(res, 200, {
              jsonrpc: '2.0',
              id,
              result,
            });
          } catch (err: any) {
            return sendJson(res, 200, {
              jsonrpc: '2.0',
              id,
              result: {
                isError: true,
                content: [{ type: 'text', text: `Tool error: ${err.message}` }],
              },
            });
          }
        }

        default: {
          return sendJson(res, 404, {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` },
          });
        }
      }
    }

    // Fallback
    res.status(405).send('Method Not Allowed');
  });

  // Dedicated /messages route for SSE POST routing
  app.post(['/messages', '/api/messages'], async (req: Request, res: Response) => {
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
  });
}
