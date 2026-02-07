import type { Property } from '../types';

const STORAGE_KEY = 'real-estate-properties';

export interface StoredData {
    properties: Property[];
    lastUpdated: string;
}

/**
 * Generate a unique key for a property based on link + price
 */
function getPropertyKey(property: Property): string {
    return `${property.link || ''}-${property.price || ''}`;
}

/**
 * Load stored properties from localStorage
 */
export function loadProperties(): StoredData | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load properties from storage:', error);
    }
    return null;
}

/**
 * Save properties to localStorage
 */
export function saveProperties(properties: Property[]): void {
    try {
        const data: StoredData = {
            properties,
            lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save properties to storage:', error);
    }
}

/**
 * Merge new properties with existing ones, marking new items and removing duplicates
 * Returns the merged list with isNew flags set appropriately
 */
export function mergeProperties(
    existingProperties: Property[],
    newProperties: Property[]
): Property[] {
    // Create a map of existing property keys
    const existingKeys = new Set(existingProperties.map(getPropertyKey));

    // Mark new properties and filter duplicates
    const processedNew = newProperties
        .filter(prop => !existingKeys.has(getPropertyKey(prop)))
        .map(prop => ({ ...prop, isNew: true }));

    // Reset isNew flag on existing properties
    const existingWithoutNew = existingProperties.map(prop => ({
        ...prop,
        isNew: false,
    }));

    // New properties come first
    return [...processedNew, ...existingWithoutNew];
}

/**
 * Get only new properties from the list
 */
export function getNewProperties(properties: Property[]): Property[] {
    return properties.filter(prop => prop.isNew);
}

/**
 * Clear all stored data
 */
export function clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
}
