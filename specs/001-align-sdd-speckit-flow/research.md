# Phase 0 Research: Align SDD Plan With Speckit Flow

## Decision 1: Branch Prefix Taxonomy
- Decision: Use an allowlist of `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `perf`, and `ci`.
- Rationale: Matches clarified spec requirements and common branch governance patterns while avoiding uncontrolled taxonomy growth.
- Alternatives considered:
  - Open prefix vocabulary: rejected due to drift and typo risk.
  - Minimal subset (`feat/fix/test` only): rejected because it under-classifies docs/maintenance/CI work.

## Decision 2: Prefix Selection Strategy
- Decision: Classify prefix from request context using deterministic rules; if confidence is low, require explicit user selection before branch creation.
- Rationale: Preserves automation while preventing silent misclassification.
- Alternatives considered:
  - Always prompt user: rejected due to unnecessary friction.
  - Always default to `feat`: rejected because it obscures bugfix/test intent.

## Decision 3: Numbering Strategy
- Decision: Use one global numeric sequence across all prefixes.
- Rationale: Maintains collision safety and simple monotonic ordering across remote branches, local branches, and specs directories.
- Alternatives considered:
  - Per-prefix counters: rejected due to added complexity and duplicate sequence ambiguity.

## Decision 4: Legacy Compatibility
- Decision: Support both legacy numeric branches (`001-name`) and prefixed branches (`fix/001-name`) during resolution.
- Rationale: Avoids disruptive migrations and keeps active workspaces functional.
- Alternatives considered:
  - Force migration of all old branches: rejected due to operational risk.
  - Reject legacy format: rejected because it breaks existing flows.

## Decision 5: Start-Work Parity With Speckit Implement
- Decision: Align `/start-work` with `/speckit.implement` readiness semantics by enforcing equivalent prerequisite and failure-guidance checks.
- Rationale: Prevents diverging execution behavior between two entry points.
- Alternatives considered:
  - Keep current divergence: rejected due to user confusion and inconsistent execution outcomes.

## Decision 6: Clarify Triggering
- Decision: Clarify remains conditional and is required when ambiguity can change architecture, validation, or UX behavior.
- Rationale: Balances planning speed with correctness and reduces rework.
- Alternatives considered:
  - Always run clarify: rejected for unnecessary overhead in well-specified features.
  - Never run clarify: rejected due to high risk of downstream mismatch.
