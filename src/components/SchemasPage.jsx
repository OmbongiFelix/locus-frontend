import { useState } from 'react';
import { Code2, Search, Box } from 'lucide-react';
import SchemaViewer from './SchemaViewer';

export default function SchemasPage({ schemas, selectedSchema, onSelectSchema }) {
  const [search, setSearch] = useState('');

  const schemaEntries = Object.entries(schemas || {});
  const filtered = schemaEntries.filter(([name]) => 
    !search || name.toLowerCase().includes(search.toLowerCase())
  );

  const activeName = selectedSchema || schemaEntries[0]?.[0];
  const activeSchema = schemas?.[activeName];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          OpenAPI Data Schemas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Core data models, validation structures, and payload contracts parsed directly from <code>openapi.json</code>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Schema Selector List */}
        <div className="glass-panel" style={{ padding: '0.75rem' }}>
          <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="text-input"
              placeholder="Search schemas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.78rem', paddingLeft: '1.8rem', height: '32px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {filtered.map(([name]) => {
              const isSelected = activeName === name;
              return (
                <button
                  key={name}
                  className={`sidebar-nav-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectSchema(name)}
                  style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                >
                  <Box size={14} color={isSelected ? '#60a5fa' : '#94a3b8'} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Schema Details */}
        <div className="glass-panel">
          <div className="glass-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={18} color="#60a5fa" />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {activeName}
              </span>
            </div>
            {activeSchema?.type && (
              <span className="param-required" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                type: {activeSchema.type}
              </span>
            )}
          </div>

          <div className="glass-panel-body">
            {activeSchema ? (
              <SchemaViewer schema={activeSchema} schemaName={activeName} />
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Select a schema to view structure</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
