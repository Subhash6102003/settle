import { Router, Request, Response } from 'express';
import { createClient, getAllClients } from '../db';
import { nanoid } from 'nanoid';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, currency, creator_id } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const client = await createClient({
      id: `cli_${nanoid(10)}`,
      creator_id: creator_id || undefined,
      name,
      email,
      currency: currency || 'USD',
    });

    res.status(201).json({ success: true, client });
  } catch (err: any) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: err.message || 'Failed to create client' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const creatorId = req.query.creator_id as string | undefined;
    const clients = await getAllClients(creatorId);
    res.json({ clients });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
