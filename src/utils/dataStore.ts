
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
 * ROBUST STRATEGY:
 * 1. Reset all 'isnew' to false effectively marking everything as "old".
 * 2. Check which incoming properties already exist in DB.
 * 3. Insert ONLY the ones that do NOT exist, marking them 'isnew: true'.
 */
export async function saveProperties(properties: Property[]): Promise<void> {
    if (properties.length === 0) return;

    try {
        // Step 1: Reset 'isNew' for all existing records
        const { error: resetError } = await (supabase as any)
            .from('properties')
            .update({ isnew: false })
            .eq('isnew', true);

        if (resetError) {
            console.error('Error resetting old properties status:', resetError);
        }

        // Step 2: Check which links already exist
        const links = properties.map(p => p.link);
        const { data: existingRows, error: checkError } = await (supabase as any)
            .from('properties')
            .select('link')
            .in('link', links);

        if (checkError) {
            console.error('Error checking existing properties:', checkError);
            return;
        }

        const existingLinks = new Set((existingRows || []).map((r: any) => r.link));

        // Step 3: Filter out existing properties so we only insert TRULY new ones
        const newPropertiesToInsert = properties.filter(p => !existingLinks.has(p.link));

        if (newPropertiesToInsert.length === 0) {
            console.log('No new properties to add.');
            return;
        }

        // Step 4: Insert the new ones
        const dbRows = newPropertiesToInsert.map(p => ({
            ...mapToDb(p),
            isnew: true // Explicitly set true
        }));

        const { error: insertError } = await (supabase as any)
            .from('properties')
            .insert(dbRows);

        if (insertError) {
            console.error('Error inserting new properties:', insertError);
        } else {
            console.log(`Successfully added ${dbRows.length} new properties.`);
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
