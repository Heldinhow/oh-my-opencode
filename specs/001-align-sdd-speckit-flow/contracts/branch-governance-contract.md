# Contract: Branch Governance

## Purpose
Define the externally observable behavior for branch creation, numbering, and validation in SDD/Speckit planning flows.

## Inputs
- Feature request text.
- Existing branch references from local and remote git.
- Existing feature directories under `specs/`.
- Optional explicit prefix override from user.

## Output
- A created branch name in one of these forms:
  - `prefix/NNN-short-name` (new typed format)
  - `NNN-short-name` (legacy supported for resolution only)

## Rules
1. Prefix MUST be one of: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `perf`, `ci`.
2. Number assignment MUST use one global sequence across all prefixes and all sources.
3. Prefix classification MUST be deterministic and auditable from matched signals.
4. If classifier confidence is below threshold, the system MUST request explicit prefix selection.
5. Legacy numeric-only branches MUST continue to resolve to feature artifacts without forced rename.

## Failure Behavior
- Invalid prefix: block creation and return allowlist guidance.
- Number collision or ambiguous mapping: block creation and return resolution guidance.
- Low-confidence classification without user selection: block creation.

## Compatibility Notes
- Spec directories remain numeric (`NNN-short-name`) for backward compatibility even when branch names use typed prefixes.
- Branch validation accepts both `NNN-short-name` and `prefix/NNN-short-name` formats.

## Acceptance Conditions
- For the same repository state and request text, classification and selected number are stable.
- All created branches are unique and conform to approved format.
- Legacy branch workflows remain operable.
