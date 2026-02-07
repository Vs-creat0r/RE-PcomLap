import './SourceFilter.css';

interface SourceFilterProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    sources: string[];
}

function SourceFilter({ activeFilter, onFilterChange, sources }: SourceFilterProps) {
    return (
        <div className="source-filter">
            <span className="filter-label">Filter by Source:</span>
            <div className="filter-buttons">
                <button
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => onFilterChange('all')}
                >
                    All
                </button>
                {sources.map((source) => (
                    <button
                        key={source}
                        className={`filter-btn ${activeFilter === source ? 'active' : ''}`}
                        onClick={() => onFilterChange(source)}
                    >
                        {source}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SourceFilter;
