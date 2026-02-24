---
description: "Executable task list for aligning SDD plan flow with Speckit"
---

# Tasks: Align SDD Plan With Speckit Flow

**Input**: Design documents from `/specs/001-align-sdd-speckit-flow/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included (project and constitution require test-first verification for behavior changes).

**Organization**: Tasks are grouped by user story to keep each story independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel (different files, no unmet dependencies)
- **[Story]**: User story label (`US1`, `US2`, `US3`)
- Every task includes explicit file path(s)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare reusable scaffolding and baseline validation for this feature.

- [x] T001 Create feature notes scaffold in `specs/001-align-sdd-speckit-flow/quickstart.md` for execution evidence links
- [x] T002 [P] Add branch-governance utility barrel at `src/shared/branch-governance/index.ts`
- [x] T003 [P] Add branch-governance type definitions in `src/shared/branch-governance/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared branch parsing/classification primitives and script compatibility helpers used by all stories.

**⚠️ CRITICAL**: User story work starts only after this phase completes.

- [x] T004 Implement allowlist constants and confidence threshold in `src/shared/branch-governance/constants.ts`
- [x] T005 [P] Implement branch format parser for legacy and prefixed names in `src/shared/branch-governance/parse-branch-name.ts`
- [x] T006 [P] Implement deterministic prefix classifier in `src/shared/branch-governance/classify-prefix.ts`
- [x] T007 Implement global sequence resolver helper in `src/shared/branch-governance/next-sequence.ts`
- [x] T008 [P] Add unit tests for parser/classifier helpers in `src/shared/branch-governance/parse-branch-name.test.ts`
- [x] T009 [P] Add unit tests for global sequence logic in `src/shared/branch-governance/next-sequence.test.ts`

**Checkpoint**: Shared branch-governance primitives are tested and reusable.

---

## Phase 3: User Story 1 - Execute canonical SDD flow (Priority: P1) 🎯 MVP

**Goal**: Enforce constitution -> specify -> plan ordering with deterministic clarify gating in SDD flow.

**Independent Test**: Run SDD planning entry and verify constitution check/create happens before specify; plan runs after specify; clarify triggers only when ambiguity thresholds are met.

### Tests for User Story 1

- [x] T010 [P] [US1] Add missing-constitution flow test in `src/agents/tinker/sdd-mode.test.ts`
- [x] T011 [P] [US1] Add flow-order test (constitution -> specify -> plan) in `src/agents/tinker/sdd-mode.test.ts`
- [x] T012 [P] [US1] Add clarify-trigger threshold test in `src/agents/tinker/sdd-mode.test.ts`

### Implementation for User Story 1

- [x] T013 [US1] Implement constitution existence/create step in `src/agents/tinker/sdd-mode.ts`
- [x] T014 [US1] Wire explicit specify->plan sequencing in `src/agents/tinker/sdd-mode.ts`
- [x] T015 [US1] Implement deterministic clarify-needed evaluator in `src/agents/tinker/interview-mode.ts`
- [x] T016 [US1] Integrate clarify evaluator into planning transition flow in `src/agents/tinker/plan-generation.ts`
- [x] T017 [US1] Update SDD mode guidance text for canonical sequence in `src/agents/tinker/system-prompt.ts`

**Checkpoint**: SDD flow executes in required order and clarify behavior is deterministic.

---

## Phase 4: User Story 2 - Preserve speckit branch semantics (Priority: P1)

**Goal**: Create typed-prefixed branches with allowlist + global numbering while preserving legacy numeric branch compatibility.

**Independent Test**: Run branch setup with mixed remote/local/spec inputs and verify output uses allowlisted prefix with global non-colliding sequence; legacy numeric branch still resolves feature directory.

### Tests for User Story 2

- [x] T018 [P] [US2] Add prefixed-branch validation tests in `src/features/boulder-state/storage.test.ts`
- [x] T019 [P] [US2] Add prefixed/legacy branch resolution tests in `src/hooks/start-work/index.test.ts`
- [x] T020 [P] [US2] Add parser coverage tests for `feat/001-name` and `001-name` in `src/shared/branch-governance/parse-branch-name.test.ts`

### Implementation for User Story 2

- [x] T021 [US2] Update branch creation to support prefix + global numbering in `.specify/scripts/bash/create-new-feature.sh`
- [x] T022 [US2] Update feature-branch validation and prefix lookup compatibility in `.specify/scripts/bash/common.sh`
- [x] T023 [US2] Update setup-plan branch checks for prefixed format in `.specify/scripts/bash/setup-plan.sh`
- [x] T024 [US2] Update prerequisites branch checks for prefixed format in `.specify/scripts/bash/check-prerequisites.sh`
- [x] T025 [US2] Extend plan name/branch parsing for prefixed format in `src/features/boulder-state/storage.ts`
- [x] T026 [US2] Use shared classifier/parser in SDD branch-creation flow in `src/agents/tinker/sdd-mode.ts`

**Checkpoint**: Branch creation and branch resolution both support new prefixed and legacy formats.

---

## Phase 5: User Story 3 - Align execution handoff semantics (Priority: P2)

**Goal**: Make `/start-work` readiness gating behaviorally equivalent to `/speckit.implement` for required artifacts and failure guidance.

**Independent Test**: For prepared and failure workspaces, `/start-work` returns same proceed/block intent and remediation direction as `/speckit.implement` expectations.

### Tests for User Story 3

- [x] T027 [P] [US3] Add missing-tasks artifact blocking test in `src/hooks/start-work/index.test.ts`
- [x] T028 [P] [US3] Add checklist-incomplete decision test in `src/hooks/start-work/index.test.ts`
- [x] T029 [P] [US3] Add parity test for equivalent readiness outcomes in `src/hooks/start-work/index.test.ts`

### Implementation for User Story 3

- [x] T030 [US3] Add readiness validator for required artifacts in `src/hooks/start-work/start-work-hook.ts`
- [x] T031 [US3] Add checklist scanning/status evaluation in `src/hooks/start-work/start-work-hook.ts`
- [x] T032 [US3] Align failure guidance messaging with speckit implement contract in `src/hooks/start-work/start-work-hook.ts`
- [x] T033 [US3] Persist readiness metadata fields in boulder state type updates at `src/features/boulder-state/types.ts`
- [x] T034 [US3] Sync start-work template guidance with readiness parity behavior in `src/features/builtin-commands/templates/start-work.ts`

**Checkpoint**: `/start-work` and `/speckit.implement` readiness intent is aligned for pass/fail scenarios.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and repository-wide verification.

- [x] T035 [P] Update branch-governance documentation notes in `specs/001-align-sdd-speckit-flow/quickstart.md`
- [x] T036 [P] Update feature contracts if implementation details changed in `specs/001-align-sdd-speckit-flow/contracts/branch-governance-contract.md`
- [x] T037 [P] Update readiness contract examples in `specs/001-align-sdd-speckit-flow/contracts/start-work-readiness-contract.md`
- [x] T038 Run targeted tests for changed suites with `bun test src/agents/tinker/sdd-mode.test.ts src/hooks/start-work/index.test.ts src/features/boulder-state/storage.test.ts`
- [x] T039 Run full verification with `bun run typecheck` and `bun test` (full-suite baseline failures documented)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2; can run parallel to Phase 3 after shared files are coordinated
- **Phase 5 (US3)**: Depends on Phase 2 and should start after US2 branch-resolution changes are available
- **Phase 6 (Polish)**: Depends on completion of US1-US3

### User Story Dependencies

- **US1 (P1)**: Independent after foundational phase
- **US2 (P1)**: Independent after foundational phase, but script updates should land before US3 parity checks
- **US3 (P2)**: Depends on stable branch/workspace resolution from US2

### Within Each User Story

- Test tasks first, then implementation
- Shared-file edits (`src/agents/tinker/sdd-mode.ts`, `src/hooks/start-work/start-work-hook.ts`, `.specify/scripts/bash/common.sh`) remain sequential
- [P] tasks can run in parallel only when they touch separate files

### Parallel Opportunities

- Phase 2 test tasks `T008` and `T009`
- US1 tests `T010`-`T012`
- US2 tests `T018`-`T020`
- US3 tests `T027`-`T029`
- Polish docs tasks `T035`-`T037`

---

## Parallel Example: User Story 2

```bash
# Parallel tests for branch behavior:
Task: "T018 [US2] Add prefixed-branch validation tests in src/features/boulder-state/storage.test.ts"
Task: "T019 [US2] Add prefixed/legacy branch resolution tests in src/hooks/start-work/index.test.ts"

# Parallel script updates that do not share files:
Task: "T023 [US2] Update setup-plan branch checks in .specify/scripts/bash/setup-plan.sh"
Task: "T024 [US2] Update prerequisites branch checks in .specify/scripts/bash/check-prerequisites.sh"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Setup + Foundational
2. Complete US1 and validate canonical SDD flow ordering
3. Validate with focused tests before moving forward

### Incremental Delivery

1. Deliver US1 (flow correctness)
2. Deliver US2 (branch governance)
3. Deliver US3 (start-work parity)
4. Run final polish and full verification

### Team Parallel Strategy

1. One engineer completes foundational branch-governance primitives
2. Engineer A handles US1 (Tinker flow)
3. Engineer B handles US2 (scripts + branch parsing)
4. Engineer C handles US3 (start-work parity) after US2 parser changes are merged

---

## Notes

- All task lines follow strict checklist format with IDs and file paths
- Story labels are only used for user-story phases
- Legacy compatibility is required throughout implementation
- Global numbering and allowlist enforcement are mandatory acceptance points
