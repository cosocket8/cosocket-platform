// ============================================================
// supabase-config.js  — paste your real credentials here
// ============================================================
const SUPABASE_URL  = 'https://ktajpeiiwipmjozwxbkx.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWpwZWlpd2lwbWpvend4Ymt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjQ0MDgsImV4cCI6MjA5NjA0MDQwOH0.mWfI2_jTQn3o8KUgnem5N0IJgD2qYIJu4dibPhDpj5I';

// This file is loaded by all pages BEFORE script.js / dashboard scripts
window._supabaseClient = null;

function getSupabase() {
    if (!window._supabaseClient) {
        window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window._supabaseClient;
}