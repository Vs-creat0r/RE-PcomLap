import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ScraperControl from './components/ScraperControl';
import PropertyGrid from './components/PropertyGrid';
import SourceFilter from './components/SourceFilter';
import ExportMenu from './components/ExportMenu';
import UserProfile from './components/UserProfile';
import { loadProperties, saveProperties, mergeProperties, getNewProperties } from './utils/dataStore';
import type { Property } from './types';

// Production n8n Webhook URL (workflow must be ACTIVATED in n8n)
const WEBHOOK_URL = 'https://n8n.srv1285810.hstgr.cloud/webhook/scrape-real-estate';

// User profile configuration - UPDATE THESE WITH YOUR DETAILS
const USER_CONFIG = {
  name: 'Dishank', // UPDATE: Your name
  email: 'djchauhan450jainil@gmail.com', // UPDATE: Your email
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Load persisted data on mount
  useEffect(() => {
    const stored = loadProperties();
    if (stored) {
      setProperties(stored.properties);
      setLastRun(stored.lastUpdated ? new Date(stored.lastUpdated).toLocaleString() : null);
    }
  }, []);

  // Check system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Extract unique sources from properties
  const sources = useMemo(() => {
    const sourceSet = new Set(properties.map(p => p.source).filter(Boolean));
    return Array.from(sourceSet);
  }, [properties]);

  // Filter properties based on active filter
  const filteredProperties = useMemo(() => {
    if (activeFilter === 'all') return properties;
    return properties.filter(p => p.source === activeFilter);
  }, [properties, activeFilter]);

  // Get new properties for export
  const newProperties = useMemo(() => getNewProperties(properties), [properties]);

  const handleStartScraping = async () => {
    setIsLoading(true);
    setActiveFilter('all');
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
      });
      const rawResult = await response.json();
      console.log("Raw n8n response:", rawResult);

      // Extract properties from various possible response structures
      let newProps: Property[] = [];

      if (Array.isArray(rawResult)) {
        newProps = rawResult.map((item: Record<string, unknown>) => item.json || item) as Property[];
      } else if (rawResult.success !== undefined && rawResult.data) {
        newProps = rawResult.data;
      } else if (rawResult.json && rawResult.json.data) {
        newProps = rawResult.json.data;
      } else if (rawResult.data && Array.isArray(rawResult.data)) {
        newProps = rawResult.data;
      }

      if (newProps.length > 0) {
        // Merge with existing properties, mark new ones, remove duplicates
        const merged = mergeProperties(properties, newProps);
        setProperties(merged);
        saveProperties(merged);
      } else {
        console.error("No properties found in response:", rawResult);
        alert("Scraping returned no data. Check console.");
      }
      setLastRun(new Date().toLocaleString());
    } catch (error) {
      console.error("Error triggering scraper:", error);
      alert("Failed to trigger scraper. Check console/network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Header theme={theme} toggleTheme={toggleTheme}>
        <ExportMenu properties={properties} newProperties={newProperties} />
        <UserProfile name={USER_CONFIG.name} email={USER_CONFIG.email} />
      </Header>
      <main>
        <ScraperControl
          isLoading={isLoading}
          onStart={handleStartScraping}
          lastRun={lastRun}
        />
        {properties.length > 0 && (
          <SourceFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sources={sources}
          />
        )}
        <PropertyGrid properties={filteredProperties} />
      </main>
    </div>
  );
}

export default App;
