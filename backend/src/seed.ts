import dotenv from 'dotenv';
dotenv.config();

import { initDb, createClient, createProposal, getAllProposals } from './db';

async function seed() {
  await initDb();
  const existing = await getAllProposals();
  if (existing.length > 0) {
    console.log('[SEED] Database already contains', existing.length, 'proposals. Skipping seed.');
    return;
  }

  console.log('[SEED] Seeding demo video editor client and proposal...');

  const client = await createClient({
    id: 'cli_acme_demo',
    name: 'Acme Media & Co.',
    email: 'sarah@acmemedia.io',
    currency: 'USD',
  });

  const proposal = await createProposal(
    {
      id: 'prop_brand_refresh_demo',
      slug: 'acme-brand-refresh-2026',
      client_id: client.id,
      title: 'Acme 3-Week Commercial Brand Launch Video Package',
      body: `Complete post-production, dynamic motion graphics, sound design, and multi-platform social cutdowns for Acme's 2026 Product Launch.\n\nDeliverables:\n- 1x 90-second 4K Master Commercial (16:9 widescreen)\n- 3x 30-second TikTok / Instagram Reels Cutdowns (9:16 vertical with burned-in dynamic captions)\n- 2x 15-second Pre-Roll Teasers\n- Commercial sync license for original audio score\n- Professional DaVinci Resolve color grade calibrated for OLED & mobile displays\n\nPayment Milestone:\n- 50% upfront deposit ($2,400) to lock schedule\n- 50% balance upon final master approval before raw ProRes export`,
      status: 'SENT',
      total_amount: 4800,
      deposit_amount: 2400,
      deposit_paid: 0,
      currency: 'USD',
      revisions_included: 2,
      turnaround_days: 14,
    },
    [
      {
        description: 'Hero Brand Commercial (90s 4K Master Cut)',
        quantity: 1,
        unit_price: 2200,
        amount: 2200,
      },
      {
        description: 'Vertical Social Cutdowns (3x 30s 9:16 with Dynamic Typography)',
        quantity: 3,
        unit_price: 450,
        amount: 1350,
      },
      {
        description: 'Dolby Atmos Audio Mastering & Commercial SFX Licensing',
        quantity: 1,
        unit_price: 650,
        amount: 650,
      },
      {
        description: 'DaVinci Resolve HDR Color Grading & Look Development',
        quantity: 1,
        unit_price: 600,
        amount: 600,
      },
    ]
  );

  console.log(`[SEED] Created seed proposal: /p/${proposal.slug}`);
}

seed().catch(console.error);
