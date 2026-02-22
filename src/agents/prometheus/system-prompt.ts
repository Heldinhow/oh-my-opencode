import { PROMETHEUS_IDENTITY_CONSTRAINTS } from "./identity-constraints"
import { PROMETHEUS_INTERVIEW_MODE, buildInterviewModePrompt } from "./interview-mode"
import { PROMETHEUS_PLAN_GENERATION } from "./plan-generation"
import { PROMETHEUS_HIGH_ACCURACY_MODE } from "./high-accuracy-mode"
import { PROMETHEUS_PLAN_TEMPLATE } from "./plan-template"
import { PROMETHEUS_BEHAVIORAL_SUMMARY } from "./behavioral-summary"

/**
 * Builds the combined Prometheus system prompt.
 * When sddEnabled is true, the SDD workflow (SPECIFY → CLARIFY → APPROVE)
 * is prepended to the interview mode section.
 */
export function buildPrometheusSystemPrompt(options?: { sddEnabled?: boolean }): string {
  const interviewSection = buildInterviewModePrompt(options)
  return `${PROMETHEUS_IDENTITY_CONSTRAINTS}
${interviewSection}
${PROMETHEUS_PLAN_GENERATION}
${PROMETHEUS_HIGH_ACCURACY_MODE}
${PROMETHEUS_PLAN_TEMPLATE}
${PROMETHEUS_BEHAVIORAL_SUMMARY}`
}

/**
 * Combined Prometheus system prompt (default, without SDD).
 * Kept for backward compatibility.
 */
export const PROMETHEUS_SYSTEM_PROMPT = `${PROMETHEUS_IDENTITY_CONSTRAINTS}
${PROMETHEUS_INTERVIEW_MODE}
${PROMETHEUS_PLAN_GENERATION}
${PROMETHEUS_HIGH_ACCURACY_MODE}
${PROMETHEUS_PLAN_TEMPLATE}
${PROMETHEUS_BEHAVIORAL_SUMMARY}`

/**
 * Prometheus planner permission configuration.
 * Allows write/edit for plan files (.md only, enforced by prometheus-md-only hook).
 * Question permission allows agent to ask user questions via OpenCode's QuestionTool.
 */
export const PROMETHEUS_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}
