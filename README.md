# Actress TCG

Dark-red cinematic collectible actress card game.

## Current stack

- Vite + React + TypeScript (the repository already contained this working UI)
- CSS/Tailwind-style utility classes
- Supabase-ready data layer
- GitHub
- Vercel-ready static/Vite build

## Game rules

- A signed-in player opens **exactly 3 cards** per drop.
- After a successful drop, a **1 hour cooldown** starts.
- The frontend countdown is only a display; the production Supabase RPC must enforce the cooldown.
- Duplicate cards increase their copy count.
- Collection cards are clickable and show their full dossier.
- Admins can manage the card catalog and player accounts.

## Authentication

For production, use Supabase Auth rather than storing passwords in browser localStorage. The existing UI accepts username/password. A simple username-only UI can map the username to an internal email identity such as `username@actresstcg.local`, while Supabase Auth remains the password authority.

Create the requested first admin account through Supabase Auth:

- username: `6102000`
- password: `6102000`

Then set that user's application role to admin in the database. Do not put the password or service-role key in GitHub.

## Supabase

Set these Vite environment variables in Vercel/local development:

`VITE_SUPABASE_URL`

`VITE_SUPABASE_ANON_KEY`

or the publishable-key equivalent already supported by `src/utils/supabase.ts`.

Enable RLS on every exposed table. Keep privileged operations inside database functions/Edge Functions and never expose a service-role key to the browser.

## Vercel

The project uses Vite:

```bash
npm install
npm run build
```

Deploy the repository to Vercel as a Vite project. Add the Supabase environment variables in the Vercel project settings.

## Important

The repository was already a substantial Actress Card Collection implementation. The requested core mechanic has been changed from the previous 5-pack batch behavior to **3 cards + 1 hour cooldown** instead of replacing the existing UI with a second unrelated application.
