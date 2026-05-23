// supabase-client.js — initialise the shared Supabase client.
// Anon keys are public by design; row-level security in schema.sql is
// what protects the data.  To rotate, replace the values below and
// commit.

window.SUPABASE_CONFIG = {
  url:     'https://tsapqdsdjocrqpduaaav.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzYXBxZHNkam9jcnFwZHVhYWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTUyNjQsImV4cCI6MjA5NTA3MTI2NH0.AO_-B0QbdQ8teyGxWpu4sm7BjuUhjhgB0N3QlklDSpI',
};

window.sb = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'nailzjae.auth.v1',
    },
  }
);
