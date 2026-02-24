import { describe, expect, test } from "bun:test"
import { formatSequenceNumber, getNextGlobalSequenceNumber } from "./next-sequence"

describe("getNextGlobalSequenceNumber", () => {
  test("returns 1 when no sources exist", () => {
    const next = getNextGlobalSequenceNumber({
      remoteBranches: [],
      localBranches: [],
      specsDirectories: [],
    })

    expect(next).toBe(1)
  })

  test("uses highest sequence across all sources", () => {
    const next = getNextGlobalSequenceNumber({
      remoteBranches: ["feat/004-remote-branch"],
      localBranches: ["fix/007-local-branch"],
      specsDirectories: ["003-spec-dir", "001-other"],
    })

    expect(next).toBe(8)
  })

  test("ignores invalid names", () => {
    const next = getNextGlobalSequenceNumber({
      remoteBranches: ["release/001-ignored"],
      localBranches: ["not-a-branch"],
      specsDirectories: ["feat/002-valid"],
    })

    expect(next).toBe(3)
  })
})

describe("formatSequenceNumber", () => {
  test("pads sequence to 3 digits", () => {
    expect(formatSequenceNumber(1)).toBe("001")
    expect(formatSequenceNumber(12)).toBe("012")
    expect(formatSequenceNumber(120)).toBe("120")
  })
})
