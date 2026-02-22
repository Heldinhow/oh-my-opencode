# Specification-Driven Development (SDD)

Learn how to use SDD to create structured, high-quality specifications before implementing features.

---

## What is SDD?

**Specification-Driven Development (SDD)** is a structured three-phase workflow that transforms ambiguous requirements into precise, actionable specifications before any implementation begins.

### Why SDD?

- **Reduces Rework**: Ambiguity at the specification stage compounds into bugs later. Investing time upfront saves debugging time.
- **Explicit Approval**: No implementation begins until you explicitly approve the specification.
- **Traceable Decisions**: Every requirement, edge case, and assumption is documented.
- **Better Planning**: Plans generated from approved specs are more accurate and complete.

### The SDD Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐     ┌────────────┐
│  SPECIFY    │ ──▶ │  CLARIFY    │ ──▶ │  APPROVE    │ ──▶ │  PLAN   │ ──▶ │ /start-work│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────┘     └────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
 Transform          Resolve            Lock spec,          Generate          Execute
 requirements       ambiguities        establish          work plan         with
 into detailed      and edge           baseline            from              orchestrator
 specs              cases                                 approved spec
```

---

## Enabling SDD

SDD is disabled by default. To enable it, add the following to your configuration:

```jsonc
// ~/.config/opencode/oh-my-opencode.jsonc
{
  "sisyphus_agent": {
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|

---

## The Three Phases

### Phase 1: SPECIFY

**Goal**: Transform user intent into detailed, unambiguous specifications.

When you describe a feature you want to build, Prometheus (the planner) will create a detailed specification file at `.specify/specs/{feature-name}/spec.md`.

Every specification includes:

| Section | Purpose |
|---------|---------|
| **Feature Name** | Clear identifier |
| **Problem Statement** | Why this feature matters |
| **Success Criteria** | How we know it's done |
| **Functional Requirements** | What the feature does |
| **Non-Functional Requirements** | Quality attributes (performance, security, etc.) |
| **Edge Cases** | Boundary conditions and failure modes |
| **Dependencies** | External requirements |

### Phase 2: CLARIFY

**Goal**: Resolve ambiguities, edge cases, and unknown unknowns.

Prometheus will:
- Research your codebase to understand existing patterns
- Ask clarifying questions about requirements
- Document assumptions explicitly
- Flag conflicts or missing information

### Phase 3: APPROVE

**Goal**: Lock the specification and establish a baseline.

Before presenting for approval, Prometheus verifies:
- All requirements have acceptance criteria
- All acceptance criteria are verifiable
- Edge cases are documented
- No open questions remain (or explicitly deferred)
- Dependencies are confirmed

You can then:
- **Approve** - Proceed to plan generation and implementation
- **Request Changes** - Go back to SPECIFY or CLARIFY
- **Defer** - Save the spec for later

---

## How SDD Integrates with /start-work

When SDD is enabled, the `/start-work` command is gated:

1. **Without an approved spec**, `/start-work` is blocked with an error
2. **Only after spec approval** can you proceed to plan generation and execution

This ensures no implementation begins without explicit specification approval.

---

## SDD State File

Each plan has a state file at `.specify/specs/{plan-name}/sdd-state.json`:

```json
{
  "spec_status": "approved",
  "spec_version": "1.0.0",
  "approved_at": "2025-02-21T10:30:00Z",
  "approved_by": "user"
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `draft` | Specification is being created |
| `clarifying` | Resolving ambiguities and questions |
| `pending_approval` | Ready for user review |
| `approved` | Specification locked, can proceed to /start-work |
| `changes_requested` | User requested modifications |
| `deferred` | Saved for later |

---

## Examples

### Example 1: Enabling SDD

```jsonc
// ~/.config/opencode/oh-my-opencode.jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "sisyphus_agent": {
    "model": "anthropic/claude-opus-4-6"
  }
}
```

### Example 2: Typical SDD Session

```
> I want to add user authentication to my app

[Prometheus responds in SPECIFY mode]
I'll create a detailed specification for user authentication. Let me first explore your codebase to understand existing patterns, then create a comprehensive spec covering:

1. Login flow (email/password, OAuth)
2. Registration flow
3. Password reset
4. Session management
5. Security requirements

I'll ask clarifying questions about:
- Which OAuth providers do you want to support?
- Do you have existing user database schema?
- What authentication library do you prefer?

[You answer questions]

[Prometheus moves to APPROVE]
Here's the complete specification. Do you approve to proceed with implementation?
```

### Example 3: Blocked /start-work

When SDD is enabled and spec is not approved:

```
> /start-work my-feature

[Error]
Cannot start work: SDD spec for plan "my-feature" has not been approved.
Current status: "draft". Please approve the specification before starting work.
```

---

## Best Practices

1. **Be Thorough in SPECIFY**: Spend time on requirements. It's easier to change a spec than code.
2. **Resolve All Questions**: Don't proceed to APPROVE with open questions unless explicitly deferred.
3. **Quantify Acceptance Criteria**: Instead of "fast", specify "<500ms response time".
4. **Document Edge Cases**: Handle failure modes upfront.
5. **Review Before Approving**: Take time to review the specification carefully.

---

## Related Documentation

- [Understanding the Orchestration System](./understanding-orchestration-system.md) - Deep dive into Prometheus → Orchestrator workflow
- [Prometheus Planner](../features.md#prometheus) - More about the planner agent
- [Configuration Guide](../configurations.md) - Full configuration reference
