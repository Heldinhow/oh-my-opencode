# Quickstart Validation: Align SDD Plan With Speckit Flow

## Preconditions
- Active branch: `001-align-sdd-speckit-flow`.
- Constitution is finalized at `.specify/memory/constitution.md`.
- Feature artifacts exist under `specs/001-align-sdd-speckit-flow/`.

## Scenario 1: Branch Prefix Classification
1. Provide a feature-like request and run branch creation flow.
2. Verify the produced prefix is allowlisted and context-appropriate.
3. Verify resulting branch number uses global sequence.

Expected:
- Branch format is `prefix/NNN-short-name`.
- Prefix is one of `feat|fix|test|docs|chore|refactor|perf|ci`.

## Scenario 2: Low-Confidence Prefix Fallback
1. Provide ambiguous request text lacking clear intent keywords.
2. Run branch creation flow.

Expected:
- Flow requests explicit prefix selection before creating branch.
- No branch is created until a valid prefix is chosen.

## Scenario 3: Legacy Compatibility
1. Use a workspace with an existing legacy branch name `NNN-short-name`.
2. Run feature resolution checks.

Expected:
- Feature directory resolves correctly.
- No forced branch renaming occurs.

## Scenario 4: Start-Work Readiness Parity
1. Prepare a valid feature workspace (`spec.md`, `plan.md`, `tasks.md` present).
2. Execute readiness check behavior for `/start-work` and `/speckit.implement` paths.

Expected:
- Both return equivalent readiness status (`proceed`).

## Scenario 5: Missing Artifact Negative Path
1. Remove or simulate missing `tasks.md`.
2. Execute readiness checks for both entry points.

Expected:
- Both block execution.
- Both provide actionable remediation guidance.

## Verification Commands
```bash
bun run typecheck
bun test
```

## Execution Evidence

- Commit(s): pending
- Targeted test run output: PASS (`bun test src/hooks/start-work/index.test.ts src/agents/tinker/sdd-mode.test.ts src/features/boulder-state/storage.test.ts src/shared/branch-governance/parse-branch-name.test.ts src/shared/branch-governance/next-sequence.test.ts`)
- Full verification output (`bun run typecheck` and `bun test`): `typecheck` PASS, `bun test` FAIL due pre-existing baseline failures in unrelated suites (model fallback/migration snapshots and schema target tests)
