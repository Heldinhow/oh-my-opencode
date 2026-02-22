import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  parseTasksFromMarkdown,
  markTaskDone,
  allTasksDone,
  getTasksSummary,
} from "./tasks-parser"

function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "speckit-tasks-"))
}

describe("tasks-parser", () => {
  test("parse tasks all pending", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(
      file,
      "- [ ] TASK-001 Do thing\n- [ ] TASK-002 Do other",
      "utf8",
    )

    //#when
    const tasks = await parseTasksFromMarkdown(file)

    //#then
    expect(tasks).toHaveLength(2)
    expect(tasks[0].done).toBe(false)
    expect(tasks[0].id).toBe("TASK-001")
  })

  test("parse tasks all done", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [x] TASK-001 Done\n- [X] TASK-002 Done", "utf8")

    //#when
    const tasks = await parseTasksFromMarkdown(file)

    //#then
    expect(tasks.every((t) => t.done)).toBe(true)
  })

  test("parse tasks mixed", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [x] TASK-001 Done\n- [ ] TASK-002 Todo", "utf8")

    //#when
    const tasks = await parseTasksFromMarkdown(file)

    //#then
    expect(tasks[0].done).toBe(true)
    expect(tasks[1].done).toBe(false)
  })

  test("markTaskDone by explicit ID", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [ ] TASK-001 Do thing\n- [ ] TASK-002 Do other", "utf8")

    //#when
    await markTaskDone(file, "TASK-001")

    //#then
    const content = await readFile(file, "utf8")
    expect(content).toContain("- [x] TASK-001")
  })

  test("markTaskDone by index when no ID", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [ ] Do thing\n- [ ] Do other", "utf8")

    //#when
    await markTaskDone(file, "1")

    //#then
    const content = await readFile(file, "utf8")
    expect(content.split("\n")[0]).toContain("[x]")
  })

  test("allTasksDone false with pending", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [ ] TASK-001 Do thing", "utf8")

    //#when
    const result = await allTasksDone(file)

    //#then
    expect(result).toBe(false)
  })

  test("allTasksDone true when all done", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [x] TASK-001 Done", "utf8")

    //#when
    const result = await allTasksDone(file)

    //#then
    expect(result).toBe(true)
  })

  test("getTasksSummary returns progress", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "- [x] TASK-001 Done\n- [ ] TASK-002 Todo\n- [x] TASK-003 Done", "utf8")

    //#when
    const summary = await getTasksSummary(file)

    //#then
    expect(summary).toBe("2/3 tasks concluídas")
  })

  test("does not break with empty file", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(file, "", "utf8")

    //#when
    const tasks = await parseTasksFromMarkdown(file)
    const result = await allTasksDone(file)

    //#then
    expect(tasks).toHaveLength(0)
    expect(result).toBe(true)
  })

  test("ignores headers and blank lines", async () => {
    //#given
    const root = await createTempDir()
    const file = join(root, "tasks.md")
    await writeFile(
      file,
      "# Title\n\n- [ ] TASK-001 Do thing\n\n## Sub\n- [x] TASK-002 Done\n",
      "utf8",
    )

    //#when
    const tasks = await parseTasksFromMarkdown(file)

    //#then
    expect(tasks).toHaveLength(2)
  })
})
