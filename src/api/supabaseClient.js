import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Notepod] Supabase credentials missing!\n' +
        'Add your project credentials to the .env file at the project root:\n\n' +
        '  VITE_SUPABASE_URL=https://<your-project>.supabase.co\n' +
        '  VITE_SUPABASE_ANON_KEY=<your-anon-key>\n\n' +
        'Find these in: Supabase Dashboard → Project Settings → API'
    );
}

export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;
