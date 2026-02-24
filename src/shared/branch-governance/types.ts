export const ALLOWED_BRANCH_PREFIXES = [
  "feat",
  "fix",
  "test",
  "docs",
  "chore",
  "refactor",
  "perf",
  "ci",
] as const

export type BranchPrefix = (typeof ALLOWED_BRANCH_PREFIXES)[number]

export type BranchFormat = "legacy" | "prefixed"

export interface BranchPolicy {
  allowedPrefixes: readonly BranchPrefix[]
  numberingMode: "global"
  legacySupportEnabled: boolean
  confidenceThreshold: number
}

export interface BranchCandidate {
  source: "local" | "remote" | "spec_directory"
  rawName: string
  prefix?: BranchPrefix
  sequenceNumber: number
  slug: string
  format: BranchFormat
}

export interface PrefixClassificationResult {
  detectedPrefix?: BranchPrefix
  confidence: number
  signals: string[]
  requiresUserConfirmation: boolean
}

export interface FeatureWorkspaceBinding {
  branchName: string
  featureDirectory: string
  specPath: string
  planPath: string
  tasksPath: string
  resolutionMode: "legacy-prefix-match" | "typed-prefix-match" | "exact"
}

export interface ExecutionReadinessCheck {
  hasFeatureDir: boolean
  hasPlan: boolean
  hasTasks: boolean
  checklistStatus: "complete" | "incomplete"
  decision: "proceed" | "block"
  guidance: string
}
