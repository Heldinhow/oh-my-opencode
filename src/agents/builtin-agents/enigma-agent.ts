import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyProviderConnected } from "../../shared"
import { createEnigmaAgent } from "../enigma"
import { createEnvContext } from "../env-context"
import { applyCategoryOverride, mergeAgentConfig } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"

export function maybeCreateEnigmaConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  useTaskSystem: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
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

  if (disabledAgents.includes("enigma")) return undefined

  const enigmaOverride = agentOverrides["enigma"]
  const enigmaRequirement = AGENT_MODEL_REQUIREMENTS["enigma"]
  const hasEnigmaExplicitConfig = enigmaOverride !== undefined

  const hasRequiredProvider =
    !enigmaRequirement?.requiresProvider ||
    hasEnigmaExplicitConfig ||
    isFirstRunNoCache ||
    isAnyProviderConnected(enigmaRequirement.requiresProvider, availableModels)

  if (!hasRequiredProvider) return undefined

  let enigmaResolution = applyModelResolution({
    userModel: enigmaOverride?.model,
    requirement: enigmaRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !enigmaOverride?.model) {
    enigmaResolution = getFirstFallbackModel(enigmaRequirement)
  }

  if (!enigmaResolution) return undefined
  const { model: enigmaModel, variant: enigmaResolvedVariant } = enigmaResolution

  let enigmaConfig = createEnigmaAgent(
    enigmaModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  enigmaConfig = { ...enigmaConfig, variant: enigmaResolvedVariant ?? "medium" }

  const hepOverrideCategory = (enigmaOverride as Record<string, unknown> | undefined)?.category as string | undefined
  if (hepOverrideCategory) {
    enigmaConfig = applyCategoryOverride(enigmaConfig, hepOverrideCategory, mergedCategories)
  }

  if (directory && enigmaConfig.prompt) {
    const envContext = createEnvContext()
    enigmaConfig = { ...enigmaConfig, prompt: enigmaConfig.prompt + envContext }
  }

  if (enigmaOverride) {
    enigmaConfig = mergeAgentConfig(enigmaConfig, enigmaOverride, directory)
  }
  return enigmaConfig
}
