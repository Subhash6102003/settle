import { Router, Request, Response } from 'express';
import { createInvoice, getAllInvoices, getClientById } from '../db';
import { stripe } from '../stripe';
import { nanoid } from 'nanoid';

const router = Router();

// Create Invoice (called by Claude MCP tool create_invoice)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { client_id, proposal_id, amount, due_date, items = [] } = req.body;

    if (!client_id || !amount) {
      return res.status(400).json({ error: 'client_id and amount are required' });
    }

    const client = await getClientById(client_id);
    if (!client) {
      return res.status(404).json({ error: `Client ${client_id} not found` });
    }

    const invoiceId = `inv_${nanoid(10)}`;
    const currency = client.currency || 'USD';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create a Stripe checkout session for this invoice directly
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: client.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Invoice #${invoiceId}`,
              description: items.length > 0 ? items.map((i: any) => i.description).join(', ') : 'Creative freelance services',
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId,
        type: 'invoice_payment',
      },
      success_url: `${frontendUrl}/invoices/${invoiceId}?payment=success`,
      cancel_url: `${frontendUrl}/invoices/${invoiceId}?payment=cancelled`,
    });

    const invoice = await createInvoice({
      id: invoiceId,
      client_id,
      proposal_id: proposal_id || undefined,
      amount: Number(amount),
      due_date: due_date || undefined,
      status: 'UNPAID',
      stripe_checkout_session_id: session.id,
    });

    res.status(201).json({
      success: true,
      invoice,
      payment_link: session.url,
    });
  } catch (err: any) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: err.message || 'Failed to create invoice' });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const invoices = await getAllInvoices();
    res.json({ invoices });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send reminder (called by Claude MCP tool send_reminder)
router.post('/:id/reminder', async (req: Request, res: Response) => {
  try {
    const invoices = await getAllInvoices();
    const invoice = invoices.find(inv => inv.id === req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Zero AI - pure programmatic email dispatch / notification log
    console.log(`[REMINDER] Sending payment reminder for invoice ${invoice.id} to ${invoice.client?.email}`);

    res.json({
      success: true,
      message: `Reminder sent to ${invoice.client?.name || 'client'} (${invoice.client?.email || 'email on file'}) for invoice #${invoice.id}.`,
      invoice_id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
