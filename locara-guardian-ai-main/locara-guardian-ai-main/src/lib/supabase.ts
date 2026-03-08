import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Safeguard against invalid URL causing immediate JS crash
let supabaseInstance;
try {
    if (supabaseUrl && supabaseUrl.startsWith("http")) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        // Return a mock-ish client that doesn't crash but warns in console
        console.warn("Supabase: Invalid URL! Backend functionality will not work until valid keys are set in .env.local");
        supabaseInstance = createClient("https://placeholder.supabase.co", "placeholder-key");
    }
} catch (e) {
    console.error("Supabase init error:", e);
    supabaseInstance = createClient("https://placeholder.supabase.co", "placeholder-key");
}

export const supabase = supabaseInstance;
