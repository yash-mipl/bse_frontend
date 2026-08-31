import { env } from '@/config/env'
import type { BseAnnouncement, BseAnnouncementRequest } from '@/types/bseAnnouncement'
import { BseApiError } from '@/types/bseAnnouncement'
import { buildBseRequestTimestamps } from '@/utils/bseAnnouncement'

function buildRequestBody(): BseAnnouncementRequest {
  const timestamps = buildBseRequestTimestamps()

  return {
    Username: env.bse.username,
    Password: env.bse.password,
    ...timestamps,
  }
}

function isLikelyCorsError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed')
  )
}

function normalizeAnnouncements(payload: unknown): BseAnnouncement[] {
  if (Array.isArray(payload)) {
    return payload as BseAnnouncement[]
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: BseAnnouncement[] }).data
  }

  throw new BseApiError('Unexpected response format from BSE API.')
}

export async function fetchBseAnnouncements(
  signal?: AbortSignal,
): Promise<BseAnnouncement[]> {
  const requestBody = buildRequestBody()

  try {
    const response = await fetch(env.bse.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal,
    })

    if (!response.ok) {
      throw new BseApiError(`BSE API responded with status ${response.status}.`, {
        status: response.status,
      })
    }

    const payload: unknown = await response.json()
    return normalizeAnnouncements(payload)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    if (error instanceof BseApiError) {
      throw error
    }

    if (isLikelyCorsError(error)) {
      throw new BseApiError(
        'Unable to reach the BSE API from the browser due to CORS restrictions. ' +
          'The request was blocked before a response could be received. ' +
          'Move this call behind a backend proxy when deploying beyond this POC.',
        { isCorsError: true },
      )
    }

    throw new BseApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred while fetching announcements.',
    )
  }
}

export function getBseRequestPreview(): BseAnnouncementRequest {
  return buildRequestBody()
}
