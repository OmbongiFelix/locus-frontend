import { useState } from 'react';
import { 
  Code2, 
  BookOpen, 
  Globe2 
} from 'lucide-react';

export default function Sidebar({
  endpoints,
  selectedEndpoint,
  onSelectEndpoint,
  schemas,
  selectedSchema,
  onSelectSchema,
  activeTab,
  setActiveTab,
  searchQuery,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Filter endpoints by search query and method
  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesMethod;
    const matchesSearch = 
      ep.path.toLowerCase().includes(q) || 
      ep.summary.toLowerCase().includes(q) || 
      ep.description.toLowerCase().includes(q) ||
      ep.category.toLowerCase().includes(q);
    return matchesMethod && matchesSearch;
  });

  // Group by category
  const categories = ['Reverse Geocoding', 'Boundaries', 'System & Health'];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = filteredEndpoints.filter(ep => ep.category === cat);
    return acc;
  }, {});

  const schemaKeys = Object.keys(schemas || {}).filter(key => {
    if (!searchQuery) return true;
    return key.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectEndpoint = (ep) => {
    onSelectEndpoint(ep);
    setActiveTab('explorer');
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleSelectSchema = (schemaKey) => {
    onSelectSchema(schemaKey);
    setActiveTab('schemas');
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="portal-sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <aside className={`portal-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Method Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Filter Methods
          </span>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {['ALL', 'GET', 'POST'].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`btn-pill ${methodFilter === m ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Getting Started / Overview */}
        <div className="sidebar-category">
          <div className="sidebar-heading">Getting Started</div>
          <button 
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); if (setMobileMenuOpen) setMobileMenuOpen(false); }}
          >
            <BookOpen size={16} color="#60a5fa" />
            <span>Overview & Quickstart</span>
          </button>
        </div>

        {/* Categorized Endpoints */}
        {categories.map((category) => {
          const items = grouped[category] || [];
          if (items.length === 0) return null;

          return (
            <div key={category} className="sidebar-category">
              <div className="sidebar-heading">
                {category} ({items.length})
              </div>
              {items.map((ep) => {
                const isSelected = activeTab === 'explorer' && selectedEndpoint?.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    className={`sidebar-nav-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectEndpoint(ep)}
                  >
                    <span className={`method-badge ${ep.method}`}>
                      {ep.method}
                    </span>
                    <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem'
                    }} title={ep.path}>
                      {ep.path}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Schemas reference section */}
        <div className="sidebar-category">
          <div className="sidebar-heading">
            Data Schemas ({schemaKeys.length})
          </div>
          {schemaKeys.map((name) => {
            const isSelected = activeTab === 'schemas' && selectedSchema === name;
            return (
              <button
                key={name}
                className={`sidebar-nav-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectSchema(name)}
                style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              >
                <Code2 size={14} color="#94a3b8" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Kenyan PostGIS Footer Note */}
        <div style={{
          marginTop: 'auto',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.2rem' }}>
            <Globe2 size={13} color="#10b981" />
            <span>GADM 4.1 Kenya</span>
          </div>
          WGS 84 spatial reference with hierarchical resolution: County → Sub-County → Ward.
        </div>
      </aside>
    </>
  );
}
