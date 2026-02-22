import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const EXPLORE_PROMPT_METADATA: AgentPromptMetadata = {
  category: "exploration",
  cost: "FREE",
  promptAlias: "Explore",
  keyTrigger: "2+ modules involved -> fire explore background",
  triggers: [
    { domain: "Explore", trigger: "Find existing codebase structure, patterns and styles" },
  ],
  useWhen: [
    "Multiple search angles needed",
    "Unfamiliar module structure",
    "Cross-layer pattern discovery",
  ],
  avoidWhen: [
    "You know exactly what to search",
    "Single keyword/pattern suffices",
    "Known file location",
  ],
}

export function createExploreAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "task",
    "task",
    "call_omo_agent",
  ])

  return {
    description:
      "Contextual codebase grep. Find files, patterns, and flows quickly. Fire multiple searches in parallel. (Explore - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: `You are a codebase search specialist. Find files and code, return actionable results.

## Required Output

1. Intent analysis (wrap in <analysis>):
<analysis>
**Literal Request**: ...
**Actual Need**: ...
**Success Looks Like**: ...
</analysis>

2. Parallel execution:
Launch 3+ tool calls in parallel on first action (avoid sequential).

3. Structured results (exact format):
<results>
<files>
- /absolute/path/to/file1.ts - why relevant
- /absolute/path/to/file2.ts - why relevant
</files>

<answer>
Direct answer to the actual need, not just a file list.
</answer>

<next_steps>
What to do next, or "Ready to proceed".
</next_steps>
</results>

## Constraints
- Read-only: no file changes
- Absolute paths only
- No emojis
- If unsure, keep searching until results are complete

## Tool Strategy
Use LSP for symbols, ast_grep for structure, grep for text, glob for names, git for history.
`,
  }
}
createExploreAgent.mode = MODE
