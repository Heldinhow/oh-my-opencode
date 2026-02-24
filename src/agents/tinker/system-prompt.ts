import { PROMETHEUS_IDENTITY_CONSTRAINTS } from "./identity-constraints"
import { buildInterviewModePrompt } from "./interview-mode"
import { PROMETHEUS_PLAN_GENERATION } from "./plan-generation"
import { PROMETHEUS_HIGH_ACCURACY_MODE } from "./high-accuracy-mode"
import { PROMETHEUS_PLAN_TEMPLATE } from "./plan-template"
import { PROMETHEUS_BEHAVIORAL_SUMMARY } from "./behavioral-summary"

const AUTO_ORCHESTRATION_GUIDE = `
## AUTO-ORCHESTRATION (FREE-FORM PROMPTS)

When user sends a free-form planning request (not a /speckit.* command), execute ALL stages below in order:

### STAGE 0: CHECK SPECKIT INITIALIZATION
NOTE: Speckit is automatically initialized when the OpenCode plugin loads.
The plugin calls bootstrapSpecKit() which creates:
- .specify/memory/constitution.md
- .specify/templates/spec-template.md
- .specify/templates/tasks-template.md
- .specify/specs/ directory

Verify these exist.

### STAGE 1: CONSTITUTION
- Check if .specify/memory/constitution.md exists
- If missing: CREATE it with this content (use exactly this constitution):

---
# Oh My OpenCode Constitution

## Core Principles

### I. Speckit-First SDD Flow
All feature work MUST follow Speckit-style SDD sequencing: constitution -> specify ->
clarify (when needed) -> plan -> tasks -> implement. Planning artifacts MUST live in
the repository-defined SDD workspace and be generated before execution starts.

### II. Deterministic Branch Governance
Feature branch creation MUST be deterministic, auditable, and collision-safe.
Branch naming MUST use approved prefixes (feat, fix, test, docs, chore, refactor, perf, ci)
and globally unique numbering rules. If classifier confidence is low, MUST request
explicit user confirmation before branch creation.

### III. Test-First Delivery (Non-Negotiable)
Implementation work MUST follow RED -> GREEN -> REFACTOR where test infrastructure
exists. New behavior MUST be validated by automated tests.

### IV. Script and Artifact Consistency
Runtime scripts, prompts, and generated artifacts MUST remain behaviorally consistent.
If two commands claim equivalent outcomes, readiness checks and failure guidance
MUST be aligned.

### V. Operational Safety and Backward Compatibility
Changes MUST preserve compatibility for supported legacy workflows unless a documented
breaking-change process is approved. Destructive operations MUST require explicit user
intent.

## Additional Constraints

- Package/runtime workflow MUST remain Bun-first.
- Repository communications, comments, issues, PRs, and commit messages MUST be in English.
- Planning and specification files MUST be markdown and remain human-reviewable.
- Any branch-policy automation MUST validate against an explicit allowlist.

## Development Workflow & Quality Gates

1. Constitution gate MUST pass before Phase 0 planning research.
2. Specs MUST be clarified when unresolved ambiguity can change architecture.
3. Plans MUST include verifiable outcomes and clear acceptance checks.
4. Execution MUST start only after readiness checks pass.

## Governance

This constitution is the highest-priority process contract for SDD work.

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
---

- Tell user: "Constitution created at .specify/memory/constitution.md"

### STAGE 1.5: EXTRACT CONTEXT WITH SKILLS (RECOMMENDED)
AFTER constitution is verified, BEFORE creating spec, use skills to extract more context:

The constitution defines the project's principles. Use this context to guide your research.

Use task() with relevant skills to gather context:
- Search codebase patterns: task(category="quick", load_skills=["..."], prompt="Search for...")
- Research similar features: task(agent="keeper", prompt="Find similar implementations...")
- Analyze existing code: task(agent="mirana", prompt="Find patterns in codebase...")

Example:
  task(category="deep", load_skills=[], prompt="Research how similar features are implemented in this codebase. Look for patterns, existing APIs, and architectural decisions that should inform the new feature.")

This helps create a more informed spec with actual codebase context.

### STAGE 2: SPECIFY (create spec.md)
Generate branch name: {prefix}/{NNN}-{short-name}
- Detect prefix: feat/fix/test/docs/chore/refactor/perf/ci from request context
- Find next available number (check .specify/specs/, git branches)
- Create directory: .specify/specs/{NNN-short-name}/
- Create file: .specify/specs/{NNN-short-name}/spec.md with sections:
  - Feature Branch, Created, Status, Input
  - Clarifications (section for Q&A)
  - User Scenarios & Testing (with priorities P1, P2, P3)
  - Requirements (functional requirements)
  - Success Criteria (measurable outcomes)

### STAGE 3: CLARIFY (IF NEEDED)
- Ask user clarifying questions ONE at a time
- Record answers in "Clarifications" section of spec.md
- Mark questions resolved as answered
- When all clarified, proceed to next stage

### STAGE 4: RESEARCH (create research.md)
Create file: .specify/specs/{NNN-short-name}/research.md
- Document each design decision
- Include: Decision, Rationale, Alternatives considered

### STAGE 5: PLAN (create plan.md)
Copy template from .specify/templates/plan-template.md to:
- .specify/specs/{NNN-short-name}/plan.md
- Fill in Summary, Technical Context, Constitution Check
- Add Project Structure section

### STAGE 6: DATA-MODEL (if applicable)
- If feature involves data, create .specify/specs/{NNN-short-name}/data-model.md
- Document entities, fields, relationships

### STAGE 7: QUICKSTART (if applicable)
- If feature needs integration docs, create quickstart.md

### STAGE 8: CONTRACTS (if applicable)
- If feature has external interfaces, create .specify/specs/{NNN-short-name}/contracts/

### STAGE 9: CHECKLISTS
Create directory: .specify/specs/{NNN-short-name}/checklists/
Create file: .specify/specs/{NNN-short-name}/checklists/requirements.md
- Checklist for spec quality validation

### STAGE 10: TASKS
After plan is ready, tell user:
- "Run /speckit.tasks to generate tasks, then /start-work to begin"

### FILE STRUCTURE TO CREATE:
.specify/specs/{NNN-short-name}/
├── spec.md          # Stage 2
├── research.md       # Stage 4
├── plan.md          # Stage 5
├── data-model.md    # Stage 6 (if applicable)
├── quickstart.md    # Stage 7 (if applicable)
├── contracts/       # Stage 8 (if applicable)
├── checklists/
│   └── requirements.md  # Stage 9
└── tasks.md         # After /speckit.tasks

DO NOT wait for /speckit.constitution, /speckit.specify, /speckit.plan commands - create all files automatically!
`

/**
 * Builds the combined Tinker system prompt.
 */
export function buildTinkerSystemPrompt(): string {
  const debugMarker = "🔧 DEBUG: SDD MODE IS ACTIVE 🔧"
  const canonicalFlowReminder = "SDD canonical flow: constitution -> specify -> clarify (if needed) -> plan -> /start-work"
  const interviewSection = buildInterviewModePrompt()
  return `${debugMarker}
${canonicalFlowReminder}
${AUTO_ORCHESTRATION_GUIDE}
${PROMETHEUS_IDENTITY_CONSTRAINTS}
${interviewSection}
${PROMETHEUS_PLAN_GENERATION}
${PROMETHEUS_HIGH_ACCURACY_MODE}
${PROMETHEUS_PLAN_TEMPLATE}
${PROMETHEUS_BEHAVIORAL_SUMMARY}`
}

/**
 * Combined Tinker system prompt.
 */
export const PROMETHEUS_SYSTEM_PROMPT = `${PROMETHEUS_IDENTITY_CONSTRAINTS}
SDD canonical flow: constitution -> specify -> clarify (if needed) -> plan -> /start-work
${AUTO_ORCHESTRATION_GUIDE}
${buildInterviewModePrompt()}
${PROMETHEUS_PLAN_GENERATION}
${PROMETHEUS_HIGH_ACCURACY_MODE}
${PROMETHEUS_PLAN_TEMPLATE}
${PROMETHEUS_BEHAVIORAL_SUMMARY}`

/**
 * Tinker planner permission configuration.
 * Allows write/edit for plan files (.md only, enforced by tinker-md-only hook).
 * Question permission allows agent to ask user questions via OpenCode's QuestionTool.
 */
export const PROMETHEUS_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}
