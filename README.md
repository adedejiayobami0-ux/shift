# Shift — production-ready V1 scaffold

Shift helps people plan what is next, navigate what happened, and support the people they care about.

## What works now
- Create multiple life threads
- Plan / Navigate / Support flows
- Living timeline and Life Map
- Editable steps and updates
- Savings goals and simulations
- Local-first persistence
- Export / import / clear local data
- FAQ and safety boundaries
- Installable PWA shell
- Optional Supabase magic-link auth + cloud sync architecture

## Run locally
Serve this folder with any static server. Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Enable cloud sync
1. Create a dedicated Supabase project for Shift.
2. Run `supabase/schema.sql` in that project.
3. Copy `config.example.js` to `config.js` and add the project URL and publishable key.
4. Set `enableCloudSync: true`.
5. Add your deployed Shift URL to Supabase Auth redirect URLs.
6. Test RLS before inviting users.

Cloud sync is opt-in. Without configuration, Shift remains fully usable as a local-first product.

## Important
Never put a Supabase secret/service-role key in this repository or client code.
