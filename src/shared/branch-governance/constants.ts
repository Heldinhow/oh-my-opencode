import type { BranchPolicy } from "./types"
import { ALLOWED_BRANCH_PREFIXES } from "./types"

export const DEFAULT_CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.7

export const DEFAULT_BRANCH_POLICY: BranchPolicy = {
  allowedPrefixes: ALLOWED_BRANCH_PREFIXES,
  numberingMode: "global",
  legacySupportEnabled: true,
  confidenceThreshold: DEFAULT_CLASSIFICATION_CONFIDENCE_THRESHOLD,
}
