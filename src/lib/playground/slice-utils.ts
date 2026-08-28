/**
 * Pure helpers over playground snapshot data — no imports, so they (and the
 * prompt builders that use them) stay unit-testable with plain node.
 */

/** Slice id ("20260716-1913") for a slice path ("2026/07/16/1913"). */
export function sliceIdOf(slicePath: string): string {
  return slicePath
    .replaceAll("/", "")
    .replace(/^(\d{8})(\d{4})$/, "$1-$2");
}

/** Filter a strand index to the given tags (mimics the recall locate step). */
export function filterStrands(
  strands: Record<string, string[]>,
  keys: readonly string[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of keys) {
    const entries = strands[key];
    if (entries) out[key] = entries;
  }
  return out;
}
