# Data Model: Align SDD Plan With Speckit Flow

## Entity: BranchPolicy
- Purpose: Defines branch governance rules for creation and validation.
- Fields:
  - `allowedPrefixes`: ordered list of approved prefixes.
  - `numberingMode`: global numbering strategy.
  - `legacySupportEnabled`: boolean for numeric-only compatibility.
  - `confidenceThreshold`: classifier threshold that triggers explicit user selection.
- Validation rules:
  - Prefix MUST exist in `allowedPrefixes`.
  - Numbering mode MUST be `global`.
  - If confidence < threshold, auto-classification MUST NOT be used.

## Entity: BranchCandidate
- Purpose: Represents one candidate branch reference from local/remote/spec sources.
- Fields:
  - `source`: `local` | `remote` | `spec_directory`.
  - `rawName`: original branch or directory identifier.
  - `prefix`: optional typed prefix.
  - `sequenceNumber`: numeric identifier.
  - `slug`: short descriptive name.
  - `format`: `legacy` | `prefixed`.
- Validation rules:
  - `sequenceNumber` MUST be parseable positive integer.
  - `format` MUST be consistent with parsed shape.

## Entity: PrefixClassificationResult
- Purpose: Captures deterministic intent classification outcome for branch prefix selection.
- Fields:
  - `detectedPrefix`: proposed allowlisted prefix.
  - `confidence`: normalized confidence score.
  - `signals`: matched keyword/rule list.
  - `requiresUserConfirmation`: boolean fallback trigger.
- State transitions:
  - `detected` -> `confirmed` when confidence high or user confirms.
  - `detected` -> `prompted` when confidence low.
  - `prompted` -> `confirmed` when user chooses explicit prefix.

## Entity: FeatureWorkspaceBinding
- Purpose: Maps active branch context to feature artifacts.
- Fields:
  - `branchName`: active branch string.
  - `featureDirectory`: resolved `specs/<feature>/` path.
  - `specPath`, `planPath`, `tasksPath`: canonical artifact paths.
  - `resolutionMode`: `legacy-prefix-match` | `typed-prefix-match` | `exact`.
- Validation rules:
  - Paths MUST resolve to a single feature directory.
  - Ambiguous mappings MUST fail with remediation guidance.

## Entity: ExecutionReadinessCheck
- Purpose: Represents pass/fail checks required before `/start-work` execution.
- Fields:
  - `hasFeatureDir`: boolean.
  - `hasPlan`: boolean.
  - `hasTasks`: boolean.
  - `checklistStatus`: `complete` | `incomplete`.
  - `decision`: `proceed` | `block`.
  - `guidance`: actionable remediation text.
- Validation rules:
  - Missing required artifacts MUST set `decision=block`.
  - Blocked state MUST include guidance.
