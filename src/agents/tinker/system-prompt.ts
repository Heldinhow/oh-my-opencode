import { PROMETHEUS_IDENTITY_CONSTRAINTS } from "./identity-constraints"
import { buildInterviewModePrompt } from "./interview-mode"
import { PROMETHEUS_PLAN_GENERATION } from "./plan-generation"
import { PROMETHEUS_HIGH_ACCURACY_MODE } from "./high-accuracy-mode"
import { PROMETHEUS_PLAN_TEMPLATE } from "./plan-template"
import { PROMETHEUS_BEHAVIORAL_SUMMARY } from "./behavioral-summary"

/**
 * Builds the combined Tinker system prompt.
 */
export function buildTinkerSystemPrompt(): string {
  const debugMarker = "🔧 DEBUG: SDD MODE IS ACTIVE 🔧"
  const canonicalFlowReminder = "SDD canonical flow: constitution -> specify -> clarify (if needed) -> plan -> /start-work"
  const interviewSection = buildInterviewModePrompt()
  return `${debugMarker}
${canonicalFlowReminder}
${PROMETHEUS_IDENTITY_CONSTRAINTS}
${interviewSection}
${PROMETHEUS_PLAN_GENERATION}
${PROMETHEUS_HIGH_ACCURACY_MODE}
${PROMETHEUS_PLAN_TEMPLATE}
${PROMETHEUS_BEHAVIORAL_SUMMARY}`
}

/**
 * Combined Tinker system prompt.
 */
export const PROMETHEUS_SYSTEM_PROMPT = `${PROMETHEUS_IDENTITY_CONSTRAINTS}
SDD canonical flow: constitution -> specify -> clarify (if needed) -> plan -> /start-work
${buildInterviewModePrompt()}
${PROMETHEUS_PLAN_GENERATION}
${PROMETHEUS_HIGH_ACCURACY_MODE}
${PROMETHEUS_PLAN_TEMPLATE}
${PROMETHEUS_BEHAVIORAL_SUMMARY}`

/**
 * Tinker planner permission configuration.
 * Allows write/edit for plan files (.md only, enforced by tinker-md-only hook).
 * Question permission allows agent to ask user questions via OpenCode's QuestionTool.
 */
export const PROMETHEUS_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}
