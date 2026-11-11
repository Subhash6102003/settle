import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.SETTLE_API_URL || 'https://settle-dbck.onrender.com';
const SETTLE_API_KEY = process.env.SETTLE_API_KEY || '';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(SETTLE_API_KEY ? { 'Authorization': `Bearer ${SETTLE_API_KEY}`, 'x-api-key': SETTLE_API_KEY } : {}),
  };
}

const server = new Server(
  {
    name: 'settle-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define MCP Tools
const TOOLS: Tool[] = [
  {
    name: 'add_client',
    description: 'Add or register a client in Settle with their name, email, and preferred currency.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client full name or company name (e.g. Acme Studio)' },
        email: { type: 'string', description: 'Client billing email address' },
        currency: { type: 'string', description: '3-letter currency code (e.g. USD, EUR, GBP, AUD, CAD)', default: 'USD' },
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
        title: { type: 'string', description: 'Title of the proposal (e.g. Brand Refresh 3-Week Video Edit)' },
        body: { type: 'string', description: 'Full proposal narrative, scope description, deliverables, and payment terms' },
        line_items: {
          type: 'array',
          description: 'Itemized deliverables with descriptions, quantities, and unit prices',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'Deliverable name (e.g. 3x 60s TikTok Edit Cuts)' },
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
    name: 'send_reminder',
    description: 'Trigger a professional payment reminder email to the client for an overdue or pending invoice.',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'string', description: 'ID of the invoice to send a reminder for' },
      },
      required: ['invoice_id'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'add_client': {
        const res = await fetch(`${API_BASE_URL}/api/clients`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(args),
        });
        const data = await res.json();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'create_proposal': {
        const res = await fetch(`${API_BASE_URL}/api/proposals`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(args),
        });
        const data = await res.json();
        return {
          content: [
            {
              type: 'text',
              text: `Proposal created successfully!\n\nPublic Link: ${data.public_link}\nProposal ID: ${data.proposal?.id}\nTotal: ${data.proposal?.currency} ${data.proposal?.total_amount}\nUpfront Deposit: ${data.proposal?.currency} ${data.proposal?.deposit_amount}\nStatus: ${data.proposal?.status}\n\nClient can open the public link to review terms and pay deposit directly via Stripe.`,
            },
          ],
        };
      }

      case 'create_invoice': {
        const res = await fetch(`${API_BASE_URL}/api/invoices`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(args),
        });
        const data = await res.json();
        return {
          content: [
            {
              type: 'text',
              text: `Invoice #${data.invoice?.id} created!\n\nPayment Link: ${data.payment_link}\nAmount: ${data.invoice?.currency || '$'}${data.invoice?.amount}\nStatus: ${data.invoice?.status}`,
            },
          ],
        };
      }

      case 'get_status': {
        const res = await fetch(`${API_BASE_URL}/api/status`, {
          headers: getHeaders(),
        });
        const data = await res.json();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'send_reminder': {
        const invoiceId = (args as any).invoice_id;
        const res = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/reminder`, {
          method: 'POST',
          headers: getHeaders(),
        });
        const data = await res.json();
        return {
          content: [
            {
              type: 'text',
              text: data.message || `Reminder dispatched for invoice ${invoiceId}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${err.message}`,
        },
      ],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[SETTLE MCP] Settle MCP server running on stdio');
}

run().catch((err) => {
  console.error('Fatal MCP server error:', err);
  process.exit(1);
});
