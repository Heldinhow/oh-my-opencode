import { describe, expect, test, beforeEach, afterEach, spyOn } from "bun:test"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"
import { createStartWorkHook } from "./index"
import {
  readBoulderState,
  writeBoulderState,
  clearBoulderState,
} from "../../features/boulder-state"
import type { BoulderState } from "../../features/boulder-state"
import * as sessionState from "../../features/claude-code-session-state"

describe("start-work hook", () => {
  let testDir: string
  let invokerDir: string

  function writeFeatureArtifacts(
    root: "specs" | ".specify/specs",
    featureName: string,
    files: { spec?: boolean; plan?: boolean; tasks?: boolean } = {},
  ) {
    const { spec = true, plan = true, tasks = true } = files
    const featureDir = join(testDir, ...root.split("/"), featureName)
    mkdirSync(featureDir, { recursive: true })
    if (spec) writeFileSync(join(featureDir, "spec.md"), "# Spec\n")
    if (plan) writeFileSync(join(featureDir, "plan.md"), "# Plan\n")
    if (tasks) writeFileSync(join(featureDir, "tasks.md"), "- [ ] TASK-001\n")
    return featureDir
  }

  function createMockPluginInput() {
    return {
      directory: testDir,
      client: {},
    } as Parameters<typeof createStartWorkHook>[0]
  }

  beforeEach(() => {
    testDir = join(tmpdir(), `start-work-test-${randomUUID()}`)
    invokerDir = join(testDir, ".specify")
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    if (!existsSync(invokerDir)) {
      mkdirSync(invokerDir, { recursive: true })
    }
    clearBoulderState(testDir)
  })

  afterEach(() => {
    clearBoulderState(testDir)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe("chat.message handler", () => {
    test("should ignore non-start-work commands", async () => {
      // given - hook and non-start-work message
      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - output should be unchanged
      expect(output.parts[0].text).toBe("Just a regular message")
    })

    test("should detect start-work command via session-context tag", async () => {
      // given - hook and start-work message
      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: "<session-context>Some context here</session-context>",
          },
        ],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - output should be modified with context info
      expect(output.parts[0].text).toContain("---")
    })

    test("should inject resume info when existing boulder state found", async () => {
      // given - existing boulder state with incomplete plan
      const planPath = join(testDir, "test-plan.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1\n- [x] Task 2")

      const state: BoulderState = {
        active_plan: planPath,
        started_at: "2026-01-02T10:00:00Z",
        session_ids: ["session-1"],
        plan_name: "test-plan",
      }
      writeBoulderState(testDir, state)
      writeFeatureArtifacts("specs", "test-plan")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should show resuming status
      expect(output.parts[0].text).toContain("RESUMING")
      expect(output.parts[0].text).toContain("test-plan")
    })

    test("should replace $SESSION_ID placeholder", async () => {
      // given - hook and message with placeholder
      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: "<session-context>Session: $SESSION_ID</session-context>",
          },
        ],
      }

      // when
      await hook["chat.message"](
        { sessionID: "ses-abc123" },
        output
      )

      // then - placeholder should be replaced
      expect(output.parts[0].text).toContain("ses-abc123")
      expect(output.parts[0].text).not.toContain("$SESSION_ID")
    })

    test("should replace $TIMESTAMP placeholder", async () => {
      // given - hook and message with placeholder
      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: "<session-context>Time: $TIMESTAMP</session-context>",
          },
        ],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - placeholder should be replaced with ISO timestamp
      expect(output.parts[0].text).not.toContain("$TIMESTAMP")
      expect(output.parts[0].text).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })

    test("should auto-select when only one incomplete plan among multiple plans", async () => {
      // given - multiple plans but only one incomplete
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      // Plan 1: complete (all checked)
      const plan1Path = join(plansDir, "plan-complete.md")
      writeFileSync(plan1Path, "# Plan Complete\n- [x] Task 1\n- [x] Task 2")

      // Plan 2: incomplete (has unchecked)
      const plan2Path = join(plansDir, "plan-incomplete.md")
      writeFileSync(plan2Path, "# Plan Incomplete\n- [ ] Task 1\n- [x] Task 2")
      writeFeatureArtifacts("specs", "plan-incomplete")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should auto-select the incomplete plan, not ask user
      expect(output.parts[0].text).toContain("Auto-Selected Plan")
      expect(output.parts[0].text).toContain("plan-incomplete")
      expect(output.parts[0].text).not.toContain("Multiple Plans Found")
    })

    test("should wrap multiple plans message in system-reminder tag", async () => {
      // given - multiple incomplete plans
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const plan1Path = join(plansDir, "plan-a.md")
      writeFileSync(plan1Path, "# Plan A\n- [ ] Task 1")

      const plan2Path = join(plansDir, "plan-b.md")
      writeFileSync(plan2Path, "# Plan B\n- [ ] Task 2")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should use system-reminder tag format
      expect(output.parts[0].text).toContain("<system-reminder>")
      expect(output.parts[0].text).toContain("</system-reminder>")
      expect(output.parts[0].text).toContain("Multiple Plans Found")
    })

    test("should use 'ask user' prompt style for multiple plans", async () => {
      // given - multiple incomplete plans
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const plan1Path = join(plansDir, "plan-x.md")
      writeFileSync(plan1Path, "# Plan X\n- [ ] Task 1")

      const plan2Path = join(plansDir, "plan-y.md")
      writeFileSync(plan2Path, "# Plan Y\n- [ ] Task 2")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should prompt agent to ask user, not ask directly
      expect(output.parts[0].text).toContain("Ask the user")
      expect(output.parts[0].text).not.toContain("Which plan would you like to work on?")
    })

    test("should select explicitly specified plan name from user-request, ignoring existing boulder state", async () => {
      // given - existing boulder state pointing to old plan
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      // Old plan (in boulder state)
      const oldPlanPath = join(plansDir, "old-plan.md")
      writeFileSync(oldPlanPath, "# Old Plan\n- [ ] Old Task 1")

      // New plan (user wants this one)
      const newPlanPath = join(plansDir, "new-plan.md")
      writeFileSync(newPlanPath, "# New Plan\n- [ ] New Task 1")

      writeFeatureArtifacts("specs", "new-plan")

      // Set up stale boulder state pointing to old plan
      const staleState: BoulderState = {
        active_plan: oldPlanPath,
        started_at: "2026-01-01T10:00:00Z",
        session_ids: ["old-session"],
        plan_name: "old-plan",
      }
      writeBoulderState(testDir, staleState)

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: `<session-context>
<user-request>new-plan</user-request>
</session-context>`,
          },
        ],
      }

      // when - user explicitly specifies new-plan
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should select new-plan, NOT resume old-plan
      expect(output.parts[0].text).toContain("new-plan")
      expect(output.parts[0].text).not.toContain("RESUMING")
      expect(output.parts[0].text).not.toContain("old-plan")
    })

    test("should strip ultrawork/ulw keywords from plan name argument", async () => {
      // given - plan with ultrawork keyword in user-request
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "my-feature-plan.md")
      writeFileSync(planPath, "# My Feature Plan\n- [ ] Task 1")
      writeFeatureArtifacts("specs", "my-feature-plan")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: `<session-context>
<user-request>my-feature-plan ultrawork</user-request>
</session-context>`,
          },
        ],
      }

      // when - user specifies plan with ultrawork keyword
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should find plan without ultrawork suffix
      expect(output.parts[0].text).toContain("my-feature-plan")
      expect(output.parts[0].text).toContain("Auto-Selected Plan")
    })

    test("should strip ulw keyword from plan name argument", async () => {
      // given - plan with ulw keyword in user-request
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "api-refactor.md")
      writeFileSync(planPath, "# API Refactor\n- [ ] Task 1")
      writeFeatureArtifacts("specs", "api-refactor")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: `<session-context>
<user-request>api-refactor ulw</user-request>
</session-context>`,
          },
        ],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should find plan without ulw suffix
      expect(output.parts[0].text).toContain("api-refactor")
      expect(output.parts[0].text).toContain("Auto-Selected Plan")
    })

    test("should match plan by partial name", async () => {
      // given - user specifies partial plan name
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "2026-01-15-feature-implementation.md")
      writeFileSync(planPath, "# Feature Implementation\n- [ ] Task 1")
      writeFeatureArtifacts("specs", "2026-01-15-feature-implementation")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [
          {
            type: "text",
            text: `<session-context>
<user-request>feature-implementation</user-request>
</session-context>`,
          },
        ],
      }

      // when
      await hook["chat.message"](
        { sessionID: "session-123" },
        output
      )

      // then - should find plan by partial match
      expect(output.parts[0].text).toContain("2026-01-15-feature-implementation")
      expect(output.parts[0].text).toContain("Auto-Selected Plan")
    })

    test("should resolve spec-kit tasks for prefixed plan name using numeric prefix fallback", async () => {
      const planPath = join(testDir, "prefixed-plan.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      const state: BoulderState = {
        active_plan: planPath,
        started_at: "2026-01-02T10:00:00Z",
        session_ids: ["session-1"],
        plan_name: "fix/001-align-sdd-speckit-flow",
        useSpecKitTasks: false,
      }
      writeBoulderState(testDir, state)

      writeFeatureArtifacts(".specify/specs", "001-align-sdd-speckit-flow", {
        spec: true,
        plan: true,
        tasks: true,
      })

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"](
        { sessionID: "session-123" },
        output,
      )

      const updatedState = readBoulderState(testDir)
      expect(updatedState?.useSpecKitTasks).toBe(true)
      expect(updatedState?.tasksFilePath).toBe(".specify/specs/001-align-sdd-speckit-flow/tasks.md")
    })

    test("should prefer specs/ when both roots exist", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-prefer-specs.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts("specs", "001-prefer-specs")
      writeFeatureArtifacts(".specify/specs", "001-prefer-specs")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"]({ sessionID: "session-123" }, output)

      const updatedState = readBoulderState(testDir)
      expect(updatedState?.useSpecKitTasks).toBe(true)
      expect(updatedState?.tasksFilePath).toBe("specs/001-prefer-specs/tasks.md")
    })

    test("should fallback to .specify/specs/ when specs/ is missing", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-fallback-legacy.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts(".specify/specs", "001-fallback-legacy")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"]({ sessionID: "session-123" }, output)

      const updatedState = readBoulderState(testDir)
      expect(updatedState?.useSpecKitTasks).toBe(true)
      expect(updatedState?.tasksFilePath).toBe(".specify/specs/001-fallback-legacy/tasks.md")
    })

    test("should block readiness when spec.md is missing", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-missing-spec.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts("specs", "001-missing-spec", { spec: false, plan: true, tasks: true })

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"]({ sessionID: "session-123" }, output)

      expect(output.parts[0].text).toContain("Readiness Blocked")
      expect(output.parts[0].text).toContain("Run /speckit.specify")
    })

    test("should block readiness when plan.md is missing", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-missing-plan.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts("specs", "001-missing-plan", { spec: true, plan: false, tasks: true })

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"]({ sessionID: "session-123" }, output)

      expect(output.parts[0].text).toContain("Readiness Blocked")
      expect(output.parts[0].text).toContain("Run /speckit.plan")
    })

    test("should block readiness on ambiguous NNN-* feature mapping", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-ambiguous.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts("specs", "001-alpha")
      writeFeatureArtifacts("specs", "001-beta")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"]({ sessionID: "session-123" }, output)

      expect(output.parts[0].text).toContain("Readiness Blocked")
      expect(output.parts[0].text).toContain("Ambiguous feature mapping")
    })

    test("should block readiness when tasks.md is missing", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-missing-tasks.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts("specs", "001-missing-tasks", { spec: true, plan: true, tasks: false })

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"](
        { sessionID: "session-123" },
        output,
      )

      expect(output.parts[0].text).toContain("Readiness Blocked")
      expect(output.parts[0].text).toContain("Run /speckit.tasks first")
    })

    test("should report incomplete checklist status before execution", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-checklist-incomplete.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      const specDir = writeFeatureArtifacts("specs", "001-checklist-incomplete")
      const checklistDir = join(specDir, "checklists")
      mkdirSync(checklistDir, { recursive: true })
      writeFileSync(join(checklistDir, "requirements.md"), "- [x] Complete\n- [ ] Pending")

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"](
        { sessionID: "session-123" },
        output,
      )

      expect(output.parts[0].text).toContain("Readiness Checklists Incomplete")
      expect(output.parts[0].text).toContain("Some checklists are incomplete")
    })

    test("should align missing tasks remediation with speckit implement intent", async () => {
      const plansDir = join(testDir, ".specify", "plans")
      mkdirSync(plansDir, { recursive: true })

      const planPath = join(plansDir, "001-parity-check.md")
      writeFileSync(planPath, "# Plan\n- [ ] Task 1")

      writeFeatureArtifacts("specs", "001-parity-check", { spec: true, plan: true, tasks: false })

      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      await hook["chat.message"](
        { sessionID: "session-123" },
        output,
      )

      expect(output.parts[0].text).toContain("Run /speckit.tasks first")
      expect(output.parts[0].text).toContain("Readiness Blocked")
    })
  })

  describe("session agent management", () => {
    test("should update session agent to Axe when start-work command is triggered", async () => {
      // given
      const updateSpy = spyOn(sessionState, "updateSessionAgent")
      
      const hook = createStartWorkHook(createMockPluginInput())
      const output = {
        parts: [{ type: "text", text: "<session-context></session-context>" }],
      }

      // when
      await hook["chat.message"](
        { sessionID: "ses-tinker-to-invoker" },
        output
      )

      // then
      expect(updateSpy).toHaveBeenCalledWith("ses-tinker-to-invoker", "axe")
      updateSpy.mockRestore()
    })
  })
})
