# Shift — International Move Planning Prototype

Shift is a front-end MVP concept for people planning a move to another city or country.

> **From “I want to move” to “I’m ready.”**

This prototype demonstrates the core product loop:

1. Enter origin, destination, and target move date.
2. Answer a short onboarding flow.
3. Receive a personalized move-readiness dashboard.
4. Explore a Move Fund, date simulator, journey, and document checklist.
5. Use a lightweight “Ask Shift” experience grounded in the current plan.

## Files

- `index.html` — app shell and templates
- `styles.css` — responsive product UI
- `app.js` — onboarding, state, dashboard interactions, localStorage
- `.nojekyll` — makes GitHub Pages serve the project as-is

## Run locally

You can open `index.html` directly in a browser, or run a lightweight local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push these files to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your default branch and `/ (root)`.
5. Save.

No build step is required.

## Current prototype assumptions

The demo defaults to **Lagos, Nigeria → Toronto, Canada** with sample financial values. Cost figures and readiness percentages are illustrative product-demo data, not legal, financial, immigration, or relocation advice.

## Suggested next build phase

For a production MVP, replace hard-coded logic with:

- authenticated user accounts
- persisted Move profiles
- country/city data and verified source records
- rules engine for household, visa, work, school, pets, and vehicle modules
- configurable Move Fund assumptions
- official-source citations for requirements
- backend AI orchestration that can safely update the user's plan

