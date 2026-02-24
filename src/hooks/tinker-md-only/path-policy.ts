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

  // 4. Determine allowed roots: .specify/ OR specs/
  // - .specify/ is the canonical planning workspace (and may include nested paths like .specify/specs/)
  // - specs/ represents a separate workspace root for specifications
  const inSpecifyRoot = /(^|[\\/])\.specify([\\/]|$)/i.test(rel)
  const inSpecsRoot = /(^|[\\/])specs([\\/]|$)/i.test(rel)

  // If outside both allowed roots, block
  if (!inSpecifyRoot && !inSpecsRoot) {
    return false
  }

  // 5. Per-root extension policy
  if (inSpecifyRoot) {
    // If under .specify/ (even if it also contains a specs/ segment), allow
    // extensions based on ALLOWED_EXTENSIONS (md/json)
    const hasAllowedExtension = ALLOWED_EXTENSIONS.some(ext => relLower.endsWith(ext.toLowerCase()))
    if (!hasAllowedExtension) return false
  } else if (inSpecsRoot) {
    // Path under specs/ root (not within .specify) — only allow .md
    if (!relLower.endsWith(".md")) return false
  } else {
    // Fallback: not in a recognized root
    return false
  }

  return true
}
