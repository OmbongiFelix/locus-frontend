import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EndpointDoc from './components/EndpointDoc';
import EndpointPlayground from './components/EndpointPlayground';
import OverviewSection from './components/OverviewSection';
import SchemasPage from './components/SchemasPage';
import { getEndpoints, getSchemas } from './openapiData';

export default function App() {
  const endpoints = useMemo(() => getEndpoints(), []);
  const schemas = useMemo(() => getSchemas(), []);

  // Active view states
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'explorer' | 'schemas'
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0] || null);
  const [selectedSchema, setSelectedSchema] = useState(Object.keys(schemas)[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseUrl = 'https://locus-xhvj.onrender.com';

  const handleSelectEndpointFromOverview = (ep) => {
    setSelectedEndpoint(ep);
    setActiveTab('explorer');
  };

  return (
    <div className="portal-layout">
      {/* Top Portal Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        baseUrl={baseUrl}
      />

      <div className="portal-body">
        {/* Left Sidebar */}
        <Sidebar 
          endpoints={endpoints}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={setSelectedEndpoint}
          schemas={schemas}
          selectedSchema={selectedSchema}
          onSelectSchema={setSelectedSchema}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="portal-main">
          {activeTab === 'overview' && (
            <OverviewSection 
              onExploreEndpoint={handleSelectEndpointFromOverview} 
              endpoints={endpoints}
            />
          )}

          {activeTab === 'schemas' && (
            <SchemasPage 
              schemas={schemas}
              selectedSchema={selectedSchema}
              onSelectSchema={setSelectedSchema}
            />
          )}

          {activeTab === 'explorer' && selectedEndpoint && (
            <div className="split-grid">
              {/* Left Column: Rich Endpoint Documentation */}
              <section aria-label="API Documentation">
                <EndpointDoc 
                  endpoint={selectedEndpoint} 
                  baseUrl={baseUrl} 
                />
              </section>

              {/* Right Column: Interactive Explorer Console */}
              <aside aria-label="Interactive Playground">
                <EndpointPlayground 
                  key={selectedEndpoint.id}
                  endpoint={selectedEndpoint} 
                  baseUrl={baseUrl} 
                />
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
