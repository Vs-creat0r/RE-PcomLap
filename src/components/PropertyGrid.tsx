import React from 'react';
import type { Property } from '../types';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
    properties: Property[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
    if (properties.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary-color)' }}>
                <p>No properties found yet. Start the scraper to fetch data.</p>
            </div>
        );
    }

    return (
        <div className="grid-auto-fit">
            {properties.map((prop, index) => (
                <PropertyCard key={`${prop.link}-${index}`} property={prop} index={index} />
            ))}
        </div>
    );
};

export default PropertyGrid;
