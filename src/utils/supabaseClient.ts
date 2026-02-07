
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Function to validate URL
const isValidUrl = (urlString: string) => {
    try {
        return Boolean(new URL(urlString));
    } catch (e) {
        return false;
    }
}

// Create Supabase client safely
let client;

if (isValidUrl(supabaseUrl)) {
    client = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // Fallback or mock client to prevent crash on invalid URL
    console.error('Invalid Supabase URL format. Client initialization skipped.');
    // Return a dummy object to prevent immediate crash, though calls will fail
    client = {
        from: () => ({
            select: () => Promise.resolve({ data: [], error: 'Invalid Supabase Configuration' }),
            upsert: () => Promise.resolve({ error: 'Invalid Supabase Configuration' }),
            delete: () => Promise.resolve({ error: 'Invalid Supabase Configuration' })
        })
    } as any;
}

export const supabase = client;
