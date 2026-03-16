# Pluginomattic Integration Plan — PayPal Payment Buttons V2

**Created:** 2026-03-14
**Project:** PayPal Payment Buttons V2 (WOOPTP-146 → WOOPTP-167)
**Target release:** Jetpack 15.7 / WordCamp Asia (April 9–11, 2026)
**Linear Project:** PayPal Payment Buttons V2: API Integration

---

## Project State Summary

18 implementation tickets, all code-complete. The work is organized in local ticket folders
(`implementation/WOOPTP-XXX/`) and needs to be consolidated, validated, and submitted as a
PR to the Jetpack monorepo before the Jetpack 15.7 code freeze.

**Test coverage (as designed):**
- 113 PHP unit tests (PHPUnit)
- 41 JS tests (Jest)
- 18 E2E tests (Playwright)
- 172 total

**Known gaps discovered in this survey:**
1. WOOPTP-161 has no PR description or documentation — purpose unclear
2. Multiple test plans are unchecked (WOOPTP-162, 163, 164, 165, 166, 167)
3. `readme.txt` (WOOPTP-155) says "Start in Sandbox mode" — contradicts WOOPTP-163's
   Production-default change and our established Production-default requirement
4. Several tickets have overlapping/superseding implementations (WOOPTP-148 vs 149,
   WOOPTP-149 vs 162) — the canonical final file set needs to be established
5. No consolidated `apply-to-jetpack.sh` that assembles all tickets into a single PR-ready diff

---

## What Pluginomattic Provides

The system at `/Users/andrewwikel/Local Sites/pluginomattic/` is a fully operational
agentic plugin factory. The components we apply to PayPal v2:

| Pluginomattic Component | Where It Lives | How We Apply It |
|---|---|---|
| **Adversarial Council** | `test_adversarial_council.py` pattern | Multi-persona review of code and docs before PR |
| **Quality Gate** | `completion_utils.py` criteria | Pre-PR checklist mapped to our 18-ticket scope |
| **Policy Compliance** | `policy_compliance_checker.py` | Validate docs meet ≥5KB, FAQ, security, troubleshooting requirements |
| **Security Patterns KB** | `knowledge-base/wordpress-escaping-security.md` | Security checklist for code review |
| **Solutions Library** | `docs/solutions/` (54 entries) | Reference for any bugs/patterns we encounter |
| **Doc Generation Pattern** | `backfill_docs.py` logic | Template for filling gaps (e.g., WOOPTP-161 docs) |

**What we do NOT use (tightly coupled to factory internals):**
- `backfill_docs.py` directly — requires `PluginWorkspace` class and factory directory structure
- `workflow_service.py` / `dashboard.py` — designed for net-new generation, not existing plugins

---

## Priorities

### Priority 1 — Adversarial Council Review: Documentation (WOOPTP-155)

**Goal:** Validate the three WOOPTP-155 doc files against multiple reviewer personas before
the PR is submitted. Catch inconsistencies, gaps, and anything that would cause a support
ticket or developer confusion.

**Files under review:**
```
implementation/WOOPTP-155/readme.txt
implementation/WOOPTP-155/rest-api-reference.md
implementation/WOOPTP-155/troubleshooting-guide.md
```

**Council personas and focus:**

| Persona | Focus | Veto Power? |
|---|---|---|
| **Security Auditor** | Credential handling guidance, any text that encourages insecure setups | Yes — block merge if security guidance is wrong |
| **User Advocate** | Installation flow clarity for non-technical merchants | No — flag for improvement |
| **Technical Accuracy** (Rachna's lens) | REST API docs match actual implementation | Yes — block merge if endpoint docs are wrong |
| **Partner Reviewer** (Jarred's lens) | PayPal Developer Dashboard steps are accurate and current | No — flag for follow-up |
| **Consistency Reviewer** | Docs match across all three files; no contradictions with code | No — flag for improvement |

**Known issue to fix in this pass:**
- `readme.txt` step 3e: "Start in **Sandbox** mode for testing, then switch to **Production**
  when ready." — Must be updated. WOOPTP-163 explicitly defaults to Production, and our
  project requirement is Production-default always. This is a concrete blocker.

**Output:** Corrected versions of all three files with council annotations.

---

### Priority 2 — Adversarial Council Review: Core PHP Code

**Goal:** Security + correctness review of the five core PHP classes before PR submission.
Payment gateway code has zero tolerance for credential handling errors.

**Files under review (use latest/most complete version per class):**
```
implementation/WOOPTP-165/class-paypal-oauth.php       ← Latest (token expiry fix)
implementation/WOOPTP-164/class-paypal-rest-controller.php  ← Latest (pre-validation)
implementation/WOOPTP-151/class-paypal-api-client.php  ← Error handling + retry
implementation/WOOPTP-161/class-paypal-payment-buttons.php  ← Consolidated version
implementation/WOOPTP-148/class-paypal-attribute-mapper.php ← Validation
```

**Council personas:**

| Persona | Focus | Veto Power? |
|---|---|---|
| **Security Auditor** | Credential storage, nonce verification, capability checks, input sanitization, PayPal domain whitelist | Yes |
| **Performance Reviewer** | Token caching, retry logic, transient handling | No |
| **Simplicity Advocate** | Over-engineered patterns, dead code paths | No |

**Reference:** Apply `pluginomattic/knowledge-base/wordpress-escaping-security.md` as
the security checklist baseline. Every item must be confirmed present.

**Output:** Security checklist section for the PR description, plus any code issues flagged.

---

### Priority 3 — Resolve WOOPTP-161

**Goal:** WOOPTP-161 has no PR description, no documentation, and no clear purpose — just
four PHP/JSON files. Determine what this ticket represents and document it properly.

**Files present:**
```
implementation/WOOPTP-161/class-paypal-payment-buttons.php
implementation/WOOPTP-161/block.json
implementation/WOOPTP-161/style.scss
implementation/WOOPTP-161/webpack.config.blocks.js
```

**Action:** Read the files, compare against neighboring tickets, determine if this is:
(a) The canonical merged/final version of the plugin entry point, or
(b) A fix ticket that wasn't documented

Apply the `backfill_docs.py` pattern to generate a `PR-DESCRIPTION.md` for this ticket.

**Output:** `implementation/WOOPTP-161/PR-DESCRIPTION.md`

---

### Priority 4 — Quality Gate: Pre-PR Checklist

**Goal:** Run the Pluginomattic completion gate criteria against the full PayPal v2 project
scope before PR submission. Catch anything that would cause the PR to be rejected or
require rework after submission.

**Pluginomattic Gate → PayPal V2 Mapping:**

| Gate | Pluginomattic Requirement | PayPal V2 Equivalent | Status |
|---|---|---|---|
| Brief | `brief.md` | `prd-paypal-payment-buttons-v2.md` | ✅ |
| Architecture | `architecture.md` | PRD §7 + ticket implementations | ✅ |
| User Docs | `USER_GUIDE.md` ≥5KB with FAQ, Security, Troubleshooting | `readme.txt` + `troubleshooting-guide.md` | ⚠️ Needs P1 review |
| Developer Docs | API reference | `rest-api-reference.md` | ⚠️ Needs P1 review |
| PHP Tests | 100% pass rate | 113 PHPUnit tests (WOOPTP-153) | ⚠️ Need to run |
| JS Tests | 100% pass rate | 41 Jest tests (WOOPTP-153) | ⚠️ Need to run |
| E2E Tests | Playwright results JSON exists, 0 failures | 18 specs (WOOPTP-154) | ⚠️ Need to run |
| Security | Adversarial council approval, zero critical issues | Priority 2 above | ❌ Not yet |
| Code Review | Zero critical, zero major issues | Priority 2 above | ❌ Not yet |
| Changelog | `CHANGELOG.md` / `readme.txt` changelog | v0.8.0 in `readme.txt` | ✅ |
| Unchecked test plans | All ticket test plans checked | 6 tickets have unchecked plans | ❌ |

**Unchecked test plans requiring sign-off:**
- WOOPTP-162 (Guided Credential UX) — 11 test points
- WOOPTP-163 (Production default) — 4 test points
- WOOPTP-164 (Token pre-validation) — 6 test points
- WOOPTP-165 (Token expiry check) — 5 test points
- WOOPTP-166 (SVG icon fix) — visual check
- WOOPTP-167 (Script stubs) — Playground test

**Output:** Signed-off checklist document at `implementation/PRE-PR-CHECKLIST.md`

---

### Priority 5 — Consolidate Implementation for PR Submission

**Goal:** All 18 ticket folders contain incremental changes. Before submitting to the Jetpack
monorepo, we need a consolidated, PR-ready diff — not 18 separate patches.

**Action:**
1. Establish the canonical final file for each class (latest ticket version wins):
   - `class-paypal-oauth.php` → WOOPTP-165
   - `class-paypal-rest-controller.php` → WOOPTP-164
   - `class-paypal-api-client.php` → WOOPTP-151
   - `class-paypal-payment-buttons.php` → WOOPTP-161
   - `class-paypal-attribute-mapper.php` → WOOPTP-148
   - `edit.js` → WOOPTP-162 (wizard supersedes WOOPTP-148/149)
   - `deprecated.js`, `index.js`, `save.js` → WOOPTP-152
   - `paypal-button-preview.js` → WOOPTP-156 (brand polish supersedes WOOPTP-150)
   - `block.json` → WOOPTP-161 (consolidated)
   - Styles → WOOPTP-156 (brand polish)
   - Tests → WOOPTP-153 + WOOPTP-154
   - Docs → WOOPTP-155 (after P1 corrections)

2. Produce a single `apply-to-jetpack.sh` or consolidated diff

**Output:** PR-ready file set at `implementation/CONSOLIDATED/`

---

### Priority 6 — Knowledge Base Contribution Back to Pluginomattic

**Goal:** As we work through the above priorities, document learnings back into Pluginomattic's
knowledge base so they compound forward for the next payment gateway integration.

**Planned contributions:**

| Learning | Target File |
|---|---|
| PayPal OAuth 2.0 patterns for WP (token caching, transient + option dual-storage) | `pluginomattic/knowledge-base/paypal-oauth-patterns.md` (NEW) |
| Payment API error mapping patterns (PayPal → WP_Error + user-friendly messages) | `pluginomattic/knowledge-base/payment-api-error-patterns.md` (NEW) |
| Block editor connection wizard pattern (multi-step onboarding for 3rd-party APIs) | `pluginomattic/knowledge-base/block-editor-connection-wizard.md` (NEW) |
| BN code / partner attribution pattern for payment plugins | Extend `pluginomattic/knowledge-base/wordpress-patterns.md` |
| Any bugs resolved during council review | `pluginomattic/docs/solutions/` |

---

## Timeline

| Priority | Target Date | Owner | Dependencies |
|---|---|---|---|
| **P1** — Doc council review + fixes | Mar 14–15 | Andrew + Claude | None — start now |
| **P2** — PHP code council review | Mar 15–16 | Andrew + Claude | P1 complete |
| **P3** — Resolve WOOPTP-161 | Mar 15 | Andrew + Claude | Parallel with P1 |
| **P4** — Quality gate checklist | Mar 17 | Andrew + Claude | P1, P2, P3 done |
| **P5** — Consolidate for PR | Mar 18–21 | Andrew + Claude | P4 signed off |
| **P6** — KB contributions | Mar 21 | Claude | P5 complete |
| E2E Playwright execution | Week of Mar 24 | Andrew | Local WP environment |
| PR submission to Jetpack | Mar 31 | Andrew | All gates passed |
| WordCamp Asia demo-ready | Apr 7 | Andrew | PR merged |

---

## How This Differs From Pluginomattic's Normal Flow

Pluginomattic is designed for **net-new plugin generation**. We're applying its
methodology — not its code — to an **existing implementation**. The key adaptations:

| Pluginomattic Native | Our Adaptation |
|---|---|
| Council runs automatically via `workflow_service.py` | Council applied manually via Claude with defined personas |
| `backfill_docs.py` targets factory directory structure | We use the doc patterns directly, applied to our ticket structure |
| `completion_utils.py` validates factory-format plugins | We map its criteria to our ticket-based structure manually |
| Knowledge base auto-populated from agent runs | We contribute manually after each priority is complete |

---

*This plan is a living document. Update as priorities are completed and new information emerges.*
