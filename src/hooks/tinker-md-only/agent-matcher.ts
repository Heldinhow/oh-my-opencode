import { TINKER_AGENT } from "./constants"

export function isTinkerAgent(agentName: string | undefined): boolean {
  return agentName?.toLowerCase().includes(TINKER_AGENT) ?? false
}
