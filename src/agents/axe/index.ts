export { ATLAS_SYSTEM_PROMPT, getDefaultAxePrompt } from "./default"
export { ATLAS_GPT_SYSTEM_PROMPT, getGptAxePrompt } from "./gpt"
export {
  getCategoryDescription,
  buildAgentSelectionSection,
  buildCategorySection,
  buildSkillsSection,
  buildDecisionMatrix,
} from "./prompt-section-builder"

export { createAxeAgent, getAxePromptSource, getAxePrompt, axePromptMetadata } from "./agent"
export type { AxePromptSource, OrchestratorContext } from "./agent"

export { isGptModel } from "../types"
