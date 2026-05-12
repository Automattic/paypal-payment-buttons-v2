# Repository Guide — PayPal Payment Buttons V2

**Last updated:** 2026-05-12

This project spans two repositories. This document explains what each contains, how they relate, and where to find the latest code.

---

## Repository Map

### 1. Implementation Workspace (this repo)

**Repo:** `Automattic/paypal-payment-buttons-v2`
**Local path:** `/Users/andrewwikel/Local Sites/paypal-payment-buttons-v2/`
**Default branch:** `trunk`

**Purpose:** Project management, documentation, standalone plugin source, and implementation archives organized by Linear ticket. This is both the "war room" and the home of the deliverable compat-plugin.

**Contains:**

| Directory/File | What It Is |
|---|---|
| `compat-plugin/` | **Standalone plugin source + built dist** — the deliverable artifact |
| `compat-results/` | WP/PHP compatibility matrix test results |
| `prd-paypal-payment-buttons-v2.md` | Product requirements document |
| `PLUGINOMATTIC-INTEGRATION-PLAN.md` | Pluginomattic methodology application plan |
| `DEEP-AUDIT-2026-03-27.md` | Security/perf/a11y deep audit findings and resolutions |
| `REPO-GUIDE.md` | This file — explains the repo structure |
| `playground-blueprint.json` | WordPress Playground configuration for demos |
| `PLAYGROUND-INSTRUCTIONS.md` | How to use the Playground demo |
| `implementation/WOOPTP-*/` | Per-ticket implementation archives (code snapshots, PR descriptions) |
| `implementation/CONSOLIDATED/` | Canonical file snapshot with MANIFEST.md |
| `implementation/PRE-PR-CHECKLIST.md` | Quality gate checklist for PR submission |
| `implementation/WOOPTP-155/docs-drafts/` | External documentation drafts for support teams |
| `implementation/WOOPTP-155/external-docs-tracker.md` | Tracker for external doc pages |
| `scripts/playground-release.sh` | Script to build + upload Playground zip releases |

**When to update this repo:**
- All plugin code changes (features, bug fixes, new classes)
- Documentation changes (docs drafts, checklist updates, plans)
- Playground blueprint updates (new zip URLs for demos)
- CONSOLIDATED folder refresh (snapshot of canonical files with MANIFEST)
- Project tracking artifacts

---

### 2. Jetpack Fork (integration target)

**Repo:** `slash1andy/jetpack` (fork of `Automattic/jetpack`)
**Local path:** `/Users/andrewwikel/Local Sites/jetpack/`
**Branch:** `paypal-payment-buttons-v2`
**Remote:** `fork` (slash1andy) / `origin` (Automattic — DO NOT push here until final merge)

**Purpose:** The Jetpack monorepo integration target. When WOOPTP-159 is ready, code from `compat-plugin/` will be ported into the package at `projects/packages/paypal-payments/`.

**Source code location (when integration begins):**
```
projects/packages/paypal-payments/
├── src/paypal-payment-buttons/    ← PHP classes, JS components, SCSS
│   ├── block.json
│   ├── class-paypal-oauth.php
│   ├── class-paypal-api-client.php
│   ├── class-paypal-rest-controller.php
│   ├── class-paypal-attribute-mapper.php
│   ├── class-paypal-payment-buttons.php
│   ├── edit.js
│   ├── save.js
│   ├── paypal-button-preview.js
│   ├── validation.js
│   ├── deprecated.js
│   ├── index.js
│   ├── editor.scss
│   └── style.scss
├── tests/
│   ├── php/                       ← PHPUnit tests
│   └── js/                        ← Jest tests
└── package.json

projects/plugins/paypal-payment-buttons/
├── jetpack.php                    ← Standalone plugin entry point
└── ...
```

**When to update this repo:**
- Only when WOOPTP-159 (Jetpack monorepo integration) is underway
- Push to `fork` remote only (never push to `origin` until final merge)

---

## Development Flow

```
1. Plan & track          → paypal-payment-buttons-v2 repo (this repo)
2. Write & test code     → compat-plugin/paypal-payment-buttons/src/
3. Run tests             → compat-test.sh for compat matrix; wp-env for local dev
4. Commit & push         → PRs against trunk on this repo
5. Build demo zip        → scripts/playground-release.sh
6. Update Playground     → Update playground-blueprint.json to point to new zip
7. Jetpack integration   → PR from slash1andy/jetpack fork → Automattic/jetpack trunk (WOOPTP-159)
```

---

## How to Share the Latest Version

### For developers:
Clone this repo, use `compat-plugin/paypal-payment-buttons/` as the plugin directory with `.wp-env.json`.

### For non-developers / demos:
Use the WordPress Playground link in `PLAYGROUND-INSTRUCTIONS.md`. The blueprint points to a pre-built zip file uploaded as a GitHub release on this repo.

### Current Playground zip version:
Check `playground-blueprint.json` for the URL. The `scripts/playground-release.sh` script builds and uploads a new release zip.

---

## Source of Truth

| Question | Answer |
|---|---|
| Where is the latest plugin code? | **This repo:** `compat-plugin/paypal-payment-buttons/src/` |
| Where are the tests? | **This repo:** `compat-plugin/tests/` (E2E) + `implementation/CONSOLIDATED/tests/` |
| Where is the documentation? | **This repo:** `implementation/WOOPTP-155/` + `implementation/CONSOLIDATED/docs/` |
| Where is the project checklist? | **This repo:** `implementation/PRE-PR-CHECKLIST.md` |
| Where is the CONSOLIDATED snapshot? | **This repo:** `implementation/CONSOLIDATED/` |
| Where do I track tickets? | **Linear:** project "PayPal Payment Buttons V2" |
| Where is the Jetpack integration? | **Pending** — WOOPTP-159; fork at `slash1andy/jetpack` |

---

## Open PRs

| PR | Title | Status |
|----|-------|--------|
| #37 | fix(sandbox): make legacy button payment link URL environment-aware | Open — needs review |
| #33 | feat(analytics): add Jetpack Tracks event instrumentation (WOOPTP-194) | Open — needs review |

---

## CONSOLIDATED Folder Status

The `implementation/CONSOLIDATED/` folder is a **point-in-time snapshot** of canonical files assembled from ticket folders. It was created on 2026-03-14 and last substantially updated 2026-03-26.

**It may be behind `compat-plugin/src/`.** The compat-plugin source is always the source of truth for the latest code. The CONSOLIDATED folder is useful for:
- Understanding file provenance (which ticket produced each file) — see `MANIFEST.md`
- The `apply-to-jetpack.sh` script for Jetpack integration
- Reference docs in `CONSOLIDATED/docs/`

---

## Key Rules

1. **Never push to `Automattic/jetpack`** until every gate is passed and the team is ready for final merge
2. **All plugin code changes go in `compat-plugin/`** in this repo
3. **Update Linear after every task** — tickets must reflect current status at all times
4. **Default to Production** — never default to Sandbox in any code or documentation
5. **Frame Jarred/PayPal items as "Andrew to confirm with Jarred"** — not generic suggestions
