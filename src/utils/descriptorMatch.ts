/** Descriptors that trigger automatic PDF opening (exact match after normalization). */
export const AUTO_OPEN_DESCRIPTORS = [
  'Outcome Of The Board Meeting',
  'Outcome Of Board Meeting',
  'Financial Results',
] as const

/**
 * Normalize descriptor for exact comparison:
 * trim, collapse whitespace, case-insensitive.
 * ("Outcome Of  Board Meeting" → same as "Outcome Of Board Meeting")
 */
export function normalizeDescriptor(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

const NORMALIZED_AUTO_OPEN = new Set(
  AUTO_OPEN_DESCRIPTORS.map((descriptor) => normalizeDescriptor(descriptor)),
)

/** Exact normalized match against the supported descriptor list. */
export function isAutoOpenDescriptor(value: string | null | undefined): boolean {
  const normalized = normalizeDescriptor(value)
  if (!normalized) return false
  return NORMALIZED_AUTO_OPEN.has(normalized)
}
