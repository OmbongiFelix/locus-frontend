import { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Menu, 
  X, 
  Server
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  baseUrl = 'https://locus-xhvj.onrender.com'
}) {
  const [healthStatus, setHealthStatus] = useState('checking'); // 'online' | 'degraded' | 'checking' | 'offline'

  // Check health of backend on mount and every 45s
  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const targetUrl = window.location.hostname === 'localhost' 
          ? '/api-proxy/v1/health' 
          : `${baseUrl}/v1/health`;
        
        const response = await fetch(targetUrl, { signal: AbortSignal.timeout(10000) });
        if (response.ok) {
          if (isMounted) setHealthStatus('online');
        } else if (response.status === 503) {
          if (isMounted) setHealthStatus('degraded');
        } else {
          if (isMounted) setHealthStatus('offline');
        }
      } catch {
        if (isMounted) {
          setHealthStatus('standby');
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [baseUrl]);

  return (
    <header className="portal-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button 
          className="btn-secondary" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', padding: '0.4rem', border: 'none' }}
          id="mobile-nav-toggle"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('overview')}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(16, 185, 129, 0.35)'
          }}>
            <Compass size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
                Locus
              </span>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '0.12rem 0.45rem', 
                borderRadius: '4px', 
                background: 'rgba(59, 130, 246, 0.15)', 
                color: '#93c5fd',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)'
              }}>
                v0.1.0
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.1 }}>
              Kenyan Reverse-Geocoding Service
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Fast Search Bar */}
      <div style={{ flex: '1', maxWidth: '420px', position: 'relative' }}>
        <Search 
          size={16} 
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
        />
        <input 
          type="text"
          placeholder="Filter endpoints, schemas, or models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-input"
          style={{ paddingLeft: '2.2rem', paddingRight: '0.8rem', fontSize: '0.82rem', height: '36px' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ 
              position: 'absolute', 
              right: '0.6rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)',
              cursor: 'pointer' 
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Right Controls: Health Badge & Target Server */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Backend Target pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.3rem 0.65rem',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)'
        }}>
          <Server size={13} color="#94a3b8" />
          <span style={{ color: '#cbd5e1' }}>locus-xhvj.onrender.com</span>
        </div>

        {/* Live Health Indicator */}
        <div 
          title="Backend API status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'default',
            border: healthStatus === 'online'
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : healthStatus === 'degraded'
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : '1px solid var(--border-subtle)',
            background: healthStatus === 'online'
              ? 'rgba(16, 185, 129, 0.12)'
              : healthStatus === 'degraded'
              ? 'rgba(245, 158, 11, 0.12)'
              : 'rgba(255, 255, 255, 0.04)',
            color: healthStatus === 'online' ? '#34d399' : healthStatus === 'degraded' ? '#fbbf24' : '#94a3b8'
          }}
        >
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: healthStatus === 'online' ? '#10b981' : healthStatus === 'degraded' ? '#f59e0b' : '#64748b',
            boxShadow: healthStatus === 'online' ? '0 0 8px #10b981' : 'none'
          }} />
          <span>
            {healthStatus === 'online' && 'API Online'}
            {healthStatus === 'degraded' && 'Cache Standby'}
            {healthStatus === 'checking' && 'Pinging...'}
            {healthStatus === 'standby' && 'Ready / Standby'}
            {healthStatus === 'offline' && 'Offline'}
          </span>
        </div>

        {/* Quick Tabs: Overview / Docs / Schemas */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-surface-elevated)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            className={`btn-pill ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`btn-pill ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            Endpoints
          </button>
          <button 
            className={`btn-pill ${activeTab === 'schemas' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemas')}
          >
            Schemas
          </button>
        </div>
      </div>
    </header>
  );
}
