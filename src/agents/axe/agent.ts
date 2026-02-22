/**
 * Axe - Master Orchestrator Agent
 *
 * Orchestrates work via task() to complete ALL tasks in a todo list until fully done.
 * You are the conductor of a symphony of specialized agents.
 *
 * Routing:
 * 1. GPT models (openai/*, github-copilot/gpt-*) → gpt.ts (GPT-5.2 optimized)
 * 2. Default (Claude, etc.) → default.ts (Claude-optimized)
 */

import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "../types"
import { isGptModel } from "../types"
import type { AvailableAgent, AvailableSkill, AvailableCategory } from "../dynamic-agent-prompt-builder"
import { buildCategorySkillsDelegationGuide } from "../dynamic-agent-prompt-builder"
import type { CategoryConfig } from "../../config/schema"
import { mergeCategories } from "../../shared/merge-categories"
import { createAgentToolRestrictions } from "../../shared/permission-compat"

import { getDefaultAxePrompt } from "./default"
import { getGptAxePrompt } from "./gpt"
import {
  getCategoryDescription,
  buildAgentSelectionSection,
  buildCategorySection,
  buildSkillsSection,
  buildDecisionMatrix,
} from "./prompt-section-builder"

const MODE: AgentMode = "primary"

export type AxePromptSource = "default" | "gpt"

/**
 * Determines which Axe prompt to use based on model.
 */
export function getAxePromptSource(model?: string): AxePromptSource {
  if (model && isGptModel(model)) {
    return "gpt"
  }
  return "default"
}

export interface OrchestratorContext {
  model?: string
  availableAgents?: AvailableAgent[]
  availableSkills?: AvailableSkill[]
  userCategories?: Record<string, CategoryConfig>
}

/**
 * Gets the appropriate Axe prompt based on model.
 */
export function getAxePrompt(model?: string): string {
  const source = getAxePromptSource(model)

  switch (source) {
    case "gpt":
      return getGptAxePrompt()
    case "default":
    default:
      return getDefaultAxePrompt()
  }
}

function buildDynamicOrchestratorPrompt(ctx?: OrchestratorContext): string {
  const agents = ctx?.availableAgents ?? []
  const skills = ctx?.availableSkills ?? []
  const userCategories = ctx?.userCategories
  const model = ctx?.model

  const allCategories = mergeCategories(userCategories)
  const availableCategories: AvailableCategory[] = Object.entries(allCategories).map(([name]) => ({
    name,
    description: getCategoryDescription(name, userCategories),
  }))

  const categorySection = buildCategorySection(userCategories)
  const agentSection = buildAgentSelectionSection(agents)
  const decisionMatrix = buildDecisionMatrix(agents, userCategories)
  const skillsSection = buildSkillsSection(skills)
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(availableCategories, skills)

  const basePrompt = getAxePrompt(model)

  return basePrompt
    .replace("{CATEGORY_SECTION}", categorySection)
    .replace("{AGENT_SECTION}", agentSection)
    .replace("{DECISION_MATRIX}", decisionMatrix)
    .replace("{SKILLS_SECTION}", skillsSection)
    .replace("{{CATEGORY_SKILLS_DELEGATION_GUIDE}}", categorySkillsGuide)
}

export function createAxeAgent(ctx: OrchestratorContext): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "task",
    "call_omo_agent",
  ])

  const baseConfig = {
    description:
      "Orchestrates work via task() to complete ALL tasks in a todo list until fully done. (Axe - OhMyOpenCode)",
    mode: MODE,
    ...(ctx.model ? { model: ctx.model } : {}),
    temperature: 0.1,
    prompt: buildDynamicOrchestratorPrompt(ctx),
    color: "#10B981",
    ...restrictions,
  }

  return baseConfig as AgentConfig
}
createAxeAgent.mode = MODE

export const axePromptMetadata: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  promptAlias: "Axe",
  triggers: [
    {
      domain: "Todo list orchestration",
      trigger: "Complete ALL tasks in a todo list with verification",
    },
    {
      domain: "Multi-agent coordination",
      trigger: "Parallel task execution across specialized agents",
    },
  ],
  useWhen: [
    "User provides a todo list path (.specify/plans/{name}.md)",
    "Multiple tasks need to be completed in sequence or parallel",
    "Work requires coordination across multiple specialized agents",
  ],
  avoidWhen: [
    "Single simple task that doesn't require orchestration",
    "Tasks that can be handled directly by one agent",
    "When user wants to execute tasks manually",
  ],
  keyTrigger:
    "Todo list path provided OR multiple tasks requiring multi-agent orchestration",
}
