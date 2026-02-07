import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, children }) => {
    return (
        <header className="glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Real Estate Scraper</h1>
                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--primary-color)', color: 'white' }}>
                    v2.0
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {children}
                <button
                    onClick={toggleTheme}
                    className="btn"
                    style={{ backgroundColor: 'transparent', color: 'var(--text-color)', padding: '0.5rem' }}
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </button>
            </div>
        </header>
    );
};

export default Header;

