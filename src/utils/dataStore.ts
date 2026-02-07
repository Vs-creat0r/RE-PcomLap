
import { supabase } from './supabaseClient';
import type { Property } from '../types';

export interface StoredData {
    properties: Property[];
    lastUpdated: string;
}

/**
 * Load properties from Supabase
 * Returns the list of properties ordered by created_at descending
 */
export async function loadProperties(): Promise<Property[]> {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching properties from Supabase:', error);
            return [];
        }

        return (data as Property[]) || [];
    } catch (error) {
        console.error('Unexpected error fetching properties:', error);
        return [];
    }
}

/**
 * Save new properties to Supabase
 * Uses UPSERT to handle duplicates based on the 'link' unique constraint
 */
export async function saveProperties(properties: Property[]): Promise<void> {
    if (properties.length === 0) return;

    try {
        // Prepare data for insertion (ensure optional fields are present or null if needed by DB)
        // We assume the table columns match Property interface 1:1 approximately
        const { error } = await supabase
            .from('properties')
            .upsert(properties, {
                onConflict: 'link',
                ignoreDuplicates: true // If true, it won't update existing. If we want to update price, set to false.
                // Let's set to true to ignore duplicates as per request "remove duplicates" - meaning keep old one?
                // Actually, user said "Last data + current data (remove duplicates)".
                // Usually scraping means we want latest price.
                // But for "NEW" tag logic, we need to know which ones were actually inserted.
                // Supabase upsert return value can tell us that if we use select().
            });

        if (error) {
            console.error('Error saving properties to Supabase:', error);
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
 * Clear all data (optional, for debugging)
 */
export async function clearStorage(): Promise<void> {
    const { error } = await supabase
        .from('properties')
        .delete()
        .neq('id', 0); // Delete all where ID is not 0 (all rows)

    if (error) console.error('Error clearing storage:', error);
}
