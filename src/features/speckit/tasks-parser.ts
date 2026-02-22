import { readFile, writeFile } from "node:fs/promises"

export interface Task {
  id: string
  description: string
  done: boolean
  line: number
}

function isIgnorableLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return true
  if (trimmed.startsWith("#")) return true
  if (trimmed.startsWith("//")) return true
  if (trimmed.startsWith("<!--")) return true
  if (trimmed.startsWith("-->")) return true
  return false
}

function parseTaskLine(line: string): { done: boolean; description: string } | null {
  const match = line.match(/^\s*-\s*\[( |x|X)\]\s*(.+)$/)
  if (!match) return null
  const done = match[1].toLowerCase() === "x"
  const description = match[2].trim()
  return { done, description }
}

function extractId(description: string): string | null {
  const tokens = description.split(/\s+/)
  const token = tokens[0]
  if (token && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9-]+$/.test(token)) {
    return token
  }
  return null
}

/** Reads tasks.md and returns list of tasks with status */
export async function parseTasksFromMarkdown(filePath: string): Promise<Task[]> {
  const content = await readFile(filePath, "utf8")
  const lines = content.split(/\r?\n/)
  const tasks: Task[] = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (isIgnorableLine(line)) continue

    const parsed = parseTaskLine(line)
    if (!parsed) continue

    const id = extractId(parsed.description) ?? String(tasks.length + 1)
    tasks.push({
      id,
      description: parsed.description,
      done: parsed.done,
      line: i + 1,
    })
  }

  return tasks
}

/** Marks task as done: [ ] -> [x] */
export async function markTaskDone(filePath: string, taskId: string): Promise<void> {
  const tasks = await parseTasksFromMarkdown(filePath)
  const target = tasks.find((t) => t.id === taskId)
  if (!target) return

  const content = await readFile(filePath, "utf8")
  const lines = content.split(/\r?\n/)
  const index = target.line - 1
  const original = lines[index]
  if (!original) return

  if (/\[x\]/i.test(original)) return
  lines[index] = original.replace(/\[ \]/, "[x]")
  await writeFile(filePath, lines.join("\n"), "utf8")
}

/** true if all tasks are [x] */
export async function allTasksDone(filePath: string): Promise<boolean> {
  const tasks = await parseTasksFromMarkdown(filePath)
  if (tasks.length === 0) return true
  return tasks.every((t) => t.done)
}

/** "X/Y tasks concluídas" */
export async function getTasksSummary(filePath: string): Promise<string> {
  const tasks = await parseTasksFromMarkdown(filePath)
  const doneCount = tasks.filter((t) => t.done).length
  return `${doneCount}/${tasks.length} tasks concluídas`
}
