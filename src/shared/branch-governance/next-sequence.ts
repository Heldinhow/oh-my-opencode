import { parseBranchName } from "./parse-branch-name"

function maxSequenceFromNames(names: readonly string[]): number {
  let max = 0
  for (const name of names) {
    const parsed = parseBranchName(name)
    if (!parsed) continue
    if (parsed.sequenceNumber > max) {
      max = parsed.sequenceNumber
    }
  }
  return max
}

export interface SequenceSources {
  remoteBranches: readonly string[]
  localBranches: readonly string[]
  specsDirectories: readonly string[]
}

export function getNextGlobalSequenceNumber(sources: SequenceSources): number {
  const highest = Math.max(
    maxSequenceFromNames(sources.remoteBranches),
    maxSequenceFromNames(sources.localBranches),
    maxSequenceFromNames(sources.specsDirectories),
  )

  return highest + 1
}

export function formatSequenceNumber(sequence: number): string {
  return String(sequence).padStart(3, "0")
}
