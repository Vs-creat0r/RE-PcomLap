import React from 'react';
import type { Property } from '../types';
import { MapPin, Home, IndianRupee, ExternalLink, Building } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
    index: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index }) => {
    return (
        <div
            className="glass-panel fade-in"
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                animationDelay: `${index * 50}ms`
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: (property.source === '99acres' ? '#3b82f6' : (property.source === 'VitalSpace' ? '#10b981' : '#64748b')),
                        backgroundColor: (property.source === '99acres' ? '#dbeafe' : (property.source === 'VitalSpace' ? '#d1fae5' : '#f1f5f9')),
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px'
                    }}>
                        {property.source || 'Unknown'}
                    </span>
                    {property.isNew && (
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            color: 'white',
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '12px',
                            animation: 'pulse 2s infinite'
                        }}>
                            ✨ NEW
                        </span>
                    )}
                </div>
                <span
                    title={property.regDate}
                    style={{
                        fontSize: '0.8rem',
                        color: 'var(--secondary-color)',
                        maxWidth: '140px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'right'
                    }}
                >
                    {property.regDate}
                </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.4' }}>{property.propertyName}</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-color)' }}>
                <Building size={16} />
                <span>{property.developer}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-color)' }}>
                <MapPin size={16} />
                <span>{property.locality}, {property.city}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Home size={16} />
                    <span>{property.bhk}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{property.area}</span>
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                    <IndianRupee size={18} />
                    {property.price}
                </div>
                <a
                    href={property.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}
                >
                    View <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </a>
            </div>
        </div>
    );
};

export default PropertyCard;
