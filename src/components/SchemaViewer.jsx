import { useState } from 'react';
import { resolveRef, generateSampleFromSchema } from '../openapiData';
import JsonSyntaxViewer from './JsonSyntaxViewer';

/**
 * Formats property type display (e.g. string | null, number, enum)
 */
function formatPropertyType(prop) {
  if (!prop) return 'any';
  if (prop.$ref) {
    const name = prop.$ref.split('/').pop();
    return name;
  }
  if (prop.anyOf) {
    const types = prop.anyOf.map(t => {
      if (t.$ref) return t.$ref.split('/').pop();
      return t.type;
    });
    return types.join(' | ');
  }
  if (prop.type === 'array') {
    if (prop.items?.$ref) {
      return `${prop.items.$ref.split('/').pop()}[]`;
    }
    return `${prop.items?.type || 'any'}[]`;
  }
  if (prop.enum) {
    return prop.enum.map(e => `"${e}"`).join(' | ');
  }
  return prop.type || 'object';
}

export default function SchemaViewer({ schema, schemaName }) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'json'

  const resolved = schema?.$ref ? resolveRef(schema.$ref) : schema;
  if (!resolved) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No schema available</div>;
  }

  const sampleJson = generateSampleFromSchema(resolved);

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {/* Switch between Schema Details and Example JSON */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setViewMode('tree')}
            className={`btn-pill ${viewMode === 'tree' ? 'active' : ''}`}
          >
            Schema Fields
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`btn-pill ${viewMode === 'json' ? 'active' : ''}`}
          >
            Example JSON
          </button>
        </div>
        {schemaName && (
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>
            {schemaName}
          </span>
        )}
      </div>

      {viewMode === 'json' ? (
        <JsonSyntaxViewer data={sampleJson} title="Sample JSON Schema Output" maxHeight="320px" />
      ) : (
        <div style={{ 
          background: 'var(--bg-code)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.75rem',
          fontSize: '0.85rem'
        }}>
          {resolved.description && (
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
              {resolved.description}
            </div>
          )}

          {resolved.properties ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(resolved.properties).map(([key, prop]) => {
                const isRequired = resolved.required?.includes(key);
                const typeStr = formatPropertyType(prop);
                
                let note = prop.description || '';
                if (prop.minimum !== undefined && prop.maximum !== undefined) {
                  note = `${note ? note + ' ' : ''}[${prop.minimum} to ${prop.maximum}]`;
                }

                return (
                  <div 
                    key={key} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.2rem',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.015)',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="param-name">{key}</span>
                      <span className="param-type">{typeStr}</span>
                      {isRequired ? (
                        <span className="param-required">required</span>
                      ) : (
                        <span className="param-optional">optional</span>
                      )}
                    </div>
                    {note && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : resolved.type === 'array' ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Array of <code>{formatPropertyType(resolved.items)}</code>
              {resolved.items && (
                <div style={{ marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-default)' }}>
                  <SchemaViewer schema={resolved.items} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>
              Type: <code>{resolved.type}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
