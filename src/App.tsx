
import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ScraperControl from './components/ScraperControl';
import PropertyGrid from './components/PropertyGrid';
import SourceFilter from './components/SourceFilter';
import ExportMenu from './components/ExportMenu';
import UserProfile from './components/UserProfile';
import { loadProperties, saveProperties, identifyNewProperties } from './utils/dataStore';
import type { Property } from './types';

// Production n8n Webhook URL
const WEBHOOK_URL = 'https://n8n.srv1285810.hstgr.cloud/webhook/scrape-real-estate';

// User profile configuration - UPDATE THESE WITH YOUR DETAILS
const USER_CONFIG = {
  name: 'Dishank',
  email: 'djchauhan450jainil@gmail.com',
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [newProperties, setNewProperties] = useState<Property[]>([]); // Track latest scraped batch for "Download New"
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Load persisted data from Supabase on mount
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      const data = await loadProperties();
      setProperties(data);
      if (data.length > 0) {
        setLastRun(new Date().toLocaleString()); // Or use data[0].created_at if available
      }
      setIsLoading(false);
    }
    initData();
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
      let incomingProps: Property[] = [];

      if (Array.isArray(rawResult)) {
        incomingProps = rawResult.map((item: Record<string, unknown>) => item.json || item) as Property[];
      } else if (rawResult.success !== undefined && rawResult.data) {
        incomingProps = rawResult.data;
      } else if (rawResult.json && rawResult.json.data) {
        incomingProps = rawResult.json.data;
      } else if (rawResult.data && Array.isArray(rawResult.data)) {
        incomingProps = rawResult.data;
      }

      if (incomingProps.length > 0) {
        // Identify new ones for badge logic
        const newlyAdded = identifyNewProperties(properties, incomingProps);

        // Mark new properties with isNew flag before saving/displaying
        const markedIncoming = incomingProps.map(p => ({
          ...p,
          isNew: newlyAdded.some(n => n.link === p.link) // Badge logic locally
        }));

        // Set the batch for "Download New Data"
        setNewProperties(markedIncoming); // Or just newlyAdded? Usually user might want entire latest scrape result. Let's keep entire batch.

        // Save to Supabase (Upsert)
        await saveProperties(incomingProps);

        // Re-fetch to get consistent state from DB (including IDs if needed)
        // Or optimally, we just merge locally for speed, then fetch in background.
        // For simplicity: Fetch fresh.
        const freshData = await loadProperties();

        // Re-apply isNew flag to fresh data based on our local knowledge of what was just scraped?
        // Actually, loadProperties returns pure data from DB. isNew is a UI state.
        // Ideally we persist isNew in DB? Yes, schema has isNew boolean default true.
        // But scraping usually means "this batch is new".
        // Let's rely on the DB's isNew column if we want.
        // The plan's SQL has `isNew boolean default true`. 
        // So any INSERT will be `isNew=true`.
        // But an UPDATE (upsert on existing) might keep old value or overwrite depending on query.
        // dataStore.ts `upsert` call didn't specify column update mapping, so it might overwrite isNew to what we send.
        // We sent `incomingProps` which likely don't have `isNew` property set explicitly (undefined).
        // If undefined, Supabase/Postgres might use default for INSERT, but for UPDATE it shouldn't touch it unless specified.

        setProperties(freshData);
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
