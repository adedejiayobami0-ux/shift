# Shift V1 architecture

## Product model
Shift has three entry modes: Plan, Navigate, and Support. Each creates a life thread. A thread contains the user's situation, timeline, steps, goals, and updates.

## Privacy model
Local-first is the default. The app stores the user's state in browser local storage. Cloud sync is opt-in and requires a dedicated Supabase project plus explicit user consent.

## Cloud sync
When enabled, authenticated users sync one JSON state document to `public.shift_state`. Row Level Security restricts access to the authenticated user's own row. The browser uses only the Supabase publishable key; never place a secret/service-role key in the client.

## Guidance data
Public source-backed guidance should live separately from personal state. The `guidance_items` table is designed for curated, sourced information that can be audited independently of user data.

## Future split
Before large scale, split the JSON state into normalized tables for threads, steps, updates, goals, and collaborators to improve conflict handling, auditing, sharing, and partial sync.
