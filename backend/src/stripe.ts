import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia' as any,
  httpClient: Stripe.createFetchHttpClient(),
  timeout: 30000,
});

export async function createDepositCheckoutSession(params: {
  proposalSlug: string;
  proposalTitle: string;
  depositAmount: number;
  currency: string;
  clientEmail: string;
  frontendUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const { proposalSlug, proposalTitle, depositAmount, currency, clientEmail, frontendUrl } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: clientEmail && clientEmail.includes('@') ? clientEmail : undefined,
    line_items: [
      {
        price_data: {
          currency: (currency || 'usd').toLowerCase(),
          product_data: {
            name: `Deposit: ${proposalTitle}`,
            description: `Upfront milestone deposit for proposal ${proposalSlug}`,
          },
          unit_amount: Math.round(depositAmount * 100), // cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      proposalSlug,
      type: 'proposal_deposit',
    },
    success_url: `${frontendUrl}/p/${proposalSlug}?payment=success`,
    cancel_url: `${frontendUrl}/p/${proposalSlug}?payment=cancelled`,
  });

  return session;
}
