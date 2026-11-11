import React, { useState } from 'react';
import { Creator, setActiveCreator, API_BASE } from '../api';
import { ArrowRight, Lock, Mail, Building, User } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (creator: Creator, token: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
      const body = isRegister
        ? { name, email, password, studio_name: studioName, currency: 'USD' }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type');
      let data: any;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      setActiveCreator(data.creator);
      localStorage.setItem('settle_auth_token', data.token);
      onLoginSuccess(data.creator, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (creatorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      setActiveCreator(data.creator);
      localStorage.setItem('settle_auth_token', data.token);
      onLoginSuccess(data.creator, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', padding: '1.5rem' }}>
      <div style={{ maxWidth: '460px', width: '100%' }}>
        
        {/* Logo & Headline */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ff5c00', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', boxShadow: '0 4px 16px rgba(255,92,0,0.3)', marginBottom: '1rem' }}>
            S.
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Create Creator Studio' : 'Sign in to Settle'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            Multi-tenant commercial ledger for freelance video editors & creators
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="card-white" style={{ padding: '2.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-clean"
                      style={{ paddingLeft: '2rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Studio or Brand Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="Apex Cut Creative Studio"
                      value={studioName}
                      onChange={e => setStudioName(e.target.value)}
                      className="input-clean"
                      style={{ paddingLeft: '2rem' }}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="email"
                  placeholder="alex@apexcut.studio"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-clean"
                  style={{ paddingLeft: '2rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-clean"
                  style={{ paddingLeft: '2rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-orange"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Studio Account' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              style={{ background: 'none', border: 'none', color: '#ff5c00', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>OR 1-CLICK DEMO LOGIN</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* 1-Click Demo Buttons for Volopay Reviewers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('cr_alex_rivera')}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ff5c00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                A
              </div>
              <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Alex Rivera</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Apex Cut Creative Studio (USD)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('cr_elena_vance')}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#64748b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                E
              </div>
              <div style={{ textAlign: 'left', marginLeft: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Elena Vance</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Vance Motion Works (USD)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Volopay Tech Assignment • Zero AI Inside • Claude MCP Connected
        </div>

      </div>
    </div>
  );
};
