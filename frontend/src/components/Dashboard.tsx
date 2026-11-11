import React, { useEffect, useState } from 'react';
import { Proposal, fetchProposals, updateProposal, fetchStatusSummary } from '../api';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Edit3,
  ExternalLink,
  X,
  RefreshCw,
  Video,
  ShieldCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editTurnaround, setEditTurnaround] = useState(14);
  const [editRevisions, setEditRevisions] = useState(2);
  const [editTotal, setEditTotal] = useState(0);

  const loadData = async () => {
    try {
      const [props, stat] = await Promise.all([fetchProposals(), fetchStatusSummary()]);
      setProposals(props);
      setSummary(stat.summary);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // 3s real-time sync with MCP
    return () => clearInterval(interval);
  }, []);

  const handleOpenEdit = (p: Proposal) => {
    setEditingProposal(p);
    setEditTitle(p.title);
    setEditBody(p.body);
    setEditTurnaround(p.turnaround_days || 14);
    setEditRevisions(p.revisions_included || 2);
    setEditTotal(p.total_amount || 0);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;

    try {
      await updateProposal(editingProposal.id, {
        title: editTitle,
        body: editBody,
        turnaround_days: Number(editTurnaround),
        revisions_included: Number(editRevisions),
        total_amount: Number(editTotal),
        deposit_amount: Math.round(Number(editTotal) * 0.5),
      });
      setEditingProposal(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating proposal');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0d10', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 229, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={20} color="#00e599" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Settle</span>
                <span style={{ fontSize: '0.7rem', background: '#181c24', color: '#00e599', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(0, 229, 153, 0.2)', letterSpacing: '0.05em' }}>
                  OPERATIONS CONSOLE
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#626b7c', marginTop: '0.15rem' }}>
                Headless Commercial Ledger • Connected via MCP • Stripe Rails
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#13161c', padding: '0.45rem 0.85rem', borderRadius: '6px', border: '1px solid #222733', fontSize: '0.8rem', color: '#9aa2b1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e599', boxShadow: '0 0 8px #00e599' }} />
              MCP Gateway Active
            </div>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
              <RefreshCw size={13} />
              Sync
            </button>
          </div>
        </div>

        {/* Financial Ledger Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#9aa2b1', fontSize: '0.85rem', fontWeight: 500 }}>Active Pipeline</span>
              <TrendingUp size={18} color="#00e599" />
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              ${summary ? Number(summary.pipeline_value).toLocaleString() : '0'}
            </div>
            <div style={{ color: '#626b7c', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              {summary ? summary.total_open_proposals : 0} open scopes pending acceptance
            </div>
          </div>

          <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#9aa2b1', fontSize: '0.85rem', fontWeight: 500 }}>Deposits Cleared</span>
              <DollarSign size={18} color="#00e599" />
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#00e599' }}>
              ${summary ? Number(summary.collected_deposits).toLocaleString() : '0'}
            </div>
            <div style={{ color: '#626b7c', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              {summary ? summary.total_accepted_proposals : 0} production schedules confirmed
            </div>
          </div>

          <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#9aa2b1', fontSize: '0.85rem', fontWeight: 500 }}>Architecture Compliance</span>
              <ShieldCheck size={18} color="#00e599" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f0f3f8' }}>
              Zero AI Inside App
            </div>
            <div style={{ color: '#626b7c', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              $0 Inference Cost • External Claude Brain
            </div>
          </div>

        </div>

        {/* Proposals Table */}
        <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Proposals & Milestones</h2>
              <p style={{ color: '#9aa2b1', fontSize: '0.85rem' }}>
                Dispatched from Claude via MCP. Editable in-place with instant client payment links.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9aa2b1' }}>
              Syncing proposals from backend...
            </div>
          ) : proposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#0b0d10', borderRadius: '10px', border: '1px dashed #222733' }}>
              <FileText size={32} color="#626b7c" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No active proposals</div>
              <p style={{ color: '#626b7c', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
                Prompt Claude Desktop to draft a proposal. The MCP server will commit the new scope to this ledger in real-time.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222733', color: '#626b7c', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Scope & Deliverables</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Client</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Milestone Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Upfront Deposit</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Human Review</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(p => {
                    const isPaid = Boolean(p.deposit_paid) || p.status === 'ACCEPTED';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1a1e27', transition: 'background 150ms ease' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#f0f3f8' }}>
                          <div>{p.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#626b7c', fontWeight: 400, marginTop: '0.2rem' }}>
                            {p.turnaround_days}d turnaround • {p.revisions_included} revisions included
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#9aa2b1' }}>
                          <div>{p.client?.name || 'Client'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#626b7c' }}>{p.client?.email}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${isPaid ? 'badge-accepted' : 'badge-sent'}`}>
                            {isPaid ? 'Deposit Cleared' : p.status}
                          </span>
                        </td>
                        <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                          ${Number(p.total_amount).toLocaleString()}
                        </td>
                        <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: isPaid ? '#00e599' : '#9aa2b1' }}>
                          ${Number(p.deposit_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              title="Human review and override terms"
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <a
                              href={`/p/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              title="Open public client payment link"
                            >
                              <ExternalLink size={13} />
                              Client Page
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Human Edit Modal ("Human edits it in the app" - Volopay requirement) */}
        {editingProposal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
            <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Human In-the-Loop Override</h3>
                  <p style={{ color: '#626b7c', fontSize: '0.8rem' }}>Modify any deliverable, price, or revision clause Claude committed.</p>
                </div>
                <button onClick={() => setEditingProposal(null)} style={{ background: 'none', border: 'none', color: '#9aa2b1', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9aa2b1', marginBottom: '0.4rem' }}>
                    Proposal Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9aa2b1', marginBottom: '0.4rem' }}>
                    Project Narrative & Scope Terms
                  </label>
                  <textarea
                    rows={5}
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9aa2b1', marginBottom: '0.4rem' }}>
                      Turnaround (Days)
                    </label>
                    <input
                      type="number"
                      value={editTurnaround}
                      onChange={e => setEditTurnaround(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9aa2b1', marginBottom: '0.4rem' }}>
                      Revisions Included
                    </label>
                    <input
                      type="number"
                      value={editRevisions}
                      onChange={e => setEditRevisions(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9aa2b1', marginBottom: '0.4rem' }}>
                      Total Price ($)
                    </label>
                    <input
                      type="number"
                      value={editTotal}
                      onChange={e => setEditTotal(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setEditingProposal(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
