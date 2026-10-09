# Single administrator access

The calendar `/auth?sso=descobreix` starts sign-in through Descobreix. Community managers keep their existing phone/password and invitation flows.

## Configuration

Descobreix keeps its existing Supabase public settings. No calendar private key needs to be transferred to Vercel. Its server validates the existing owner with `getUser`, then sends that session's access token server-to-server to the fixed calendar `/api/auth/descobreix` endpoint. Redirects during this request are rejected.

The calendar server uses its existing Lovable Cloud `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, already used by its administration functions. These credentials remain server-only. The source Auth URL and public key are pinned in `src/lib/descobreix-sso-source.json`; this file contains public configuration only.

Production uses `https://descobreix.com` and `https://elcalendario.lovable.app/auth` by default. For local testing, set `VITE_DESCOBREIX_URL=http://127.0.0.1:3000` in the calendar and `CALENDAR_SSO_CALLBACK_URL=http://127.0.0.1:3001/auth` in Descobreix. Local exchange requires the calendar's existing private server configuration, or a deployed preview with that configuration. Neither local URL is permitted in production.

## Access boundaries

Both servers validate the real source Auth user and require the fixed, verified Descobreix owner UUID. The calendar additionally checks the existing linked account still has its admin role and retrieves that existing account before generating a magic link. No users, roles, policies or passwords are created or changed.

The calendar returns a one-use token hash server-to-server. Descobreix sends it to the fixed callback in a URL fragment with no caching and no referrer. The browser checks a random 256-bit state with a five-minute lifetime, clears the fragment and stored state, redeems the token, and checks the admin role again. Invalid states are rejected before contacting Auth. No access or refresh token is placed in a URL or logged.

Each app owns its session. Signing out of one currently does not sign out of the other.

## Verification

Both owner UUIDs and the existing calendar admin role were verified against the live backends. Run type checks and production builds for both repositories; check absent and malformed states, anonymous redirects, invalid bearer tokens, callback rejection and a real owner round trip. Verify existing manager sign-in after deployment. Do not claim activation before the real round trip succeeds.
