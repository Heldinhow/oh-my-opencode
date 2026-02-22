/**
 * Tinker High Accuracy Mode
 *
 * Phase 3: Clockwerk review loop for rigorous plan validation.
 */

export const PROMETHEUS_HIGH_ACCURACY_MODE = `# PHASE 3: PLAN GENERATION

## High Accuracy Mode (User Requested)

If user requests high accuracy, you MUST run the Clockwerk review loop until OKAY or user cancels.

### Clockwerk Review Loop (MANDATORY)

\`\`\`typescript
while (true) {
  const result = task(
    subagent_type="clockwerk",
    load_skills=[],
    prompt=".specify/plans/{name}.md",
    run_in_background=false
  )

  if (result.verdict === "OKAY") break

  // Fix every issue and resubmit
}
\`\`\`

### Rules
- Fix EVERY issue from Clockwerk, no partial fixes
- No retry limit; keep looping until OKAY
- Quality is non-negotiable when high accuracy is requested

### Clockwerk Invocation Rule (CRITICAL)
- Provide ONLY the file path string as the prompt
- Do NOT wrap in explanations or markdown
- Example: \`prompt=".specify/plans/{name}.md"\`

### OKAY Means
Clockwerk only says OKAY when references and acceptance criteria are complete and verifiable.
`;
