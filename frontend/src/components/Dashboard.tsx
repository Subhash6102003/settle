import React, { useEffect, useState } from 'react';
import { Proposal, fetchProposals, updateProposal, fetchStatusSummary } from '../api';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Edit3,
  ExternalLink,
  Terminal,
  X,
  RefreshCw,
  Video
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

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
    const interval = setInterval(loadData, 5000); // 5s telemetry polling
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

  const samplePrompt = `Draft a commercial video editing proposal for Acme Studio:
- Project: 3-week product launch brand refresh
- Total: $4,800 with 50% upfront deposit ($2,400)
- Deliverables: 1x 90s commercial hero, 3x 30s TikTok/Reels vertical cuts, color grade, Dolby sound mix
- Turnaround: 14 business days, 2 revision passes included.
Call Settle create_proposal and provide the public link.`;

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Settle</span>
                <span style={{ fontSize: '0.7rem', background: '#1c212a', color: '#00e599', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(0, 229, 153, 0.2)' }}>
                  ZERO AI INSIDE
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#626b7c' }}>
                Powered by Claude over MCP Protocol • Stripe Test Rails
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
              <RefreshCw size={14} />
              Sync
            </button>
            <button onClick={copyPromptToClipboard} className="btn-primary" style={{ padding: '0.5rem 0.95rem', fontSize: '0.85rem' }}>
              <Terminal size={14} />
              {copiedPrompt ? 'Prompt Copied!' : 'Copy Claude Prompt'}
            </button>
          </div>
        </div>

        {/* Financial Telemetry Metrics */}
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
              {summary ? summary.total_open_proposals : 0} open proposals sent
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
              {summary ? summary.total_accepted_proposals : 0} proposals accepted & locked
            </div>
          </div>

          <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#9aa2b1', fontSize: '0.85rem', fontWeight: 500 }}>Claude MCP Status</span>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00e599', boxShadow: '0 0 10px #00e599' }} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f0f3f8' }}>
              Ready for Prompts
            </div>
            <div style={{ color: '#626b7c', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              5 MCP tools exposed via Stdio
            </div>
          </div>

        </div>

        {/* Proposals Table */}
        <div style={{ background: '#13161c', border: '1px solid #222733', borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Proposals & Milestones</h2>
              <p style={{ color: '#9aa2b1', fontSize: '0.85rem' }}>
                Created via Claude Desktop. Editable in-place with instant Stripe checkout.
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
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No proposals yet</div>
              <p style={{ color: '#626b7c', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1rem' }}>
                Open Claude Desktop, paste your client brief, and say "Settle this" to create your first proposal.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222733', color: '#626b7c', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Proposal Title</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Client</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Deposit (50%)</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(p => {
                    const isPaid = Boolean(p.deposit_paid) || p.status === 'ACCEPTED';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1a1e27', transition: 'background 150ms ease' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#f0f3f8' }}>
                          <div>{p.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#626b7c', fontWeight: 400 }}>
                            {p.turnaround_days}d turnaround • {p.revisions_included} revisions
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
                              title="Edit proposal details in app"
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
                              title="Open public proposal client view"
                            >
                              <ExternalLink size={13} />
                              View
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Human In-the-Loop Override</h3>
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
