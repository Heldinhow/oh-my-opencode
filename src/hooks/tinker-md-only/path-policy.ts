import { relative, resolve, isAbsolute } from "node:path"

import { ALLOWED_EXTENSIONS } from "./constants"

/**
 * Cross-platform path validator for Tinker file writes.
 * Uses path.resolve/relative instead of string matching to handle:
 * - Windows backslashes (e.g., .specify\\plans\\x.md)
 * - Mixed separators (e.g., .specify\\plans/x.md)
 * - Case-insensitive directory/extension matching
 * - Workspace confinement (blocks paths outside root or via traversal)
 * - Nested project paths (e.g., parent/.specify/... when ctx.directory is parent)
 */
export function isAllowedFile(filePath: string, workspaceRoot: string): boolean {
  // 1. Resolve to absolute path
  const resolved = resolve(workspaceRoot, filePath)

  // 2. Get relative path from workspace root
  const rel = relative(workspaceRoot, resolved)

  // 3. Reject if escapes root (starts with ".." or is absolute)
  if (rel.startsWith("..") || isAbsolute(rel)) {
    return false
  }

  const relLower = rel.toLowerCase()

  // 4. Determine earliest allowed root segment in the relative path
  //    - Allowed roots of interest: ".specify" and "specs"
  //    - Choose the earliest segment (by position) among these two as the
  //      authoritative root for extension policy. This prevents bypasses
  //      where a later segment would incorrectly grant access.
  const segments = rel.split(/[\\/]+/).filter((s) => s.length > 0)
  let earliestRoot: ".specify" | "specs" | null = null
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].toLowerCase()
    if (seg === ".specify") {
      earliestRoot = ".specify"
      break
    }
    if (seg === "specs") {
      earliestRoot = "specs"
      break
    }
  }

  if (!earliestRoot) {
    // No recognized root segment found
    return false
  }

  // 5. Per-root extension policy based on the earliest root segment
  if (earliestRoot === ".specify") {
    // Under .specify/, allow both md and json (as defined by ALLOWED_EXTENSIONS)
    return ALLOWED_EXTENSIONS.some(ext => relLower.endsWith(ext.toLowerCase()))
  } else {
    // Under specs/ root (not within .specify), only allow md files
    return relLower.endsWith(".md")
  }
}
