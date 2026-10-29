import { api } from '@/services/api'
import type { BseAnnouncement, BseTimeFilters } from '@/types/bseAnnouncement'
import { BseApiError } from '@/types/bseAnnouncement'
import { getKolkataBseTimestamps } from '@/utils/bseAnnouncement'

type BseAnnouncementsApiResponse = {
  success: boolean
  message?: string
  data?: BseAnnouncement[]
  meta?: {
    fromCache?: boolean
    bseApiMs?: number
    backendTotalMs?: number
  }
}

/** Minutes the backend may walk back when the live snapshot is empty (cold start only). */
const COLD_START_FALLBACK_MINUTES = 5

async function fetchOnce(
  timeFilters: BseTimeFilters & { fallbackMinutes?: number },
  signal?: AbortSignal,
): Promise<BseAnnouncement[]> {
  const response = await api.post<BseAnnouncementsApiResponse>(
    '/bse/corporate-announcements',
    timeFilters,
    { signal },
  )

  if (!response.success || !Array.isArray(response.data)) {
    throw new BseApiError(
      response.message || 'Unable to fetch the latest BSE announcements. Please try again.',
    )
  }

  if (import.meta.env.DEV && response.meta) {
    console.info(
      `BSE fetch — ${response.data.length} records — backend ${response.meta.backendTotalMs ?? '?'} ms` +
        (response.meta.fromCache ? ' (cache)' : ` (BSE ${response.meta.bseApiMs ?? '?'} ms)`),
    )
  }

  return response.data
}

/**
 * Fetch BSE announcements using live Kolkata time.
 * Cold start can ask the backend to try previous minutes in one request.
 * Steady polling uses the current minute only (fast path + backend cache).
 */
export async function fetchBseAnnouncements(
  options: {
    signal?: AbortSignal
    timeFilters?: BseTimeFilters
    /** When true, backend may walk back up to 5 minutes if live snapshot is empty. */
    allowMinuteFallback?: boolean
  } = {},
): Promise<BseAnnouncement[]> {
  const { signal, timeFilters, allowMinuteFallback = false } = options

  try {
    const filters = timeFilters ?? getKolkataBseTimestamps()

    return await fetchOnce(
      {
        ...filters,
        fallbackMinutes: allowMinuteFallback ? COLD_START_FALLBACK_MINUTES : 0,
      },
      signal,
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    if (error instanceof BseApiError) {
      throw error
    }

    const apiError = error as { message?: string }
    throw new BseApiError(
      apiError.message || 'Unable to fetch the latest BSE announcements. Please try again.',
    )
  }
}
