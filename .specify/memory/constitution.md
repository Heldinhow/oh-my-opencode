<!--
Sync Impact Report
- Version change: 0.0.0-template -> 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] -> I. Speckit-First SDD Flow
  - [PRINCIPLE_2_NAME] -> II. Deterministic Branch Governance
  - [PRINCIPLE_3_NAME] -> III. Test-First Delivery (Non-Negotiable)
  - [PRINCIPLE_4_NAME] -> IV. Script and Artifact Consistency
  - [PRINCIPLE_5_NAME] -> V. Operational Safety and Backward Compatibility
- Added sections:
  - Additional Constraints
  - Development Workflow & Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ verified compatible (Constitution Check section remains valid)
  - .specify/templates/spec-template.md: ✅ verified compatible (no mandatory structure conflicts)
  - .specify/templates/tasks-template.md: ✅ verified compatible (task-level verification aligned)
  - .specify/templates/commands/: ⚠ pending full sweep in a dedicated docs sync pass
- Deferred TODOs:
  - None
-->

# Oh My OpenCode Constitution

## Core Principles

### I. Speckit-First SDD Flow
All feature work MUST follow Speckit-style SDD sequencing: constitution -> specify ->
clarify (when needed) -> plan -> tasks -> implement. Planning artifacts MUST live in
the repository-defined SDD workspace and be generated before execution starts.
Rationale: this preserves traceability from intent to execution and prevents
implementation drift.

### II. Deterministic Branch Governance
Feature branch creation MUST be deterministic, auditable, and collision-safe.
Branch naming MUST use approved prefixes and globally unique numbering rules defined
by active planning specs. If classifier confidence is low, the workflow MUST request
explicit user confirmation before branch creation.
Rationale: predictable branch semantics reduce merge risk and support automation.

### III. Test-First Delivery (Non-Negotiable)
Implementation work MUST follow RED -> GREEN -> REFACTOR where test infrastructure
exists. New behavior MUST be validated by automated tests, and failing tests MUST be
addressed by fixing code, not deleting assertions.
Rationale: this ensures correctness and lowers regression risk for orchestration code.

### IV. Script and Artifact Consistency
Runtime scripts, prompts, and generated artifacts MUST remain behaviorally consistent.
If two commands claim equivalent outcomes (for example `/start-work` and
`/speckit.implement`), readiness checks and failure guidance MUST be aligned or
explicitly documented as intentional deviations.
Rationale: consistent UX and behavior prevent operator confusion.

### V. Operational Safety and Backward Compatibility
Changes MUST preserve compatibility for supported legacy workflows unless a documented
breaking-change process is approved. Destructive operations MUST require explicit user
intent. Planning and execution flows MUST fail fast with actionable remediation.
Rationale: safe defaults protect active repositories and reduce accidental disruption.

## Additional Constraints

- Package/runtime workflow MUST remain Bun-first for this repository.
- Repository communications, comments, issues, PRs, and commit messages MUST be in
  English.
- Planning and specification files MUST be markdown and remain human-reviewable.
- Any branch-policy automation MUST validate against an explicit allowlist.

## Development Workflow & Quality Gates

1. Constitution gate MUST pass before Phase 0 planning research.
2. Specs MUST be clarified when unresolved ambiguity can change architecture,
   verification, or user behavior.
3. Plans MUST include verifiable outcomes and clear acceptance checks.
4. Execution MUST start only after readiness checks pass.
5. Any high-risk change SHOULD undergo additional review (for example Oracle,
   Rubick, or Clockwerk loops as configured).

## Governance

This constitution is the highest-priority process contract for SDD work in this
repository. Every plan, task list, and implementation review MUST verify compliance.

Amendment policy:
- MAJOR: incompatible principle removals/redefinitions.
- MINOR: new principle/section or materially expanded governance.
- PATCH: wording clarifications with no semantic policy change.

Compliance expectations:
- Each planning cycle MUST record gate outcomes.
- Violations MUST be documented with justification and remediation path.
- Temporary exceptions MUST include an owner and expiration condition.

**Version**: 1.0.0 | **Ratified**: 2026-02-23 | **Last Amended**: 2026-02-23
