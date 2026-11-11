import { Router, Request, Response } from 'express';
import { getAllProposals, getAllInvoices } from '../db';

const router = Router();

// get_status() - lists open proposals and overdue/unpaid invoices
router.get('/', async (req: Request, res: Response) => {
  try {
    const creatorId = req.query.creator_id as string | undefined;
    const proposals = await getAllProposals(creatorId);
    const invoices = await getAllInvoices(creatorId);

    const openProposals = proposals.filter(p => p.status !== 'PAID');
    const acceptedProposals = proposals.filter(p => p.status === 'ACCEPTED' || p.deposit_paid === 1);
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID');

    res.json({
      summary: {
        total_open_proposals: openProposals.length,
        total_accepted_proposals: acceptedProposals.length,
        total_unpaid_invoices: unpaidInvoices.length,
        pipeline_value: openProposals.reduce((sum, p) => sum + Number(p.total_amount), 0),
        collected_deposits: acceptedProposals.reduce((sum, p) => sum + Number(p.deposit_amount), 0),
      },
      open_proposals: openProposals.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        client: p.client?.name,
        client_email: p.client?.email,
        total_amount: p.total_amount,
        deposit_amount: p.deposit_amount,
        deposit_paid: Boolean(p.deposit_paid),
        status: p.status,
        created_at: p.created_at,
      })),
      unpaid_invoices: unpaidInvoices.map(inv => ({
        id: inv.id,
        client: inv.client?.name,
        amount: inv.amount,
        due_date: inv.due_date,
        status: inv.status,
        created_at: inv.created_at,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
