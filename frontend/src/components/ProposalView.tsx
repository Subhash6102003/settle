import React, { useEffect, useState } from 'react';
import { Proposal, fetchProposalBySlug, createCheckout } from '../api';
import { CheckCircle2, Clock, RotateCcw, ShieldCheck, ArrowRight, Video, AlertCircle } from 'lucide-react';

interface ProposalViewProps {
  slug: string;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ slug }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setIsSuccess(true);
    }

    fetchProposalBySlug(slug)
      .then(data => {
        setProposal(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const handleAcceptAndPay = async () => {
    if (!proposal) return;
    setPaying(true);
    try {
      const checkoutUrl = await createCheckout(proposal.slug);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert(err.message || 'Error redirecting to Stripe');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #222733', borderTopColor: '#00e599', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#9aa2b1' }}>Loading proposal specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#13161c', border: '1px solid #222733', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#ff5c00" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Proposal Not Found</h2>
          <p style={{ color: '#9aa2b1', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The proposal link you opened may have expired or is unavailable.
          </p>
          <a href="/dashboard" className="btn-secondary">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  const isDepositPaid = Boolean(proposal.deposit_paid) || isSuccess;

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem', background: '#0b0d10' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Navigation / Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 229, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={18} color="#00e599" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Settle</span>
            <span style={{ fontSize: '0.75rem', background: '#181c24', color: '#9aa2b1', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #222733' }}>
              Commercial Video Scope
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#626b7c', fontSize: '0.85rem' }}>Ref:</span>
            <code style={{ fontSize: '0.8rem', background: '#13161c', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #222733', color: '#9aa2b1' }}>
              {proposal.slug}
            </code>
          </div>
        </div>

        {/* Payment Confirmation Banner if paid */}
        {isDepositPaid && (
          <div style={{ background: 'rgba(0, 229, 153, 0.1)', border: '1px solid rgba(0, 229, 153, 0.3)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 size={24} color="#00e599" />
            <div>
              <div style={{ fontWeight: 600, color: '#00e599' }}>Milestone Deposit Paid & Schedule Confirmed</div>
              <div style={{ fontSize: '0.85rem', color: '#9aa2b1' }}>
                The upfront deposit of {proposal.currency} ${Number(proposal.deposit_amount).toLocaleString()} was cleared via Stripe. Production timeline is officially locked.
              </div>
            </div>
          </div>
        )}

        {/* Proposal Document Card */}
        <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          {/* Header & Client Info */}
          <div style={{ borderBottom: '1px solid #222733', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className={`badge ${isDepositPaid ? 'badge-accepted' : 'badge-sent'}`} style={{ marginBottom: '0.75rem' }}>
                  {isDepositPaid ? 'Accepted & Deposit Paid' : 'Pending Client Acceptance'}
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {proposal.title}
                </h1>
                <p style={{ color: '#9aa2b1', fontSize: '0.95rem' }}>
                  Prepared for <strong style={{ color: '#f0f3f8' }}>{proposal.client?.name || 'Valued Client'}</strong> ({proposal.client?.email})
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#626b7c', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
                <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0f3f8' }}>
                  {proposal.currency} ${Number(proposal.total_amount).toLocaleString()}
                </div>
                <div style={{ color: '#00e599', fontSize: '0.85rem', fontWeight: 500 }}>
                  50% Deposit: ${Number(proposal.deposit_amount).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Scope Metadata Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', background: '#0b0d10', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #1c212a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={16} color="#00e599" />
                <span style={{ fontSize: '0.85rem', color: '#9aa2b1' }}>
                  Turnaround: <strong style={{ color: '#f0f3f8' }}>{proposal.turnaround_days} Business Days</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={16} color="#00e599" />
                <span style={{ fontSize: '0.85rem', color: '#9aa2b1' }}>
                  Revisions: <strong style={{ color: '#f0f3f8' }}>{proposal.revisions_included} Rounds Included</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={16} color="#00e599" />
                <span style={{ fontSize: '0.85rem', color: '#9aa2b1' }}>
                  Rights: <strong style={{ color: '#f0f3f8' }}>Full Commercial Release</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Scope Narrative */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#626b7c', marginBottom: '1rem' }}>
              Project Narrative & Deliverables
            </h2>
            <div style={{ color: '#c3cad6', fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: 1.7, background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1c212a' }}>
              {proposal.body}
            </div>
          </div>

          {/* Itemized Deliverables Table */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#626b7c', marginBottom: '1rem' }}>
              Itemized Deliverables & Rates
            </h2>

            <div style={{ border: '1px solid #222733', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#0e1116', borderBottom: '1px solid #222733', color: '#9aa2b1' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Deliverable / Service</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '120px', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '120px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(proposal.line_items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1a1e27' }}>
                      <td style={{ padding: '1rem', color: '#f0f3f8', fontWeight: 500 }}>
                        {item.description}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'center', color: '#9aa2b1' }}>
                        {item.quantity}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#9aa2b1' }}>
                        ${Number(item.unit_price).toLocaleString()}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#f0f3f8', fontWeight: 600 }}>
                        ${Number(item.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Settlement & Checkout CTA */}
          <div style={{ background: '#0e1116', border: '1px solid #222733', borderRadius: '12px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: '#9aa2b1' }}>Subtotal Scope</span>
              <span className="tabular-nums" style={{ fontWeight: 600 }}>${Number(proposal.total_amount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #222733', paddingBottom: '1rem' }}>
              <span style={{ color: '#00e599', fontWeight: 500 }}>Required Upfront Deposit (50%)</span>
              <span className="tabular-nums" style={{ color: '#00e599', fontWeight: 700, fontSize: '1.2rem' }}>
                ${Number(proposal.deposit_amount).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ color: '#626b7c', fontSize: '0.8rem', maxWidth: '340px' }}>
                By clicking below, you accept the commercial scope terms and lock in the production start date upon Stripe settlement.
              </div>

              {isDepositPaid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e599', fontWeight: 600 }}>
                  <CheckCircle2 size={20} />
                  Deposit Cleared
                </div>
              ) : (
                <button
                  onClick={handleAcceptAndPay}
                  disabled={paying}
                  className="btn-primary"
                  style={{ minWidth: '240px' }}
                >
                  {paying ? 'Redirecting to Stripe...' : `Accept & Pay Deposit ($${Number(proposal.deposit_amount).toLocaleString()})`}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#626b7c', fontSize: '0.8rem' }}>
          Powered by <strong style={{ color: '#9aa2b1' }}>Settle</strong> — Zero AI inside. Direct Stripe rails.
        </div>
      </div>
    </div>
  );
};
