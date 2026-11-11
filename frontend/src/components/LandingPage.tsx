import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import gsap from 'gsap';

interface LandingPageProps {
  onGoToApp: () => void;
  onViewDemoProposal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp, onViewDemoProposal }) => {
  const [targetRevenue, setTargetRevenue] = useState(15000);
  const [avgProjectSize, setAvgProjectSize] = useState(3000);
  const heroRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  const projectsNeeded = Math.ceil(targetRevenue / avgProjectSize);
  const depositUnlocked = Math.round(targetRevenue * 0.5);
  const currentPaced = 11400; // Sample current revenue pace
  const targetAchievedPct = Math.min(100, Math.round((currentPaced / targetRevenue) * 100));

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Navigation Bar */}
      <header style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb', zIndex: 50, padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 2px 10px rgba(255,92,0,0.3)' }}>
              S.
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Settle</span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: '#fff5f0', color: '#ff5c00', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(255,92,0,0.2)' }}>
                Zero AI Inside
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={onViewDemoProposal} className="btn-ghost" style={{ fontSize: '0.88rem' }}>
              View Live Client Proposal
            </button>
            <button onClick={onGoToApp} className="btn-orange" style={{ fontSize: '0.88rem' }}>
              Open Creator Studio
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} style={{ maxWidth: '1080px', margin: '4rem auto 3rem', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff5f0', border: '1px solid rgba(255,92,0,0.25)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, color: '#ff5c00', marginBottom: '1.5rem' }}>
          <Zap size={14} />
          Built for Commercial Video Editors & Creative Freelancers
        </div>

        <h1 style={{ fontSize: '3.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', marginBottom: '1.25rem' }}>
          Turn Messy Client Chats Into <span style={{ color: '#ff5c00' }}>Cleared Bank Deposits</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Settle is an autonomous proposal and invoicing operating system running on your own Claude plan via MCP. 
          Settle contains <strong>zero AI</strong>—it acts as your headless contract ledger, client checkout page, and Stripe payment rail.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onGoToApp} className="btn-orange" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Launch Creator Studio
            <ArrowRight size={18} />
          </button>
          <button onClick={onViewDemoProposal} className="btn-ghost" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Preview Interactive Proposal
          </button>
        </div>
      </section>

      {/* Interactive Target & Sales Simulator Section */}
      <section ref={calcRef} style={{ maxWidth: '1140px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="card-white" style={{ padding: '2.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#ff5c00' }}>
              Interactive Target Planner
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
              Set Your Monthly Goal & Simulate Milestone Velocity
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              See how 50% upfront deposits eliminate cashflow drought and accelerate project close rates.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem', alignItems: 'center' }}>
            
            {/* Sliders Control Panel */}
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Monthly Revenue Target</label>
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
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Average Project Scope</label>
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
                  <span>$10,000 (Hero Campaign)</span>
                </div>
              </div>

              {/* Dynamic Calculation Output */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Deals to Close</div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                    {projectsNeeded} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>scopes</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Upfront Cash Locked</div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ff5c00' }}>
                    ${depositUnlocked.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts & Semicircle Target Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Semicircle Target Achievement Arc Gauge */}
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Target Pacing Simulator</span>
                  <span className="badge-status badge-orange">{targetAchievedPct}% Achieved</span>
                </div>

                <div style={{ position: 'relative', width: '220px', height: '110px', margin: '1.5rem auto 0.5rem', overflow: 'hidden' }}>
                  <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-180deg)' }}>
                    <circle
                      cx="110"
                      cy="110"
                      r="90"
                      fill="none"
                      stroke="#f1f3f7"
                      strokeWidth="20"
                    />
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
                      Current Cleared Pace
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div>Goal: <strong style={{ color: '#0f172a' }}>${targetRevenue.toLocaleString()}</strong></div>
                  <div>Gap Remaining: <strong style={{ color: '#ff5c00' }}>${Math.max(0, targetRevenue - currentPaced).toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Deposit vs Final Milestone Donut Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>50% Upfront Deposit</div>
                  <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff5c00', marginTop: '0.2rem' }}>
                    50.0%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Cleared before frame 1 renders</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Final Cut Release</div>
                  <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    50.0%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Cleared upon ProRes master approval</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* How It Works with Claude */}
      <section style={{ maxWidth: '1080px', margin: '5rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#ff5c00' }}>
            Zero Friction Workflow
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
            How Settle Replaces Bloated CRMs with Claude
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
          
          <div className="card-white" style={{ padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff5f0', color: '#ff5c00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Talk in Claude Desktop
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Paste your client's messy email into Claude on your personal subscription. Claude writes the scope and calls Settle via MCP.
            </p>
          </div>

          <div className="card-white" style={{ padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff5f0', color: '#ff5c00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Settle Hosts the Agreement
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A live public URL appears instantly. Revision boundaries (2 rounds max) and turnaround terms are legally locked in.
            </p>
          </div>

          <div className="card-white" style={{ padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff5f0', color: '#ff5c00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Client Settles via Stripe
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              The client clicks "Accept & Pay Deposit" on mobile or desktop. Funds hit your bank and Settle issues an official receipt.
            </p>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Ready to Automate Your Freelance Cashflow?
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={onGoToApp} className="btn-orange" style={{ padding: '0.85rem 1.75rem' }}>
            Open Creator Studio
            <ArrowRight size={16} />
          </button>
        </div>
        <div style={{ marginTop: '2.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
          Settle • Volopay Product & Tech Assignment • Zero AI Inside • Claude MCP Native
        </div>
      </footer>

    </div>
  );
};
