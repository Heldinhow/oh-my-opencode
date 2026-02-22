export type FallbackEntry = {
  providers: string[]
  model: string
  variant?: string // Entry-specific variant (e.g., GPT→high, Opus→max)
}

export type ModelRequirement = {
  fallbackChain: FallbackEntry[]
  variant?: string // Default variant (used when entry doesn't specify one)
  requiresModel?: string // If set, only activates when this model is available (fuzzy match)
  requiresAnyModel?: boolean // If true, requires at least ONE model in fallbackChain to be available (or empty availability treated as unavailable)
  requiresProvider?: string[] // If set, only activates when any of these providers is connected
}

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  invoker: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
    requiresAnyModel: true,
  },
  enigma: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
    requiresAnyModel: true,
  },
  oracle: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
   keeper: {
     fallbackChain: [
       { providers: ["opencode"], model: "glm-5-free" },
     ],
   },
  mirana: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  "broodmother": {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  tinker: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  rubick: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  clockwerk: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  axe: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
}

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  "visual-engineering": {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  ultrabrain: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  deep: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  artistry: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  quick: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  "unspecified-low": {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  "unspecified-high": {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
  writing: {
    fallbackChain: [
      { providers: ["opencode"], model: "glm-5-free" },
    ],
  },
}
