# Contract: Start-Work Readiness Parity

## Purpose
Define expected readiness-gating behavior parity between `/start-work` and `/speckit.implement`.

## Inputs
- Active feature workspace context.
- Required artifact paths (`spec.md`, `plan.md`, `tasks.md`).
- Checklist status under feature checklists directory.

## Output
- Deterministic readiness decision:
  - `proceed` when all required conditions pass.
  - `block` with remediation guidance when any required condition fails.

## Rules
1. Both commands MUST evaluate equivalent required artifacts before execution.
2. Missing required artifacts MUST block execution.
3. Incomplete checklists MUST trigger explicit decision handling consistent with configured policy.
4. Failure guidance MUST provide actionable next commands.
5. Readiness outcomes for equivalent workspace states MUST match across both entry points.

## Readiness Guidance Contract
- Missing `tasks.md` remediation SHOULD direct users to `/speckit.tasks`.
- Incomplete checklists SHOULD present a proceed decision prompt before execution continues.

## Failure Behavior
- Missing feature directory: block and direct to specify stage.
- Missing plan: block and direct to plan stage.
- Missing tasks: block and direct to tasks stage.
- Ambiguous feature mapping: block and request branch/workspace disambiguation.

## Acceptance Conditions
- For a prepared workspace, `/start-work` and `/speckit.implement` both return `proceed`.
- For each negative scenario above, both return `block` with equivalent remediation intent.
