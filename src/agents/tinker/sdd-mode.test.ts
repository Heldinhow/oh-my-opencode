import { describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildInterviewModePrompt, evaluateClarifyNeed } from "./interview-mode"
import { getPlanningTransition } from "./plan-generation"
import { SDD_MODE_PROMPT, ensureConstitution, getCanonicalSddSequence, detectSddBranchPrefix } from "./sdd-mode"
import { orchestrateSpeckitFlow, shouldProceedToPlan, getSddSequence } from "./orchestration"

const GOLDEN_PROMETHEUS_TO_TINKER_SEQUENCE = ["constitution", "specify", "clarify", "plan", "tasks", "start-work"] as const

function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "sdd-mode-"))
}

describe("sdd-mode", () => {
  test("buildInterviewModePrompt always includes SDD_MODE_PROMPT", () => {
    //#given
    const prompt = buildInterviewModePrompt()

    //#when / #then
    expect(prompt).toContain(SDD_MODE_PROMPT)
  })

  test("ensureConstitution creates file when missing", async () => {
    //#given
    const root = await createTempDir()

    //#when
    const result = await ensureConstitution(root)

    //#then
    expect(result.created).toBe(true)
    const content = await readFile(result.path, "utf8")
    expect(content).toContain("# Oh My OpenCode Constitution")
  })

  test("ensureConstitution does not overwrite existing file", async () => {
    //#given
    const root = await createTempDir()
    const filePath = join(root, ".specify/memory/constitution.md")
    await mkdir(join(root, ".specify/memory"), { recursive: true })
    await writeFile(filePath, "custom", "utf8")

    //#when
    const result = await ensureConstitution(root)

    //#then
    expect(result.created).toBe(false)
    const content = await readFile(result.path, "utf8")
    expect(content).toBe("custom")
  })

  test("ensureConstitution replaces [DATE] tokens in existing file", async () => {
    //#given
    const root = await createTempDir()
    const filePath = join(root, ".specify/memory/constitution.md")
    await mkdir(join(root, ".specify/memory"), { recursive: true })
    await writeFile(filePath, "custom content\nDate: [DATE]\nMore", "utf8")

    //#when
    const result = await ensureConstitution(root)

    //#then
    expect(result.created).toBe(false)
    const content = await readFile(result.path, "utf8")
    const today = new Date().toISOString().slice(0, 10)
    expect(content).toContain("Date: " + today)
    expect(content).not.toContain("[DATE]")
    expect(content).toContain("custom content")
  })

  test("canonical sequence preserves constitution before specify and plan after clarify", () => {
    //#given
    const sequence = getCanonicalSddSequence()

    //#when
    const constitutionIndex = sequence.indexOf("constitution")
    const specifyIndex = sequence.indexOf("specify")
    const clarifyIndex = sequence.indexOf("clarify")
    const planIndex = sequence.indexOf("plan")

    //#then
    expect(constitutionIndex).toBeLessThan(specifyIndex)
    expect(specifyIndex).toBeLessThan(clarifyIndex)
    expect(clarifyIndex).toBeLessThan(planIndex)
  })

  test("evaluateClarifyNeed requires clarify when unresolved markers exist", () => {
    //#given
    const spec = "Requirement A\n[NEEDS CLARIFICATION: define scope]\nTODO: answer"

    //#when
    const result = evaluateClarifyNeed(spec)

    //#then
    expect(result.required).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(3)
  })

  test("getPlanningTransition returns plan when clarify is not needed", () => {
    //#given
    const spec = "Requirements complete. No unresolved ambiguity remains."

    //#when
    const transition = getPlanningTransition(spec)

    //#then
    expect(transition).toBe("plan")
  })

  test("detectSddBranchPrefix classifies fix requests", () => {
    //#given
    const request = "fix branch creation bug"

    //#when
    const detected = detectSddBranchPrefix(request)

    //#then
    expect(detected.prefix).toBe("fix")
    expect(detected.requiresConfirmation).toBe(false)
  })
})

describe("orchestration", () => {
  test("orchestrateSpeckitFlow creates constitution if missing", async () => {
    //#given
    const root = await createTempDir()

    //#when
    const result = await orchestrateSpeckitFlow({
      projectRoot: root,
      userRequest: "add user authentication",
    })

    //#then
    expect(result.success).toBe(true)
    expect(result.constitutionCreated).toBe(true)
    expect(result.stagesCompleted).toContain("constitution")
  })

  test("orchestrateSpeckitFlow detects branch prefix from request", async () => {
    //#given
    const root = await createTempDir()

    //#when
    const result = await orchestrateSpeckitFlow({
      projectRoot: root,
      userRequest: "fix login bug",
    })

    //#then
    expect(result.success).toBe(true)
    expect(result.branchPrefix).toBe("fix")
  })

  test("shouldProceedToPlan returns false when clarify needed", () => {
    //#given
    const specWithMarker = "Feature: Add auth\n[NEEDS CLARIFICATION: what provider?]"

    //#when
    const shouldPlan = shouldProceedToPlan(specWithMarker)

    //#then
    expect(shouldPlan).toBe(false)
  })

  test("shouldProceedToPlan returns true when no clarify needed", () => {
    //#given
    const cleanSpec = "Feature: Add user authentication\nRequirements: Login, logout, register"

    //#when
    const shouldPlan = shouldProceedToPlan(cleanSpec)

    //#then
    expect(shouldPlan).toBe(true)
  })

  test("getSddSequence returns canonical sequence", () => {
    //#given / #when
    const sequence = getSddSequence()

    //#then
    expect(sequence).toEqual(GOLDEN_PROMETHEUS_TO_TINKER_SEQUENCE)
  })

  test("prometheus parity contract keeps stage sequence identical across tinker modules", () => {
    //#given
    const canonicalSequence = getCanonicalSddSequence()
    const orchestrationSequence = getSddSequence()

    //#when / #then
    expect(canonicalSequence).toEqual(GOLDEN_PROMETHEUS_TO_TINKER_SEQUENCE)
    expect(orchestrationSequence).toEqual(GOLDEN_PROMETHEUS_TO_TINKER_SEQUENCE)
  })

  test("prometheus parity contract keeps start-work as terminal handoff stage", () => {
    //#given
    const sequence = getSddSequence()
    const startWorkIndex = sequence.indexOf("start-work")

    //#when / #then
    expect(startWorkIndex).toBe(sequence.length - 1)
    expect(sequence.filter((stage) => stage === "start-work")).toHaveLength(1)
    expect(sequence.indexOf("plan")).toBeLessThan(startWorkIndex)
  })

  test("shouldProceedToPlan returns false when clarify needed", () => {
    //#given
    const specWithMarker = "Feature: Add auth\n[NEEDS CLARIFICATION: what provider?]"

    //#when
    const shouldPlan = shouldProceedToPlan(specWithMarker)

    //#then
    expect(shouldPlan).toBe(false)
  })

  test("orchestrateSpeckitFlow skips clarify when spec is clean", async () => {
    //#given
    const root = await createTempDir()
    const specsDir = join(root, ".specify", "specs", "002-clean-feature")
    await mkdir(specsDir, { recursive: true })
    await writeFile(join(specsDir, "spec.md"), "Feature: Clean feature\nRequirements: Complete")

    //#when
    const result = await orchestrateSpeckitFlow({
      projectRoot: root,
      userRequest: "clean feature",
    })

    //#then
    expect(result.success).toBe(true)
    expect(result.clarifyRequired).toBe(false)
  })
})
