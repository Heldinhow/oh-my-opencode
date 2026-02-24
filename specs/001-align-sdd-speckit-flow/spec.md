# Feature Specification: Align SDD Plan With Speckit Flow

**Feature Branch**: `001-align-sdd-speckit-flow`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "precisamos ajustar o comportamento da etapa de SDD (Plan) para seguir o fluxo do speckit"

## Clarifications

### Session 2026-02-23

- Q: Which prefix selection strategy should branch creation use? → A: Detect context and define the prefix automatically.
- Q: Should branch numbering be global or per prefix? → A: Use global numbering across all prefixes.
- Q: How should legacy branches like `001-old-feature` be handled? → A: Support both formats and create new branches in prefixed format.
- Q: Which prefix policy should be adopted? → A: Enforce a conventional allowlist (`feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `perf`, `ci`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Execute canonical SDD flow (Priority: P1)

A planner running SDD can execute a predictable flow that mirrors speckit order: constitution check, specify, plan, and conditional clarify decision.

**Why this priority**: This is the core outcome requested and directly affects planning reliability and user trust.

**Independent Test**: Trigger a new SDD planning session and verify the run enforces constitution presence, runs specify, runs plan, and evaluates whether clarify is required.

**Acceptance Scenarios**:

1. **Given** a new SDD planning request and constitution file already present, **When** the SDD flow starts, **Then** the flow proceeds directly to specify and then plan in the expected order.
2. **Given** a new SDD planning request and constitution file missing, **When** the SDD flow starts, **Then** a constitution file is created before specify runs.
3. **Given** a generated spec with unresolved ambiguities, **When** plan preparation reaches ambiguity checks, **Then** clarify is required before continuing.

---

### User Story 2 - Preserve speckit branch semantics (Priority: P1)

A planner can start a new feature branch using speckit-style numbering and naming as part of plan-phase workflow setup.

**Why this priority**: Branch behavior is a stated requirement and is necessary for predictable feature isolation and discoverability.

**Independent Test**: Start planning for a new feature and verify branch numbering/name selection follows existing branch/spec numbering conventions and checks out the new branch.

**Acceptance Scenarios**:

1. **Given** existing numbered branches for other features, **When** a new SDD planning flow starts, **Then** the next valid feature number is selected for the new short name.
2. **Given** no existing branches/spec directories for a short name, **When** the flow starts, **Then** numbering starts at 1.
3. **Given** a feature request describing bug-fix behavior, **When** branch creation runs, **Then** the branch prefix is context-detected as `fix/` rather than `feat/`.

---

### User Story 3 - Align execution handoff semantics (Priority: P2)

A user invoking `/start-work` gets behavior equivalent in intent and guardrails to `/speckit.implement` so execution begins with the same readiness checks and progression expectations.

**Why this priority**: Consistent handoff semantics reduce confusion and prevent mismatched planning-to-execution behavior.

**Independent Test**: Compare `/start-work` and `/speckit.implement` run outcomes for prerequisites, readiness checks, and execution initiation messaging for the same prepared feature.

**Acceptance Scenarios**:

1. **Given** an approved and ready feature workspace, **When** the user runs `/start-work`, **Then** the command validates readiness and starts execution with equivalent guardrail behavior to `/speckit.implement`.
2. **Given** missing required planning artifacts, **When** the user runs `/start-work`, **Then** execution is blocked with actionable guidance comparable to `/speckit.implement` failure behavior.

---

### Edge Cases

- Constitution file exists but contains unresolved placeholder content; the system must still surface that governance setup is incomplete before relying on it as valid policy.
- Multiple candidate branch numbers exist across remote branches, local branches, and spec directories; the system must select the highest observed number + 1.
- Clarify decision signals conflict (for example, some requirements are explicit while others remain ambiguous); the system must apply a deterministic rule and record the reason for clarify-required vs clarify-skipped.
- `/start-work` is invoked on a branch that does not map to a valid feature workspace; the system must fail with clear recovery instructions.
- A legacy numeric-only branch is used in an active workspace; the system must still resolve the correct feature artifacts without forced branch renaming.
- Context classification proposes a prefix outside the approved allowlist; the system must block branch creation and request a valid prefix.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: SDD plan flow MUST verify the constitution file exists before running specification generation.
- **FR-002**: If the constitution file does not exist, the system MUST create it using the same baseline behavior expected from `/speckit.constitution`.
- **FR-003**: SDD plan flow MUST execute specify behavior equivalent to `/speckit.specify` before plan behavior.
- **FR-004**: SDD plan flow MUST execute plan behavior equivalent to `/speckit.plan` after specify artifacts are available.
- **FR-005**: The system MUST evaluate whether clarify is required and MUST invoke clarify behavior equivalent to `/speckit.clarify` when ambiguity thresholds are met.
- **FR-006**: The clarify decision rule MUST be explicit, deterministic, and auditable from generated planning artifacts or logs.
- **FR-007**: Plan-phase setup MUST support creating and switching to a new numbered feature branch using the same numbering logic used by speckit feature creation.
- **FR-008**: Branch numbering MUST consider remote branches, local branches, and feature specification directories to avoid collisions.
- **FR-012**: Branch creation MUST detect intent from request context and assign a prefix category (for example `feat/`, `fix/`, `test/`) using deterministic classification rules.
- **FR-013**: If context-based classification confidence is insufficient, the flow MUST request explicit prefix selection before creating the branch.
- **FR-014**: Number assignment MUST use one global sequence across all allowed branch prefixes.
- **FR-015**: Branch and feature-directory resolution MUST support both legacy numeric-only branch format and new prefixed branch format.
- **FR-016**: The branch prefix MUST be validated against an approved allowlist containing `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `perf`, and `ci`.
- **FR-009**: `/start-work` MUST enforce readiness and execution-start behavior consistent with `/speckit.implement` for required artifacts and failure guidance.
- **FR-010**: When readiness checks fail, `/start-work` MUST stop execution and provide a remediation path aligned with speckit implementation flow expectations.
- **FR-011**: The end-to-end SDD flow MUST preserve compatibility with existing `.specify` workspace conventions already used by this repository.

### Key Entities *(include if feature involves data)*

- **Flow Stage**: A named step in the lifecycle (constitution, specify, clarify, plan, execute) with defined preconditions and outputs.
- **Feature Workspace**: The branch-scoped planning artifact set for a feature (specification, plan, and readiness artifacts).
- **Clarify Decision Record**: A structured decision outcome indicating whether clarify is required, skipped, or completed and why.
- **Execution Readiness State**: The pass/fail status representing whether `/start-work` can begin execution safely.

### Assumptions

- Existing speckit command behaviors in this repository are the source of truth for equivalence.
- Clarify is only mandatory when ambiguity indicators are present; otherwise the flow may continue without clarify.
- Branch naming uses a context-detected type prefix plus numeric identifier and short-name semantics.
- Existing users rely on `.specify` as canonical workspace and this remains unchanged.
- Existing numeric-only feature branches remain valid and must continue to work without migration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of sampled SDD plan runs, constitution existence is verified before specification generation begins.
- **SC-002**: In 100% of sampled new-feature planning runs, branch creation selects a non-colliding global number derived from all configured branch/spec sources across every allowed prefix category.
- **SC-003**: For at least 95% of ambiguity-containing specs in validation runs, clarify is triggered before planning continues.
- **SC-004**: For 100% of readiness-failure scenarios, `/start-work` halts execution and returns actionable remediation steps rather than partially starting execution.
- **SC-005**: For prepared feature workspaces, `/start-work` and `/speckit.implement` produce equivalent pass/fail readiness outcomes in all validation scenarios.
