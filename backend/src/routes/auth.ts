import { Router, Request, Response } from 'express';
import { getAllCreators, createCreator, getCreatorByEmail, getCreatorById } from '../db';
import { nanoid } from 'nanoid';

const router = Router();

// Register new creator
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, studio_name, currency } = req.body;

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
      currency: currency || 'USD',
      api_key: apiKey,
      plan: 'Pro',
    });

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

export default router;
