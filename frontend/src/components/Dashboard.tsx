import React, { useEffect, useState, useRef } from 'react';
import {
  Proposal,
  fetchProposals,
  updateProposal,
  fetchStatusSummary,
  Creator,
  getActiveCreator,
  API_BASE
} from '../api';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Edit3,
  ExternalLink,
  X,
  RefreshCw,
  Search,
  Download,
  Key,
  Users,
  Layers,
  Check,
  Plus,
  Send,
  LogOut,
  UserPlus,
  CreditCard,
  Phone,
  Mail,
  Building,
  Globe,
  ChevronRight,
  Award
} from 'lucide-react';
import gsap from 'gsap';

interface DashboardProps {
  onSignOut: () => void;
  onOpenLanding: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSignOut, onOpenLanding }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'proposals' | 'invoices' | 'clients'>('dashboard');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Active hover states for charts
  const [hoveredMonth, setHoveredMonth] = useState<any | null>(null);
  const [hoveredGauge, setHoveredGauge] = useState(false);

  // Creator profile state (Alex Rivera)
  const [creatorProfile, setCreatorProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex@apexcut.studio',
    phone: '+1 (555) 382-9104',
    studioName: 'Apex Cut Creative Studio',
    currency: 'USD',
    stripeAccountId: 'acct_1UXxyL1WqmAv4Br6',
    bankRouting: 'Chase Bank (•••• 4912)',
    taxId: 'XX-XXX8921',
  });

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editTurnaround, setEditTurnaround] = useState(14);
  const [editRevisions, setEditRevisions] = useState(2);
  const [editTotal, setEditTotal] = useState(0);

  // New proposal form state
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTotal, setNewTotal] = useState(3000);
  const [newTurnaround, setNewTurnaround] = useState(14);
  const [newRevisions, setNewRevisions] = useState(2);

  // New client form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const activeCreator: Creator = getActiveCreator();
  const gaugeRef = useRef<SVGCircleElement>(null);

  const loadData = async () => {
    try {
      const [props, stat, invRes, clientRes] = await Promise.all([
        fetchProposals(),
        fetchStatusSummary(),
        fetch(`${API_BASE}/api/invoices`).then(r => r.json()),
        fetch(`${API_BASE}/api/clients`).then(r => r.json()),
      ]);

      setProposals(props);
      setSummary(stat.summary);
      setInvoices(invRes.invoices || []);
      setClients(clientRes.clients || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  // GSAP Gauge Animation on load
  useEffect(() => {
    if (gaugeRef.current) {
      gsap.fromTo(
        gaugeRef.current,
        { strokeDashoffset: 440 },
        { strokeDashoffset: 440 - (440 * 0.88 * 0.5), duration: 1.2, ease: 'power2.out' }
      );
    }
  }, [loading]);

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

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: newClientId || clients[0]?.id || 'cli_partner_1042',
          creator_id: activeCreator.id,
          title: newTitle,
          body: newBody,
          line_items: [
            { description: 'Primary Commercial Production Deliverable', quantity: 1, unit_price: Number(newTotal), amount: Number(newTotal) },
          ],
          turnaround_days: Number(newTurnaround),
          revisions_included: Number(newRevisions),
          deposit_percentage: 50,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create proposal');

      setShowNewProposalModal(false);
      setNewTitle('');
      setNewBody('');
      loadData();
      alert(`Proposal created successfully!\nPublic Link: ${data.public_link}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          currency: activeCreator.currency || 'USD',
        }),
      });

      if (!res.ok) throw new Error('Failed to create client');
      setShowNewClientModal(false);
      setClientName('');
      setClientEmail('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${invoiceId}/reminder`, { method: 'POST' });
      const data = await res.json();
      setReminderToast(data.message || `Payment reminder dispatched for invoice #${invoiceId}`);
      setTimeout(() => setReminderToast(null), 3000);
    } catch {
      alert('Failed to send reminder');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Scope Title', 'Client Ref', 'Status', 'Total ($)', '50% Deposit ($)', 'Created At'];
    const rows = proposals.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"Commercial Partner #${p.id.slice(-4)}"`,
      p.status,
      p.total_amount,
      p.deposit_amount,
      p.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settle-commercial-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(activeCreator.api_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Anonymized proposals (zero raw client names exposed on UI)
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PAID') return matchesSearch && (p.deposit_paid === 1 || p.status === 'ACCEPTED');
    if (statusFilter === 'PENDING') return matchesSearch && !p.deposit_paid && p.status !== 'ACCEPTED';
    return matchesSearch;
  });

  const monthlyBars = [
    { m: 'Jan', h: 45, rev: '$4,200', conv: '8.2%', a: false },
    { m: 'Feb', h: 60, rev: '$6,800', conv: '9.4%', a: false },
    { m: 'Mar', h: 35, rev: '$3,500', conv: '7.1%', a: false },
    { m: 'Apr', h: 80, rev: '$12,400', conv: '11.0%', a: false },
    { m: 'May', h: 65, rev: '$8,900', conv: '10.2%', a: false },
    { m: 'Jun', h: 110, rev: '$24,064', conv: '12.5%', a: true }, // Current month
    { m: 'Jul', h: 50, rev: '$5,800', conv: '8.8%', a: false },
    { m: 'Aug', h: 40, rev: '$4,100', conv: '7.9%', a: false },
    { m: 'Sep', h: 75, rev: '$9,800', conv: '10.5%', a: false },
    { m: 'Oct', h: 60, rev: '$7,200', conv: '9.1%', a: false },
    { m: 'Nov', h: 85, rev: '$14,200', conv: '11.8%', a: false },
    { m: 'Dec', h: 95, rev: '$16,500', conv: '12.2%', a: false },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      
      {/* Toast Alert */}
      {reminderToast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#0f172a', color: '#fff', padding: '0.85rem 1.25rem', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 100, fontSize: '0.88rem' }}>
          <Check size={16} color="#ff5c00" />
          {reminderToast}
        </div>
      )}

      {/* 1. Sidebar Navigation */}
      <aside style={{ width: '250px', background: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1.25rem', position: 'sticky', top: 0, height: '100vh' }}>
        <div>
          {/* Studio Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f3f7' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(255,92,0,0.25)' }}>
              S.
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {creatorProfile.studioName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#ff5c00', fontWeight: 700 }}>Pro Studio</span>
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
              placeholder="Search scopes (⌘K)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>

          {/* Main Menu Links */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Main Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', background: activeTab === 'dashboard' ? '#fff5f0' : 'transparent', color: activeTab === 'dashboard' ? '#ff5c00' : '#475569', fontWeight: activeTab === 'dashboard' ? 700 : 500, fontSize: '0.88rem', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', borderLeft: activeTab === 'dashboard' ? '3px solid #ff5c00' : 'none' }}
            >
              <Layers size={17} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', background: activeTab === 'proposals' ? '#fff5f0' : 'transparent', color: activeTab === 'proposals' ? '#ff5c00' : '#475569', fontWeight: activeTab === 'proposals' ? 700 : 500, fontSize: '0.88rem', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', borderLeft: activeTab === 'proposals' ? '3px solid #ff5c00' : 'none' }}
            >
              <FileText size={17} />
              Proposals
              <span style={{ marginLeft: 'auto', background: '#f1f3f7', color: '#64748b', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                {proposals.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', background: activeTab === 'invoices' ? '#fff5f0' : 'transparent', color: activeTab === 'invoices' ? '#ff5c00' : '#475569', fontWeight: activeTab === 'invoices' ? 700 : 500, fontSize: '0.88rem', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', borderLeft: activeTab === 'invoices' ? '3px solid #ff5c00' : 'none' }}
            >
              <DollarSign size={17} />
              Invoices
              <span style={{ marginLeft: 'auto', background: '#f1f3f7', color: '#64748b', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                {invoices.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', background: activeTab === 'clients' ? '#fff5f0' : 'transparent', color: activeTab === 'clients' ? '#ff5c00' : '#475569', fontWeight: activeTab === 'clients' ? 700 : 500, fontSize: '0.88rem', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', borderLeft: activeTab === 'clients' ? '3px solid #ff5c00' : 'none' }}
            >
              <Users size={17} />
              Commercial Partners
              <span style={{ marginLeft: 'auto', background: '#f1f3f7', color: '#64748b', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                {clients.length}
              </span>
            </button>
          </nav>

          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Model Context Protocol (MCP)
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button onClick={() => setShowKeyModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '8px', color: '#475569', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>
              <Key size={17} color="#ff5c00" />
              MCP Protocol Token
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              MCP Server Ready
            </div>
          </nav>
        </div>

        {/* User Profile Button in Side Panel (Clickable to view Profile & Payout details) */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f3f7' }}>
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.75rem',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              marginBottom: '0.75rem',
              textAlign: 'left',
              transition: 'all 150ms ease',
            }}
            title="Click to view full Creator Profile & Payout credentials"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                {creatorProfile.name.charAt(0)}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {creatorProfile.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#ff5c00', fontWeight: 600 }}>
                  View Creator Profile ↗
                </div>
              </div>
            </div>
            <ChevronRight size={14} color="#94a3b8" />
          </button>

          <button onClick={onSignOut} className="btn-ghost" style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem', justifyContent: 'center', color: '#b91c1c' }}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Work Area */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
              {activeTab} Overview
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Multi-tenant commercial ledger • Connected to Stripe Test Sandbox
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onOpenLanding} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
              <Globe size={14} color="#ff5c00" />
              Product Landing Page
            </button>
            <button onClick={loadData} className="btn-ghost" title="Refresh database sync">
              <RefreshCw size={14} />
              Sync
            </button>
            <button onClick={handleExportCSV} className="btn-ghost" title="Export database to CSV">
              <Download size={14} />
              Export CSV
            </button>
            <button onClick={() => setShowNewClientModal(true)} className="btn-ghost">
              <UserPlus size={14} />
              + Add Partner
            </button>
            <button onClick={() => setShowNewProposalModal(true)} className="btn-orange">
              <Plus size={15} />
              New Proposal
            </button>
          </div>
        </div>

        {/* View 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <>
            {/* KPI Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              
              <div className="card-white" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>Active Pipeline</span>
                  <TrendingUp size={16} color="#ff5c00" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  ${summary ? Number(summary.pipeline_value).toLocaleString() : '0'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  ↑ 12% <span style={{ color: '#94a3b8', fontWeight: 400 }}>from active proposals</span>
                </div>
              </div>

              <div className="card-white" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>Deposits Cleared</span>
                  <DollarSign size={16} color="#ff5c00" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#ff5c00', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  ${summary ? Number(summary.collected_deposits).toLocaleString() : '0'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  ↑ 9% <span style={{ color: '#94a3b8', fontWeight: 400 }}>secured via Stripe</span>
                </div>
              </div>

              <div className="card-white" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>Proposals Settled</span>
                  <FileText size={16} color="#64748b" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  {summary ? summary.total_accepted_proposals : 0} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/ {proposals.length}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  ↑ 7% <span style={{ color: '#94a3b8', fontWeight: 400 }}>acceptance conversion</span>
                </div>
              </div>

              <div className="card-white" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>Avg Contract Scope</span>
                  <Award size={16} color="#ff5c00" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  ${proposals.length > 0 ? Math.round(proposals.reduce((acc, p) => acc + Number(p.total_amount || 0), 0) / proposals.length).toLocaleString() : '4,800'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                  ↑ 14% <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs commercial benchmark</span>
                </div>
              </div>

            </div>

            {/* Interactive Performance Row (GSAP Animated Semicircle Arc & Tooltips) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '1.25rem', marginBottom: '2rem' }}>
              
              {/* Interactive Semicircle Score Gauge */}
              <div
                className="card-white"
                onMouseEnter={() => setHoveredGauge(true)}
                onMouseLeave={() => setHoveredGauge(false)}
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Operational Score</span>
                    <span className="badge-status badge-orange">Live Velocity</span>
                  </div>

                  {/* Interactive Semicircle Arc */}
                  <div style={{ position: 'relative', width: '180px', height: '95px', margin: '1.75rem auto 0.75rem', overflow: 'hidden' }}>
                    <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-180deg)' }}>
                      <circle
                        cx="90"
                        cy="90"
                        r="70"
                        fill="none"
                        stroke="#f1f3f7"
                        strokeWidth="16"
                      />
                      <circle
                        ref={gaugeRef}
                        cx="90"
                        cy="90"
                        r="70"
                        fill="none"
                        stroke="#ff5c00"
                        strokeWidth="16"
                        strokeDasharray="440"
                        strokeDashoffset="246"
                        strokeLinecap="round"
                        style={{ transition: 'stroke 200ms ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
                      <div className="tabular-nums" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        88 <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>+1</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                        of 100 points
                      </div>
                    </div>
                  </div>

                  {/* Hover breakdown tooltip */}
                  {hoveredGauge ? (
                    <div style={{ background: '#0f172a', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
                      Conversion: 92% • Revision Limit: 100% • Deposit Rate: 50%
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Hover for metric breakdown
                    </div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
                  50% upfront deposit terms lock client production calendars 3.2x faster.
                </div>
              </div>

              {/* Monthly Pipeline Bar Chart with Hover Tooltips */}
              <div className="card-white" style={{ padding: '1.75rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Monthly Pipeline Volume</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Hover any month for detailed telemetry</div>
                  </div>
                  {hoveredMonth ? (
                    <div style={{ background: '#0f172a', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {hoveredMonth.m}: {hoveredMonth.rev} ({hoveredMonth.conv})
                    </div>
                  ) : (
                    <span className="badge-status badge-orange">Active: Jun ($24.0k)</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '175px', paddingTop: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                  {monthlyBars.map((bar, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredMonth(bar)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          width: '26px',
                          height: `${bar.h}px`,
                          borderRadius: '6px 6px 0 0',
                          transform: hoveredMonth?.m === bar.m ? 'scaleY(1.08)' : 'scaleY(1)',
                          transition: 'all 180ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                        className={bar.a || hoveredMonth?.m === bar.m ? 'bg-hatched-orange' : 'bg-hatched'}
                      />
                      <span style={{ fontSize: '0.72rem', color: bar.a || hoveredMonth?.m === bar.m ? '#ff5c00' : '#94a3b8', fontWeight: bar.a || hoveredMonth?.m === bar.m ? 800 : 500 }}>
                        {bar.m}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

        {/* View 2: PROPOSALS TABLE (All client names strictly sanitized) */}
        {(activeTab === 'dashboard' || activeTab === 'proposals') && (
          <div className="card-white" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Active Proposals & Scope Agreements
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Committed by Claude over MCP. Click Edit to review or override terms in-place.
                </p>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setStatusFilter('ALL')} className={statusFilter === 'ALL' ? 'btn-orange' : 'btn-ghost'} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                  All ({proposals.length})
                </button>
                <button onClick={() => setStatusFilter('PENDING')} className={statusFilter === 'PENDING' ? 'btn-orange' : 'btn-ghost'} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                  Pending
                </button>
                <button onClick={() => setStatusFilter('PAID')} className={statusFilter === 'PAID' ? 'btn-orange' : 'btn-ghost'} style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                  Paid
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                Syncing database...
              </div>
            ) : filteredProposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>No Proposals Found</div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1rem' }}>
                  Prompt Claude or click "New Proposal" to create one.
                </p>
                <button onClick={() => setShowNewProposalModal(true)} className="btn-orange">
                  + Create Proposal
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Commercial Scope</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Partner Reference</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Milestone Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Total Scope</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>50% Upfront</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.map(p => {
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
                            {/* Privacy Sanitized: Zero raw client names */}
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>Commercial Partner #{p.id.slice(-4).toUpperCase()}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Production Account</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge-status ${isPaid ? 'badge-green' : 'badge-orange'}`}>
                              {isPaid ? 'Deposit Cleared' : p.status}
                            </span>
                          </td>
                          <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            ${Number(p.total_amount).toLocaleString()}
                          </td>
                          <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', color: isPaid ? '#10b981' : '#ff5c00', fontWeight: 700 }}>
                            ${Number(p.deposit_amount).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="btn-ghost"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                title="Human review & edit terms in app"
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
                                title="Open client payment & receipt link"
                              >
                                <ExternalLink size={13} />
                                Client Link
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
        )}

        {/* View 3: INVOICES DIRECTORY */}
        {activeTab === 'invoices' && (
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Issued Invoices & Payment Rail</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Direct Stripe payment links and automated reminders</p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <DollarSign size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>No Invoices Issued Yet</div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
                  Ask Claude: "Create an invoice for $2,400 balance due upon delivery."
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Invoice Reference</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Partner Account</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Due Date</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f1f3f7' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>#{inv.id}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>Partner #{inv.id.slice(-4).toUpperCase()}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{inv.due_date || 'Due Upon Receipt'}</td>
                        <td className="tabular-nums" style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          ${Number(inv.amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge-status ${inv.status === 'PAID' ? 'badge-green' : 'badge-orange'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleSendReminder(inv.id)}
                            className="btn-ghost"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          >
                            <Send size={13} />
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View 4: CLIENTS DIRECTORY */}
        {activeTab === 'clients' && (
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Commercial Partner Accounts</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Registered production partners and billing profiles</p>
              </div>
              <button onClick={() => setShowNewClientModal(true)} className="btn-orange">
                <UserPlus size={15} />
                + Add Partner
              </button>
            </div>

            {clients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Users size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>No Partners Registered</div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1rem' }}>
                  Register a commercial partner account here or let Claude add them automatically via MCP.
                </p>
                <button onClick={() => setShowNewClientModal(true)} className="btn-orange">
                  + Add Partner
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Partner Reference</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Account Status</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Currency</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f3f7' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>Partner #{c.id.slice(-4).toUpperCase()}</td>
                        <td style={{ padding: '1rem', color: '#10b981', fontWeight: 600 }}>Active Production Account</td>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#ff5c00' }}>{c.currency || 'USD'}</td>
                        <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(c.created_at || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modal 1: Creator Profile & Payout Settings (Triggered by Alex Rivera Profile Button) */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 60 }}>
          <div className="card-white" style={{ maxWidth: '560px', width: '100%', padding: '2.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f3f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                  A
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{creatorProfile.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Creator Profile & Payout Credentials</p>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Profile Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Studio Entity</label>
                <div style={{ position: 'relative' }}>
                  <Building size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  <input
                    type="text"
                    value={creatorProfile.studioName}
                    onChange={e => setCreatorProfile({ ...creatorProfile, studioName: e.target.value })}
                    className="input-clean"
                    style={{ paddingLeft: '2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input
                      type="email"
                      value={creatorProfile.email}
                      onChange={e => setCreatorProfile({ ...creatorProfile, email: e.target.value })}
                      className="input-clean"
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Contact Phone / WhatsApp</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input
                      type="text"
                      value={creatorProfile.phone}
                      onChange={e => setCreatorProfile({ ...creatorProfile, phone: e.target.value })}
                      className="input-clean"
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Stripe Payment & Payout Routing Details */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={16} color="#ff5c00" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Stripe Payout Rail</span>
                  </div>
                  <span className="badge-status badge-green">Payouts Active</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div>Stripe Account ID: <strong style={{ color: '#0f172a' }}>{creatorProfile.stripeAccountId}</strong></div>
                  <div>Settlement Currency: <strong style={{ color: '#0f172a' }}>{creatorProfile.currency} ($)</strong></div>
                  <div>Bank Payout: <strong style={{ color: '#0f172a' }}>{creatorProfile.bankRouting}</strong></div>
                  <div>Tax EIN / ID: <strong style={{ color: '#0f172a' }}>{creatorProfile.taxId}</strong></div>
                </div>
              </div>

              {/* MCP Protocol Secret */}
              <div style={{ background: '#fff5f0', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,92,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff5c00', textTransform: 'uppercase' }}>Claude MCP Secret Token</span>
                  <button onClick={copyApiKey} style={{ background: 'none', border: 'none', color: '#ff5c00', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    {copiedKey ? 'Copied' : 'Copy Key'}
                  </button>
                </div>
                <code style={{ fontSize: '0.8rem', color: '#0f172a', background: '#fff', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'block' }}>
                  {activeCreator.api_key}
                </code>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowProfileModal(false)} className="btn-ghost">
                Close
              </button>
              <button
                onClick={() => {
                  alert('Profile & payout credentials saved successfully!');
                  setShowProfileModal(false);
                }}
                className="btn-orange"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Human Edit Proposal */}
      {editingProposal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div className="card-white" style={{ maxWidth: '580px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Human In-the-Loop Override</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Modify any deliverable, price, or revision clause before client sends.</p>
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

      {/* Modal 3: Create Proposal */}
      {showNewProposalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div className="card-white" style={{ maxWidth: '580px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Create New Proposal</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Generate an executive scope with 50% upfront deposit</p>
              </div>
              <button onClick={() => setShowNewProposalModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProposal}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Proposal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Brand Video Campaign (3-Week Launch)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input-clean"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Partner Account
                </label>
                <select
                  value={newClientId}
                  onChange={e => setNewClientId(e.target.value)}
                  className="input-clean"
                  required
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>Partner #{c.id.slice(-4).toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Scope Narrative & Deliverables Breakdown
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the deliverables, timeline, audio licensing, and post-production specifics..."
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="input-clean"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Total Price ($)
                  </label>
                  <input
                    type="number"
                    value={newTotal}
                    onChange={e => setNewTotal(Number(e.target.value))}
                    className="input-clean"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Turnaround (Days)
                  </label>
                  <input
                    type="number"
                    value={newTurnaround}
                    onChange={e => setNewTurnaround(Number(e.target.value))}
                    className="input-clean"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Revisions Included
                  </label>
                  <input
                    type="number"
                    value={newRevisions}
                    onChange={e => setNewRevisions(Number(e.target.value))}
                    className="input-clean"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowNewProposalModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-orange">
                  Publish Proposal & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add Partner */}
      {showNewClientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div className="card-white" style={{ maxWidth: '460px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Register Commercial Partner</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Add a partner account to your studio ledger</p>
              </div>
              <button onClick={() => setShowNewClientModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClient}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Partner Account Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Media Production Group (Ref #1043)"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="input-clean"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Partner Billing Email
                </label>
                <input
                  type="email"
                  placeholder="billing@partnergroup.io"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  className="input-clean"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowNewClientModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-orange">
                  Add Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Claude MCP Secret Token */}
      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 60 }}>
          <div className="card-white" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Model Context Protocol (MCP) Token</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Universal multi-tenant agent authentication token</p>
              </div>
              <button onClick={() => setShowKeyModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Your Personal MCP Token</span>
                <button onClick={copyApiKey} style={{ background: 'none', border: 'none', color: '#ff5c00', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {copiedKey ? <Check size={13} /> : null}
                  {copiedKey ? 'Copied' : 'Copy Token'}
                </button>
              </div>
              <code style={{ fontSize: '0.82rem', color: '#0f172a', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'block', wordBreak: 'break-all' }}>
                {activeCreator.api_key}
              </code>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
                Compatible with any MCP-enabled assistant (Claude Desktop, ChatGPT, Cursor, Windsurf, or custom agent). Set <code>SETTLE_API_KEY</code> so all generated agreements link to your studio ledger.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowKeyModal(false)} className="btn-orange" style={{ width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
