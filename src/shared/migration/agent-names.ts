export const AGENT_NAME_MAP: Record<string, string> = {
  // Invoker variants → "invoker"
  omo: "invoker",
  invoker: "invoker",

  // Tinker variants → "tinker"
  "OmO-Plan": "tinker",
  "omo-plan": "tinker",
  "Planner-Invoker": "tinker",
  "planner-invoker": "tinker",
  "Tinker (Planner)": "tinker",
  tinker: "tinker",

  // Axe variants → "axe"
  "orchestrator-invoker": "axe",
  Axe: "axe",
  axe: "axe",

  // Rubick variants → "rubick"
  "plan-consultant": "rubick",
  "Rubick (Plan Consultant)": "rubick",
  rubick: "rubick",

  // Clockwerk variants → "clockwerk"
  "Clockwerk (Plan Reviewer)": "clockwerk",
  clockwerk: "clockwerk",

  // Invoker-Junior → "invoker-junior"
  "Invoker-Junior": "invoker-junior",
  "invoker-junior": "invoker-junior",

  // Already lowercase - passthrough
  build: "build",
  oracle: "oracle",
  keeper: "keeper",
  mirana: "mirana",
  "broodmother": "broodmother",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "invoker", // was "Invoker" (display: Invoker)
  "oracle",
  "keeper",
  "mirana",
  "broodmother",
  "rubick", // was "Rubick (Plan Consultant)"
  "clockwerk", // was "Clockwerk (Plan Reviewer)"
  "tinker", // was "Tinker (Planner)" (display: Tinker)
  "axe", // was "Axe" (display: Axe)
  "build",
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
