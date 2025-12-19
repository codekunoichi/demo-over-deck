# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Demo Over Deck is an MBA founder toolkit for turning slide deck claims into live demo URLs. This is NOT a coding bootcamp - it exists to help MBA students build prototypes quickly to test ideas rather than just present slides.

Live site: https://codekunoichi.github.io/demo-over-deck/

## Repository Structure

This is a monorepo with two distinct parts:

- `apps/` - Self-contained demo applications (each deployable independently)
  - `shift-notes/` - Nursing shift handoff communication demo
  - `hep-tracker/` - Home Exercise Program tracker for physical therapy
- `docs/` - GitHub Pages workshop materials and documentation
- `templates/` - Prompt templates for building new demos

Each app in `apps/` is completely independent with its own:
- `public/` directory (published to Netlify)
- `netlify/functions/` directory (serverless functions)
- `package.json` with dependencies
- `netlify.toml` configuration

## Architecture Pattern: Vanilla JavaScript Apps

Both demo apps follow an intentionally simple architecture pattern for teaching purposes:

### JavaScript Module Organization
- `src/app.js` - Controller/event wiring, navigation, app initialization
- `src/state.js` - Data loading, CSV parsing, business logic, Netlify function calls
- `src/ui.js` - DOM rendering functions, view generation

### Data Flow Pattern
1. CSV files in `public/data/` serve as seed data (patients, exercises, nurses)
2. User-generated data persists to Netlify Blob storage via serverless functions
3. Graceful degradation: apps work locally with CSV-only mode, show helpful messages when persistence unavailable
4. State management is in-memory JavaScript objects (no frameworks)

### Deployment Pattern
- Frontend: Static files in `public/` directory
- Backend: Netlify Functions for CRUD operations
- Storage: Netlify Blobs (CSV format) for user data
- All apps use `"type": "module"` in package.json for ES6 modules

## Common Development Commands

### Shift Notes App

```bash
cd apps/shift-notes

# Local development (frontend only, no persistence)
python3 -m http.server 8000 --directory public
# Then open http://localhost:8000

# Full stack development (with Netlify Functions)
npm install
npm run dev

# Deploy to Netlify
npm run deploy
```

### HEP Tracker App

```bash
cd apps/hep-tracker

# Local development
npm run dev
# Or: python3 -m http.server 8080 --directory public

# Deploy to Netlify
netlify deploy --prod
```

### GitHub Pages Documentation

The `docs/` directory auto-deploys to GitHub Pages on push to master. No build step required.

## Netlify Deployment Architecture

### Critical Files
- `netlify.toml` - Configures publish directory and functions directory
- `netlify/functions/*.js` - Serverless function endpoints
- `package.json` must include `"type": "module"` for ES6 imports in functions

### Netlify Functions Pattern
All serverless functions follow this structure:
- Use `@netlify/blobs` for data persistence (CSV format)
- Export a default handler function
- GET functions return CSV text
- POST functions accept JSON, persist to blob storage, return success/error
- Automatic fallback in client code when functions unavailable (local mode)

### Data Persistence Strategy
- Seed data: Static CSV files in `public/data/` (patients, exercises, nurses)
- User data: Netlify Blobs store dynamically created CSV (shift notes, daily logs)
- Upsert pattern: Read blob → Parse CSV → Update/append → Write back to blob
- Client-side CSV parsing: split by newlines, split by commas, map to objects

## Key Implementation Constraints

These constraints are intentional for teaching purposes:

### What NOT to Add
- NO authentication/login systems
- NO frameworks (React, Vue, etc.)
- NO build steps or bundlers
- NO databases (use CSV + Netlify Blobs)
- NO role-based access control
- NO editing/deleting features (insert-only for simplicity)
- NO HIPAA-grade security (these are teaching demos)

### What TO Maintain
- Keep JavaScript vanilla (ES6 modules only)
- Keep architecture simple and readable
- Preserve CSV-based data model
- Maintain graceful degradation for local development
- Keep scope minimal (one core workflow per app)

## Creating New Demo Apps

When building a new demo app:

1. Use `templates/initial-prompt-template.md` as a starting point for the intent spec
2. Follow the established architecture pattern (app.js/state.js/ui.js)
3. Start with static HTML/CSS matching a sketch
4. Wire to CSV data sources
5. Add Netlify Functions only if persistence needed
6. Create README with Quick Start, Deployment, and Architecture sections
7. Test locally first, then deploy to Netlify

## Important Context

- Target audience: MBA students learning to build prototypes
- Goal: Live demo URL in hours, not weeks
- Philosophy: Minimal viable demo that proves one core workflow
- Grading criteria: Thinking and iteration, NOT code complexity
- Security: Treat all data as public, no real patient/sensitive data

## Common Gotchas

1. **Functions not deploying**: Ensure `"type": "module"` in package.json
2. **Local mode alerts**: Expected behavior when Netlify Functions unavailable
3. **CSV parsing**: Watch for trailing newlines and empty rows
4. **Blob storage**: Automatically available on Netlify, no env vars needed
5. **Module imports**: Must use relative paths with `.js` extension in browser
6. **CORS**: Not an issue since functions and frontend deployed together on Netlify
