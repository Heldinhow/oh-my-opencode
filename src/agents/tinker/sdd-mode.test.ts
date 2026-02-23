import { describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildInterviewModePrompt, evaluateClarifyNeed } from "./interview-mode"
import { getPlanningTransition } from "./plan-generation"
import { SDD_MODE_PROMPT, ensureConstitution, getCanonicalSddSequence, detectSddBranchPrefix } from "./sdd-mode"

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
    expect(content).toContain("# Constitution")
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
