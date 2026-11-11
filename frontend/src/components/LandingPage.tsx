import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Bot, Edit3 } from 'lucide-react';
import gsap from 'gsap';

interface LandingPageProps {
  onGoToApp: () => void;
  onViewDemoProposal: () => void;
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp, onViewDemoProposal, onGoToLogin }) => {
  // Financial simulator state
  const [targetRevenue, setTargetRevenue] = useState(20000);
  const [avgProjectSize, setAvgProjectSize] = useState(4000);
  const [activeProjects, setActiveProjects] = useState(3);
  const heroRef = useRef<HTMLDivElement>(null);
  const gaugeArcRef = useRef<SVGCircleElement>(null);

  // Dynamic calculations:
  // Paced monthly revenue is directly driven by Active Projects × Average Scope!
  const pacedRevenue = activeProjects * avgProjectSize;
  const upfrontDeposit = Math.round(pacedRevenue * 0.5);
  const finalBalance = pacedRevenue - upfrontDeposit;
  
  // Progress calculations
  const targetAchievedPct = Math.round((pacedRevenue / targetRevenue) * 100);
  const isGoalReached = pacedRevenue >= targetRevenue;
  const surplusOrGap = Math.abs(pacedRevenue - targetRevenue);
  const dealsNeededForGoal = Math.ceil(targetRevenue / avgProjectSize);
  const remainingDealsNeeded = Math.max(0, dealsNeededForGoal - activeProjects);

  // Maximum scale for horizontal comparison bars
  const maxScale = Math.max(50000, targetRevenue * 1.15, pacedRevenue * 1.15);
  const revenueBarPct = Math.min(100, Math.round((pacedRevenue / maxScale) * 100));
  const targetBarPct = Math.min(100, Math.round((targetRevenue / maxScale) * 100));

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

  // Update SVG Arc dynamically when values change
  useEffect(() => {
    if (gaugeArcRef.current) {
      const fillRatio = Math.min(1, pacedRevenue / targetRevenue);
      // Total circumference for r=70 is 2 * PI * 70 = 439.82 (approx 440)
      // Semicircle uses half circle (220 max stroke)
      const targetOffset = 440 - (440 * fillRatio * 0.5);
      gsap.to(gaugeArcRef.current, {
        strokeDashoffset: targetOffset,
        duration: 0.35,
        ease: 'power1.out',
      });
    }
  }, [pacedRevenue, targetRevenue]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      
      {/* 1. Header */}
      <header style={{ position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0', zIndex: 50, padding: '0.85rem 2rem' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
              S
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Settle</span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                Billing OS for Freelancers
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onViewDemoProposal} className="btn-ghost" style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}>
              Preview Client Proposal Page
            </button>
            <button onClick={onGoToLogin} className="btn-ghost" style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}>
              Sign In
            </button>
            <button onClick={onGoToApp} className="btn-orange" style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}>
              Open Studio Dashboard
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section ref={heroRef} style={{ maxWidth: '960px', margin: '3.5rem auto 2.5rem', padding: '0 1.5rem', textAlign: 'center' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fff7ed', border: '1px solid #ffedd5', padding: '0.3rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#c2410c', marginBottom: '1.25rem' }}>
          Commercial Video Editors • Designers • Independent Contractors
        </div>

        <h1 style={{ fontSize: '2.85rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', marginBottom: '1.15rem' }}>
          Proposals, Invoices & Payment Receipts.<br />
          <span style={{ color: '#ff5c00' }}>Controlled from Claude or Your Dashboard.</span>
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '680px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Settle is a dedicated billing engine. It contains <strong>zero built-in AI</strong>. Connect your personal Claude Desktop plan via MCP to draft scopes automatically, or manage client agreements and Stripe deposits directly in the studio console.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button onClick={onGoToApp} className="btn-orange" style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}>
            Open Studio Dashboard
            <ArrowRight size={16} />
          </button>
          <button onClick={onViewDemoProposal} className="btn-ghost" style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}>
            View Client Proposal & Receipt
          </button>
        </div>
      </section>

      {/* 3. The Two Ways to Work */}
      <section style={{ maxWidth: '1060px', margin: '2.5rem auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Workflow A: Claude MCP */}
          <div className="card-white" style={{ padding: '2rem', border: '1px solid #fed7aa', background: '#fffaf5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Workflow A: Autonomous via Claude (MCP)
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700 }}>Zero prompt engineering inside Settle</span>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Paste your client's brief or email into Claude Desktop. Claude calls Settle's tools via the Model Context Protocol to generate proposals, issue payment links, and pull financial summaries:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#334155', marginBottom: '1.25rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#ff5c00" /> Formats deliverables, revision caps & turnaround schedules
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#ff5c00" /> Calls <code>create_proposal</code> to publish a live client page
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#ff5c00" /> Calls <code>create_invoice</code> with Stripe Checkout links
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#ff5c00" /> Calls <code>get_status</code> to report paid milestone deposits
              </li>
            </ul>

            <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>
              MCP server: <code>node settle/mcp-server/dist/index.js</code>
            </div>
          </div>

          {/* Workflow B: Manual Studio */}
          <div className="card-white" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit3 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Workflow B: Manual Studio Management
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Direct in-browser control</span>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Use the Settle web console directly when you prefer manual drafting, accounting oversight, or human-in-the-loop adjustments:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#334155', marginBottom: '1.25rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#10b981" /> <strong>+ New Proposal:</strong> Form-based builder with line items
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#10b981" /> <strong>Edit & Review:</strong> In-place edits of scope, prices & timeline
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#10b981" /> <strong>Send Reminder:</strong> 1-click payment chase emails
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#10b981" /> <strong>Export CSV:</strong> Download full financial records for tax prep
              </li>
            </ul>

            <button onClick={onGoToApp} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
              Open Studio Dashboard Directly
            </button>
          </div>

        </div>
      </section>

      {/* 4. Complete Interactive Sales & Revenue Simulator */}
      <section style={{ maxWidth: '1060px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div className="card-white" style={{ padding: '2.5rem', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, color: '#ff5c00' }}>
              Financial Planning Simulator
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              Interactive Revenue & Milestone Cashflow Simulator
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              Adjust deal sizes, project volume, and target goals to visualize revenue pacing and instant deposit cashflow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.85fr', gap: '2.25rem', alignItems: 'start' }}>
            
            {/* Control Sliders Column */}
            <div style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              
              {/* Slider 1: Target Revenue Goal */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Monthly Revenue Target</label>
                  <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
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
                  style={{ width: '100%', accentColor: '#0f172a', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  <span>$5,000 (Baseline)</span>
                  <span>$20,000 (Target)</span>
                  <span>$40,000 (Stretch)</span>
                </div>
              </div>

              {/* Slider 2: Average Project Scope (Deal Size) */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Average Deal Size</label>
                  <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ff5c00' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  <span>$1,000 (Quick Edits)</span>
                  <span>$4,000 (Commercial)</span>
                  <span>$10,000 (Full Brand)</span>
                </div>
              </div>

              {/* Slider 3: Active Scopes This Month */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Active Projects This Month</label>
                  <span className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ff5c00' }}>
                    {activeProjects} {activeProjects === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={activeProjects}
                  onChange={e => setActiveProjects(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ff5c00', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  <span>1 client</span>
                  <span>5 clients</span>
                  <span>10 clients</span>
                </div>
              </div>

              {/* Formula & Live Calculation Footnote */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                  Formula: {activeProjects} projects × ${avgProjectSize.toLocaleString()}
                </div>
                <div>
                  Each +$1,000 in deal size increases monthly revenue by <strong>${(activeProjects * 1000).toLocaleString()}</strong>.
                </div>
              </div>

            </div>

            {/* Visual Graphs & Comparison Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Graph 1: Pricing vs Goal Comparison Bars */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Pricing vs. Goal Comparison
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Real-time revenue pacing based on current deal size and volume
                    </div>
                  </div>
                  <span className={`badge-status ${isGoalReached ? 'badge-green' : 'badge-orange'}`}>
                    {isGoalReached ? `✓ Goal Met (+${targetAchievedPct}%)` : `${targetAchievedPct}% of Target`}
                  </span>
                </div>

                {/* Bar 1: Projected Revenue */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Projected Revenue ({activeProjects} × ${avgProjectSize.toLocaleString()})</span>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: '#ff5c00' }}>${pacedRevenue.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '7px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${revenueBarPct}%`,
                        height: '100%',
                        background: '#ff5c00',
                        borderRadius: '7px',
                        transition: 'width 250ms ease-out',
                      }}
                    />
                  </div>
                </div>

                {/* Bar 2: Target Goal */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>Target Goal Benchmark</span>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: '#0f172a' }}>${targetRevenue.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '7px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${targetBarPct}%`,
                        height: '100%',
                        background: '#0f172a',
                        borderRadius: '7px',
                        transition: 'width 250ms ease-out',
                      }}
                    />
                  </div>
                </div>

                {/* Status Indicator */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <div style={{ color: '#64748b' }}>
                    {isGoalReached ? (
                      <span style={{ color: '#047857', fontWeight: 600 }}>
                        Revenue exceeds goal by <strong>${surplusOrGap.toLocaleString()}</strong>.
                      </span>
                    ) : (
                      <span>
                        Need <strong>${surplusOrGap.toLocaleString()}</strong> more to reach goal ({remainingDealsNeeded} more {remainingDealsNeeded === 1 ? 'deal' : 'deals'} at ${avgProjectSize.toLocaleString()}).
                      </span>
                    )}
                  </div>
                  <div className="tabular-nums" style={{ fontWeight: 700, color: '#0f172a' }}>
                    {dealsNeededForGoal} total deals needed
                  </div>
                </div>
              </div>

              {/* Graph 2: Semicircle Velocity Gauge & Cashflow Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1rem' }}>
                
                {/* Semicircle Target Gauge */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Pacing Gauge
                  </div>

                  <div style={{ position: 'relative', width: '170px', height: '90px', margin: '1rem auto 0.25rem', overflow: 'hidden' }}>
                    <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-180deg)' }}>
                      <circle cx="85" cy="85" r="70" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                      <circle
                        ref={gaugeArcRef}
                        cx="85"
                        cy="85"
                        r="70"
                        fill="none"
                        stroke="#ff5c00"
                        strokeWidth="16"
                        strokeDasharray="440"
                        strokeDashoffset="440"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
                      <div className="tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        ${pacedRevenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Paced This Month
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    {targetAchievedPct}% achieved of ${targetRevenue.toLocaleString()}
                  </div>
                </div>

                {/* Instant Deposit Cashflow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      50% Upfront Stripe Cash
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ff5c00', marginTop: '0.15rem' }}>
                      ${upfrontDeposit.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Liquid in bank before starting production
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      50% Final Release
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                      ${finalBalance.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Settled on master ProRes approval
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. Minimal Human Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Commercial Billing Engine for Independent Creators
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '580px', margin: '0 auto 1.5rem' }}>
          Connect Claude via MCP or use the manual studio. Zero AI inside our backend, verified Stripe test payment rails.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button onClick={onGoToApp} className="btn-orange" style={{ padding: '0.75rem 1.5rem' }}>
            Open Creator Studio
            <ArrowRight size={15} />
          </button>
          <button onClick={onViewDemoProposal} className="btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>
            View Client Proposal Page
          </button>
        </div>
        <div style={{ marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.78rem' }}>
          Settle • Volopay Product & Tech Assignment Submission • Built for Creative Freelancers
        </div>
      </footer>

    </div>
  );
};