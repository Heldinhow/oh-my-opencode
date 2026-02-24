/**
 * Tinker Auto-Oorchestration
 *
 * Single entrypoint that coordinates the full Speckit flow:
 * constitution -> specify -> clarify (if needed) -> plan -> tasks check
 */

import { ensureConstitution, detectSddBranchPrefix } from "./sdd-mode"
import { evaluateClarifyNeed } from "./interview-mode"
import { getPlanningTransition } from "./plan-generation"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Context for orchestration flow
 */
export interface OrchestrationContext {
  projectRoot: string
  userRequest: string
  specSlug?: string
}

/**
 * Result of orchestration flow
 */
export interface OrchestrationResult {
  success: boolean
  stagesCompleted: string[]
  constitutionCreated?: boolean
  constitutionPath?: string
  branchPrefix?: string
  branchRequiresConfirmation?: boolean
  specPath?: string
  planPath?: string
  clarifyRequired?: boolean
  clarifyReasons?: string[]
  error?: string
}

/**
 * Default slug generator from user request
 */
function generateSlug(request: string): string {
  const words = request
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 4)
  return words.join("-")
}

/**
 * Get next available feature number from specs directory
 */
function resolveSpeckitSpecsRoot(projectRoot: string): string {
  const canonical = join(projectRoot, "specs")
  if (existsSync(canonical)) {
    return canonical
  }

  const legacy = join(projectRoot, ".specify", "specs")
  if (existsSync(legacy)) {
    return legacy
  }

  return canonical
}

function getNextFeatureNumber(specsDir: string): number {
  if (!existsSync(specsDir)) {
    return 1
  }

  const { readdirSync } = require("node:fs")
  let highest = 0

  try {
    const entries = readdirSync(specsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const match = entry.name.match(/^(\d+)-/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > highest) {
          highest = num
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return highest + 1
}

/**
 * Main orchestration function
 * Coordinates the full Speckit flow for free-form Tinker requests
 */
export async function orchestrateSpeckitFlow(
  context: OrchestrationContext
): Promise<OrchestrationResult> {
  const stagesCompleted: string[] = []
  const { projectRoot, userRequest, specSlug } = context

  try {
    // Stage 1: Constitution check
    const constitutionResult = await ensureConstitution(projectRoot)
    stagesCompleted.push("constitution")

    const constitutionCreated = constitutionResult.created

    // Stage 2: Branch prefix detection
    const branchResult = detectSddBranchPrefix(userRequest)
    const branchPrefix = branchResult.prefix
    const branchRequiresConfirmation = branchResult.requiresConfirmation
    stagesCompleted.push("branch-detection")

    // Stage 3: Generate/resolve spec slug
    const slug = specSlug || generateSlug(userRequest)
    const specsRoot = resolveSpeckitSpecsRoot(projectRoot)
    const featureNum = getNextFeatureNumber(specsRoot)
    const paddedNum = String(featureNum).padStart(3, "0")
    const fullSlug = `${paddedNum}-${slug}`
    const specDir = join(specsRoot, fullSlug)
    const specPath = join(specDir, "spec.md")
    stagesCompleted.push("spec-resolution")

    // Stage 4: Check if spec exists and evaluate clarify need
    let clarifyRequired = false
    let clarifyReasons: string[] = []

    if (existsSync(specPath)) {
      const specContent = readFileSync(specPath, "utf-8")
      const evaluation = evaluateClarifyNeed(specContent)
      clarifyRequired = evaluation.required
      clarifyReasons = evaluation.reasons
      stagesCompleted.push("spec-evaluation")
    } else {
      // Spec doesn't exist yet - will be created during specify phase
      stagesCompleted.push("spec-creation-required")
    }

    // Stage 5: Plan generation decision
    const planTransition = clarifyRequired ? "clarify" : "plan"
    stagesCompleted.push(`transition-to-${planTransition}`)

    // Stage 6: Task check
    stagesCompleted.push("task-check")

    return {
      success: true,
      stagesCompleted,
      constitutionCreated,
      constitutionPath: constitutionResult.path,
      branchPrefix,
      branchRequiresConfirmation,
      specPath,
      clarifyRequired,
      clarifyReasons,
    }
  } catch (error) {
    return {
      success: false,
      stagesCompleted,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Determine if we should proceed to plan or clarify
 */
export function shouldProceedToPlan(specContent: string): boolean {
  const evaluation = evaluateClarifyNeed(specContent)
  return !evaluation.required
}

/**
 * Get the canonical SDD sequence for display
 */
export function getSddSequence(): readonly string[] {
  return ["constitution", "specify", "clarify", "plan", "tasks", "start-work"]
}
