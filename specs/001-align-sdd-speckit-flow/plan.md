# Implementation Plan: Align SDD Plan With Speckit Flow

**Branch**: `001-align-sdd-speckit-flow` | **Date**: 2026-02-23 | **Spec**: `specs/001-align-sdd-speckit-flow/spec.md`
**Input**: Feature specification from `/specs/001-align-sdd-speckit-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Align SDD plan behavior with speckit flow by enforcing constitution pre-checks, running specify/plan/clarify in the correct sequence, introducing typed branch prefixes with deterministic classification, and aligning `/start-work` readiness gating with `/speckit.implement`.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Bun runtime)  
**Primary Dependencies**: `@opencode-ai/plugin`, Bun, Zod, existing speckit bash scripts under `.specify/scripts/bash/`  
**Storage**: File-based markdown/json in repo (`specs/`, `.specify/`)  
**Testing**: `bun test` (existing repository test suite)  
**Target Platform**: OpenCode CLI plugin on macOS/Linux terminal environments
**Project Type**: CLI plugin / agent-orchestration extension  
**Performance Goals**: Planning/setup commands complete in under 3s for local prerequisite checks; no regression in start-work latency  
**Constraints**: Preserve backward compatibility for legacy numeric branches; enforce prefix allowlist; global numbering across prefixes; no destructive git behavior  
**Scale/Scope**: Single feature flow affecting SDD planner prompts, speckit scripts, and start-work readiness checks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1 - Constitution Ratified**: **PASS**. `.specify/memory/constitution.md` is now concrete and versioned.
- **Gate 2 - Constitutional Principles Extractable**: **PASS**. Speckit flow, branch governance, test-first, consistency, and safety principles are explicit.
- **Gate 3 - Amendment/Version Traceability**: **PASS**. Version and dates are present in ISO format.

**Gate Result (Pre-Research)**: PASS. Phase 0 research authorized.

## Project Structure

### Documentation (this feature)

```text
specs/001-align-sdd-speckit-flow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── agents/
├── features/
├── hooks/
├── tools/
└── shared/

specs/
└── 001-align-sdd-speckit-flow/

.specify/
├── scripts/bash/
├── templates/
└── memory/
```

**Structure Decision**: Single TypeScript plugin repository with feature planning artifacts in `specs/` and speckit assets in `.specify/`.

## Phase 0 Research Summary

Research findings are captured in `specs/001-align-sdd-speckit-flow/research.md` and resolve branch-prefix policy, classifier fallback behavior, global numbering, and compatibility constraints.

## Phase 1 Design Outputs

- Data model: `specs/001-align-sdd-speckit-flow/data-model.md`
- Contracts: `specs/001-align-sdd-speckit-flow/contracts/branch-governance-contract.md`, `specs/001-align-sdd-speckit-flow/contracts/start-work-readiness-contract.md`
- Validation guide: `specs/001-align-sdd-speckit-flow/quickstart.md`

## Constitution Check (Post-Design)

- **Flow Conformance**: PASS. Design preserves constitution -> specify -> clarify -> plan sequencing semantics.
- **Branch Governance**: PASS. Contract enforces allowlist, deterministic classification, global numbering, and explicit fallback.
- **Test-First & Verification**: PASS. Quickstart includes automated verification commands and negative-path checks.
- **Backward Compatibility**: PASS. Legacy numeric branch support remains part of the contract.

**Gate Result (Post-Design)**: PASS.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
