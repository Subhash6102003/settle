import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, CheckCircle2, Bot, Edit3 } from 'lucide-react';
import gsap from 'gsap';

interface LandingPageProps {
  onGoToApp: () => void;
  onViewDemoProposal: () => void;
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp, onViewDemoProposal, onGoToLogin }) => {
  const [targetRevenue, setTargetRevenue] = useState(15000);
  const [avgProjectSize, setAvgProjectSize] = useState(3000);
  const heroRef = useRef<HTMLDivElement>(null);

  const projectsNeeded = Math.ceil(targetRevenue / avgProjectSize);
  const depositUnlocked = Math.round(targetRevenue * 0.5);
  const currentPaced = 11400;
  const targetAchievedPct = Math.min(100, Math.round((currentPaced / targetRevenue) * 100));

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. Header Navigation */}
      <header style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb', zIndex: 50, padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 2px 10px rgba(255,92,0,0.3)' }}>
              S.
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>Settle</span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: '#fff5f0', color: '#ff5c00', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(255,92,0,0.2)' }}>
                INVOICE & RECEIPT ENGINE
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onViewDemoProposal} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
              Preview Client Proposal Page
            </button>
            <button onClick={onGoToLogin} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
              Sign In
            </button>
            <button onClick={onGoToApp} className="btn-orange" style={{ fontSize: '0.88rem' }}>
              Open Creator Studio
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Clear Value Proposition */}
      <section ref={heroRef} style={{ maxWidth: '1080px', margin: '3.5rem auto 2.5rem', padding: '0 1.5rem', textAlign: 'center' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff5f0', border: '1px solid rgba(255,92,0,0.25)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, color: '#ff5c00', marginBottom: '1.25rem' }}>
          <Zap size={14} />
          Commercial Proposal, Invoice & Payment Receipt Generator
        </div>

        <h1 style={{ fontSize: '3.1rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', marginBottom: '1.25rem' }}>
          Generate Proposals, Invoices & Tax Receipts.<br />
          <span style={{ color: '#ff5c00' }}>Through Claude MCP or Manually.</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '760px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          We are the <strong>invoice generator and receipt generator</strong> for freelance creators.
          You can connect Claude through the <strong>Model Context Protocol (MCP)</strong> and Claude will do all your work—or you can manage everything manually in our clean dashboard.
          <strong>Zero AI inside our backend</strong>—your own Claude plan does the writing, while Settle guarantees your deposits clear.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onGoToApp} className="btn-orange" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Launch Creator Studio
            <ArrowRight size={18} />
          </button>
          <button onClick={onViewDemoProposal} className="btn-ghost" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Inspect Sample Public Proposal Link
          </button>
        </div>
      </section>

      {/* 3. The Two Paths: Claude MCP vs. Manual Control */}
      <section style={{ maxWidth: '1100px', margin: '3rem auto 4.5rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Path 1: Connect with Claude over MCP */}
          <div className="card-white" style={{ padding: '2.25rem', border: '2px solid #ff5c00', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#ff5c00', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.3rem 0.85rem', borderRadius: '0 0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RECOMMENDED FLOW
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff5f0', color: '#ff5c00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Option A: Connect with Claude via MCP
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Paste your client's email into Claude Desktop on your personal subscription. Claude connects to Settle over the Model Context Protocol and executes everything:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#ff5c00" /> Claude structures the deliverables & revision boundaries
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#ff5c00" /> Claude calls <code>create_proposal</code> to publish a live URL
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#ff5c00" /> Claude calls <code>create_invoice</code> with Stripe payment rails
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#ff5c00" /> Settle issues the legal settlement receipt upon payment
              </li>
            </ul>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
              Claude config: <code>"command": "node D:/don't_know/settle/mcp-server/dist/index.js"</code>
            </div>
          </div>

          {/* Path 2: Manual Control In Dashboard */}
          <div className="card-white" style={{ padding: '2.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f1f3f7', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Edit3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Option B: Create Everything Manually
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Prefer direct manual control? Use the Settle Creator Studio dashboard directly with zero prompt typing:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Click <strong>"+ New Proposal"</strong> to draft custom scopes
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Click <strong>"Edit"</strong> on any proposal to override terms
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Click <strong>"Send Reminder"</strong> to email payment links
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> 1-Click <strong>"Export CSV"</strong> to download full financial ledger
              </li>
            </ul>
            <button onClick={onGoToApp} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              Open Studio Dashboard Directly
            </button>
          </div>

        </div>
      </section>

      {/* 4. Interactive Target Revenue & Sales Simulator */}
      <section style={{ maxWidth: '1140px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div className="card-white" style={{ padding: '2.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#ff5c00' }}>
              Interactive Sales Simulator
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
              Simulate Monthly Revenue & Target Achievement
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Set your target revenue, see how many proposals you need, and track your upfront cashflow velocity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem', alignItems: 'center' }}>
            
            {/* Controls */}
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Monthly Revenue Goal</label>
                  <span className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ff5c00' }}>
                    ${targetRevenue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={40000}
                  step={1000}
                  value={targetRevenue}
                  onChange={e => setTargetRevenue(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ff5c00', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  <span>$5,000/mo</span>
                  <span>$20,000/mo</span>
                  <span>$40,000/mo</span>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Average Deal Size</label>
                  <span className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    ${avgProjectSize.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step={500}
                  value={avgProjectSize}
                  onChange={e => setAvgProjectSize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ff5c00', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  <span>$1,000 (Shorts/Reels)</span>
                  <span>$5,000 (Commercial)</span>
                  <span>$10,000 (Hero Cut)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Proposals to Settle</div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                    {projectsNeeded} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>scopes</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>50% Upfront Cash</div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ff5c00' }}>
                    ${depositUnlocked.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Semicircle Target Pacing Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Pacing vs. Goal</span>
                  <span className="badge-status badge-orange">{targetAchievedPct}% Paced</span>
                </div>

                <div style={{ position: 'relative', width: '220px', height: '110px', margin: '1.5rem auto 0.5rem', overflow: 'hidden' }}>
                  <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-180deg)' }}>
                    <circle cx="110" cy="110" r="90" fill="none" stroke="#f1f3f7" strokeWidth="20" />
                    <circle
                      cx="110"
                      cy="110"
                      r="90"
                      fill="none"
                      stroke="#ff5c00"
                      strokeWidth="20"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 - (565.48 * (targetAchievedPct / 100) * 0.5)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 400ms ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
                    <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      ${currentPaced.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Paced This Month
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div>Goal: <strong style={{ color: '#0f172a' }}>${targetRevenue.toLocaleString()}</strong></div>
                  <div>Remaining: <strong style={{ color: '#ff5c00' }}>${Math.max(0, targetRevenue - currentPaced).toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Milestone Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>50% Upfront Deposit</div>
                  <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff5c00', marginTop: '0.2rem' }}>
                    ${Math.round(currentPaced * 0.5).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Cleared before work starts</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Final Cut Balance</div>
                  <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    ${Math.round(currentPaced * 0.5).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Cleared upon ProRes approval</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          Start Generating Invoices & Proposals Today
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Connect Claude via MCP or use the manual studio. Zero AI inside our backend, 100% verified Stripe payment rails.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onGoToApp} className="btn-orange" style={{ padding: '0.85rem 1.75rem' }}>
            Open Creator Studio
            <ArrowRight size={16} />
          </button>
          <button onClick={onViewDemoProposal} className="btn-ghost" style={{ padding: '0.85rem 1.75rem' }}>
            View Client Proposal Page
          </button>
        </div>
        <div style={{ marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
          Settle • Volopay Product & Tech Assignment Submission • Built for Creative Freelancers
        </div>
      </footer>

    </div>
  );
};
