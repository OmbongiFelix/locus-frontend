import { useState, useMemo } from 'react';
import { 
  Play, 
  RotateCw, 
  Send, 
  Key, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  FileCode, 
  Sliders, 
  Terminal, 
  MapPin,
  Layers
} from 'lucide-react';
import JsonSyntaxViewer from './JsonSyntaxViewer';
import CodeBlock from './CodeBlock';
import { KENYA_PRESETS } from '../openapiData';

export default function EndpointPlayground({ 
  endpoint, 
  baseUrl = 'https://locus-xhvj.onrender.com' 
}) {
  // Authentication: Placeholder API Key
  const [apiKey, setApiKey] = useState('""');

  // Query & Path parameter values state: initialized cleanly based on endpoint
  const [paramValues, setParamValues] = useState(() => {
    const initialParams = {};
    if (endpoint?.path === '/v1/geocode/reverse') {
      initialParams['lat'] = -1.286389; // Nairobi Kilimani default
      initialParams['lon'] = 36.817223;
    } else {
      (endpoint?.parameters || []).forEach(p => {
        if (p.in === 'query') {
          if (p.schema?.type === 'number') initialParams[p.name] = 0;
          else initialParams[p.name] = '';
        }
      });
    }
    return initialParams;
  });

  // Request body state: initialized cleanly based on endpoint
  const [requestBodyJson, setRequestBodyJson] = useState(() => {
    if (endpoint?.requestBody) {
      if (endpoint?.path === '/v1/geocode/reverse/batch') {
        const defaultBatch = {
          points: [
            { lat: -1.286389, lon: 36.817223 }, // Nairobi Kilimani
            { lat: -4.043477, lon: 39.668206 }, // Mombasa Island
            { lat: -0.091702, lon: 34.767956 }  // Kisumu Central
          ]
        };
        return JSON.stringify(defaultBatch, null, 2);
      }
      return '{}';
    }
    return '';
  });

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [responseState, setResponseState] = useState(null);
  const [activeTab, setActiveTab] = useState('response'); // 'response' | 'headers' | 'snippets'
  const [activeSnippetTab, setActiveSnippetTab] = useState('curl'); // 'curl' | 'js' | 'python'
  const [useProxy, setUseProxy] = useState(true); // Dev proxy to bypass browser CORS preflight restrictions

  // Construct target URL with query params
  const computedRequestUrl = useMemo(() => {
    if (!endpoint) return '';
    const url = new URL(endpoint.path, baseUrl);
    Object.entries(paramValues).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
    return url.toString();
  }, [endpoint, baseUrl, paramValues]);

  // Generate snippets
  const snippets = useMemo(() => {
    if (!endpoint) return { curl: '', js: '', python: '' };

    const method = endpoint.method;
    const url = computedRequestUrl;
    const hasBody = Boolean(endpoint.requestBody && requestBodyJson);
    const requiresKey = (endpoint.parameters || []).some(
      p => p.in === 'header' && p.name.toLowerCase() === 'x-api-key'
    );

    // 1. cURL
    let curl = `curl -X ${method} "${url}"`;
    if (requiresKey) {
      curl += ` \\\n  -H "X-API-Key: ${apiKey || '""'}"`;
    }
    if (hasBody) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${requestBodyJson.replace(/'/g, "'\\''")}'`;
    }

    // 2. JavaScript (Fetch)
    let js = `// Fetch API (JavaScript)\n`;
    js += `const response = await fetch("${url}", {\n`;
    js += `  method: "${method}",\n`;
    js += `  headers: {\n`;
    if (requiresKey) {
      js += `    "X-API-Key": "${apiKey || '""'}",\n`;
    }
    if (hasBody) {
      js += `    "Content-Type": "application/json",\n`;
    }
    js += `  },\n`;
    if (hasBody) {
      js += `  body: JSON.stringify(${requestBodyJson})\n`;
    }
    js += `});\n\nconst data = await response.json();\nconsole.log(data);`;

    // 3. Python (Requests)
    let py = `# Python Requests\nimport requests\n\nurl = "${url}"\n`;
    py += `headers = {\n`;
    if (requiresKey) {
      py += `    "X-API-Key": "${apiKey || '""'}",\n`;
    }
    if (hasBody) {
      py += `    "Content-Type": "application/json",\n`;
    }
    py += `}\n`;
    if (hasBody) {
      py += `payload = ${requestBodyJson.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}\n`;
      py += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
    } else {
      py += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
    }
    py += `print(response.status_code)\nprint(response.json())`;

    return { curl, js, python: py };
  }, [endpoint, computedRequestUrl, apiKey, requestBodyJson]);

  // Execute API Request
  const handleExecuteRequest = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    setResponseState(null);

    const startTime = performance.now();

    try {
      let fetchUrl = computedRequestUrl;
      if (useProxy) {
        // Route through the Vite dev-proxy (or any reverse-proxy at /api-proxy) to avoid CORS.
        // In production (Render/etc.) ensure the hosting server also proxies /api-proxy → backend.
        const parsed = new URL(computedRequestUrl);
        fetchUrl = `/api-proxy${parsed.pathname}${parsed.search}`;
      }

      const headers = {};
      const requiresKey = (endpoint.parameters || []).some(
        p => p.in === 'header' && p.name.toLowerCase() === 'x-api-key'
      );
      if (requiresKey) {
        headers['X-API-Key'] = apiKey;
      }

      const options = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.requestBody && requestBodyJson) {
        headers['Content-Type'] = 'application/json';
        options.body = requestBodyJson;
      }

      const res = await fetch(fetchUrl, options);
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      const headerEntries = {};
      res.headers.forEach((val, key) => {
        headerEntries[key] = val;
      });

      const rawText = await res.text();
      let parsedJson = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        parsedJson = rawText;
      }

      setResponseState({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Response'),
        timeMs,
        headers: headerEntries,
        data: parsedJson,
        rawText,
        isError: !res.ok,
        url: computedRequestUrl
      });
      setActiveTab('response');
    } catch (err) {
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      const isCorsOrNetwork = err.name === 'TypeError' || err.message?.includes('Failed to fetch');

      setResponseState({
        status: 0,
        statusText: 'Network / CORS Error',
        timeMs,
        headers: {},
        data: {
          error: 'Network request failed',
          message: err.message,
          suggestion: isCorsOrNetwork 
            ? 'The browser blocked this cross-origin request or the Render backend is waking up from sleep. Try enabling the "Dev Proxy" toggle above, or execute via cURL/Python in terminal!'
            : 'Check parameters and ensure backend server is reachable.'
        },
        rawText: err.message,
        isError: true,
        errorType: isCorsOrNetwork ? 'CORS_OR_COLD_START' : 'GENERIC_ERROR',
        url: computedRequestUrl
      });
      setActiveTab('response');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to load Kenyan Preset coordinates
  const handleSelectPreset = (preset) => {
    setParamValues(prev => ({
      ...prev,
      lat: preset.lat,
      lon: preset.lon
    }));
  };

  if (!endpoint) return null;

  const requiresAuth = (endpoint.parameters || []).some(
    p => p.in === 'header' && p.name.toLowerCase() === 'x-api-key'
  );

  const geocodeHit = responseState?.status === 200 && responseState.data && !Array.isArray(responseState.data) && responseState.data.county_name !== undefined ? responseState.data : null;
  const batchGeocodeHits = responseState?.status === 200 && Array.isArray(responseState.data) && responseState.data.length > 0 && responseState.data[0].county_name !== undefined ? responseState.data : null;

  return (
    <div className="glass-panel explorer-sticky">
      {/* Panel Header */}
      <div className="glass-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={16} color="#3b82f6" fill="#3b82f6" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Interactive API Explorer</span>
        </div>
        
        {/* Dev Proxy Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={useProxy} 
              onChange={(e) => setUseProxy(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Use Dev Proxy</span>
          </label>
        </div>
      </div>

      <div className="glass-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* API Key Section */}
        {requiresAuth && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--border-default)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                <Key size={15} color="#60a5fa" />
                <span>API Key Authorization</span>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>
                Header: X-API-Key
              </span>
            </div>

            {/* Required instruction callout */}
            <div className="callout-warning" style={{ fontSize: '0.82rem', padding: '0.65rem 0.85rem' }}>
              <HelpCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>No API key assigned yet.</strong>
                <div style={{ marginTop: '0.2rem', color: '#fef08a' }}>
                  You can enter a placeholder value while exploring the API. Even quotation marks (<code>""</code>) can be used as a placeholder.
                </div>
              </div>
            </div>

            <div className="input-group">
              <input 
                type="text" 
                className="text-input"
                placeholder='e.g. "" or placeholder-key'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ fontSize: '0.84rem' }}
              />
            </div>
          </div>
        )}

        {/* Query Parameters Form */}
        {endpoint.path === '/v1/geocode/reverse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <Sliders size={15} color="#60a5fa" />
                <span>Coordinate Parameters (WGS 84)</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Kenya Boundaries
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">
                  <span>lat (Latitude)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#f87171' }}>*req</span>
                </label>
                <input 
                  type="number"
                  step="any"
                  className="text-input"
                  placeholder="-1.286389"
                  value={paramValues['lat'] !== undefined ? paramValues['lat'] : ''}
                  onChange={(e) => setParamValues(p => ({ ...p, lat: parseFloat(e.target.value) || e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span>lon (Longitude)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#f87171' }}>*req</span>
                </label>
                <input 
                  type="number"
                  step="any"
                  className="text-input"
                  placeholder="36.817223"
                  value={paramValues['lon'] !== undefined ? paramValues['lon'] : ''}
                  onChange={(e) => setParamValues(p => ({ ...p, lon: parseFloat(e.target.value) || e.target.value }))}
                />
              </div>
            </div>

            {/* Quick Kenyan Location Presets */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} color="#10b981" />
                <span>Quick Kenyan Presets:</span>
              </div>
              <div className="preset-grid">
                {KENYA_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    className="preset-chip"
                    onClick={() => handleSelectPreset(preset)}
                    type="button"
                  >
                    <span className="preset-chip-title">{preset.name.split(' — ')[1] || preset.name}</span>
                    <span className="preset-chip-coords">{preset.lat}, {preset.lon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Batch Request Body (for /v1/geocode/reverse/batch) */}
        {endpoint.path === '/v1/geocode/reverse/batch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <FileCode size={15} color="#38bdf8" />
                <span>Request Body (JSON)</span>
              </div>
              <button
                className="btn-pill"
                type="button"
                onClick={() => {
                  const defaultBatch = {
                    points: [
                      { lat: -1.286389, lon: 36.817223 },
                      { lat: -4.043477, lon: 39.668206 },
                      { lat: -0.091702, lon: 34.767956 }
                    ]
                  };
                  setRequestBodyJson(JSON.stringify(defaultBatch, null, 2));
                }}
              >
                Reset Sample Batch
              </button>
            </div>

            <textarea 
              className="text-input text-area"
              value={requestBodyJson}
              onChange={(e) => setRequestBodyJson(e.target.value)}
              placeholder='{\n  "points": [\n    {"lat": -1.286, "lon": 36.817}\n  ]\n}'
              style={{ minHeight: '140px' }}
            />
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            className="btn-primary"
            onClick={handleExecuteRequest}
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {isLoading ? (
              <>
                <RotateCw size={17} className="animate-spin" />
                <span>Sending Request to Render...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Execute Request</span>
              </>
            )}
          </button>
        </div>

        {/* URL Target Preview */}
        <div style={{ 
          background: 'var(--bg-code)', 
          padding: '0.5rem 0.75rem', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          wordBreak: 'break-all'
        }}>
          <strong style={{ color: endpoint.method === 'GET' ? '#34d399' : '#60a5fa' }}>{endpoint.method}</strong> {computedRequestUrl}
        </div>

        {/* Code Snippets & Response Tabs */}
        <div>
          <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              className={`btn-pill ${activeTab === 'response' ? 'active' : ''}`}
              onClick={() => setActiveTab('response')}
            >
              Response {responseState ? `(${responseState.status || 'ERR'})` : ''}
            </button>
            <button
              className={`btn-pill ${activeTab === 'snippets' ? 'active' : ''}`}
              onClick={() => setActiveTab('snippets')}
            >
              Client Snippets
            </button>
            {responseState?.headers && Object.keys(responseState.headers).length > 0 && (
              <button
                className={`btn-pill ${activeTab === 'headers' ? 'active' : ''}`}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
            )}
          </div>

          {/* Snippets Tab */}
          {activeTab === 'snippets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'gap', gap: '0.3rem' }}>
                <button
                  className={`btn-pill ${activeSnippetTab === 'curl' ? 'active' : ''}`}
                  onClick={() => setActiveSnippetTab('curl')}
                >
                  cURL
                </button>
                <button
                  className={`btn-pill ${activeSnippetTab === 'js' ? 'active' : ''}`}
                  onClick={() => setActiveSnippetTab('js')}
                >
                  JavaScript
                </button>
                <button
                  className={`btn-pill ${activeSnippetTab === 'python' ? 'active' : ''}`}
                  onClick={() => setActiveSnippetTab('python')}
                >
                  Python
                </button>
              </div>

              <CodeBlock 
                code={snippets[activeSnippetTab]} 
                language={activeSnippetTab === 'curl' ? 'bash' : activeSnippetTab === 'js' ? 'javascript' : 'python'}
                title={`${activeSnippetTab.toUpperCase()} Snippet`}
                maxHeight="250px"
              />
            </div>
          )}

          {/* Headers Tab */}
          {activeTab === 'headers' && responseState?.headers && (
            <div className="glass-panel" style={{ background: 'var(--bg-code)', padding: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                {Object.entries(responseState.headers).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#93c5fd' }}>{k}:</span>
                    <span style={{ color: '#cbd5e1' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Tab */}
          {activeTab === 'response' && (
            <div>
              {!responseState && !isLoading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2.5rem 1rem', 
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <Terminal size={28} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                  <div>Click <strong>Execute Request</strong> to query the live Locus API.</div>
                </div>
              )}

              {isLoading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2.5rem 1rem', 
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-code)'
                }}>
                  <RotateCw size={24} className="animate-spin" style={{ margin: '0 auto 0.65rem auto', color: '#3b82f6' }} />
                  <div style={{ fontWeight: 600 }}>Executing request against Render backend...</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    If the free Render instance was sleeping, initial spin-up may take 20–40 seconds.
                  </div>
                </div>
              )}

              {responseState && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Status Bar */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`status-pill ${
                        responseState.status >= 200 && responseState.status < 300 
                          ? 'status-2xx' 
                          : responseState.status >= 400 && responseState.status < 500 
                          ? 'status-4xx' 
                          : 'status-5xx'
                      }`}>
                        {responseState.status > 0 ? `${responseState.status} ${responseState.statusText}` : 'Error'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} />
                        <span>{responseState.timeMs} ms</span>
                      </div>
                      <span>•</span>
                      <span>{new Blob([responseState.rawText || '']).size} bytes</span>
                    </div>
                  </div>

                  {/* Geospatial Result Visualizer (Single Hit) */}
                  {geocodeHit && (
                    <div className="location-result-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600, fontSize: '0.88rem' }}>
                          <CheckCircle2 size={16} />
                          <span>Kenyan Boundary Match</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '9999px',
                          background: geocodeHit.match_type === 'exact' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: geocodeHit.match_type === 'exact' ? '#34d399' : '#fbbf24',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {geocodeHit.match_type} match
                        </span>
                      </div>

                      <div className="location-grid">
                        <div className="location-item">
                          <span className="location-item-label">County</span>
                          <span className="location-item-value">{geocodeHit.county_name || 'N/A'}</span>
                        </div>
                        <div className="location-item">
                          <span className="location-item-label">Ward</span>
                          <span className="location-item-value">{geocodeHit.ward_name || 'N/A'}</span>
                        </div>
                        <div className="location-item">
                          <span className="location-item-label">Sub-County</span>
                          <span className="location-item-value">{geocodeHit.sub_county_name || 'N/A'}</span>
                        </div>
                        <div className="location-item">
                          <span className="location-item-label">Constituency</span>
                          <span className="location-item-value">{geocodeHit.constituency || 'N/A'}</span>
                        </div>
                        <div className="location-item">
                          <span className="location-item-label">Distance</span>
                          <span className="location-item-value">{geocodeHit.distance_m} m</span>
                        </div>
                        <div className="location-item">
                          <span className="location-item-label">Dataset Version</span>
                          <span className="location-item-value" style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                            {geocodeHit.boundary_version}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Batch Hits Summary */}
                  {batchGeocodeHits && (
                    <div className="location-result-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600 }}>
                          <Layers size={16} />
                          <span>Batch Matches ({batchGeocodeHits.length} points)</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {batchGeocodeHits.map((hit, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '0.4rem 0.6rem', 
                            borderRadius: '4px',
                            fontSize: '0.82rem'
                          }}>
                            <span>Point {idx + 1}: <strong>{hit.county_name}</strong> ({hit.ward_name})</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94a3b8' }}>
                              {hit.match_type} • {hit.distance_m}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Syntax Highlighted JSON Response */}
                  <JsonSyntaxViewer 
                    data={responseState.data} 
                    title={`Response Body (${responseState.status})`} 
                    maxHeight="320px"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
