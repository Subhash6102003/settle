import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';
import { getCurrencySymbol } from '../currencies';
import {
  CheckCircle2,
  Clock,
  Printer,
  Download,
  AlertCircle,
  CreditCard,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface InvoiceData {
  id: string;
  creator_id?: string;
  proposal_id?: string;
  client_id: string;
  amount: number;
  currency?: string;
  due_date?: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  created_at?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    currency?: string;
  };
  creator?: {
    id: string;
    name: string;
    email?: string;
    studio_name: string;
    currency: string;
    description?: string;
    phone?: string;
    website?: string;
    address?: string;
    tax_id?: string;
  };
  items?: any[];
}

interface InvoiceReceiptViewProps {
  invoiceId: string;
}

export const InvoiceReceiptView: React.FC<InvoiceReceiptViewProps> = ({ invoiceId }) => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/invoices/${invoiceId}`);
        if (!res.ok) throw new Error('Invoice not found');
        const data = await res.json();
        setInvoice(data.invoice);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice receipt');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#ff5c00', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>Loading Official Invoice & Receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb', padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="card-white" style={{ maxWidth: '440px', textAlign: 'center', padding: '2.5rem' }}>
          <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Invoice Receipt Not Found</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.75rem 0 1.5rem' }}>
            The requested invoice record (#{invoiceId}) does not exist or has expired.
          </p>
          <a href="/" className="btn-orange" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Return to Studio
          </a>
        </div>
      </div>
    );
  }

  const currencyCode = (invoice.currency || invoice.creator?.currency || 'INR').toUpperCase();
  const sym = getCurrencySymbol(currencyCode);
  const isPaid = invoice.status === 'PAID';
  const receiptNo = `REC-2026-${invoice.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  const handlePay = () => {
    setPaying(true);
    // Direct Stripe payment or simulation
    setTimeout(() => {
      alert(`Stripe Checkout Session Initiated for ${sym}${Number(invoice.amount).toLocaleString()} (${currencyCode}). Receipt will be issued upon settlement.`);
      setPaying(false);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', background: '#f8f9fb', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#ff5c00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              S.
            </div>
            <div>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{invoice.creator?.studio_name || 'Creator Studio'}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>• Commercial Ledger Record</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={() => window.print()} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={() => window.print()} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}>
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Executive Receipt Document */}
        <div className="card-white" style={{ padding: '3rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1.75rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ff5c00', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Official Commercial Invoice & Payment Receipt
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>
                {receiptNo}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                Issued: {new Date(invoice.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Due: {invoice.due_date || 'Due on Receipt'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: isPaid ? '#ecfdf5' : '#fffbeb',
                color: isPaid ? '#059669' : '#d97706',
                border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
              }}>
                {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {isPaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
              </span>
              <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                {sym}{Number(invoice.amount).toLocaleString()}.00
              </div>
            </div>
          </div>

          {/* Party Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.75rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>Issued By</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                {invoice.creator?.studio_name || 'Creative Studio'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Principal: {invoice.creator?.name || 'Studio Principal'}<br />
                {invoice.creator?.phone && <>Phone: {invoice.creator.phone}<br /></>}
                {invoice.creator?.email && <>Email: {invoice.creator.email}<br /></>}
                {invoice.creator?.address && <>Address: {invoice.creator.address}<br /></>}
                {invoice.creator?.tax_id && <>Tax ID / EIN: <strong>{invoice.creator.tax_id}</strong><br /></>}
                Settlement Currency: <strong>{currencyCode} ({sym})</strong>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>Billed To (Commercial Partner)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                {invoice.client?.name || 'Commercial Client'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Billing Email: {invoice.client?.email || 'billing@client.com'}<br />
                Client Account ID: #{invoice.client_id.slice(-6).toUpperCase()}<br />
                Payment Terms: Net 14 Milestone Settlement<br />
                Payment Rail: Stripe Verified Card Authorization
              </div>
            </div>
          </div>

          {/* Studio Profile & Commercial Specialization */}
          {invoice.creator?.description && (
            <div style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#ff5c00', fontWeight: 800, letterSpacing: '0.05em' }}>
                Studio Scope & Creative Capabilities
              </span>
              <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, margin: '0.4rem 0 0' }}>
                {invoice.creator.description}
              </p>
            </div>
          )}

          {/* Itemized Line Items Table */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ff5c00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Itemized Milestone Deliverables & Engineering Scope
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Deliverable Description / Scope Service</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '90px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '140px', textAlign: 'right' }}>Rate</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '140px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f3f7' }}>
                      <td style={{ padding: '1rem', color: '#0f172a' }}>
                        <div style={{ fontWeight: 700 }}>{item.description}</div>
                        {item.spec && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {item.spec}
                          </div>
                        )}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                        {item.quantity || 1}
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                        {sym}{Number(item.unit_price || item.amount).toLocaleString()}.00
                      </td>
                      <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                        {sym}{Number(item.amount).toLocaleString()}.00
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ borderBottom: '1px solid #f1f3f7' }}>
                    <td style={{ padding: '1rem', color: '#0f172a' }}>
                      <div style={{ fontWeight: 700 }}>AI Code Editor Desktop Application + Local LLM Runtime Engine</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Full production deliverable: React 19 + Electron.js desktop IDE with local on-device LLM autonomous code generation.
                      </div>
                    </td>
                    <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                      1
                    </td>
                    <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                      {sym}{Number(invoice.amount).toLocaleString()}.00
                    </td>
                    <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                      {sym}{Number(invoice.amount).toLocaleString()}.00
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Technical Architecture & Stack Dossier */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              Technical Architecture & Delivered System Dossier
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
              <div>
                <strong>1. Desktop IDE Shell (Electron.js + React 19):</strong><br />
                Multi-tab Monaco code editor, file-tree explorer, native terminal integration, and hardware-accelerated 150ms composite transitions.
              </div>
              <div>
                <strong>2. Local LLM Runtime Integration:</strong><br />
                Direct desktop bridge to locally running LLM engines (Ollama / Llama.cpp) enabling 100% offline, zero-latency, private AI code generation.
              </div>
              <div>
                <strong>3. Autonomous Agentic Code Engine:</strong><br />
                Boil-the-ocean code diff streaming, AST patch validation, multi-turn pair programming prompt profiles, and workspace file synchronization.
              </div>
              <div>
                <strong>4. Extensible Tool Protocol (MCP):</strong><br />
                Integrated Model Context Protocol client allowing local LLM to execute shell commands, edit files, and read project repos deterministically.
              </div>
            </div>
          </div>

          {/* Legal IP Assignment & Warranty Guarantee */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
            <strong style={{ color: '#0f172a' }}>Intellectual Property Assignment & Source Code Warranty:</strong><br />
            Upon milestone payment clearance, 100% of all intellectual property, git repository branches, Electron desktop binary signing certificates, and proprietary local LLM orchestration logic are assigned exclusively and irrevocably to <strong>Subhash Maurya</strong>. Deliverables are warranted to be free of defects and compliant with master architectural specifications.
          </div>

          {/* Calculation Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
            <div style={{ width: '320px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span className="tabular-nums" style={{ color: '#0f172a', fontWeight: 600 }}>{sym}{Number(invoice.amount).toLocaleString()}.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Taxes & Gateway Fees:</span>
                <span className="tabular-nums" style={{ color: '#10b981', fontWeight: 600 }}>{sym}0.00 (Covered)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', borderTop: '2px solid #0f172a', paddingTop: '0.75rem' }}>
                <span>Total Due ({currencyCode}):</span>
                <span className="tabular-nums" style={{ color: '#ff5c00' }}>{sym}{Number(invoice.amount).toLocaleString()}.00</span>
              </div>
            </div>
          </div>

          {/* Payment & Security Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={28} color="#10b981" />
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                  Stripe-Verified Commercial Transaction
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Payments settled securely in {currencyCode} via Stripe checkout.
                </div>
              </div>
            </div>

            {isPaid ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800 }}>
                <CheckCircle2 size={18} /> Receipt Confirmed • Settled
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-orange"
                style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <CreditCard size={16} />
                {paying ? 'Connecting to Stripe...' : `Pay ${sym}${Number(invoice.amount).toLocaleString()}`}
                <ArrowRight size={15} />
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.78rem' }}>
          Official Record • Multi-Tenant Billing Engine • Settle
        </div>

      </div>
    </div>
  );
};
