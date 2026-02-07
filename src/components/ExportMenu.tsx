import { Download, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import type { Property } from '../types';
import './ExportMenu.css';

interface ExportMenuProps {
    properties: Property[];
    newProperties: Property[];
}

function ExportMenu({ properties, newProperties }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const exportToExcel = (data: Property[], filename: string) => {
        if (data.length === 0) {
            alert('No data to export!');
            return;
        }

        // Prepare data for Excel (remove isNew flag, format nicely)
        const exportData = data.map(prop => ({
            'Property Name': prop.propertyName || 'N/A',
            'Price': prop.price || 'N/A',
            'BHK': prop.bhk || 'N/A',
            'Area': prop.area || 'N/A',
            'Locality': prop.locality || 'N/A',
            'City': prop.city || 'N/A',
            'Status': prop.status || 'N/A',
            'Developer': prop.developer || 'N/A',
            'Property Type': prop.propertyType || 'N/A',
            'Furnishing': prop.furnishing || 'N/A',
            'RERA/Reg Date': prop.regDate || 'N/A',
            'Source': prop.source || 'N/A',
            'Link': prop.link || 'N/A',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Properties');

        // Auto-size columns
        const colWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length, 15)
        }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        setIsOpen(false);
    };

    return (
        <div className="export-menu" ref={menuRef}>
            <button
                className="export-btn"
                onClick={() => setIsOpen(!isOpen)}
                disabled={properties.length === 0}
            >
                <Download size={18} />
                <span>Export</span>
                <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
            </button>

            {isOpen && (
                <div className="export-dropdown">
                    <button
                        className="dropdown-item"
                        onClick={() => exportToExcel(newProperties, 'new_properties')}
                        disabled={newProperties.length === 0}
                    >
                        <span className="new-badge">NEW</span>
                        Download New Data ({newProperties.length})
                    </button>
                    <button
                        className="dropdown-item"
                        onClick={() => exportToExcel(properties, 'all_properties')}
                    >
                        Download All Data ({properties.length})
                    </button>
                </div>
            )}
        </div>
    );
}

export default ExportMenu;
