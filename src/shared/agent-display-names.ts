/**
 * Agent config keys to display names mapping.
 * Config keys are lowercase (e.g., "invoker", "axe").
 * Display names include suffixes for UI/logs (e.g., "Invoker (Ultraworker)").
 */
export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  invoker: "Invoker (Ultraworker)",
  axe: "Axe (Plan Execution Orchestrator)",
  tinker: "Tinker (Plan Builder)",
  // Legacy alias support: map to canonical display name
  prometheus: "Tinker (Plan Builder)",
  "invoker-junior": "Invoker-Junior",
  rubick: "Rubick (Plan Consultant)",
  clockwerk: "Clockwerk (Plan Reviewer)",
  oracle: "oracle",
  keeper: "keeper",
  mirana: "mirana",
  "broodmother": "broodmother",
  // Backwards-compat aliases -> canonical display names
  sisyphus: "Invoker (Ultraworker)",
  omo: "Invoker (Ultraworker)",
}

/**
 * Get display name for an agent config key.
 * Uses case-insensitive lookup for backward compatibility.
 * Returns original key if not found.
 */
export function getAgentDisplayName(configKey: string): string {
  // Try exact match first
  const exactMatch = AGENT_DISPLAY_NAMES[configKey]
  if (exactMatch !== undefined) return exactMatch
  
  // Fall back to case-insensitive search
  const lowerKey = configKey.toLowerCase()
  for (const [k, v] of Object.entries(AGENT_DISPLAY_NAMES)) {
    if (k.toLowerCase() === lowerKey) return v
  }
  
  // Unknown agent: return original key
  return configKey
}
