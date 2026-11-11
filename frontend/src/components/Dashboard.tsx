import React, { useEffect, useState } from 'react';
import { Proposal, fetchProposals, updateProposal, fetchStatusSummary, Creator, getActiveCreator, setActiveCreator, DEMO_CREATORS } from '../api';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Edit3,
  ExternalLink,
  X,
  RefreshCw,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Key,
  Users,
  Settings,
  Layers,
  Check,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [activeCreator, setCreatorState] = useState<Creator>(getActiveCreator());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

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
  }, [activeCreator]);

  const handleSwitchCreator = (c: Creator) => {
    setActiveCreator(c);
    setCreatorState(c);
    setShowAuthModal(false);
    setLoading(true);
    loadData();
  };

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

  const copyApiKey = () => {
    navigator.clipboard.writeText(activeCreator.api_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const monthlyBars = [
    { month: 'Jan', val: 32, active: false },
    { month: 'Feb', val: 45, active: false },
    { month: 'Mar', val: 28, active: false },
    { month: 'Apr', val: 64, active: false },
    { month: 'May', val: 52, active: false },
    { month: 'Jun', val: 88, active: true }, // Current active month in orange
    { month: 'Jul', val: 40, active: false },
    { month: 'Aug', val: 30, active: false },
    { month: 'Sept', val: 55, active: false },
    { month: 'Okt', val: 48, active: false },
    { month: 'Nov', val: 60, active: false },
    { month: 'Dec', val: 72, active: false },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      
      {/* 1. Left Sidebar Navigation (Matching Reference Design) */}
      <aside style={{ width: '250px', background: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1.25rem', position: 'sticky', top: 0, height: '100vh' }}>
        <div>
          {/* Studio Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f3f7' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(255,92,0,0.25)' }}>
              S.
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeCreator.studio_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#ff5c00', fontWeight: 600 }}>{activeCreator.plan} Plan</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Multi-Tenant</span>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search (⌘K)"
              style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>

          {/* Menu Sections */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Main Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
            <a href="#dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', background: '#fff5f0', color: '#ff5c00', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', borderLeft: '3px solid #ff5c00' }}>
              <Layers size={17} />
              Dashboard
            </a>
            <a href="#proposals" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#475569', fontWeight: 500, fontSize: '0.88rem', textDecoration: 'none' }}>
              <FileText size={17} />
              Proposals
              <span style={{ marginLeft: 'auto', background: '#f1f3f7', color: '#64748b', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '10px', fontWeight: 600 }}>{proposals.length}</span>
            </a>
            <a href="#invoices" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#475569', fontWeight: 500, fontSize: '0.88rem', textDecoration: 'none' }}>
              <DollarSign size={17} />
              Invoices
            </a>
            <a href="#clients" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#475569', fontWeight: 500, fontSize: '0.88rem', textDecoration: 'none' }}>
              <Users size={17} />
              Clients
            </a>
          </nav>

          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            MCP & Cloud
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button onClick={() => setShowAuthModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#475569', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>
              <Key size={17} color="#ff5c00" />
              Creator API Key
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              MCP Gateway Active
            </div>
          </nav>
        </div>

        {/* User Account Drawer */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f3f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                {activeCreator.name.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{activeCreator.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{activeCreator.email}</div>
              </div>
            </div>
            <button onClick={() => setShowAuthModal(true)} title="Switch Creator Profile" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Executive Content Area */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        
        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Creator Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Real-time commercial proposal ledger & Stripe deposit tracking for {activeCreator.studio_name}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={loadData} className="btn-ghost">
              <RefreshCw size={14} />
              Sync Ledger
            </button>
            <button className="btn-ghost">
              <Filter size={14} />
              Filter
            </button>
            <button className="btn-ghost">
              <Download size={14} />
              Export
            </button>
            <button onClick={() => setShowAuthModal(true)} className="btn-orange">
              <Sparkles size={15} />
              Creator Account ({activeCreator.plan})
            </button>
          </div>
        </div>

        {/* 3. Primary Metrics Cards (Styled exactly like reference image) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div className="card-white" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>Active Pipeline</span>
              <TrendingUp size={16} color="#ff5c00" />
            </div>
            <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              ${summary ? Number(summary.pipeline_value).toLocaleString() : '0'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              <span>↑ 12%</span>
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs last month</span>
            </div>
          </div>

          <div className="card-white" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>Deposits Cleared</span>
              <DollarSign size={16} color="#ff5c00" />
            </div>
            <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#ff5c00', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              ${summary ? Number(summary.collected_deposits).toLocaleString() : '0'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              <span>↑ 9%</span>
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>cleared through Stripe</span>
            </div>
          </div>

          <div className="card-white" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>Proposals Settled</span>
              <FileText size={16} color="#64748b" />
            </div>
            <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              {summary ? summary.total_accepted_proposals : 0} <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500 }}>/ {proposals.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              <span>↑ 7%</span>
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>conversion rate</span>
            </div>
          </div>

          <div className="card-white" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span>Architecture Model</span>
              <ShieldCheck size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.65rem', marginBottom: '0.25rem' }}>
              Zero AI Inside
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              $0 Inference Cost • External Claude MCP
            </div>
          </div>

        </div>

        {/* 4. Middle Performance & Analytics Row (Modeled after reference image) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* Sales Performance Gauge */}
          <div className="card-white" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Sales Performance</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time</span>
              </div>
              <div style={{ textAlign: 'center', margin: '2rem 0 1rem' }}>
                {/* Visual Orange Semi-Circle Gauge */}
                <div style={{ position: 'relative', width: '160px', height: '80px', margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ width: '160px', height: '160px', border: '16px solid #f1f3f7', borderTopColor: '#ff5c00', borderRightColor: '#ff5c00', borderRadius: '50%', transform: 'rotate(-45deg)' }} />
                </div>
                <div className="tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  88 <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>+1</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>of 100 points operational score</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                Commercial Scope Velocity ⚡
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Proposals with 50% upfront deposit terms close 3.2x faster than standard net-30 invoicing.
              </div>
            </div>
          </div>

          {/* 12-Month Pipeline Bar Chart (Hatched bars matching reference) */}
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Pipeline Analytics</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Monthly scope value volume</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge-status badge-orange">Active: Jun ($24.0k)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              {monthlyBars.map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <div
                    style={{
                      width: '26px',
                      height: `${b.val * 1.5}px`,
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 200ms ease',
                    }}
                    className={b.active ? 'bg-hatched-orange' : 'bg-hatched'}
                  />
                  <span style={{ fontSize: '0.72rem', color: b.active ? '#ff5c00' : '#94a3b8', fontWeight: b.active ? 700 : 500 }}>
                    {b.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 5. Live Proposals & Milestones Ledger */}
        <div className="card-white" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Recent Proposals & Commercial Milestones
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Created via Claude MCP. In-place human review and client payment links.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              Syncing ledger...
            </div>
          ) : proposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>No Proposals in Ledger</div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
                Ask Claude Desktop: "Draft a proposal for Acme: 3-week commercial video edit, $4,800, 50% deposit." Settle will instantly record it here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Scope & Deliverables</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Client</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Scope</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>50% Upfront</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(p => {
                    const isPaid = Boolean(p.deposit_paid) || p.status === 'ACCEPTED';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f3f7', transition: 'background 150ms ease' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                          <div>{p.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '0.2rem' }}>
                            {p.turnaround_days}d turnaround • {p.revisions_included} revisions included
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#475569' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.client?.name || 'Client'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.client?.email}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge-status ${isPaid ? 'badge-green' : 'badge-orange'}`}>
                            {isPaid ? 'Deposit Cleared' : p.status}
                          </span>
                        </td>
                        <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ${Number(p.total_amount).toLocaleString()}
                        </td>
                        <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: isPaid ? '#10b981' : '#ff5c00', fontWeight: 600 }}>
                          ${Number(p.deposit_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="btn-ghost"
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
                              className="btn-orange"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', textDecoration: 'none' }}
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

      </main>

      {/* 6. Human Edit Modal ("Human edits it in the app" - Volopay requirement) */}
      {editingProposal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div className="card-white" style={{ maxWidth: '580px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Human In-the-Loop Override</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Modify any deliverable, price, or revision clause Claude committed.</p>
              </div>
              <button onClick={() => setEditingProposal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="input-clean"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Project Narrative & Scope Terms
                </label>
                <textarea
                  rows={5}
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  className="input-clean"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Turnaround (Days)
                  </label>
                  <input
                    type="number"
                    value={editTurnaround}
                    onChange={e => setEditTurnaround(Number(e.target.value))}
                    className="input-clean"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Revisions Included
                  </label>
                  <input
                    type="number"
                    value={editRevisions}
                    onChange={e => setEditRevisions(Number(e.target.value))}
                    className="input-clean"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Total Price ($)
                  </label>
                  <input
                    type="number"
                    value={editTotal}
                    onChange={e => setEditTotal(Number(e.target.value))}
                    className="input-clean"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingProposal(null)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-orange">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Creator Authentication & Multi-Tenancy Switcher Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 60 }}>
          <div className="card-white" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Creator Studio Account</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Multi-tenant profile and MCP protocol secret</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* API Key Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Your Claude MCP Secret Token</span>
                <button onClick={copyApiKey} style={{ background: 'none', border: 'none', color: '#ff5c00', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {copiedKey ? <Check size={13} /> : null}
                  {copiedKey ? 'Copied' : 'Copy Key'}
                </button>
              </div>
              <code style={{ fontSize: '0.82rem', color: '#0f172a', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'block', wordBreak: 'break-all' }}>
                {activeCreator.api_key}
              </code>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                Pass this key in your Claude Desktop MCP configuration to route actions to this studio.
              </p>
            </div>

            {/* Switch Profile (Simulating 100,000 creators) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                Switch Creator Workspace
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {DEMO_CREATORS.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSwitchCreator(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: c.id === activeCreator.id ? '2px solid #ff5c00' : '1px solid #e2e8f0',
                      background: c.id === activeCreator.id ? '#fff5f0' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{c.studio_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.name} • {c.email}</div>
                    </div>
                    {c.id === activeCreator.id && (
                      <span className="badge-status badge-orange">Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAuthModal(false)} className="btn-orange" style={{ width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
