# Repository Guide — PayPal Payment Buttons V2

**Last updated:** 2026-03-16

This project spans two repositories. This document explains what each contains, how they relate, and where to find the latest code.

---

## Repository Map

### 1. Implementation Workspace (this repo)

**Repo:** `Automattic/paypal-payment-buttons-v2`
**Local path:** `/Users/andrewwikel/Local Sites/paypal-payment-buttons-v2/`
**Branch:** `wooptp-167-standalone-stubs`

**Purpose:** Project management, documentation, and implementation planning. This is the "war room" — it tracks the work but is NOT the running plugin.

**Contains:**

| Directory/File | What It Is |
|---|---|
| `prd-paypal-payment-buttons-v2.md` | Product requirements document |
| `PLUGINOMATTIC-INTEGRATION-PLAN.md` | Pluginomattic methodology application plan |
| `REPO-GUIDE.md` | This file — explains the repo structure |
| `playground-blueprint.json` | WordPress Playground configuration for demos |
| `PLAYGROUND-INSTRUCTIONS.md` | How to use the Playground demo |
| `implementation/WOOPTP-*/` | Per-ticket implementation folders (code snapshots, PR descriptions) |
| `implementation/CONSOLIDATED/` | Canonical file snapshot (may be stale — fork is source of truth) |
| `implementation/PRE-PR-CHECKLIST.md` | Quality gate checklist for PR submission |
| `implementation/WOOPTP-155/docs-drafts/` | External documentation drafts for support teams |
| `implementation/WOOPTP-155/screenshots/` | Screenshot plan, UX review, Playwright automation |
| `implementation/WOOPTP-155/external-docs-tracker.md` | Tracker for 8 external doc pages |

**Does NOT contain:** The actual plugin source code. All live code is in the fork (see below).

**When to update this repo:**
- Documentation changes (docs drafts, checklist updates, plans)
- CONSOLIDATED folder refresh (snapshot from fork for reference)
- Playground blueprint updates (new zip URLs for demos)
- Project tracking artifacts

---

### 2. Jetpack Fork (live source code)

**Repo:** `slash1andy/jetpack` (fork of `Automattic/jetpack`)
**Local path:** `/Users/andrewwikel/Local Sites/jetpack/`
**Branch:** `paypal-payment-buttons-v2`
**Remote:** `fork` (slash1andy) / `origin` (Automattic — DO NOT push here until final merge)

**Purpose:** The actual running plugin code. All development happens here.

**Source code location:**
```
projects/packages/paypal-payments/
├── src/paypal-payment-buttons/    ← PHP classes, JS components, SCSS
│   ├── block.json                 ← Block registration metadata
│   ├── class-paypal-oauth.php     ← OAuth 2.0 credential management
│   ├── class-paypal-api-client.php ← PayPal API CRUD with retry logic
│   ├── class-paypal-rest-controller.php ← WordPress REST API endpoints
│   ├── class-paypal-attribute-mapper.php ← Block ↔ API field mapping
│   ├── class-paypal-payment-buttons.php ← Block registration + PHP renderer
│   ├── edit.js                    ← Block editor component (wizard + form)
│   ├── save.js                    ← Block save/frontend output
│   ├── paypal-button-preview.js   ← Editor preview component
│   ├── validation.js              ← Client-side validation utilities
│   ├── deprecated.js              ← Legacy block migration
│   ├── index.js                   ← Block registration entry point
│   ├── editor.scss                ← Editor-only styles
│   └── style.scss                 ← Frontend styles
├── tests/
│   ├── php/                       ← PHPUnit tests (163 tests)
│   └── js/                        ← Jest tests (109 tests)
├── docs/                          ← Jetpack-specific doc drafts
├── dist/                          ← Built assets (webpack output)
├── jest.config.js
├── webpack.config.blocks.js
└── package.json

projects/plugins/paypal-payment-buttons/
├── jetpack.php                    ← Standalone plugin entry point
└── ...                            ← Plugin wrapper referencing the package
```

**Latest commit:** `3421c0d6b2` — feat(paypal-buttons): add product image support (WOOPTP-188)

**When to update this repo:**
- All code changes (features, bug fixes, test updates)
- Push to `fork` remote only (never push to `origin` until final merge)

---

## Development Flow

```
1. Plan & track          → paypal-payment-buttons-v2 repo (this repo)
2. Write & test code     → slash1andy/jetpack fork (paypal-payment-buttons-v2 branch)
3. Run tests             → In the fork: pnpm run test:js + phpunit
4. Commit & push         → Push to fork remote only
5. Build demo zip        → Build from fork, upload to v2 repo releases
6. Update Playground     → Update blueprint in v2 repo to point to new zip
7. Final merge           → PR from fork to Automattic/jetpack trunk (LAST STEP)
```

---

## How to Share the Latest Version

### For developers:
Clone `slash1andy/jetpack`, checkout `paypal-payment-buttons-v2`, run locally.

### For non-developers / demos:
Use the WordPress Playground link in `PLAYGROUND-INSTRUCTIONS.md`. The blueprint points to a pre-built zip file uploaded as a GitHub release on this repo.

### Current Playground zip version:
Check `playground-blueprint.json` for the URL. Update it when a new build is available.

---

## Source of Truth

| Question | Answer |
|---|---|
| Where is the latest code? | **Fork:** `slash1andy/jetpack` branch `paypal-payment-buttons-v2` |
| Where are the tests? | **Fork:** `projects/packages/paypal-payments/tests/` |
| Where is the documentation? | **This repo:** `implementation/WOOPTP-155/` |
| Where is the project checklist? | **This repo:** `implementation/PRE-PR-CHECKLIST.md` |
| Where is the CONSOLIDATED snapshot? | **This repo:** `implementation/CONSOLIDATED/` (may be stale) |
| Where do I track tickets? | **Linear:** project "PayPal Payment Buttons V2: API Integration" |

---

## CONSOLIDATED Folder Status

The `implementation/CONSOLIDATED/` folder is a **point-in-time snapshot** of canonical files assembled from ticket folders. It was created on 2026-03-14 and last updated 2026-03-15.

**It may be behind the fork.** The fork (`slash1andy/jetpack`) is always the source of truth for the latest code. The CONSOLIDATED folder is useful for:
- Understanding file provenance (which ticket produced each file)
- Reference when the fork isn't available
- The `MANIFEST.md` documents the source ticket for every file

To refresh CONSOLIDATED from the fork, copy files from `projects/packages/paypal-payments/src/paypal-payment-buttons/` to the appropriate CONSOLIDATED subdirectories.

---

## Key Rules

1. **Never push to `Automattic/jetpack`** until every gate is passed and the team is ready for final merge
2. **All code changes go in the fork** — this repo is for documentation and planning only
3. **Update Linear after every task** — tickets must reflect current status at all times
4. **Default to Production** — never default to Sandbox in any code or documentation
5. **Frame Jarred/PayPal items as "Andrew to confirm with Jarred"** — not generic suggestions
