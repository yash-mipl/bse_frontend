import { api } from '@/services/api'
import type { BseAnnouncement, BseTimeFilters } from '@/types/bseAnnouncement'
import { BseApiError } from '@/types/bseAnnouncement'

type BseAnnouncementsApiResponse = {
  success: boolean
  message?: string
  data?: BseAnnouncement[]
}

export async function fetchBseAnnouncements(
  options?: {
    signal?: AbortSignal
    timeFilters?: BseTimeFilters
  },
): Promise<BseAnnouncement[]> {
  const requestStarted = performance.now()
  const { signal, timeFilters } = options ?? {}

  try {
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

    if (import.meta.env.DEV) {
      const totalMs = Math.round(performance.now() - requestStarted)
      const mode = timeFilters ? 'custom filters' : 'server time'
      console.info(`BSE announcements fetch (${mode}) — frontend total: ${totalMs} ms`)
    }

    return response.data
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
