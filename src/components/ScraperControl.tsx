import React from 'react';
import { Play, Loader2 } from 'lucide-react';

interface ScraperControlProps {
    isLoading: boolean;
    onStart: () => void;
    lastRun: string | null;
}

const ScraperControl: React.FC<ScraperControlProps> = ({ isLoading, onStart, lastRun }) => {
    return (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>Start Data Collection</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--secondary-color)' }}>
                Trigger the n8n workflow to scrape data from 99acres and VitalSpace simultaneously.
            </p>

            <button
                className="btn btn-primary"
                onClick={onStart}
                disabled={isLoading}
                style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" /> Scraping...
                    </>
                ) : (
                    <>
                        <Play fill="currentColor" /> Start Scraper
                    </>
                )}
            </button>

            {lastRun && (
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--secondary-color)' }}>
                    Last run: {lastRun}
                </p>
            )}
        </div>
    );
};

export default ScraperControl;
