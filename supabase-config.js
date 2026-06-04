// ============================================================
// supabase-config.js  — COSOCKET
// ============================================================

// ✅ FIXED: Removed /rest/v1/ — the SDK appends its own paths
const SUPABASE_URL      = 'https://ktajpeiiwipmjozwxbkx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWpwZWlpd2lwbWpvend4Ymt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjQ0MDgsImV4cCI6MjA5NjA0MDQwOH0.mWfI2_jTQn3o8KUgnem5N0IJgD2qYIJu4dibPhDpj5I';

window._supabaseClient = null;

function getSupabase() {
    if (!window._supabaseClient) {
        window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,       // keep user logged in across tabs
                autoRefreshToken: true,     // silently refresh JWT before expiry
                detectSessionInUrl: true,   // handle email-confirm redirect links
            }
        });
    }
    return window._supabaseClient;
}