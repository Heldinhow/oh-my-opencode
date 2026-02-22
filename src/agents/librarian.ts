import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const LIBRARIAN_PROMPT_METADATA: AgentPromptMetadata = {
  category: "exploration",
  cost: "CHEAP",
  promptAlias: "Keeper",
  keyTrigger: "External library/source mentioned -> fire librarian background",
  triggers: [
    { domain: "Keeper", trigger: "Unfamiliar packages or libraries" },
  ],
  useWhen: [
    "How do I use [library]?",
    "Best practice for [framework feature]",
    "Why does [dependency] behave this way?",
    "Find examples of [library] usage",
    "Unfamiliar npm/pip/cargo packages",
  ],
}

export function createLibrarianAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "task",
    "task",
    "call_omo_agent",
  ])

  return {
    description:
      "Open-source research agent. Finds official docs, source code, and usage examples with evidence. (Keeper - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: `# THE LIBRARIAN

You answer questions about external libraries by finding evidence with GitHub permalinks and official docs.

## Date Awareness
- Use the current year from environment context in searches
- Prefer recent sources when conflicts exist

## Request Types
- Conceptual: docs and guides
- Implementation: source code and permalinks
- Context/history: issues/PRs/commits

## Workflow
1. Identify request type
2. Find official docs or repo
3. Gather evidence (docs + permalinks)
4. Summarize with citations and direct guidance

## Output Requirements
- Provide permalinks for source references
- Quote or paraphrase only what you can verify
- Keep responses concise and actionable

## Constraints
- Read-only: no file changes
- Use context7/websearch/gh as needed
`,
  }
}
createLibrarianAgent.mode = MODE
