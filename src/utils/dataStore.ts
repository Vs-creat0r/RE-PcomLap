
import { supabase } from './supabaseClient';
import type { Property } from '../types';

export interface StoredData {
    properties: Property[];
    lastUpdated: string;
}

/**
 * Helper to map DB row (lowercase) to Property object (camelCase)
 */
function mapFromDb(row: any): Property {
    return {
        propertyName: row.propertyname || row.propertyName, // Handle both just in case
        price: row.price,
        bhk: row.bhk,
        locality: row.locality,
        area: row.area,
        developer: row.developer,
        status: row.status,
        regDate: row.regdate || row.regDate,
        link: row.link,
        propertyType: row.propertytype || row.propertyType,
        city: row.city,
        furnishing: row.furnishing,
        fomo: row.fomo,
        source: row.source,
        isNew: row.isnew ?? row.isNew ?? true // DB might be isnew
    };
}

/**
 * Helper to map Property object (camelCase) to DB row (lowercase)
 */
function mapToDb(prop: Property): any {
    return {
        propertyname: prop.propertyName,
        price: prop.price,
        bhk: prop.bhk,
        locality: prop.locality,
        area: prop.area,
        developer: prop.developer,
        status: prop.status,
        regdate: prop.regDate,
        link: prop.link,
        propertytype: prop.propertyType,
        city: prop.city,
        furnishing: prop.furnishing,
        fomo: prop.fomo,
        source: prop.source,
        isnew: prop.isNew
    };
}

/**
 * Normalize values for consistent comparison
 * Removes punctuation, spaces, and case differences.
 * e.g. "1,935 sqft" -> "1935sqft"
 * e.g. "3 BHK" -> "3bhk"
 */
function normalizeForComparison(value: any): string {
    if (!value) return '';
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
}

/**
 * Load properties from Supabase
 * Returns the list of properties ordered by created_at descending
 */
export async function loadProperties(): Promise<Property[]> {
    try {
        const { data, error } = await (supabase as any)
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties from Supabase:', error);
            return [];
        }

        return (data || []).map(mapFromDb);
    } catch (error) {
        console.error('Unexpected error fetching properties:', error);
        return [];
    }
}

/**
 * Save new properties to Supabase
 * STRATEGY WITH ROBUST DUPLICATE CHECK:
 * 1. Reset all 'isnew' to false.
 * 2. Check existing properties (Link + Area).
 * 3. Logic:
 *    - Link New? -> INSERT (isNew=true).
 *    - Link Exists? 
 *      -> Compare NORMALIZED Area.
 *      -> If Different -> UPDATE (isNew=true).
 *      -> If Same -> IGNORE.
 */
export async function saveProperties(properties: Property[]): Promise<void> {
    if (properties.length === 0) return;

    try {
        // Step 1: Reset 'isNew' for all existing records
        const { error: resetError } = await (supabase as any)
            .from('properties')
            .update({ isnew: false })
            .eq('isnew', true);

        if (resetError) console.error('Error resetting old properties status:', resetError);

        // Step 2: Check which links already exist AND get their area
        const links = properties.map(p => p.link);
        const { data: existingRows, error: checkError } = await (supabase as any)
            .from('properties')
            .select('link, area')
            .in('link', links);

        if (checkError) {
            console.error('Error checking existing properties:', checkError);
            return;
        }

        // Map: Link -> Area
        const existingMap = new Map();
        (existingRows || []).forEach((r: any) => existingMap.set(r.link, r.area));

        const toInsert: any[] = [];
        const toUpdate: any[] = [];

        properties.forEach(p => {
            const mapped = mapToDb(p);

            if (!existingMap.has(p.link)) {
                // Case 1: Brand new link
                toInsert.push({ ...mapped, isnew: true });
            } else {
                const existingArea = existingMap.get(p.link);

                // ROBUST COMPARISON: Normalize both values
                const normExisting = normalizeForComparison(existingArea);
                const normIncoming = normalizeForComparison(p.area);

                if (normExisting !== normIncoming) {
                    // Case 2: Link exists, but Normalized Area changed -> Treat as NEW (Update)
                    toUpdate.push({ ...mapped, isnew: true });
                }
                // Case 3: Link + Normalized Area match -> Ignore (Old)
            }
        });

        // Execute Inserts
        if (toInsert.length > 0) {
            const { error: insertError } = await (supabase as any)
                .from('properties')
                .insert(toInsert);
            if (insertError) console.error('Error inserting new properties:', insertError);
            else console.log(`Inserted ${toInsert.length} properties.`);
        }

        // Execute Updates
        if (toUpdate.length > 0) {
            const { error: updateError } = await (supabase as any)
                .from('properties')
                .upsert(toUpdate, { onConflict: 'link' });
            if (updateError) console.error('Error updating changed properties:', updateError);
            else console.log(`Updated ${toUpdate.length} properties with changed area.`);
        }

    } catch (error) {
        console.error('Unexpected error saving properties:', error);
    }
}

/**
 * Filter properties to identify which ones are new (not in current list)
 * purely for UI "NEW" badge logic before saving.
 */
export function identifyNewProperties(
    existingProperties: Property[],
    incomingProperties: Property[]
): Property[] {
    const existingLinks = new Set(existingProperties.map(p => p.link));
    return incomingProperties.filter(p => !existingLinks.has(p.link));
}

/**
 * Merge logic for local state updates
 */
export function mergeProperties(
    existingProperties: Property[],
    newProperties: Property[]
): Property[] {
    const existingKeys = new Set(existingProperties.map(p => p.link));

    // Mark new properties and filter duplicates
    const processedNew = newProperties
        .filter(prop => !existingKeys.has(prop.link))
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
 * Get only new properties
 */
export function getNewProperties(properties: Property[]): Property[] {
    return properties.filter(p => p.isNew);
}

/**
 * Clear all data (optional, for debugging)
 */
export async function clearStorage(): Promise<void> {
    const { error } = await (supabase as any)
        .from('properties')
        .delete()
        .neq('id', 0); // Delete all where ID is not 0 (all rows)

    if (error) console.error('Error clearing storage:', error);
}
