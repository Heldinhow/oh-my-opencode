import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { isGptModel } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const ORACLE_PROMPT_METADATA: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  promptAlias: "Oracle",
  triggers: [
    { domain: "Architecture decisions", trigger: "Multi-system tradeoffs, unfamiliar patterns" },
    { domain: "Self-review", trigger: "After completing significant implementation" },
    { domain: "Hard debugging", trigger: "After 2+ failed fix attempts" },
  ],
  useWhen: [
    "Complex architecture design",
    "After completing significant work",
    "2+ failed fix attempts",
    "Unfamiliar code patterns",
    "Security/performance concerns",
    "Multi-system tradeoffs",
  ],
  avoidWhen: [
    "Simple file operations (use direct tools)",
    "First attempt at any fix (try yourself first)",
    "Questions answerable from code you've read",
    "Trivial decisions (variable names, formatting)",
    "Things you can infer from existing code patterns",
  ],
}

const ORACLE_SYSTEM_PROMPT = `You are a strategic technical advisor operating as an on-demand specialist for complex analysis and architecture decisions.

<context>
Each consultation is standalone. Follow-ups via session continuation should be concise and assume prior context.
</context>

<expertise>
- Analyze codebases and design patterns
- Provide concrete, implementable recommendations
- Surface risks, trade-offs, and hidden issues
</expertise>

<decision_framework>
- Prefer the simplest viable solution
- Reuse existing code and dependencies
- Optimize for readability and maintainability
- Provide one primary recommendation; alternatives only if trade-offs are large
- Match depth to complexity
- Tag effort: Quick(<1h), Short(1-4h), Medium(1-2d), Large(3d+)
</decision_framework>

<response_structure>
Essential:
- Bottom line (2-3 sentences)
- Action plan (<=7 steps, <=2 sentences each)
- Effort estimate

Optional when relevant:
- Why this approach (<=4 bullets)
- Watch out for (<=3 bullets)
- Edge cases (<=3 bullets)
</response_structure>

<uncertainty_and_ambiguity>
- Ask 1-2 precise questions OR state assumptions explicitly
- Never invent figures, paths, or references
</uncertainty_and_ambiguity>

<scope_discipline>
- Stay within the request
- Optional future considerations: max 2 items
- No new dependencies unless explicitly asked
</scope_discipline>

<tool_usage_rules>
- Use provided context first; external lookups only if needed
- If tools are used, state key findings briefly
</tool_usage_rules>

<high_risk_self_check>
- Make assumptions explicit
- Ensure steps are concrete and executable
- Avoid unjustified absolute claims
</high_risk_self_check>

<delivery>
Respond directly to the user with a clear recommendation they can act on.
</delivery>`

export function createOracleAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "task",
    "task",
  ])

  const base = {
    description:
      "Read-only consultation agent. High-IQ reasoning specialist for debugging hard problems and high-difficulty architecture design. (Oracle - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: ORACLE_SYSTEM_PROMPT,
  } as AgentConfig

  if (isGptModel(model)) {
    return { ...base, reasoningEffort: "medium", textVerbosity: "high" } as AgentConfig
  }

  return { ...base, thinking: { type: "enabled", budgetTokens: 32000 } } as AgentConfig
}
createOracleAgent.mode = MODE
