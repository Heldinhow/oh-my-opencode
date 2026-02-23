import { describe, expect, test } from "bun:test"
import { classifyPrefixFromContext } from "./classify-prefix"
import { parseBranchName } from "./parse-branch-name"

describe("parseBranchName", () => {
  test("parses legacy branch format", () => {
    //#given
    const branch = "001-align-sdd-speckit-flow"

    //#when
    const parsed = parseBranchName(branch)

    //#then
    expect(parsed).not.toBeNull()
    expect(parsed?.format).toBe("legacy")
    expect(parsed?.sequenceNumber).toBe(1)
    expect(parsed?.slug).toBe("align-sdd-speckit-flow")
  })

  test("parses prefixed branch format", () => {
    //#given
    const branch = "fix/012-branch-prefix-bug"

    //#when
    const parsed = parseBranchName(branch)

    //#then
    expect(parsed).not.toBeNull()
    expect(parsed?.format).toBe("prefixed")
    expect(parsed?.prefix).toBe("fix")
    expect(parsed?.sequenceNumber).toBe(12)
    expect(parsed?.slug).toBe("branch-prefix-bug")
  })

  test("supports remote and refs prefixes", () => {
    //#given
    const branch = "refs/heads/origin/feat/007-workflow-sync"

    //#when
    const parsed = parseBranchName(branch)

    //#then
    expect(parsed).not.toBeNull()
    expect(parsed?.prefix).toBe("feat")
    expect(parsed?.sequenceNumber).toBe(7)
  })

  test("rejects unsupported prefix", () => {
    //#given
    const branch = "release/001-feature"

    //#when
    const parsed = parseBranchName(branch)

    //#then
    expect(parsed).toBeNull()
  })
})

describe("classifyPrefixFromContext", () => {
  test("classifies fix intent with high confidence", () => {
    //#given
    const request = "fix payment timeout bug in start-work flow"

    //#when
    const result = classifyPrefixFromContext(request)

    //#then
    expect(result.detectedPrefix).toBe("fix")
    expect(result.requiresUserConfirmation).toBe(false)
  })

  test("requests confirmation for ambiguous text", () => {
    //#given
    const request = "adjust behavior"

    //#when
    const result = classifyPrefixFromContext(request)

    //#then
    expect(result.requiresUserConfirmation).toBe(true)
  })
})
