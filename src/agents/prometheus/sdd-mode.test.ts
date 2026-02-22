import { describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildInterviewModePrompt } from "./interview-mode"
import { SDD_MODE_PROMPT, ensureConstitution } from "./sdd-mode"

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
})
