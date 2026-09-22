# Shift security notes

- Do not deploy cloud sync against a shared or unrelated Supabase project.
- Use only the public/publishable Supabase key in browser code.
- Keep Row Level Security enabled on all exposed user-data tables.
- Do not authorize from user-editable metadata.
- Shift is not an emergency service or a medical, psychological, legal, financial, or immigration provider.
- Minimize health and other sensitive data collection. Do not use sensitive life data for advertising or profiling.
- Treat exported JSON backups as sensitive user files.
- Before enabling document upload, add a dedicated threat model, private storage buckets, storage RLS, retention controls, encryption review, and deletion workflows.
