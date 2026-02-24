import type { BranchFormat, BranchPrefix } from "./types"
import { ALLOWED_BRANCH_PREFIXES } from "./types"

export interface ParsedBranchName {
  original: string
  normalized: string
  format: BranchFormat
  prefix?: BranchPrefix
  sequenceNumber: number
  slug: string
}

function normalizeBranchName(input: string): string {
  let branch = input.trim()
  branch = branch.replace(/^refs\/heads\//, "")
  branch = branch.replace(/^origin\//, "")
  return branch
}

function parseLegacy(normalized: string): ParsedBranchName | null {
  const legacy = normalized.match(/^([0-9]{3})-([a-z0-9-]+)$/)
  if (!legacy) return null

  const sequenceNumber = Number.parseInt(legacy[1], 10)
  if (!Number.isFinite(sequenceNumber) || sequenceNumber <= 0) return null

  return {
    original: normalized,
    normalized,
    format: "legacy",
    sequenceNumber,
    slug: legacy[2],
  }
}

function parsePrefixed(normalized: string): ParsedBranchName | null {
  const prefixed = normalized.match(/^([a-z]+)\/([0-9]{3})-([a-z0-9-]+)$/)
  if (!prefixed) return null

  const candidatePrefix = prefixed[1] as BranchPrefix
  if (!ALLOWED_BRANCH_PREFIXES.includes(candidatePrefix)) return null

  const sequenceNumber = Number.parseInt(prefixed[2], 10)
  if (!Number.isFinite(sequenceNumber) || sequenceNumber <= 0) return null

  return {
    original: normalized,
    normalized,
    format: "prefixed",
    prefix: candidatePrefix,
    sequenceNumber,
    slug: prefixed[3],
  }
}

export function parseBranchName(input: string): ParsedBranchName | null {
  const normalized = normalizeBranchName(input)
  if (!normalized) return null

  const prefixed = parsePrefixed(normalized)
  if (prefixed) return prefixed

  const legacy = parseLegacy(normalized)
  if (legacy) return legacy

  return null
}
