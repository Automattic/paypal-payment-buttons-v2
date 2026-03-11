---
name: paypal-payment-buttons-v2-pr-workflow
description: >
  GitHub PR workflow for the Automattic/paypal-payment-buttons-v2 repository. MANDATORY TRIGGERS: Use this
  skill when opening a pull request, committing code, pushing files, or creating a branch
  for the paypal-payment-buttons-v2 project or the Automattic/paypal-payment-buttons-v2 GitHub repository. This is a project-scoped
  wrapper — always load and follow the general github-pr-workflow skill alongside this one.
---

# paypal-payment-buttons-v2 — GitHub PR Defaults

This is a **project-scoped wrapper** for the general `github-pr-workflow` skill.
Load and follow that skill for the full workflow. This file only supplies the
project-specific constants.

---

## Project Constants

| Parameter | Value |
|---|---|
| `owner` | `Automattic` |
| `repo`  | `paypal-payment-buttons-v2` |
| `base`  | `trunk` |

Substitute these into every `mcp__github__*` call described in `github-pr-workflow`.
