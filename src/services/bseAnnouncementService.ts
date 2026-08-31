import { api } from '@/services/api'
import type { BseAnnouncement, BseTimeFilters } from '@/types/bseAnnouncement'
import { BseApiError } from '@/types/bseAnnouncement'
import { getKolkataBseTimestampsForMinuteOffset } from '@/utils/bseAnnouncement'

type BseAnnouncementsApiResponse = {
  success: boolean
  message?: string
  data?: BseAnnouncement[]
}

/** How many previous minutes to try when BSE returns an empty snapshot. */
const MINUTE_FALLBACK_OFFSETS = [0, -1, -2, -3, -4, -5] as const

async function fetchOnce(
  timeFilters: BseTimeFilters,
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

  return response.data
}

/**
 * Fetch BSE announcements using live Kolkata time.
 * Tries the current minute (Sec=0), then walks back minute-by-minute if BSE returns empty.
 */
export async function fetchBseAnnouncements(
  options: {
    signal?: AbortSignal
    timeFilters?: BseTimeFilters
  } = {},
): Promise<BseAnnouncement[]> {
  const requestStarted = performance.now()
  const { signal, timeFilters } = options

  try {
    if (timeFilters) {
      return await fetchOnce(timeFilters, signal)
    }

    for (const minuteOffset of MINUTE_FALLBACK_OFFSETS) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const filters = getKolkataBseTimestampsForMinuteOffset(minuteOffset)
      const data = await fetchOnce(filters, signal)

      if (data.length > 0) {
        if (import.meta.env.DEV) {
          const totalMs = Math.round(performance.now() - requestStarted)
          console.info(
            `BSE fetch OK (offset ${minuteOffset} min, Sec=0) — ${data.length} records — ${totalMs} ms`,
          )
        }
        return data
      }
    }

    if (import.meta.env.DEV) {
      console.info('BSE fetch returned empty for all minute offsets')
    }

    return []
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
