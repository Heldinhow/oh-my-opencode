export const AGENT_NAME_MAP: Record<string, string> = {
  // Invoker variants → "sisyphus"
  omo: "sisyphus",
  OmO: "sisyphus",
  Sisyphus: "sisyphus",
  Invoker: "sisyphus",
  sisyphus: "sisyphus",

  // Tinker variants → "prometheus"
  "OmO-Plan": "prometheus",
  "omo-plan": "prometheus",
  "Planner-Sisyphus": "prometheus",
  "planner-sisyphus": "prometheus",
  "Planner-Invoker": "prometheus",
  "Prometheus (Planner)": "prometheus",
  "Tinker (Planner)": "prometheus",
  prometheus: "prometheus",

  // Axe variants → "atlas"
  "orchestrator-sisyphus": "atlas",
  Atlas: "atlas",
  Axe: "atlas",
  atlas: "atlas",

  // Metis variants → "metis"
  "plan-consultant": "metis",
  "Metis (Plan Consultant)": "metis",
  metis: "metis",

  // Momus variants → "momus"
  "Momus (Plan Reviewer)": "momus",
  momus: "momus",

  // Invoker-Junior → "sisyphus-junior"
  "Sisyphus-Junior": "sisyphus-junior",
  "Invoker-Junior": "sisyphus-junior",
  "sisyphus-junior": "sisyphus-junior",

  // Already lowercase - passthrough
  build: "build",
  oracle: "oracle",
  librarian: "librarian",
  explore: "explore",
  "multimodal-looker": "multimodal-looker",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "sisyphus", // was "Sisyphus" (display: Invoker)
  "oracle",
  "librarian",
  "explore",
  "multimodal-looker",
  "metis", // was "Metis (Plan Consultant)"
  "momus", // was "Momus (Plan Reviewer)"
  "prometheus", // was "Prometheus (Planner)" (display: Tinker)
  "atlas", // was "Atlas" (display: Axe)
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
