import { Router, Request, Response } from 'express';
import { getAllCreators, createCreator, getCreatorByEmail, getCreatorById, updateCreator, resetDatabase } from '../db';
import { sendCreatorOnboardingEmail, sendMcpConnectedEmail, getRecentEmails } from '../email';
import { nanoid } from 'nanoid';

const router = Router();

// Register new creator
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, studio_name, currency, description, phone, website, address, tax_id } = req.body;

    if (!name || !email || !password || !studio_name) {
      return res.status(400).json({ error: 'Name, email, password, and studio_name are required' });
    }

    const existing = await getCreatorByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const creatorId = `cr_${nanoid(10)}`;
    const apiKey = `stl_live_${nanoid(16)}`;

    const newCreator = await createCreator({
      id: creatorId,
      name,
      email,
      password_hash: password, // In production use bcrypt, plain for demo
      studio_name,
      currency: currency || 'INR',
      api_key: apiKey,
      plan: 'Pro',
      description: description || 'Commercial Production & Creative Direction',
      phone: phone || '',
      website: website || '',
      address: address || '',
      tax_id: tax_id || '',
    });

    // Send Onboarding Email asynchronously
    sendCreatorOnboardingEmail(newCreator).catch(err => console.warn('[EMAIL] Onboarding send failed:', err.message));

    res.status(201).json({
      success: true,
      creator: newCreator,
      token: `sess_${newCreator.id}_${nanoid(12)}`,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Failed to register creator' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const creator = await getCreatorByEmail(email);
    if (!creator) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // For demo simplicity, match password directly or demo hash
    if (creator.password_hash !== password && password !== 'demo' && password !== 'demo_hash_pass123') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      creator,
      token: `sess_${creator.id}_${nanoid(12)}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo 1-click login
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const creatorId = req.body.creator_id || 'cr_alex_rivera';
    const creator = await getCreatorById(creatorId);

    if (!creator) {
      return res.status(404).json({ error: 'Demo creator not found' });
    }

    res.json({
      success: true,
      creator,
      token: `sess_${creator.id}_demo`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let creatorId = 'cr_alex_rivera';

    if (authHeader && authHeader.startsWith('Bearer sess_')) {
      const parts = authHeader.replace('Bearer ', '').split('_');
      if (parts.length >= 2) {
        creatorId = `cr_${parts[1]}`;
      }
    }

    const creator = await getCreatorById(creatorId);
    res.json({ creator: creator || (await getAllCreators())[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update creator profile (including currency, studio name, name, description, contact)
router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const { id, currency, studio_name, name, email, description, phone, website, address, tax_id } = req.body;
    const targetId = id || (req as any).creator?.id;
    if (!targetId) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }
    const updated = await updateCreator(targetId, {
      ...(currency ? { currency } : {}),
      ...(studio_name ? { studio_name } : {}),
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(website !== undefined ? { website } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(tax_id !== undefined ? { tax_id } : {}),
    });
    if (!updated) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    res.json({ success: true, creator: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset database endpoint (keeps demo creators, clears all ephemeral test records)
router.post('/reset-db', async (_req: Request, res: Response) => {
  try {
    const result = await resetDatabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger Onboarding Email manually
router.post('/email/onboarding', async (req: Request, res: Response) => {
  try {
    const creator = (req as any).creator || (await getCreatorById(req.body.creator_id || 'cr_alex_rivera'));
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    const result = await sendCreatorOnboardingEmail(creator);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger MCP Connected Email manually
router.post('/email/mcp-connected', async (req: Request, res: Response) => {
  try {
    const creator = (req as any).creator || (await getCreatorById(req.body.creator_id || 'cr_alex_rivera'));
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    const result = await sendMcpConnectedEmail(creator, req.body.client_type || 'Claude / Universal MCP Agent');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recent Emails preview
router.get('/email/recent', (_req: Request, res: Response) => {
  res.json({ emails: getRecentEmails() });
});

export default router;
