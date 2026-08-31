import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchBseAnnouncements } from '@/services/bseAnnouncementService'
import type { BseAnnouncement } from '@/types/bseAnnouncement'
import { BseApiError } from '@/types/bseAnnouncement'

type FetchMode = 'initial' | 'refresh'

type UseBseAnnouncementsResult = {
  announcements: BseAnnouncement[]
  isInitialLoading: boolean
  isRefreshing: boolean
  error: string | null
  isCorsError: boolean
  refreshSuccess: boolean
  fetchLatest: () => Promise<void>
}

let initialLoadStarted = false

export function useBseAnnouncements(): UseBseAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<BseAnnouncement[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCorsError, setIsCorsError] = useState(false)
  const [refreshSuccess, setRefreshSuccess] = useState(false)

  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const successTimeoutRef = useRef<number | null>(null)

  const clearSuccessTimeout = useCallback(() => {
    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }, [])

  const runFetch = useCallback(async (mode: FetchMode) => {
    if (isFetchingRef.current) return

    isFetchingRef.current = true
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    if (mode === 'initial') {
      setIsInitialLoading(true)
    } else {
      setIsRefreshing(true)
      setRefreshSuccess(false)
      clearSuccessTimeout()
    }

    setError(null)
    setIsCorsError(false)

    try {
      const data = await fetchBseAnnouncements(controller.signal)
      setAnnouncements(data)

      if (mode === 'refresh') {
        setRefreshSuccess(true)
        clearSuccessTimeout()
        successTimeoutRef.current = window.setTimeout(() => {
          setRefreshSuccess(false)
        }, 3000)
      }
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return
      }

      const message =
        fetchError instanceof BseApiError
          ? fetchError.message
          : 'Unable to fetch the latest BSE announcements. Please try again.'

      setError(message)
      setIsCorsError(fetchError instanceof BseApiError && fetchError.isCorsError)
    } finally {
      if (abortControllerRef.current === controller) {
        isFetchingRef.current = false
        abortControllerRef.current = null

        if (mode === 'initial') {
          setIsInitialLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    }
  }, [clearSuccessTimeout])

  const fetchLatest = useCallback(async () => {
    await runFetch('refresh')
  }, [runFetch])

  useEffect(() => {
    if (initialLoadStarted) return

    initialLoadStarted = true
    void runFetch('initial')

    return () => {
      abortControllerRef.current?.abort()
      clearSuccessTimeout()
    }
  }, [runFetch, clearSuccessTimeout])

  return {
    announcements,
    isInitialLoading,
    isRefreshing,
    error,
    isCorsError,
    refreshSuccess,
    fetchLatest,
  }
}
