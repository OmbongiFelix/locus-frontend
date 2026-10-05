import { useState } from 'react';
import { 
  Copy, 
  Check, 
  KeyRound, 
  Sliders, 
  FileCode, 
  CheckCircle
} from 'lucide-react';
import SchemaViewer from './SchemaViewer';

export default function EndpointDoc({ 
  endpoint, 
  baseUrl = 'https://locus-xhvj.onrender.com' 
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeResponseTab, setActiveResponseTab] = useState('200');

  if (!endpoint) return null;

  const fullUrl = `${baseUrl}${endpoint.path}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Check if endpoint requires API key header
  const authHeader = endpoint.parameters?.find(
    p => p.in === 'header' && p.name.toLowerCase() === 'x-api-key'
  );

  // Group parameters by in (query vs header)
  const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
  const headerParams = endpoint.parameters?.filter(p => p.in === 'header') || [];

  // Request Body Schema
  const requestBodySchema = endpoint.requestBody?.content?.['application/json']?.schema;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Endpoint Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className={`method-badge ${endpoint.method}`} style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}>
            {endpoint.method}
          </span>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: '#fff',
            letterSpacing: '-0.01em'
          }}>
            {endpoint.path}
          </span>
          <button
            className="btn-secondary"
            onClick={handleCopyUrl}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', marginLeft: 'auto' }}
            title="Copy full endpoint URL"
          >
            {copiedUrl ? (
              <>
                <Check size={13} color="#34d399" />
                <span style={{ color: '#34d399' }}>Copied URL</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {endpoint.summary}
        </h1>

        {endpoint.description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
            {endpoint.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Operation ID: <code style={{ color: '#93c5fd' }}>{endpoint.operationId}</code></span>
          <span>•</span>
          <span>Category: <strong style={{ color: '#e2e8f0' }}>{endpoint.category}</strong></span>
        </div>
      </div>

      {/* Authentication Notice if required */}
      {authHeader && (
        <div className="callout-info">
          <KeyRound size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ fontWeight: 600, color: '#fff' }}>
              Authentication: Header <code style={{ color: '#93c5fd' }}>X-API-Key</code> Required
            </div>
            <div style={{ color: '#bfdbfe', fontSize: '0.85rem' }}>
              <strong>No API key assigned yet.</strong> You can enter a placeholder value while exploring the API. Even quotation marks (<code>""</code>) or arbitrary text can be used as a placeholder during testing.
            </div>
          </div>
        </div>
      )}

      {/* Query / Path Parameters */}
      {queryParams.length > 0 && (
        <div className="glass-panel">
          <div className="glass-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Sliders size={16} color="#60a5fa" />
              <span>Query Parameters ({queryParams.length})</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>In</th>
                  <th>Requirement</th>
                  <th>Constraints & Description</th>
                </tr>
              </thead>
              <tbody>
                {queryParams.map((param) => {
                  const schema = param.schema || {};
                  let constraints = [];
                  if (schema.minimum !== undefined) constraints.push(`min: ${schema.minimum}`);
                  if (schema.maximum !== undefined) constraints.push(`max: ${schema.maximum}`);

                  return (
                    <tr key={param.name}>
                      <td>
                        <span className="param-name">{param.name}</span>
                      </td>
                      <td>
                        <span className="param-type">{schema.type || 'string'}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {param.in}
                        </span>
                      </td>
                      <td>
                        {param.required ? (
                          <span className="param-required">required</span>
                        ) : (
                          <span className="param-optional">optional</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {param.description || schema.title || ''}
                        {constraints.length > 0 && (
                          <div style={{ marginTop: '0.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#93c5fd' }}>
                            [{constraints.join(', ')}]
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Header Parameters */}
      {headerParams.length > 0 && (
        <div className="glass-panel">
          <div className="glass-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <KeyRound size={16} color="#34d399" />
              <span>Header Parameters ({headerParams.length})</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Type</th>
                  <th>Requirement</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {headerParams.map((param) => (
                  <tr key={param.name}>
                    <td>
                      <span className="param-name">{param.name}</span>
                    </td>
                    <td>
                      <span className="param-type">{param.schema?.type || 'string'}</span>
                    </td>
                    <td>
                      {param.required ? (
                        <span className="param-required">required</span>
                      ) : (
                        <span className="param-optional">optional</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {param.name.toLowerCase() === 'x-api-key' ? (
                        <span>API Access token for authentication. Placeholder values accepted during preview.</span>
                      ) : (
                        param.description || 'Request header'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Body (for batch POST) */}
      {requestBodySchema && (
        <div className="glass-panel">
          <div className="glass-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <FileCode size={16} color="#38bdf8" />
              <span>Request Body Schema</span>
              <span className="param-required">application/json</span>
            </div>
          </div>
          <div className="glass-panel-body">
            {endpoint.requestBody?.description && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                {endpoint.requestBody.description}
              </p>
            )}
            <SchemaViewer schema={requestBodySchema} />
          </div>
        </div>
      )}

      {/* Responses */}
      <div className="glass-panel">
        <div className="glass-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <CheckCircle size={16} color="#34d399" />
            <span>Response Definitions</span>
          </div>
          {/* Status code tabs */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {Object.keys(endpoint.responses || {}).map((code) => {
              const is2xx = code.startsWith('2');
              const is4xx = code.startsWith('4');
              return (
                <button
                  key={code}
                  onClick={() => setActiveResponseTab(code)}
                  className={`btn-pill ${activeResponseTab === code ? 'active' : ''}`}
                  style={{
                    color: is2xx ? '#34d399' : is4xx ? '#fbbf24' : '#f87171',
                    borderColor: activeResponseTab === code ? (is2xx ? '#10b981' : '#f59e0b') : 'transparent'
                  }}
                >
                  {code} {code === '200' ? 'Success' : code === '422' ? 'Validation Error' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel-body">
          {(() => {
            const respObj = endpoint.responses?.[activeResponseTab];
            if (!respObj) return <div style={{ color: 'var(--text-muted)' }}>Select a response code</div>;

            const contentSchema = respObj.content?.['application/json']?.schema;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className={`status-pill ${activeResponseTab.startsWith('2') ? 'status-2xx' : 'status-4xx'}`}>
                    HTTP {activeResponseTab}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {respObj.description || 'Response'}
                  </span>
                </div>

                {contentSchema && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                      Response Body (application/json)
                    </div>
                    <SchemaViewer schema={contentSchema} />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
