import type { BranchPrefix, PrefixClassificationResult } from "./types"
import { ALLOWED_BRANCH_PREFIXES } from "./types"

interface Rule {
  prefix: BranchPrefix
  patterns: RegExp[]
  confidence: number
}

const CLASSIFICATION_RULES: Rule[] = [
  { prefix: "fix", confidence: 0.9, patterns: [/\bfix\b/i, /\bbug\b/i, /\bhotfix\b/i, /\berror\b/i] },
  { prefix: "test", confidence: 0.88, patterns: [/\btest\b/i, /\bcoverage\b/i, /\bspec\b/i] },
  { prefix: "docs", confidence: 0.86, patterns: [/\bdoc(s|umentation)?\b/i, /\breadme\b/i, /\bchangelog\b/i] },
  { prefix: "refactor", confidence: 0.84, patterns: [/\brefactor\b/i, /\brestructure\b/i, /\bcleanup\b/i] },
  { prefix: "perf", confidence: 0.82, patterns: [/\bperf(ormance)?\b/i, /\boptimiz(e|ation)\b/i, /\bfaster\b/i] },
  { prefix: "ci", confidence: 0.82, patterns: [/\bci\b/i, /\bworkflow\b/i, /\bgithub actions\b/i, /\bpipeline\b/i] },
  { prefix: "chore", confidence: 0.76, patterns: [/\bchore\b/i, /\bdependency\b/i, /\bmaintenance\b/i, /\bupgrade\b/i] },
  { prefix: "feat", confidence: 0.74, patterns: [/\bfeat(ure)?\b/i, /\badd\b/i, /\bimplement\b/i, /\bcreate\b/i] },
]

function detectExplicitPrefix(request: string): BranchPrefix | null {
  const explicit = request.trim().match(/^([a-z]+)\s*[:/\-]/i)
  if (!explicit) return null
  const prefix = explicit[1].toLowerCase() as BranchPrefix
  return ALLOWED_BRANCH_PREFIXES.includes(prefix) ? prefix : null
}

export function classifyPrefixFromContext(
  request: string,
  confidenceThreshold = 0.7,
): PrefixClassificationResult {
  const trimmed = request.trim()
  if (!trimmed) {
    return {
      confidence: 0,
      signals: [],
      requiresUserConfirmation: true,
    }
  }

  const explicit = detectExplicitPrefix(trimmed)
  if (explicit) {
    return {
      detectedPrefix: explicit,
      confidence: 1,
      signals: [`explicit:${explicit}`],
      requiresUserConfirmation: false,
    }
  }

  for (const rule of CLASSIFICATION_RULES) {
    const matched = rule.patterns.find((pattern) => pattern.test(trimmed))
    if (!matched) continue

    return {
      detectedPrefix: rule.prefix,
      confidence: rule.confidence,
      signals: [matched.source],
      requiresUserConfirmation: rule.confidence < confidenceThreshold,
    }
  }

  return {
    detectedPrefix: "feat",
    confidence: 0.5,
    signals: ["fallback:feat"],
    requiresUserConfirmation: true,
  }
}
