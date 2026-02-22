export const ALLOWED_AGENTS = [
  "mirana",
  "keeper",
  "oracle",
  "enigma",
  "rubick",
  "clockwerk",
  "broodmother",
] as const

export const CALL_OMO_AGENT_DESCRIPTION = `Spawn mirana/keeper agent. run_in_background REQUIRED (true=async with task_id, false=sync).

Available: {agents}

Pass \`session_id=<id>\` to continue previous agent with full context. Prompts MUST be in English. Use \`background_output\` for async results.`
