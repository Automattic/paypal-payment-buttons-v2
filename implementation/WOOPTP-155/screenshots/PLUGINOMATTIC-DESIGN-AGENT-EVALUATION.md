# Pluginomattic Design Agent — Evaluation for PayPal Payment Buttons V2

**Date:** 2026-03-15
**Question:** Would the Pluginomattic design agent improve UX for this plugin?

---

## What Pluginomattic Has Today

| Capability | Status | Relevance to Our Plugin |
|------------|--------|------------------------|
| **Onboarding Designer Agent** | Planned in architecture, not implemented | High — would directly apply to our wizard flow |
| **Admin UI Guidelines KB** | Exists (`wordpress-admin-ui-guidelines.md`) | Medium — our block uses block editor, not admin pages |
| **Adversarial Council "User Advocate"** | Exists as persona, not UX-specialized | Medium — we already ran council reviews |
| **Playwright Test Generation** | Exists, tests behavior not visuals | Low — we already have E2E tests |
| **Dashboard Design Brief** | Exists as template | Low — for Pluginomattic's own dashboard, not plugins |
| **Visual Testing / Screenshots** | Does not exist | High — gap we're addressing now |
| **UX Heuristic Evaluation** | Does not exist | High — would catch usability issues |
| **Figma Integration** | Does not exist | Medium — no mockups were created for this project |
| **Accessibility Audit** | Basic keyword detection only | Medium — we did WCAG 2.1 work in WOOPTP-156 |

---

## Assessment: Should We Use It?

**Short answer: Not for this release. But it would benefit future feature work (WOOPTP-166+).**

### Why Not Now

1. **No design agent code exists** — It's planned in the architecture doc but never implemented. There's nothing to run.
2. **Our UX is already built and tested** — The wizard (WOOPTP-162), brand compliance (WOOPTP-156), and frontend parity (WOOPTP-161) are done, council-reviewed, and manually verified.
3. **Time to ship** — PR deadline is March 31. Implementing a design agent to review already-completed work doesn't accelerate shipping.
4. **The existing council already covered UX** — The "User Advocate" and "Consistency Reviewer" personas in our P1/P2 adversarial council review caught UX issues (sandbox-default contradiction, error message clarity, etc.).

### Where It Would Help — Future Features

The backlog has several features that would benefit from UX design before implementation:

| Feature | Why Design Agent Would Help |
|---------|---------------------------|
| **WOOPTP-166 — Admin Dashboard** | New admin page with table/list view — needs layout, pagination, empty states. This is exactly what the admin UI guidelines KB covers. |
| **WOOPTP-167 — Detail View** | Resource detail page — needs information hierarchy, action buttons, status display. |
| **WOOPTP-174 — Product Variants** | Complex UI for size/color options with per-option pricing — high UX complexity, easy to get wrong. |
| **WOOPTP-170 — Adjustable Quantity** | Quantity selector UX in checkout context — needs to feel native to both WordPress and PayPal. |
| **WOOPTP-175 — Copy/Share Actions** | Quick-share UI pattern — clipboard, social sharing, QR code integration. Needs careful information architecture. |

### Recommendation: Build the Design Agent for Phase 2

Rather than using Pluginomattic's (non-existent) design agent now, we should:

1. **Ship v0.8.0 as-is** — the UX has been reviewed, tested, and is solid for launch
2. **Implement the Onboarding Designer Agent in Pluginomattic** using our wizard as a reference implementation. Our `block-editor-connection-wizard.md` KB contribution already documents the patterns.
3. **Add a UX Specialist persona to the adversarial council** — the current "User Advocate" is too generic. A dedicated UX persona would evaluate:
   - Task completion rates (can a non-technical user complete the flow?)
   - Error recovery paths (what happens when things go wrong?)
   - Information hierarchy (is the most important info most visible?)
   - Cognitive load (how many decisions per screen?)
   - Consistency with platform conventions (WordPress, Gutenberg, PayPal)
4. **Use the design agent for WOOPTP-166** (admin dashboard) as the first real test case — that feature has genuine UX design needs.

---

## Gaps to Address in Pluginomattic

If we want Pluginomattic to be useful for UX on payment plugins, these are the gaps:

| Gap | Priority | Effort |
|-----|----------|--------|
| Implement Design Agent (basic version) | High | Medium — follow `BaseAgent` pattern, add heuristic evaluation |
| Add UX Specialist to adversarial council | High | Low — add persona definition to council config |
| Visual regression testing (screenshot comparison) | Medium | Medium — integrate Percy or Playwright visual comparisons |
| Accessibility audit integration (axe-core) | Medium | Low — add axe-core to Playwright E2E runs |
| Design token system for WordPress blocks | Low | High — would need Figma API integration |

---

## What We're Doing Instead Right Now

1. **Screenshot automation** — Playwright script captures the 5 WordPress.org screenshots automatically
2. **UX expert review** — Running a dedicated UX review of the wizard, button creation, and frontend rendering (in progress)
3. **P6 KB contributions** — Already contributed the wizard pattern, error patterns, and OAuth patterns back to Pluginomattic's knowledge base so future plugins benefit
