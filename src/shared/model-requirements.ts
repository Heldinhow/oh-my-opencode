export type FallbackEntry = {
  providers: string[]
  model: string
  variant?: string
}

export type ModelRequirement = {
  fallbackChain: FallbackEntry[]
  variant?: string
  requiresModel?: string
  requiresAnyModel?: boolean
  requiresProvider?: string[]
}

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  invoker: {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["google", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["kimi-for-coding", "opencode"], model: "k2p5" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
    requiresAnyModel: true,
  },
  enigma: {
    fallbackChain: [
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.3-codex", variant: "medium" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
    requiresProvider: ["openai", "github-copilot", "opencode"],
  },
  oracle: {
    fallbackChain: [
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  keeper: {
    fallbackChain: [
      { providers: ["zai-coding-plan"], model: "glm-4.7" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-5" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  mirana: {
    fallbackChain: [
      { providers: ["github-copilot"], model: "grok-code-fast-1" },
      { providers: ["anthropic", "opencode"], model: "claude-haiku-4-5" },
      { providers: ["opencode"], model: "gpt-5-nano" },
    ],
  },
  broodmother: {
    fallbackChain: [
      { providers: ["google", "opencode"], model: "gemini-3-flash" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  tinker: {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  rubick: {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  clockwerk: {
    fallbackChain: [
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "medium" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  axe: {
    fallbackChain: [
      { providers: ["kimi-for-coding"], model: "k2p5" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-5" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "medium" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
}

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  "visual-engineering": {
    fallbackChain: [
      { providers: ["google", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["zai-coding-plan"], model: "glm-5" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["kimi-for-coding"], model: "k2p5" },
    ],
  },
  ultrabrain: {
    fallbackChain: [
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.3-codex", variant: "xhigh" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  deep: {
    fallbackChain: [
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.3-codex", variant: "medium" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
    requiresModel: "gpt-5.3-codex",
  },
  artistry: {
    fallbackChain: [
      { providers: ["google", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
    requiresModel: "gemini-3-pro",
  },
  quick: {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-haiku-4-5" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5-nano" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  "unspecified-low": {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-5" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.3-codex", variant: "medium" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  "unspecified-high": {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.3-codex", variant: "high" },
      { providers: ["opencode"], model: "glm-4.7-free" },
    ],
  },
  writing: {
    fallbackChain: [
      { providers: ["kimi-for-coding"], model: "k2p5" },
      { providers: ["google", "opencode"], model: "gemini-3-flash" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-5" },
    ],
  },
}
