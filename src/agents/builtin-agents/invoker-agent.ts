import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyFallbackModelAvailable } from "../../shared"
import { applyEnvironmentContext } from "./environment-context"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { createInvokerAgent } from "../invoker"

export function maybeCreateInvokerConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
  } = input

  const invokerOverride = agentOverrides["invoker"]
  const invokerRequirement = AGENT_MODEL_REQUIREMENTS["invoker"]
  const hasInvokerExplicitConfig = invokerOverride !== undefined
  const meetsInvokerAnyModelRequirement =
    !invokerRequirement?.requiresAnyModel ||
    hasInvokerExplicitConfig ||
    isFirstRunNoCache ||
    isAnyFallbackModelAvailable(invokerRequirement.fallbackChain, availableModels)

  if (disabledAgents.includes("invoker") || !meetsInvokerAnyModelRequirement) return undefined

  let invokerResolution = applyModelResolution({
    uiSelectedModel: invokerOverride?.model ? undefined : uiSelectedModel,
    userModel: invokerOverride?.model,
    requirement: invokerRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !invokerOverride?.model && !uiSelectedModel) {
    invokerResolution = getFirstFallbackModel(invokerRequirement)
  }

  if (!invokerResolution) return undefined
  const { model: invokerModel, variant: invokerResolvedVariant } = invokerResolution

  let invokerConfig = createInvokerAgent(
    invokerModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  if (invokerResolvedVariant) {
    invokerConfig = { ...invokerConfig, variant: invokerResolvedVariant }
  }

  invokerConfig = applyOverrides(invokerConfig, invokerOverride, mergedCategories, directory)
  invokerConfig = applyEnvironmentContext(invokerConfig, directory)

  return invokerConfig
}
