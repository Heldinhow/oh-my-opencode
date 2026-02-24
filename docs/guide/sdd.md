# Specification-Driven Development (SDD)

Learn how to use SDD to create structured, high-quality specifications before implementing features.

---

## What is SDD?

Specification-Driven Development (SDD) is a disciplined workflow that converts ambiguous requirements into precise, testable specifications before any implementation begins.

### Why SDD?

- Reduces rework by removing ambiguity early.
- Explicit governance: the workflow is driven by a living constitution and clear artifacts.
- Traceable decisions: each requirement, edge case, and assumption is documented.
- Better planning: plans generated from well-defined specs are more accurate.

## The Canonical SDD Workflow (Speckit)

The canonical flow moves through:

Constitution -> Specify -> Clarify -> Plan -> Tasks -> /start-work

To illustrate:

```
CONSTITUTION -> SPECIFY -> CLARIFY -> PLAN -> TASKS -> /start-work
```

Each stage produces concrete artifacts in the specs workspace.

---

## Constitution

Goal: Establish governance, constraints, and success criteria that guide the rest of the workflow.

- Stored under `.specify/memory/constitution.md` (created automatically as part of constitution management).
- Lightweight and focused on guardrails, not feature detail.

---

## Phase 1: SPECIFY

**Goal**: Transform user intent into a detailed specification.

When you describe a feature, Tinker will create a specification at:
`specs/{NNN-feature-slug}/spec.md`

Every specification includes:
- Feature Name
- Problem Statement
- Success Criteria
- Functional Requirements
- Non-Functional Requirements
- Edge Cases
- Dependencies

### Phase 2: CLARIFY

**Goal**: Resolve ambiguities, edge cases, and unknowns.

Tinker will:
- Research codebase patterns
- Ask clarifying questions
- Document assumptions
- Flag conflicts or missing information

### Phase 3: PLAN

**Goal**: Generate an implementation plan from the clarified spec.

The plan describes the sequence of work, verification steps, and acceptance criteria.

The output can be used to drive the next stage.

### Phase 4: TASKS

**Goal**: Break the plan down into executable tasks.

Create `specs/{NNN-feature-slug}/tasks.md` with a checklist.

- Each task should be atomic and executable.
- Include clear verification steps and pass/fail criteria.

--- 

## How SDD Integrates with /start-work

Readiness for starting work is defined by the presence of core artifacts:

- specs/{NNN-feature-slug}/spec.md
- specs/{NNN-feature-slug}/plan.md
- specs/{NNN-feature-slug}/tasks.md

If you've migrated to a new workspace, legacy artifacts under `.specify/specs/` may be used as a fallback, but the canonical per-feature artifacts live in `specs/` and the planning workspace is under `.specify/`. Legacy artifacts under `.specify/specs/` are supported as a fallback.

---

## Enabling SDD

SDD can be enabled by configuring your workspace to follow the Speckit/SDD workflow. Canonical per-feature artifacts live in `specs/`, planning artifacts reside under `.specify/`, and legacy artifacts under `.specify/specs/` are supported as a fallback. Constitution is stored at `.specify/memory/constitution.md`.

 (No specific default behavior is asserted in this document; enablement is environment-specific.)

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|

---

## Examples

### Example 2: Typical SDD Session

```
> I want to add user authentication to my app

[Tinker responds in SPECIFY mode]
I'll create a detailed specification for user authentication...
```

### Example 3: Starting Work

```
> /start-work my-feature

[Starts work after ensuring spec.md, plan.md, and tasks.md exist]
```

---

## Best Practices

1. Be thorough in SPECIFY.
2. Resolve all questions before moving to PLAN.
3. Quantify acceptance criteria in spec.
4. Document edge cases.
5. Review before starting work.

---

## Related Documentation

- Understanding the Orchestration System
- Tinker Planner
- Configuration Guide
