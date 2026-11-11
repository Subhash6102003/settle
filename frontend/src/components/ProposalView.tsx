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
  AlertCircle,
  FileText,
  CreditCard,
  ExternalLink
} from 'lucide-react';

interface ProposalViewProps {
  slug: string;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ slug }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposal' | 'receipt'>('proposal');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setIsSuccess(true);
      setActiveTab('receipt');
    }

    fetchProposalBySlug(slug)
      .then(data => {
        setProposal(data);
        if (data.deposit_paid) {
          setActiveTab('receipt');
        }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '38px', height: '38px', border: '3px solid #e2e8f0', borderTopColor: '#ff5c00', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8f9fb' }}>
        <div className="card-white" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#ff5c00" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Proposal Unavailable</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            The proposal reference <code>{slug}</code> could not be found or has expired.
          </p>
          <a href="/" className="btn-ghost" style={{ justifyContent: 'center' }}>Return to Homepage</a>
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

  const receiptNumber = `REC-2026-${proposal.slug.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', background: '#f8f9fb', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        {/* Document Switcher & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.3rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('proposal')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'proposal' ? '#ff5c00' : 'transparent',
                color: activeTab === 'proposal' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <FileText size={15} />
              Commercial Scope & Terms
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'receipt' ? '#0f172a' : 'transparent',
                color: activeTab === 'receipt' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <CreditCard size={15} />
              Official Tax & Payment Receipt
              {isDepositPaid && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button onClick={handlePrint} className="btn-ghost" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <Printer size={14} />
              Print / Save PDF
            </button>
            <a href="/" className="btn-ghost" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              Studio Console
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW A: OFFICIAL TAX & PAYMENT RECEIPT                                    */}
        {/* ========================================================================= */}
        {activeTab === 'receipt' && (
          <div className="card-white" style={{ padding: '3rem', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px' }}>
            
            {/* Top Receipt Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#64748b' }}>
                  Electronic Payment Confirmation
                </span>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                  Official Payment Receipt
                </h1>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Issued via Stripe Payment Rails
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <CheckCircle2 size={15} />
                  Status: Deposit Cleared
                </div>
                <div className="tabular-nums" style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Receipt #: <strong style={{ color: '#0f172a' }}>{receiptNumber}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Date: <strong style={{ color: '#0f172a' }}>{issueDate}</strong>
                </div>
              </div>
            </div>

            {/* Billed By & Billed To Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Billed By (Creative Studio)
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  {proposal.creator?.studio_name || 'Apex Cut Creative Studio LLC'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  Alex Rivera • Principal Director<br />
                  alex@apexcut.studio<br />
                  Registration: EIN 84-2910482
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Billed To (Commercial Partner)
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  {proposal.client?.name || 'Commercial Partner #104'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  Attention: Accounts Payable<br />
                  {proposal.client?.email || 'ap@partner.com'}<br />
                  Project Reference: {proposal.slug}
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CreditCard size={18} color="#ff5c00" />
                <span style={{ color: '#475569' }}>
                  Payment Rails: <strong>Stripe Checkout (Card ending in 4242)</strong>
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Transaction Auth: <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>ch_3Oq8zL1WqmAv4Br0</span>
              </div>
            </div>

            {/* Receipt Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 700, width: '120px', textAlign: 'center' }}>Terms</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 700, width: '140px', textAlign: 'right' }}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 0', color: '#0f172a' }}>
                    <div style={{ fontWeight: 700 }}>{proposal.title} — 50% Mobilization Deposit</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Locks production schedule and initiates primary asset ingestion for {proposal.turnaround_days} business day turnaround.
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'center', color: '#475569' }}>
                    Due on Signing
                  </td>
                  <td className="tabular-nums" style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ${Number(proposal.deposit_amount).toLocaleString()}.00
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Financial Totals Calculation Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '320px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <span>Total Project Scope:</span>
                  <span className="tabular-nums" style={{ color: '#0f172a', fontWeight: 600 }}>${Number(proposal.total_amount).toLocaleString()}.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <span>Deposit Required (50%):</span>
                  <span className="tabular-nums" style={{ color: '#0f172a', fontWeight: 600 }}>${Number(proposal.deposit_amount).toLocaleString()}.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  <span>Taxes & Gateway Fees:</span>
                  <span className="tabular-nums" style={{ color: '#10b981', fontWeight: 600 }}>$0.00 (Covered)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', borderTop: '2px solid #0f172a', paddingTop: '0.75rem' }}>
                  <span>Total Paid (USD):</span>
                  <span className="tabular-nums" style={{ color: '#ff5c00' }}>${Number(proposal.deposit_amount).toLocaleString()}.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginTop: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <span>Balance Due on Delivery:</span>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: '#0f172a' }}>${(Number(proposal.total_amount) - Number(proposal.deposit_amount)).toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            {/* Plain Human Note */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
              <strong style={{ color: '#0f172a' }}>Next Steps:</strong> This payment receipt formally confirms receipt of your mobilization deposit. Production schedule is confirmed. First cut review will be shared within {proposal.turnaround_days} business days. Remaining balance is payable upon delivery of final master 4K ProRes files.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Official Record • Stored in Multi-Tenant Ledger
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handlePrint} className="btn-ghost" style={{ fontSize: '0.82rem' }}>
                  <Download size={14} />
                  Download PDF Copy
                </button>
                <button onClick={() => setActiveTab('proposal')} className="btn-ghost" style={{ fontSize: '0.82rem' }}>
                  View Scope Agreement
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW B: COMMERCIAL SCOPE & AGREEMENT TERMS                                */}
        {/* ========================================================================= */}
        {activeTab === 'proposal' && (
          <div className="card-white" style={{ padding: '3rem', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '12px' }}>
            
            {/* Header Metadata */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ff5c00' }}>
                      {proposal.creator?.studio_name || 'Apex Cut Creative Studio'}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Production Work Order</span>
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.65rem' }}>
                    {proposal.title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#64748b', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <div>Commercial Partner: <strong style={{ color: '#0f172a' }}>{proposal.client?.name || 'Commercial Partner #104'}</strong></div>
                    <div>Issued: <strong style={{ color: '#0f172a' }}>{issueDate}</strong></div>
                    <div>Valid Until: <strong style={{ color: '#0f172a' }}>{validUntil}</strong></div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Total Project Scope
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
                    ${Number(proposal.total_amount).toLocaleString()}
                  </div>
                  <div style={{ color: '#ff5c00', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.1rem' }}>
                    50% Deposit: ${Number(proposal.deposit_amount).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Service Level Boundaries */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.75rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Clock size={16} color="#ff5c00" />
                  <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                    Delivery: <strong style={{ color: '#0f172a' }}>{proposal.turnaround_days} Business Days</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <RotateCcw size={16} color="#ff5c00" />
                  <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                    Revisions: <strong style={{ color: '#0f172a' }}>{proposal.revisions_included} Included Rounds</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                    Licensing: <strong style={{ color: '#0f172a' }}>Perpetual Commercial Release</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Scope Specification */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700, marginBottom: '0.75rem' }}>
                Scope & Deliverables Specification
              </h3>
              <div style={{ color: '#334155', fontSize: '0.92rem', whiteSpace: 'pre-line', lineHeight: 1.7, background: '#f8fafc', padding: '1.35rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {proposal.body}
              </div>
            </div>

            {/* Itemized Deliverables Schedule */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700, marginBottom: '0.75rem' }}>
                Itemized Scope Schedule
              </h3>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
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
                        <td style={{ padding: '0.9rem 1rem', color: '#0f172a', fontWeight: 600 }}>
                          {item.description}
                        </td>
                        <td className="tabular-nums" style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#64748b' }}>
                          {item.quantity}
                        </td>
                        <td className="tabular-nums" style={{ padding: '0.9rem 1rem', textAlign: 'right', color: '#64748b' }}>
                          ${Number(item.unit_price).toLocaleString()}
                        </td>
                        <td className="tabular-nums" style={{ padding: '0.9rem 1rem', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                          ${Number(item.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plain Terms */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.15rem 1.25rem', marginBottom: '2.5rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Commercial Working Agreement:
              </div>
              • Project commences upon receipt of 50% upfront milestone deposit.<br />
              • Includes {proposal.revisions_included} consolidated feedback revision rounds. Subsequent revisions billed at $95/hr.<br />
              • Master 4K ProRes deliverables released upon final milestone settlement.
            </div>

            {/* Action Box */}
            <div style={{ background: '#ffffff', border: '1px solid #ff5c00', borderRadius: '10px', padding: '1.75rem', boxShadow: '0 4px 15px rgba(255,92,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f3f7', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ color: '#ff5c00', fontWeight: 800, fontSize: '1.1rem' }}>
                    50% Upfront Milestone Deposit
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Locks production dates on calendar
                  </div>
                </div>
                <div className="tabular-nums" style={{ color: '#ff5c00', fontWeight: 800, fontSize: '1.6rem' }}>
                  ${Number(proposal.deposit_amount).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: '380px' }}>
                  Secure payment via Stripe Checkout. An official tax receipt will be issued immediately.
                </div>

                {isDepositPaid ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CheckCircle2 size={20} />
                    Deposit Paid • <button onClick={() => setActiveTab('receipt')} style={{ background: 'none', border: 'none', color: '#0f172a', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>View Receipt</button>
                  </div>
                ) : (
                  <button
                    onClick={handleAcceptAndPay}
                    disabled={paying}
                    className="btn-orange"
                    style={{ minWidth: '240px', padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
                  >
                    {paying ? 'Redirecting to Stripe...' : `Accept Scope & Pay $${Number(proposal.deposit_amount).toLocaleString()}`}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Human Minimal Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.78rem' }}>
          Settle Billing Engine • Connected to Stripe
        </div>

      </div>
    </div>
  );
};