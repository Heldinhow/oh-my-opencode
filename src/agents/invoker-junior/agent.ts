/**
 * Invoker-Junior - Focused Task Executor
 *
 * Executes delegated tasks directly without spawning other agents.
 * Category-spawned executor with domain-specific configurations.
 *
 * Routing:
 * 1. GPT models (openai/*, github-copilot/gpt-*) -> gpt.ts (GPT-5.2 optimized)
 * 2. Default (Claude, etc.) -> default.ts (Claude-optimized)
 */

import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode } from "../types"
import { isGptModel } from "../types"
import type { AgentOverrideConfig } from "../../config/schema"
import {
  createAgentToolRestrictions,
  type PermissionValue,
} from "../../shared/permission-compat"

import { buildDefaultInvokerJuniorPrompt } from "./default"
import { buildGptInvokerJuniorPrompt } from "./gpt"

const MODE: AgentMode = "subagent"

// Core tools that Invoker-Junior must NEVER have access to
// Note: call_omo_agent is ALLOWED so subagents can spawn mirana/keeper
const BLOCKED_TOOLS = ["task"]

export const INVOKER_JUNIOR_DEFAULTS = {
  model: "minimax/MiniMax-M2.5",
  temperature: 0.1,
} as const

export type InvokerJuniorPromptSource = "default" | "gpt"

/**
 * Determines which Invoker-Junior prompt to use based on model.
 */
export function getInvokerJuniorPromptSource(model?: string): InvokerJuniorPromptSource {
  if (model && isGptModel(model)) {
    return "gpt"
  }
  return "default"
}

/**
 * Builds the appropriate Invoker-Junior prompt based on model.
 */
export function buildInvokerJuniorPrompt(
  model: string | undefined,
  useTaskSystem: boolean,
  promptAppend?: string
): string {
  const source = getInvokerJuniorPromptSource(model)

  switch (source) {
    case "gpt":
      return buildGptInvokerJuniorPrompt(useTaskSystem, promptAppend)
    case "default":
    default:
      return buildDefaultInvokerJuniorPrompt(useTaskSystem, promptAppend)
  }
}

export function createInvokerJuniorAgentWithOverrides(
  override: AgentOverrideConfig | undefined,
  systemDefaultModel?: string,
  useTaskSystem = false
): AgentConfig {
  if (override?.disable) {
    override = undefined
  }

  const overrideModel = (override as { model?: string } | undefined)?.model
  const model = overrideModel ?? systemDefaultModel ?? INVOKER_JUNIOR_DEFAULTS.model
  const temperature = override?.temperature ?? INVOKER_JUNIOR_DEFAULTS.temperature

  const promptAppend = override?.prompt_append
  const prompt = buildInvokerJuniorPrompt(model, useTaskSystem, promptAppend)

  const baseRestrictions = createAgentToolRestrictions(BLOCKED_TOOLS)

  const userPermission = (override?.permission ?? {}) as Record<string, PermissionValue>
  const basePermission = baseRestrictions.permission
  const merged: Record<string, PermissionValue> = { ...userPermission }
  for (const tool of BLOCKED_TOOLS) {
    merged[tool] = "deny"
  }
  merged.call_omo_agent = "allow"
  const toolsConfig = { permission: { ...merged, ...basePermission } }

  const base: AgentConfig = {
    description: override?.description ??
      "Focused task executor. Same discipline, no delegation. (Invoker-Junior - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature,
    maxTokens: 64000,
    prompt,
    color: override?.color ?? "#20B2AA",
    ...toolsConfig,
  }

  if (override?.top_p !== undefined) {
    base.top_p = override.top_p
  }

  if (isGptModel(model)) {
    return { ...base, reasoningEffort: "medium" } as AgentConfig
  }

  return {
    ...base,
    thinking: { type: "enabled", budgetTokens: 32000 },
  } as AgentConfig
}

createInvokerJuniorAgentWithOverrides.mode = MODE
