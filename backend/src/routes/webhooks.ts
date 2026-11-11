import { Router, Request, Response } from 'express';
import { stripe } from '../stripe';
import { getProposalBySlug, updateProposal, getAllInvoices, createInvoice } from '../db';

const router = Router();

// Stripe Webhook handler
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && webhookSecret !== 'whsec_demo_placeholder' && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In dev or demo mode without signed secret, accept JSON payload directly
      event = req.body;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    if (metadata.type === 'proposal_deposit' && metadata.proposalSlug) {
      const proposal = await getProposalBySlug(metadata.proposalSlug);
      if (proposal) {
        console.log(`[STRIPE] Deposit paid for proposal: ${proposal.slug}`);
        await updateProposal(proposal.id, {
          status: 'ACCEPTED',
          deposit_paid: 1,
        });
      }
    } else if (metadata.type === 'invoice_payment' && metadata.invoiceId) {
      const invoices = await getAllInvoices();
      const invoice = invoices.find(inv => inv.id === metadata.invoiceId);
      if (invoice) {
        console.log(`[STRIPE] Invoice paid: ${invoice.id}`);
        // Mark as paid
        invoice.status = 'PAID';
        invoice.stripe_payment_intent_id = session.payment_intent;
      }
    }
  }

  res.json({ received: true });
});

export default router;
