import { Router, Request, Response } from 'express';
import { createProposal, getProposalBySlug, getAllProposals, updateProposal, getClientById, getCreatorById, createClient } from '../db';
import { createDepositCheckoutSession } from '../stripe';
import { nanoid } from 'nanoid';

const router = Router();

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .substring(0, 30);
  return `${base}-${nanoid(6)}`;
}

// Create Proposal (called by Claude MCP tool create_proposal)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      creator_id,
      title,
      body,
      line_items = [],
      deposit_percentage = 50,
      revisions_included = 2,
      turnaround_days = 14,
      currency,
      slug: customSlug,
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const resolvedCreatorId = (req as any).creator?.id || creator_id || 'cr_jM6U3UuVEB';
    const creator = resolvedCreatorId ? await getCreatorById(resolvedCreatorId) : null;
    const propCurrency = currency || (creator && creator.currency) || 'INR';

    let client = client_id ? await getClientById(client_id) : null;
    if (!client) {
      client = await createClient({
        id: (client_id && client_id.startsWith('cli_')) ? client_id : `cli_${nanoid(8)}`,
        creator_id: resolvedCreatorId,
        name: req.body.client_name || 'Infosys Limited',
        email: req.body.client_email || 'ap@infosys.com',
        company: req.body.client_company || 'Infosys Limited',
        currency: propCurrency,
      });
    }

    // Calculate line items total
    let total = 0;
    const formattedItems = line_items.map((item: any) => {
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

    const depositAmount = Math.round(((total * (deposit_percentage / 100))) * 100) / 100;
    const slug = customSlug ? customSlug.toLowerCase().trim() : slugify(title);
    const proposalId = `prop_${nanoid(10)}`;

    const proposal = await createProposal(
      {
        id: proposalId,
        slug,
        creator_id: resolvedCreatorId,
        client_id,
        title,
        body,
        status: 'SENT',
        total_amount: total,
        deposit_amount: depositAmount,
        deposit_paid: 0,
        currency: propCurrency,
        revisions_included: Number(revisions_included) || 2,
        turnaround_days: Number(turnaround_days) || 14,
      },
      formattedItems
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const publicUrl = `${frontendUrl}/p/${slug}`;

    res.status(201).json({
      success: true,
      proposal,
      public_link: publicUrl,
    });
  } catch (err: any) {
    console.error('Error creating proposal:', err);
    res.status(500).json({ error: err.message || 'Failed to create proposal' });
  }
});

// List all proposals for dashboard
router.get('/', async (req: Request, res: Response) => {
  try {
    const creatorId = req.query.creator_id as string | undefined;
    const proposals = await getAllProposals(creatorId);
    res.json({ proposals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get proposal by slug for public client viewer
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const proposal = await getProposalBySlug(req.params.slug);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ proposal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Human edit proposal (dashboard)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateProposal(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ success: true, proposal: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Stripe Checkout Session for deposit payment
router.post('/:slug/checkout', async (req: Request, res: Response) => {
  try {
    const proposal = await getProposalBySlug(req.params.slug);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.deposit_paid) {
      return res.status(400).json({ error: 'Deposit has already been paid for this proposal' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await createDepositCheckoutSession({
      proposalSlug: proposal.slug,
      proposalTitle: proposal.title,
      depositAmount: proposal.deposit_amount || proposal.total_amount,
      currency: proposal.currency,
      clientEmail: proposal.client?.email || '',
      frontendUrl,
    });

    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

export default router;
