/**
 * Cross-platform check if a path is inside .specify/ directory.
 * Handles both forward slashes (Unix) and backslashes (Windows).
 * Uses path segment matching (not substring) to avoid false positives like "not-invoker/file.txt"
 */
export function isInvokerPath(filePath: string): boolean {
  return /\.specify[/\\]/.test(filePath)
}
