import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { existsSync, mkdirSync, rmSync, writeFileSync, writeFileSync as writeJsonSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"
import { createSddGateHook } from "./index"
import type { OhMyOpenCodeConfig } from "../../config"
import type { PluginInput } from "@opencode-ai/plugin"
import { writeBoulderState, clearBoulderState } from "../../features/boulder-state"

describe("sdd-gate hook", () => {
  let testDir: string

  function createMockPluginInput(): PluginInput {
    return {
      directory: testDir,
      client: {},
    } as PluginInput
  }

  function createMockConfig(sddEnabled: boolean): OhMyOpenCodeConfig {
    return {
      sisyphus_agent: {
        sdd_enabled: sddEnabled,
      },
    } as OhMyOpenCodeConfig
  }

  beforeEach(() => {
    testDir = join(tmpdir(), `sdd-gate-test-${randomUUID()}`)
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    // Create .sisyphus directory for specs
    mkdirSync(join(testDir, ".sisyphus"), { recursive: true })
    clearBoulderState(testDir)
  })

  afterEach(() => {
    clearBoulderState(testDir)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe("sdd_enabled: false", () => {
    test("should allow start-work when SDD is disabled (retrocompatible)", async () => {
      // given - SDD disabled
      const config = createMockConfig(false)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work command with plan name
      const output = {
        parts: [{ type: "text", text: "/start-work my-feature-plan" }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })

    test("should allow start-work without plan name when SDD is disabled", async () => {
      // given - SDD disabled
      const config = createMockConfig(false)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work command without plan name
      const output = {
        parts: [{ type: "text", text: "/start-work" }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })
  })

  describe("sdd_enabled: true + spec approved", () => {
    test("should allow start-work when spec is approved", async () => {
      // given - SDD enabled with approved spec
      const planName = "my-feature-plan"
      const specsDir = join(testDir, ".sisyphus", "specs", planName)
      mkdirSync(specsDir, { recursive: true })

      // Write sdd-state.json with approved status
      const sddStatePath = join(specsDir, "sdd-state.json")
      writeJsonSync(sddStatePath, JSON.stringify({ spec_status: "approved" }))

      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work with plan name
      const output = {
        parts: [{ type: "text", text: `/start-work ${planName}` }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })
  })

  describe("sdd_enabled: true + spec not approved", () => {
    test("should block start-work when spec_status is not approved", async () => {
      // given - SDD enabled with pending spec
      const planName = "my-feature-plan"
      const specsDir = join(testDir, ".sisyphus", "specs", planName)
      mkdirSync(specsDir, { recursive: true })

      // Write sdd-state.json with pending status
      const sddStatePath = join(specsDir, "sdd-state.json")
      writeJsonSync(sddStatePath, JSON.stringify({ spec_status: "pending" }))

      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work with plan name
      const output = {
        parts: [{ type: "text", text: `/start-work ${planName}` }],
      }

      // then - should throw error blocking the command
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).rejects.toThrow(/Cannot start work.*spec.*not been approved/i)
    })

    test("should block start-work when spec_status is draft", async () => {
      // given - SDD enabled with draft spec
      const planName = "my-feature-plan"
      const specsDir = join(testDir, ".sisyphus", "specs", planName)
      mkdirSync(specsDir, { recursive: true })

      // Write sdd-state.json with draft status
      const sddStatePath = join(specsDir, "sdd-state.json")
      writeJsonSync(sddStatePath, JSON.stringify({ spec_status: "draft" }))

      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work with plan name
      const output = {
        parts: [{ type: "text", text: `/start-work ${planName}` }],
      }

      // then - should throw error blocking the command
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).rejects.toThrow(/Cannot start work.*spec.*not been approved/i)
    })

    test("should block start-work when spec_status is undefined", async () => {
      // given - SDD enabled with spec but no status
      const planName = "my-feature-plan"
      const specsDir = join(testDir, ".sisyphus", "specs", planName)
      mkdirSync(specsDir, { recursive: true })

      // Write sdd-state.json without spec_status
      const sddStatePath = join(specsDir, "sdd-state.json")
      writeJsonSync(sddStatePath, JSON.stringify({}))

      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work with plan name
      const output = {
        parts: [{ type: "text", text: `/start-work ${planName}` }],
      }

      // then - should throw error blocking the command
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).rejects.toThrow(/Cannot start work.*not been approved/i)
    })
  })

  describe("sdd_enabled: true + no spec", () => {
    test("should allow start-work when no spec exists (retrocompatible)", async () => {
      // given - SDD enabled but no specs directory
      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work with plan name (no spec file)
      const output = {
        parts: [{ type: "text", text: "/start-work my-feature-plan" }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })

    test("should allow start-work when no plan name provided", async () => {
      // given - SDD enabled but no plan name in command
      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work without plan name
      const output = {
        parts: [{ type: "text", text: "/start-work" }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })

    test("should allow start-work when plan exists in boulder state but no spec", async () => {
      // given - SDD enabled with boulder state but no spec file
      const planName = "my-feature-plan"
      const planPath = join(testDir, ".sisyphus", "plans", `${planName}.md`)
      mkdirSync(join(testDir, ".sisyphus", "plans"), { recursive: true })
      writeFileSync(planPath, `# ${planName}\n- [ ] Task 1`)

      // Set up boulder state
      writeBoulderState(testDir, {
        active_plan: planPath,
        started_at: "2026-01-01T10:00:00Z",
        session_ids: [],
        plan_name: planName,
      })

      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - start-work without explicit plan name (uses boulder state)
      const output = {
        parts: [{ type: "text", text: "/start-work" }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })
  })

  describe("non-start-work commands", () => {
    test("should ignore non-start-work messages", async () => {
      // given - SDD enabled but message is not start-work
      const config = createMockConfig(true)
      const hook = createSddGateHook(createMockPluginInput(), config)

      // when - regular message
      const output = {
        parts: [{ type: "text", text: "Just a regular message" }],
      }

      // then - hook resolves (passes)
      await expect(
        hook["chat.message"]({ sessionID: "session-123" }, output)
      ).resolves.toBeUndefined()
    })
  })
})
