import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchBseAnnouncements } from '@/services/bseAnnouncementService'
import type { BseAnnouncement, BseTimeFilters } from '@/types/bseAnnouncement'
import { BseApiError } from '@/types/bseAnnouncement'
import {
  bseFiltersToInputValues,
  getKolkataBseTimestamps,
  inputValuesToBseFilters,
} from '@/utils/bseAnnouncement'

type FetchMode = 'initial' | 'refresh'

type UseBseAnnouncementsResult = {
  announcements: BseAnnouncement[]
  isInitialLoading: boolean
  isRefreshing: boolean
  error: string | null
  refreshSuccess: boolean
  useCustomTime: boolean
  filterDate: string
  filterTime: string
  setUseCustomTime: (enabled: boolean) => void
  setFilterDate: (date: string) => void
  setFilterTime: (time: string) => void
  fetchLatest: () => Promise<void>
}

let initialLoadStarted = false

function getActiveTimeFilters(
  useCustomTime: boolean,
  filterDate: string,
  filterTime: string,
): BseTimeFilters | undefined {
  if (!useCustomTime || !filterDate || !filterTime) {
    return undefined
  }

  return inputValuesToBseFilters(filterDate, filterTime)
}

export function useBseAnnouncements(): UseBseAnnouncementsResult {
  const defaultInputs = bseFiltersToInputValues(getKolkataBseTimestamps())

  const [announcements, setAnnouncements] = useState<BseAnnouncement[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [filterDate, setFilterDate] = useState(defaultInputs.date)
  const [filterTime, setFilterTime] = useState(defaultInputs.time)

  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const successTimeoutRef = useRef<number | null>(null)
  const useCustomTimeRef = useRef(useCustomTime)
  const filterDateRef = useRef(filterDate)
  const filterTimeRef = useRef(filterTime)

  useCustomTimeRef.current = useCustomTime
  filterDateRef.current = filterDate
  filterTimeRef.current = filterTime

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

    const timeFilters = getActiveTimeFilters(
      useCustomTimeRef.current,
      filterDateRef.current,
      filterTimeRef.current,
    )

    try {
      const data = await fetchBseAnnouncements({
        signal: controller.signal,
        timeFilters,
      })
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
    refreshSuccess,
    useCustomTime,
    filterDate,
    filterTime,
    setUseCustomTime,
    setFilterDate,
    setFilterTime,
    fetchLatest,
  }
}
