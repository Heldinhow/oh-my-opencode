import { describe, test, expect } from "bun:test"
import { PROMETHEUS_SYSTEM_PROMPT, buildTinkerSystemPrompt } from "./tinker"

describe("PROMETHEUS_SYSTEM_PROMPT Clockwerk invocation policy", () => {
  test("should direct providing ONLY the file path string when invoking Clockwerk", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when / #then
    expect(prompt.toLowerCase()).toMatch(/clockwerk.*only.*path|path.*only.*clockwerk/)
  })

  test("should forbid wrapping Clockwerk invocation in explanations or markdown", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when / #then
    expect(prompt.toLowerCase()).toMatch(/not.*wrap|no.*explanation|no.*markdown/)
  })
})

describe("PROMETHEUS_SYSTEM_PROMPT zero human intervention", () => {
  test("should enforce universal zero human intervention rule", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when
    const lowerPrompt = prompt.toLowerCase()

    //#then
    expect(lowerPrompt).toContain("zero human intervention")
    expect(lowerPrompt).toContain("forbidden")
    expect(lowerPrompt).toMatch(/user manually tests|사용자가 직접 테스트/)
  })

  test("should require agent-executed QA scenarios as mandatory for all tasks", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when
    const lowerPrompt = prompt.toLowerCase()

    //#then
    expect(lowerPrompt).toContain("agent-executed qa scenarios")
    expect(lowerPrompt).toMatch(/mandatory.*all tasks|all tasks.*mandatory/)
  })

  test("should not contain ambiguous 'manual QA' terminology", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when / #then
    expect(prompt).not.toMatch(/manual QA procedures/i)
    expect(prompt).not.toMatch(/manual verification procedures/i)
    expect(prompt).not.toMatch(/Manual-only/i)
  })

  test("should require per-scenario format with detailed structure", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when
    const lowerPrompt = prompt.toLowerCase()

    //#then
    expect(lowerPrompt).toContain("preconditions")
    expect(lowerPrompt).toContain("failure indicators")
    expect(lowerPrompt).toContain("evidence")
    expect(lowerPrompt).toMatch(/negative scenario/)
  })

  test("should require QA scenario adequacy in self-review checklist", () => {
    //#given
    const prompt = PROMETHEUS_SYSTEM_PROMPT

    //#when
    const lowerPrompt = prompt.toLowerCase()

    //#then
    expect(lowerPrompt).toMatch(/every task has agent-executed qa scenarios/)
    expect(lowerPrompt).toMatch(/happy-path and negative/)
    expect(lowerPrompt).toMatch(/zero acceptance criteria require human/)
  })
})

describe("PROMETHEUS_SYSTEM_PROMPT SDD Mode", () => {
  test("should include explicit SDD=ON instruction", () => {
    //#given
    const prompt = buildTinkerSystemPrompt()

    //#when / #then
    expect(prompt.toLowerCase()).toMatch(/sdd.*on|sdd.*mode.*active/)
    expect(prompt.toLowerCase()).toMatch(/you are in sdd mode|sdd mode is enabled/)
    expect(prompt.toLowerCase()).toMatch(/answer.*sdd.*on|if asked.*sdd.*on/)
    expect(prompt.toLowerCase()).toMatch(/first response.*specify|start with specify/)
  })
})
 
describe("buildTinkerSystemPrompt canonical Speckit flow and artifacts", () => {
  test("should include canonical Speckit stage order and tasks stage", () => {
    //#given
    const prompt = buildTinkerSystemPrompt()

    //#when / #then
    // Ensure the canonical Speckit flow order is present: constitution -> specify -> clarify -> plan -> tasks
    expect(prompt).toMatch(/constitution[\s\S]*specify[\s\S]*clarify[\s\S]*plan[\s\S]*tasks/i)
  })

  test("should mention specs/ workspace and create-new-feature script with --json", () => {
    //#given
    const prompt = buildTinkerSystemPrompt()

    //#when / #then
    expect(prompt).toMatch(/specs\//)
    expect(prompt).toMatch(/create-new-feature\.sh/)
    expect(prompt).toMatch(/--json/)
  })

  test("should contain required JSON keys for feature creation", () => {
    //#given
    const prompt = buildTinkerSystemPrompt()

    //#when / #then
    expect(prompt).toMatch(/"BRANCH_NAME"\s*:/)
    expect(prompt).toMatch(/"SPEC_FILE"\s*:/)
    expect(prompt).toMatch(/"FEATURE_DIR"\s*:/)
    expect(prompt).toMatch(/"FEATURE_NUM"\s*:/)
    expect(prompt).toMatch(/"PREFIX"\s*:/)
  })
})
