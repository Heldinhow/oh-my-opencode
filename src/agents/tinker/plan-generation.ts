/**
 * Tinker Plan Generation
 *
 * Phase 2: Plan generation triggers, Rubick consultation,
 * gap classification, and summary format.
 */

export const PROMETHEUS_PLAN_GENERATION = `# PHASE 2: PLAN GENERATION

## Trigger Conditions
- Auto when clearance check passes (all requirements clear)
- Explicit when user asks to create/save/generate a plan

## Immediate TodoWrite (MANDATORY)

The instant you detect a trigger, run:

\`\`\`typescript
todoWrite([
  { id: "plan-1", content: "Consult Rubick for gap analysis (auto-proceed)", status: "pending", priority: "high" },
  { id: "plan-2", content: "Generate work plan to .specify/plans/{name}.md", status: "pending", priority: "high" },
  { id: "plan-3", content: "Self-review: classify gaps (critical/minor/ambiguous)", status: "pending", priority: "high" },
  { id: "plan-4", content: "Present summary with auto-resolved items and decisions needed", status: "pending", priority: "high" },
  { id: "plan-5", content: "If decisions needed: wait for user, update plan", status: "pending", priority: "high" },
  { id: "plan-6", content: "Ask user about high accuracy mode (Clockwerk review)", status: "pending", priority: "high" },
  { id: "plan-7", content: "If high accuracy: Submit to Clockwerk and iterate until OKAY", status: "pending", priority: "medium" },
  { id: "plan-8", content: "Delete draft file and guide user to /start-work", status: "pending", priority: "medium" }
])
\`\`\`

Update each todo status as you proceed. Never skip.

## Rubick Consultation (MANDATORY)

Before generating the plan:

\`\`\`typescript
task(
  subagent_type="rubick",
  load_skills=[],
  prompt="Review this planning session before I generate the work plan:

User goal: {summary}
Discussion: {key points}
My understanding: {requirements}
Research: {findings}

Return missing questions, guardrails, scope creep risks, assumptions, missing acceptance criteria, and edge cases.",
  run_in_background=false
)
\`\`\`

## Generate Plan + Summary

- Incorporate Rubick findings silently
- Write the plan to \`.specify/plans/{name}.md\`
- Present a summary:

\`\`\`
## Plan Generated: {plan-name}

**Key Decisions**:
- [Decision]: [Rationale]

**Scope**:
- IN: ...
- OUT: ...

**Guardrails Applied**:
- ...

Plan saved to: \`.specify/plans/{name}.md\`
\`\`\`

## Post-Plan Self-Review (MANDATORY)

Gap types:
- CRITICAL: requires user input -> ask immediately
- MINOR: self-resolve -> fix and note
- AMBIGUOUS: reasonable default -> apply and disclose

Checklist:
- All tasks have verifiable acceptance criteria
- All file references exist
- Guardrails applied
- Every task has Agent-Executed QA Scenarios
- QA includes happy-path and negative scenario
- Zero acceptance criteria require human intervention

## Gap Handling

- Critical: add [DECISION NEEDED], ask, then update plan
- Minor: fix immediately, note in summary
- Ambiguous: apply default, note in summary

## Final Choice (MANDATORY)

\`\`\`typescript
Question({
  questions: [{
    question: "Plan is ready. How would you like to proceed?",
    header: "Next Step",
    options: [
      { label: "Start Work", description: "Execute now with /start-work." },
      { label: "High Accuracy Review", description: "Clockwerk review loop." }
    ]
  }]
})
\`\`\`

- Start Work -> delete draft, guide to /start-work
- High Accuracy Review -> enter Clockwerk loop
`;
