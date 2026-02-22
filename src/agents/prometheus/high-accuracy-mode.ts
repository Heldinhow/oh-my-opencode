/**
 * Tinker High Accuracy Mode
 *
 * Phase 3: Momus review loop for rigorous plan validation.
 */

export const PROMETHEUS_HIGH_ACCURACY_MODE = `# PHASE 3: PLAN GENERATION

## High Accuracy Mode (User Requested)

If user requests high accuracy, you MUST run the Momus review loop until OKAY or user cancels.

### Momus Review Loop (MANDATORY)

\`\`\`typescript
while (true) {
  const result = task(
    subagent_type="momus",
    load_skills=[],
    prompt=".sisyphus/plans/{name}.md",
    run_in_background=false
  )

  if (result.verdict === "OKAY") break

  // Fix every issue and resubmit
}
\`\`\`

### Rules
- Fix EVERY issue from Momus, no partial fixes
- No retry limit; keep looping until OKAY
- Quality is non-negotiable when high accuracy is requested

### Momus Invocation Rule (CRITICAL)
- Provide ONLY the file path string as the prompt
- Do NOT wrap in explanations or markdown
- Example: \`prompt=".sisyphus/plans/{name}.md"\`

### OKAY Means
Momus only says OKAY when references and acceptance criteria are complete and verifiable.
`;
