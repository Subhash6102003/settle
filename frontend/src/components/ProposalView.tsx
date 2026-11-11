import React, { useEffect, useState } from 'react';
import { Proposal, fetchProposalBySlug, createCheckout } from '../api';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Download,
  Printer,
  AlertCircle
} from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '42px', height: '42px', border: '3px solid #e2e8f0', borderTopColor: '#ff5c00', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading commercial scope...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f7f8fa' }}>
        <div className="card-white" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <AlertCircle size={44} color="#ff5c00" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Proposal Unavailable</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            The proposal reference <code>{slug}</code> could not be found or has expired.
          </p>
          <a href="/dashboard" className="btn-ghost">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  const isDepositPaid = Boolean(proposal.deposit_paid) || isSuccess;
  const issueDate = new Date(proposal.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem', background: '#f7f8fa' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        {/* Top Branding & Document Meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(255,92,0,0.25)' }}>
              S.
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                  {proposal.creator?.studio_name || 'Apex Cut Creative Studio'}
                </span>
                <span className="badge-status badge-orange">Verified Creator</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Commercial Video Production & Post-Production Agreement
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn-ghost" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <Printer size={14} />
              Print / PDF
            </button>
            <span style={{ fontSize: '0.78rem', background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
              Ref: <strong style={{ color: '#0f172a' }}>{proposal.slug}</strong>
            </span>
          </div>
        </div>

        {/* Official Payment Receipt Banner (If Paid) */}
        {isDepositPaid && (
          <div className="card-white" style={{ border: '2px solid #10b981', background: '#ffffff', padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      Milestone Deposit Confirmed & Receipt Issued
                    </h3>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: '0.2rem', maxWidth: '520px', lineHeight: 1.5 }}>
                    Your upfront deposit of <strong>{proposal.currency} ${Number(proposal.deposit_amount).toLocaleString()}</strong> was successfully processed via Stripe. Production schedule is officially locked.
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
                    <div>Receipt No: <strong style={{ color: '#0f172a' }}>REC-2026-{proposal.slug.slice(-6).toUpperCase()}</strong></div>
                    <div>Gateway: <strong style={{ color: '#0f172a' }}>Stripe (Test Sandbox)</strong></div>
                    <div>Status: <span className="badge-status badge-green">Cleared</span></div>
                  </div>
                </div>
              </div>

              <button onClick={handlePrint} className="btn-ghost" style={{ alignSelf: 'center' }}>
                <Download size={14} />
                Download Receipt
              </button>
            </div>
          </div>
        )}

        {/* Main Commercial Proposal Document */}
        <div className="card-white" style={{ padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          
          {/* Header Metadata */}
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <span className={`badge-status ${isDepositPaid ? 'badge-green' : 'badge-orange'}`} style={{ marginBottom: '0.75rem' }}>
                  {isDepositPaid ? 'Deposit Settled • Production Active' : 'Awaiting Client Deposit'}
                </span>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.4rem', marginBottom: '0.5rem' }}>
                  {proposal.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#64748b', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                  <div>Client: <strong style={{ color: '#0f172a' }}>{proposal.client?.name || 'Valued Client'}</strong> ({proposal.client?.email})</div>
                  <div>Issued: <strong style={{ color: '#0f172a' }}>{issueDate}</strong></div>
                  <div>Valid Until: <strong style={{ color: '#0f172a' }}>{validUntil}</strong></div>
                </div>
              </div>

              <div style={{ textAlign: 'right', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Total Project Scope
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
                  {proposal.currency} ${Number(proposal.total_amount).toLocaleString()}
                </div>
                <div style={{ color: '#ff5c00', fontSize: '0.82rem', fontWeight: 600, marginTop: '0.1rem' }}>
                  50% Upfront Deposit: ${Number(proposal.deposit_amount).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Contract Boundary Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} color="#ff5c00" />
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Turnaround: <strong style={{ color: '#0f172a' }}>{proposal.turnaround_days} Business Days</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RotateCcw size={18} color="#ff5c00" />
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Revisions: <strong style={{ color: '#0f172a' }}>{proposal.revisions_included} Rounds Included</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Licensing: <strong style={{ color: '#0f172a' }}>Full Commercial Release</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Project Narrative & Scope */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700, marginBottom: '0.85rem' }}>
              Project Narrative & Deliverables Specification
            </h3>
            <div style={{ color: '#334155', fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: 1.7, background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {proposal.body}
            </div>
          </div>

          {/* Itemized Deliverables & Pricing */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700, marginBottom: '0.85rem' }}>
              Itemized Scope & Pricing Schedule
            </h3>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb', color: '#64748b' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Deliverable / Service</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, width: '130px', textAlign: 'right' }}>Unit Rate</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, width: '130px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(proposal.line_items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f3f7' }}>
                      <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 600 }}>
                        {item.description}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                        {item.quantity}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                        ${Number(item.unit_price).toLocaleString()}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                        ${Number(item.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Protection & Revision Clauses */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              Commercial Terms & Revision Policies:
            </div>
            • Includes {proposal.revisions_included} complete rounds of structural revisions based on consolidated feedback.<br />
            • Any additional rounds of revisions or script restructures will be billed at standard commercial rate of $95/hr.<br />
            • Master 4K ProRes exports and project project files released upon settlement of the final 50% milestone balance.
          </div>

          {/* Payment & Acceptance Action Box */}
          <div style={{ background: '#ffffff', border: '2px solid #ff5c00', borderRadius: '14px', padding: '2rem', boxShadow: '0 4px 20px rgba(255,92,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Total Project Value</span>
              <span className="tabular-nums" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                ${Number(proposal.total_amount).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f3f7', paddingBottom: '1rem' }}>
              <div>
                <span style={{ color: '#ff5c00', fontWeight: 700, fontSize: '1.05rem' }}>50% Upfront Milestone Deposit</span>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Locks calendar and initiates asset ingestion</div>
              </div>
              <span className="tabular-nums" style={{ color: '#ff5c00', fontWeight: 800, fontSize: '1.5rem' }}>
                ${Number(proposal.deposit_amount).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.82rem', maxWidth: '380px' }}>
                Secured by Stripe Checkout. Encrypted 256-bit payment processing with instant receipt issuance.
              </div>

              {isDepositPaid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                  <CheckCircle2 size={22} />
                  Deposit Cleared via Stripe
                </div>
              ) : (
                <button
                  onClick={handleAcceptAndPay}
                  disabled={paying}
                  className="btn-orange"
                  style={{ minWidth: '260px', padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
                >
                  {paying ? 'Redirecting to Stripe...' : `Accept Scope & Pay $${Number(proposal.deposit_amount).toLocaleString()} Deposit`}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
          Executed via <strong style={{ color: '#64748b' }}>Settle</strong> • Headless Commercial Proposal Engine • Zero AI Inside
        </div>

      </div>
    </div>
  );
};
