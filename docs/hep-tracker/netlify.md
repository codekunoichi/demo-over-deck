# Netlify Deployment & Debugging Guide

This document captures the exact steps used to deploy the HEP Tracker to Netlify and, more importantly, how we debugged and fixed a real production issue. This is intentional: learning to reason through deployment failures is part of building real products.

---

## 1. Netlify Deployment Setup

### Repository Structure (Relevant Parts)

```
apps/hep-tracker/
├── public/                # Static site (HTML/CSS/JS)
├── netlify/
│   └── functions/         # Netlify serverless functions
│       ├── get_daily_log.js
│       └── save_daily_log.js
├── netlify.toml
├── package.json
```

### Netlify Site Configuration

In the Netlify UI:

- **Base directory:** `apps/hep-tracker`
- **Publish directory:** `apps/hep-tracker/public`
- **Functions directory:** `apps/hep-tracker/netlify/functions`
- **Build command:** `npm install`

This configuration allows:
- Static assets to be served from `public/`
- Serverless functions to be deployed from `netlify/functions/`

---

## 2. netlify.toml (Final Working Version)

The final `netlify.toml` is intentionally minimal:

```
[build]
  publish = "public"
  functions = "netlify/functions"
```

No redirects are required.

---

## 3. Initial Problem Encountered

After deployment:

- The UI loaded correctly
- Netlify showed both functions (`get_daily_log`, `save_daily_log`) as deployed
- However, the browser console showed errors:

```
404 GET /.netlify/functions/get_daily_log
404 POST /.netlify/functions/save_daily_log
```

This meant:
- The frontend was calling the wrong function URLs
- But the functions themselves *did* exist

---

## 4. Debugging Process

### Step 1: Verify Functions Exist
- Checked Netlify dashboard → Functions tab
- Confirmed both functions were active and deployed

### Step 2: Test Function URLs Directly
Tried accessing the functions manually:

```
https://<site>.netlify.app/get_daily_log
```

✅ This returned the CSV data correctly.

But:

```
https://<site>.netlify.app/.netlify/functions/get_daily_log
```

❌ Returned 404.

This was the key insight.

---

## 5. Root Cause

Because of how the Functions directory was configured, Netlify exposed the functions at the **site root**:

```
/get_daily_log
/save_daily_log
```

Not at:

```
/.netlify/functions/get_daily_log
```

The frontend code was calling the wrong endpoints.

---

## 6. The Fix

We updated the frontend fetch calls (in `state.js`) to use:

```
/get_daily_log
/save_daily_log
```

We **removed** redirect hacks from `netlify.toml` instead of papering over the issue.

This aligned the frontend with Netlify’s actual runtime behavior.

---

## 7. Validation (Proof It Worked)

After the fix:

- Saving patient exercise minutes succeeded
- New rows appeared in Netlify Blob-backed storage
- Weekly Compliance View refreshed immediately
- No 404s in the browser console
- Netlify Observability showed successful requests

Example proof:
- New entries for `2025-12-17` appeared after saving via the UI

---

## 8. Why This Matters (Teaching Moment)

This is the difference between a demo and a product.

AI can scaffold code quickly, but:
- Logs
- Evidence
- Hypothesis
- Small, precise fixes

are still the responsibility of the builder.

This debugging flow is intentionally documented so students learn how to:
- Trust evidence over assumptions
- Debug production systems calmly
- Ship working software, not just slides

---

## 9. Local vs Netlify Behavior

- **Local (`python -m http.server`)**
  - Functions are unavailable
  - App runs in read-only mode with a friendly message

- **Netlify**
  - Full persistence via Netlify Blobs
  - Save → refresh → updated weekly view

This dual-mode behavior is intentional and documented.

---

## 10. Takeaway

If you can debug this, you can ship.

This is the exact mindset shift from:
> “Why doesn’t this work?”

to:
> “What is the system telling me?”

That shift is the real MVP.
