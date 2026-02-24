import type { PluginInput } from "@opencode-ai/plugin"
import {
  readBoulderState,
  writeBoulderState,
  appendSessionId,
  findTinkerPlans,
  getPlanProgress,
  createBoulderState,
  getPlanName,
  clearBoulderState,
} from "../../features/boulder-state"
import { log } from "../../shared/logger"
import { getSessionAgent, updateSessionAgent } from "../../features/claude-code-session-state"
import { access, readdir, readFile, stat } from "node:fs/promises"
import { join } from "node:path"

export const HOOK_NAME = "start-work" as const

const KEYWORD_PATTERN = /\b(ultrawork|ulw)\b/gi

interface StartWorkHookInput {
  sessionID: string
  messageID?: string
}

interface StartWorkHookOutput {
  parts: Array<{ type: string; text?: string }>
}

interface ChecklistSummary {
  total: number
  completed: number
  incomplete: number
}

const SPEC_ROOTS = ["specs", ".specify/specs"] as const
type SpecRoot = (typeof SPEC_ROOTS)[number]

type FeatureDirResolution =
  | {
      kind: "resolved"
      normalizedPlanName: string
      root: SpecRoot
      featureDirName: string
      featureDirRel: string
      featureDirAbs: string
    }
  | {
      kind: "ambiguous"
      normalizedPlanName: string
      root: SpecRoot
      prefix: string
      matches: string[]
    }
  | {
      kind: "not_found"
      normalizedPlanName: string
    }

type ReadinessResult =
  | {
      decision: "proceed"
      featureDirAbs: string
      featureDirRel: string
      tasksFilePath: string
    }
  | {
      decision: "block"
      message: string
    }

function normalizePlanName(planName: string): string {
  return planName.includes("/") ? planName.substring(planName.lastIndexOf("/") + 1) : planName
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const st = await stat(path)
    return st.isDirectory()
  } catch {
    return false
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function resolveFeatureDir(projectRoot: string, planName: string): Promise<FeatureDirResolution> {
  const normalizedPlanName = normalizePlanName(planName)

  const numericPrefixMatch = normalizedPlanName.match(/^([0-9]{3})-/)
  const prefix = numericPrefixMatch?.[1] ?? null

  for (const root of SPEC_ROOTS) {
    const directFeatureDirRel = `${root}/${normalizedPlanName}`
    const directFeatureDirAbs = join(projectRoot, directFeatureDirRel)
    if (await isDirectory(directFeatureDirAbs)) {
      return {
        kind: "resolved",
        normalizedPlanName,
        root,
        featureDirName: normalizedPlanName,
        featureDirRel: directFeatureDirRel,
        featureDirAbs: directFeatureDirAbs,
      }
    }

    if (!prefix) continue

    try {
      const rootAbs = join(projectRoot, root)
      const entries = await readdir(rootAbs, { withFileTypes: true })
      const matches = entries
        .filter((e) => e.isDirectory() && e.name.startsWith(`${prefix}-`))
        .map((e) => e.name)

      if (matches.length === 1) {
        const featureDirName = matches[0]
        const featureDirRel = `${root}/${featureDirName}`
        const featureDirAbs = join(projectRoot, featureDirRel)
        return {
          kind: "resolved",
          normalizedPlanName,
          root,
          featureDirName,
          featureDirRel,
          featureDirAbs,
        }
      }

      if (matches.length > 1) {
        return {
          kind: "ambiguous",
          normalizedPlanName,
          root,
          prefix,
          matches,
        }
      }
    } catch {
      // ignore and continue
    }
  }

  return { kind: "not_found", normalizedPlanName }
}

function readinessBlockedMessage(title: string, detail: string) {
  return `
## Readiness Blocked

${title}${detail}`
}

async function resolveSpecKitReadiness(projectRoot: string, planName: string): Promise<ReadinessResult> {
  const resolution = await resolveFeatureDir(projectRoot, planName)

  if (resolution.kind === "ambiguous") {
    const matchesList = resolution.matches
      .map((m) => `- ${resolution.root}/${m}`)
      .join("\n")
    return {
      decision: "block",
      message: readinessBlockedMessage(
        `Ambiguous feature mapping for plan "${resolution.normalizedPlanName}" (prefix "${resolution.prefix}-").`,
        `\n\n${matchesList}\n\nRename the plan to match the intended feature directory, then retry /start-work.`,
      ),
    }
  }

  if (resolution.kind === "not_found") {
    return {
      decision: "block",
      message: readinessBlockedMessage(
        `No feature directory found for plan "${resolution.normalizedPlanName}" under specs/.`,
        `\n\nRun /speckit.specify first, then retry /start-work.`,
      ),
    }
  }

  const specAbs = join(resolution.featureDirAbs, "spec.md")
  const planAbs = join(resolution.featureDirAbs, "plan.md")
  const tasksAbs = join(resolution.featureDirAbs, "tasks.md")

  if (!(await pathExists(specAbs))) {
    return {
      decision: "block",
      message: readinessBlockedMessage(
        `Missing spec.md for plan "${resolution.normalizedPlanName}".`,
        `\nRun /speckit.specify first, then retry /start-work.`,
      ),
    }
  }

  if (!(await pathExists(planAbs))) {
    return {
      decision: "block",
      message: readinessBlockedMessage(
        `Missing plan.md for plan "${resolution.normalizedPlanName}".`,
        `\nRun /speckit.plan first, then retry /start-work.`,
      ),
    }
  }

  if (!(await pathExists(tasksAbs))) {
    return {
      decision: "block",
      message: readinessBlockedMessage(
        `Missing tasks.md for plan "${resolution.normalizedPlanName}".`,
        `\nRun /speckit.tasks first, then retry /start-work.`,
      ),
    }
  }

  return {
    decision: "proceed",
    featureDirAbs: resolution.featureDirAbs,
    featureDirRel: resolution.featureDirRel,
    tasksFilePath: `${resolution.featureDirRel}/tasks.md`,
  }
}

async function getChecklistSummary(featureDirAbs: string): Promise<ChecklistSummary | null> {
  const checklistRoot = join(featureDirAbs, "checklists")
  try {
    const checklistEntries = await readdir(checklistRoot, { withFileTypes: true })
    const files = checklistEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    if (files.length === 0) return null

    let total = 0
    let completed = 0
    let incomplete = 0

    for (const file of files) {
      const content = await readFile(join(checklistRoot, file.name), "utf8")
      const allMatches = content.match(/^- \[( |x|X)\]/gm) ?? []
      const completeMatches = content.match(/^- \[(x|X)\]/gm) ?? []
      const incompleteMatches = content.match(/^- \[ \]/gm) ?? []

      total += allMatches.length
      completed += completeMatches.length
      incomplete += incompleteMatches.length
    }

    return { total, completed, incomplete }
  } catch {
    return null
  }
}

function extractUserRequestPlanName(promptText: string): string | null {
  const userRequestMatch = promptText.match(/<user-request>\s*([\s\S]*?)\s*<\/user-request>/i)
  if (!userRequestMatch) return null
  
  const rawArg = userRequestMatch[1].trim()
  if (!rawArg) return null
  
  const cleanedArg = rawArg.replace(KEYWORD_PATTERN, "").trim()
  return cleanedArg || null
}

function findPlanByName(plans: string[], requestedName: string): string | null {
  const lowerName = requestedName.toLowerCase()
  
  const exactMatch = plans.find(p => getPlanName(p).toLowerCase() === lowerName)
  if (exactMatch) return exactMatch
  
  const partialMatch = plans.find(p => getPlanName(p).toLowerCase().includes(lowerName))
  return partialMatch || null
}

export function createStartWorkHook(ctx: PluginInput) {
  return {
    "chat.message": async (
      input: StartWorkHookInput,
      output: StartWorkHookOutput
    ): Promise<void> => {
      const parts = output.parts
      const promptText = parts
        ?.filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("\n")
        .trim() || ""

      // Only trigger on actual command execution (contains <session-context> tag)
      // NOT on description text like "Start Invoker work session from Tinker plan"
      const isStartWorkCommand = promptText.includes("<session-context>")

      if (!isStartWorkCommand) {
        return
      }

      log(`[${HOOK_NAME}] Processing start-work command`, {
        sessionID: input.sessionID,
      })

      updateSessionAgent(input.sessionID, "axe") // Always switch: fixes #1298

      const existingState = readBoulderState(ctx.directory)
      const sessionId = input.sessionID
      const timestamp = new Date().toISOString()

      let contextInfo = ""
      
      const explicitPlanName = extractUserRequestPlanName(promptText)
      
      if (explicitPlanName) {
        log(`[${HOOK_NAME}] Explicit plan name requested: ${explicitPlanName}`, {
          sessionID: input.sessionID,
        })
        
        const allPlans = findTinkerPlans(ctx.directory)
        const matchedPlan = findPlanByName(allPlans, explicitPlanName)
        
        if (matchedPlan) {
          const progress = getPlanProgress(matchedPlan)
          
          if (progress.isComplete) {
            contextInfo = `
## Plan Already Complete

The requested plan "${getPlanName(matchedPlan)}" has been completed.
All ${progress.total} tasks are done. Create a new plan with: /plan "your task"`
          } else {
            if (existingState) {
              clearBoulderState(ctx.directory)
            }
            const newState = createBoulderState(matchedPlan, sessionId, "axe")
            const readiness = await resolveSpecKitReadiness(ctx.directory, getPlanName(matchedPlan))
            if (readiness.decision === "block") {
              contextInfo = readiness.message
            } else {
              newState.tasksFilePath = readiness.tasksFilePath
              newState.useSpecKitTasks = true
              newState.readinessDecision = "proceed"

              const checklist = await getChecklistSummary(readiness.featureDirAbs)
              if (checklist && checklist.incomplete > 0) {
                newState.readinessDecision = "block"
                newState.checklistProgress = `${checklist.completed}/${checklist.total}`
                contextInfo = `
## Readiness Checklists Incomplete

Plan: ${getPlanName(matchedPlan)}
Checklist progress: ${checklist.completed}/${checklist.total} complete (${checklist.incomplete} incomplete)

Some checklists are incomplete. Ask the user if they want to proceed anyway.`
              } else {
                writeBoulderState(ctx.directory, newState)
                contextInfo = `
## Auto-Selected Plan

**Plan**: ${getPlanName(matchedPlan)}
**Path**: ${matchedPlan}
**Progress**: ${progress.completed}/${progress.total} tasks
**Session ID**: ${sessionId}
**Started**: ${timestamp}

boulder.json has been created. Read the plan and begin execution.`
              }
            }
          }
        } else {
          const incompletePlans = allPlans.filter(p => !getPlanProgress(p).isComplete)
          if (incompletePlans.length > 0) {
            const planList = incompletePlans.map((p, i) => {
              const prog = getPlanProgress(p)
              return `${i + 1}. [${getPlanName(p)}] - Progress: ${prog.completed}/${prog.total}`
            }).join("\n")
            
            contextInfo = `
## Plan Not Found

Could not find a plan matching "${explicitPlanName}".

Available incomplete plans:
${planList}

Ask the user which plan to work on.`
          } else {
            contextInfo = `
## Plan Not Found

Could not find a plan matching "${explicitPlanName}".
No incomplete plans available. Create a new plan with: /plan "your task"`
          }
        }
      } else if (existingState) {
        const progress = getPlanProgress(existingState.active_plan)
        
        if (!progress.isComplete) {
          appendSessionId(ctx.directory, sessionId)
          if (!existingState.useSpecKitTasks) {
            const readiness = await resolveSpecKitReadiness(ctx.directory, existingState.plan_name)
            if (readiness.decision === "block") {
              contextInfo = readiness.message
            } else {
              const updatedState = {
                ...existingState,
                tasksFilePath: readiness.tasksFilePath,
                useSpecKitTasks: true,
                readinessDecision: "proceed" as "proceed" | "block",
              }
              const checklist = await getChecklistSummary(readiness.featureDirAbs)
              if (checklist && checklist.incomplete > 0) {
                updatedState.readinessDecision = "block"
                updatedState.checklistProgress = `${checklist.completed}/${checklist.total}`
                contextInfo = `
## Readiness Checklists Incomplete

Plan: ${existingState.plan_name}
Checklist progress: ${checklist.completed}/${checklist.total} complete (${checklist.incomplete} incomplete)

Some checklists are incomplete. Ask the user if they want to proceed anyway.`
              } else {
                writeBoulderState(ctx.directory, updatedState)
              }
            }
          }
          if (!contextInfo) {
            contextInfo = `
## Active Work Session Found

**Status**: RESUMING existing work
**Plan**: ${existingState.plan_name}
**Path**: ${existingState.active_plan}
**Progress**: ${progress.completed}/${progress.total} tasks completed
**Sessions**: ${existingState.session_ids.length + 1} (current session appended)
**Started**: ${existingState.started_at}

The current session (${sessionId}) has been added to session_ids.
Read the plan file and continue from the first unchecked task.`
          }
        } else {
          contextInfo = `
## Previous Work Complete

The previous plan (${existingState.plan_name}) has been completed.
Looking for new plans...`
        }
      }

      if ((!existingState && !explicitPlanName) || (existingState && !explicitPlanName && getPlanProgress(existingState.active_plan).isComplete)) {
        const plans = findTinkerPlans(ctx.directory)
        const incompletePlans = plans.filter(p => !getPlanProgress(p).isComplete)
        
        if (plans.length === 0) {
          contextInfo += `

## No Plans Found

No Tinker plan files found at .specify/plans/
Use Tinker to create a work plan first: /plan "your task"`
        } else if (incompletePlans.length === 0) {
          contextInfo += `

## All Plans Complete

All ${plans.length} plan(s) are complete. Create a new plan with: /plan "your task"`
        } else if (incompletePlans.length === 1) {
           const planPath = incompletePlans[0]
           const progress = getPlanProgress(planPath)
           const newState = createBoulderState(planPath, sessionId, "axe")
           const readiness = await resolveSpecKitReadiness(ctx.directory, getPlanName(planPath))
           if (readiness.decision === "block") {
             contextInfo += readiness.message
           } else {
             newState.tasksFilePath = readiness.tasksFilePath
             newState.useSpecKitTasks = true
             newState.readinessDecision = "proceed"
             const checklist = await getChecklistSummary(readiness.featureDirAbs)
             if (checklist && checklist.incomplete > 0) {
               newState.readinessDecision = "block"
               newState.checklistProgress = `${checklist.completed}/${checklist.total}`
               contextInfo += `

## Readiness Checklists Incomplete

Plan: ${getPlanName(planPath)}
Checklist progress: ${checklist.completed}/${checklist.total} complete (${checklist.incomplete} incomplete)

Some checklists are incomplete. Ask the user if they want to proceed anyway.`
            } else {
              writeBoulderState(ctx.directory, newState)

              contextInfo += `

## Auto-Selected Plan

**Plan**: ${getPlanName(planPath)}
**Path**: ${planPath}
**Progress**: ${progress.completed}/${progress.total} tasks
**Session ID**: ${sessionId}
**Started**: ${timestamp}

boulder.json has been created. Read the plan and begin execution.`
            }
          }
        } else {
          const planList = incompletePlans.map((p, i) => {
            const progress = getPlanProgress(p)
            const stat = require("node:fs").statSync(p)
            const modified = new Date(stat.mtimeMs).toISOString()
            return `${i + 1}. [${getPlanName(p)}] - Modified: ${modified} - Progress: ${progress.completed}/${progress.total}`
          }).join("\n")

          contextInfo += `

<system-reminder>
## Multiple Plans Found

Current Time: ${timestamp}
Session ID: ${sessionId}

${planList}

Ask the user which plan to work on. Present the options above and wait for their response.
</system-reminder>`
        }
      }

      const idx = output.parts.findIndex((p) => p.type === "text" && p.text)
      if (idx >= 0 && output.parts[idx].text) {
        output.parts[idx].text = output.parts[idx].text
          .replace(/\$SESSION_ID/g, sessionId)
          .replace(/\$TIMESTAMP/g, timestamp)
        
        output.parts[idx].text += `\n\n---\n${contextInfo}`
      }

      log(`[${HOOK_NAME}] Context injected`, {
        sessionID: input.sessionID,
        hasExistingState: !!existingState,
      })
    },
  }
}
