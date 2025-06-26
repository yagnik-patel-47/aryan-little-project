import { createClient } from '@supabase/supabase-js';

// This is the client-side client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This is a server-side client creator.
export function createSupabaseServerClient() {
    console.log('Attempting to create a server-side Supabase client.');
    console.log('NEXT_PUBLIC_SUPABASE_URL is set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    // Use the secure, server-only service role key
    console.log('SUPABASE_SERVICE_ROLE_KEY is set:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('Missing Supabase environment variables for server-side client.');
        throw new Error('Supabase URL and Service Role Key must be defined in environment variables for server-side operations.');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey);
} 