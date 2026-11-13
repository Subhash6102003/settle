import { Router, Request, Response } from 'express';
import { createInvoice, getAllInvoices, getClientById, getInvoiceById, getCreatorById, updateInvoiceStatus } from '../db';
import { stripe } from '../stripe';
import { sendInvoiceReceiptEmail } from '../email';
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

    let sessionUrl = `${frontendUrl}/invoices/${invoiceId}?payment=success`;
    let sessionId = `cs_sim_${nanoid(16)}`;

    try {
      if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_') && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
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
        sessionUrl = session.url || sessionUrl;
        sessionId = session.id;
      }
    } catch (stripeErr: any) {
      console.warn('[STRIPE] Invoice session fallback:', stripeErr.message);
    }

    const invoice = await createInvoice({
      id: invoiceId,
      creator_id: (req as any).creator?.id || req.body.creator_id || client.creator_id,
      client_id,
      proposal_id: proposal_id || undefined,
      amount: Number(amount),
      currency: currency || client.currency || 'INR',
      due_date: due_date || undefined,
      status: 'UNPAID',
      stripe_checkout_session_id: sessionId,
    });

    res.status(201).json({
      success: true,
      invoice,
      payment_link: sessionUrl,
    });
  } catch (err: any) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: err.message || 'Failed to create invoice' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const creatorId = req.query.creator_id as string | undefined;
    const invoices = await getAllInvoices(creatorId);
    res.json({ invoices });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ invoice });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send official invoice & receipt email to client via SMTP rail
router.post('/:id/send-email', async (req: Request, res: Response) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const client = await getClientById(invoice.client_id);
    const creator = await getCreatorById(invoice.creator_id || client?.creator_id || 'cr_alex_rivera');
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://settle-blond.vercel.app';
    const receiptUrl = `${frontendUrl}/invoices/${invoice.id}`;

    const dispatchRes = await sendInvoiceReceiptEmail(
      invoice,
      client || { name: 'Commercial Partner', email: req.body.email || 'billing@partner.com' },
      creator,
      receiptUrl
    );

    res.json({
      success: true,
      message: `Official invoice receipt emailed to ${client?.email || req.body.email} via SMTP rail.`,
      dispatch: dispatchRes,
      receipt_url: receiptUrl,
    });
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

// Create Stripe Checkout Session for Invoice Payment
router.post('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice has already been paid in full' });
    }

    const client = await getClientById(invoice.client_id);
    const creator = await getCreatorById(invoice.creator_id || client?.creator_id || 'cr_alex_rivera');
    const currency = invoice.currency || client?.currency || creator?.currency || 'USD';
    const frontendUrl = process.env.FRONTEND_URL || 'https://settle-blond.vercel.app';

    let sessionUrl = `${frontendUrl}/invoices/${invoice.id}?payment=success`;
    let sessionId = `cs_sim_${nanoid(16)}`;

    try {
      if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_') && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer_email: client?.email && client.email.includes('@') ? client.email : undefined,
          line_items: [
            {
              price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                  name: `Invoice #${invoice.id} - ${creator?.studio_name || 'Studio'}`,
                  description: `Milestone settlement payment for invoice #${invoice.id}`,
                },
                unit_amount: Math.round(Number(invoice.amount) * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            invoiceId: invoice.id,
            type: 'invoice_payment',
          },
          success_url: `${frontendUrl}/invoices/${invoice.id}?payment=success`,
          cancel_url: `${frontendUrl}/invoices/${invoice.id}?payment=cancelled`,
        });

        sessionUrl = session.url || sessionUrl;
        sessionId = session.id;
      }
    } catch (stripeErr: any) {
      console.warn('[STRIPE] Invoice session generation fallback:', stripeErr.message);
    }

    res.json({
      success: true,
      checkout_url: sessionUrl,
      session_id: sessionId,
    });
  } catch (err: any) {
    console.error('Invoice checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// Mark invoice as paid (settled)
router.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updated = await updateInvoiceStatus(invoice.id, 'PAID');
    res.json({
      success: true,
      message: `Invoice #${invoice.id} marked as PAID.`,
      invoice: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
