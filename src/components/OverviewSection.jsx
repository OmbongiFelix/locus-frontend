import { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Database, 
  KeyRound, 
  ArrowRight, 
  Zap
} from 'lucide-react';
import CodeBlock from './CodeBlock';
import JsonSyntaxViewer from './JsonSyntaxViewer';

export default function OverviewSection({ onExploreEndpoint, endpoints = [] }) {
  const [quickTestResult, setQuickTestResult] = useState(null);
  const [quickTestLoading, setQuickTestLoading] = useState(false);

  const reverseEndpoint = endpoints.find(e => e.path === '/v1/geocode/reverse');
  const batchEndpoint = endpoints.find(e => e.path === '/v1/geocode/reverse/batch');

  const handleRunQuickTest = async () => {
    setQuickTestLoading(true);
    setQuickTestResult(null);
    try {
      const url = window.location.hostname === 'localhost'
        ? '/api-proxy/v1/geocode/reverse?lat=-1.286389&lon=36.817223'
        : 'https://locus-xhvj.onrender.com/v1/geocode/reverse?lat=-1.286389&lon=36.817223';
      
      const res = await fetch(url, {
        headers: { 'X-API-Key': '""' }
      });
      const data = await res.json();
      setQuickTestResult({ status: res.status, data });
    } catch (e) {
      setQuickTestResult({ status: 0, data: { error: e.message } });
    } finally {
      setQuickTestLoading(false);
    }
  };

  const curlExample = `curl -X GET "https://locus-xhvj.onrender.com/v1/geocode/reverse?lat=-1.286389&lon=36.817223" \\
  -H "X-API-Key: \\"\\""`;

  const pythonExample = `import requests

url = "https://locus-xhvj.onrender.com/v1/geocode/reverse"
params = {"lat": -1.286389, "lon": 36.817223}
headers = {"X-API-Key": '""'}

response = requests.get(url, params=params, headers=headers)
print(response.json())
# Output: {'county_name': 'Nairobi', 'ward_name': 'Kilimani', ...}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1000px' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
          <Compass size={14} />
          <span>Kenyan Reverse-Geocoding Service • PostGIS + GADM 4.1</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem', color: '#fff' }}>
          Spatial Intelligence for Kenyan Administrative Boundaries
        </h1>

        <p style={{ fontSize: '1.08rem', color: '#cbd5e1', maxWidth: '750px', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Locus translates geographic coordinates (WGS 84 latitude & longitude) into exact Kenyan administrative hierarchies—identifying <strong>County, Sub-County, Constituency, and Ward</strong> with millimeter spatial precision backed by PostGIS.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          {reverseEndpoint && (
            <button 
              className="btn-primary"
              onClick={() => onExploreEndpoint(reverseEndpoint)}
            >
              <span>Explore Reverse Geocode</span>
              <ArrowRight size={16} />
            </button>
          )}
          {batchEndpoint && (
            <button 
              className="btn-secondary"
              onClick={() => onExploreEndpoint(batchEndpoint)}
            >
              <span>Batch Geocoding API</span>
            </button>
          )}
        </div>
      </div>

      {/* Authentication Note Card */}
      <div className="callout-info" style={{ padding: '1.25rem' }}>
        <KeyRound size={22} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            API Key & Authentication Policy
          </div>
          <div style={{ color: '#bfdbfe', fontSize: '0.92rem', lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 0.4rem 0' }}>
              Endpoints requiring authentication enforce an <code>X-API-Key</code> request header.
            </p>
            <p style={{ margin: 0, background: 'rgba(0,0,0,0.2)', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid #60a5fa' }}>
              <strong>No API key assigned yet.</strong> You can enter a placeholder value while exploring the API. Even quotation marks (<code>""</code>) can be used as a placeholder.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <MapPin size={20} color="#60a5fa" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
            Single-Point Geocoding
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Query any point within Kenya (lat: -4.7 to 5.5, lon: 33.9 to 41.9) and receive instant administrative boundary resolution with match type classification.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <Layers size={20} color="#34d399" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
            Batch Coordinate Stream
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Submit an array of coordinate pairs via POST. Ideal for logistical dispatch, delivery routing, and fleet telematics across Kenya.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <Database size={20} color="#c084fc" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
            PostGIS Indexing & Versioning
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Backed by spatial GIST indexes and verifiable boundary dataset versions (e.g. <code>gadm41-ken-2022</code>) ensuring deterministic outputs.
          </p>
        </div>
      </div>

      {/* Interactive Quick Try Card */}
      <div className="glass-panel">
        <div className="glass-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Zap size={16} color="#fbbf24" />
            <span>Live Quick Test: Nairobi Kilimani (-1.286389, 36.817223)</span>
          </div>
          <button
            className="btn-primary"
            onClick={handleRunQuickTest}
            disabled={quickTestLoading}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
          >
            {quickTestLoading ? 'Querying...' : 'Test Live Endpoint'}
          </button>
        </div>
        <div className="glass-panel-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
            Click the button above to execute a live request against <code>https://locus-xhvj.onrender.com/v1/geocode/reverse</code> using placeholder credentials.
          </p>

          {quickTestResult && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className={`status-pill ${quickTestResult.status === 200 ? 'status-2xx' : 'status-5xx'}`}>
                  HTTP {quickTestResult.status}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {quickTestResult.status === 200 ? 'Successful response from Locus API' : 'Service response'}
                </span>
              </div>
              <JsonSyntaxViewer data={quickTestResult.data} title="Live Response Data" maxHeight="240px" />
            </div>
          )}
        </div>
      </div>

      {/* Quickstart Code Snippets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Quickstart Request Examples
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              cURL CLI
            </div>
            <CodeBlock code={curlExample} language="bash" title="cURL" maxHeight="200px" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Python Requests
            </div>
            <CodeBlock code={pythonExample} language="python" title="Python 3" maxHeight="200px" />
          </div>
        </div>
      </div>
    </div>
  );
}
