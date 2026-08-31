import { useCallback, useEffect, useRef, useState } from 'react'

import {
  MAX_ANNOUNCEMENTS,
  NEW_RECORD_HIGHLIGHT_MS,
  POLL_INTERVAL_MS,
} from '@/config/announcements'
import { fetchBseAnnouncements } from '@/services/bseAnnouncementService'
import type { BseAnnouncement } from '@/types/bseAnnouncement'
import {
  loadAnnouncementsFromStorage,
  saveAnnouncementsToStorage,
} from '@/utils/announcementStorage'
import {
  filterAnnouncementsByScripRange,
  sortAnnouncementsDesc,
  syncAnnouncements,
} from '@/utils/announcementSync'

type UseBseAnnouncementsResult = {
  announcements: BseAnnouncement[]
  isInitialLoading: boolean
  isUpdating: boolean
  hasUpdateError: boolean
  isPaused: boolean
  lastUpdated: Date | null
  newRecordKeys: Set<string>
  initialError: string | null
  fetchLatest: () => void
}

export function useBseAnnouncements(): UseBseAnnouncementsResult {
  const storedAll = loadAnnouncementsFromStorage()
  const storedRaw = filterAnnouncementsByScripRange(storedAll)
  const storedOnInit = sortAnnouncementsDesc(storedRaw).slice(0, MAX_ANNOUNCEMENTS)

  if (storedAll.length !== storedOnInit.length) {
    saveAnnouncementsToStorage(storedOnInit)
  }

  const [announcements, setAnnouncements] = useState<BseAnnouncement[]>(storedOnInit)
  const [isInitialLoading, setIsInitialLoading] = useState(storedOnInit.length === 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasUpdateError, setHasUpdateError] = useState(false)
  const [isPaused, setIsPaused] = useState(document.visibilityState === 'hidden')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [newRecordKeys, setNewRecordKeys] = useState<Set<string>>(new Set())
  const [initialError, setInitialError] = useState<string | null>(null)

  const announcementsRef = useRef(announcements)
  const isFetchingRef = useRef(false)
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const pollTimeoutRef = useRef<number | null>(null)
  const highlightTimeoutRef = useRef<number | null>(null)
  const hasFetchedOnceRef = useRef(false)

  announcementsRef.current = announcements

  const clearPollTimeout = useCallback(() => {
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }, [])

  const clearHighlightTimeout = useCallback(() => {
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = null
    }
  }, [])

  const applyHighlight = useCallback(
    (keys: string[]) => {
      if (keys.length === 0) return

      setNewRecordKeys(new Set(keys))
      clearHighlightTimeout()
      highlightTimeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          setNewRecordKeys(new Set())
        }
      }, NEW_RECORD_HIGHLIGHT_MS)
    },
    [clearHighlightTimeout],
  )

  const applySyncResult = useCallback(
    (apiRecords: BseAnnouncement[]) => {
      const { records, newKeys, hasChanges } = syncAnnouncements(
        announcementsRef.current,
        apiRecords,
        MAX_ANNOUNCEMENTS,
      )

      if (hasChanges) {
        announcementsRef.current = records
        setAnnouncements(records)
        saveAnnouncementsToStorage(records)
        applyHighlight(newKeys)
      }

      return hasChanges
    },
    [applyHighlight],
  )

  const scheduleNextPoll = useCallback(
    (delay: number = POLL_INTERVAL_MS) => {
      if (!isMountedRef.current || document.visibilityState === 'hidden') return

      clearPollTimeout()
      pollTimeoutRef.current = window.setTimeout(() => {
        void pollRef.current()
      }, delay)
    },
    [clearPollTimeout],
  )

  const performFetch = useCallback(async (): Promise<boolean> => {
    if (isFetchingRef.current || !isMountedRef.current) return false

    isFetchingRef.current = true
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsUpdating(true)
    setHasUpdateError(false)

    try {
      const apiRecords = await fetchBseAnnouncements({
        signal: controller.signal,
      })

      if (!isMountedRef.current) return false

      applySyncResult(apiRecords)
      setLastUpdated(new Date())
      setInitialError(null)
      hasFetchedOnceRef.current = true
      return true
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return false
      }

      if (!isMountedRef.current) return false

      setHasUpdateError(true)

      if (!hasFetchedOnceRef.current && announcementsRef.current.length === 0) {
        setInitialError('Unable to fetch the latest BSE announcements. Please try again.')
      }

      return false
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }

      if (isMountedRef.current) {
        isFetchingRef.current = false
        setIsUpdating(false)
        setIsInitialLoading(false)
      }
    }
  }, [applySyncResult])

  const pollRef = useRef<() => Promise<void>>(async () => {})

  pollRef.current = async () => {
    if (!isMountedRef.current) return

    if (document.visibilityState === 'hidden') {
      setIsPaused(true)
      return
    }

    setIsPaused(false)

    if (isFetchingRef.current) {
      scheduleNextPoll()
      return
    }

    await performFetch()

    if (isMountedRef.current && document.visibilityState === 'visible') {
      scheduleNextPoll()
    }
  }

  const fetchLatest = useCallback(() => {
    if (isFetchingRef.current) return

    clearPollTimeout()
    void performFetch().finally(() => {
      if (isMountedRef.current && document.visibilityState === 'visible') {
        scheduleNextPoll()
      }
    })
  }, [clearPollTimeout, performFetch, scheduleNextPoll])

  useEffect(() => {
    isMountedRef.current = true

    void performFetch().finally(() => {
      if (isMountedRef.current && document.visibilityState === 'visible') {
        scheduleNextPoll()
      }
    })

    const handleVisibilityChange = () => {
      const hidden = document.visibilityState === 'hidden'
      setIsPaused(hidden)

      if (hidden) {
        clearPollTimeout()
        return
      }

      clearPollTimeout()
      void performFetch().finally(() => {
        if (isMountedRef.current) {
          scheduleNextPoll()
        }
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMountedRef.current = false
      clearPollTimeout()
      clearHighlightTimeout()
      abortControllerRef.current?.abort()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [clearHighlightTimeout, clearPollTimeout, performFetch, scheduleNextPoll])

  return {
    announcements,
    isInitialLoading,
    isUpdating,
    hasUpdateError,
    isPaused,
    lastUpdated,
    newRecordKeys,
    initialError,
    fetchLatest,
  }
}
