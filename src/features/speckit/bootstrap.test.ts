import { readFile } from "node:fs/promises"
import { describe, expect, test } from "bun:test"
import { resolve, join } from "node:path"
import { tmpdir } from "node:os"
import { mkdtemp } from "node:fs/promises"
import { bootstrapSpecKit } from "./bootstrap"

describe("speckit bootstrap spec template", () => {
  test("Test A: spec-template.md contains '## Clarifications'", async () => {
    const templatePath = resolve(process.cwd(), ".specify/templates/spec-template.md")
    const content = await readFile(templatePath, "utf8")
    expect(content).toContain("## Clarifications")
  })

  test("Test B: bootstrapSpecKit(tempDir) writes spec-template.md with Clarifications", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "speckit-bootstrap-"))
    await bootstrapSpecKit(tempDir)
    const targetPath = join(tempDir, ".specify/templates/spec-template.md")
    const content = await readFile(targetPath, "utf8")
    expect(content).toContain("## Clarifications")
  })
})
