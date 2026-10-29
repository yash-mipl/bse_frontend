import { useCallback, useEffect, useRef } from 'react'

import type { BseAnnouncement } from '@/types/bseAnnouncement'
import { getAnnouncementKey } from '@/utils/announcementSync'
import {
  collectAutoOpenCandidates,
  loadOpenedPdfIds,
  markPdfOpened,
  openPdfInNewTab,
} from '@/utils/autoOpenPdf'

type UseAutoOpenMatchingPdfsResult = {
  handleNewAnnouncements: (records: BseAnnouncement[], newKeys: string[]) => void
}

export function useAutoOpenMatchingPdfs(): UseAutoOpenMatchingPdfsResult {
  const openedIdsRef = useRef<Set<string>>(loadOpenedPdfIds())
  const pendingIdsRef = useRef<Set<string>>(new Set())
  const monitoringReadyRef = useRef(false)

  const handleNewAnnouncements = useCallback(
    (records: BseAnnouncement[], newKeys: string[]) => {
      // First successful sync: establish baseline so historical matches are not opened.
      if (!monitoringReadyRef.current) {
        const allKeys = records.map((record) => getAnnouncementKey(record))
        const baselineCandidates = collectAutoOpenCandidates(
          records,
          allKeys,
          new Set(),
          new Set(),
        )

        for (const candidate of baselineCandidates) {
          openedIdsRef.current = markPdfOpened(candidate.documentId, openedIdsRef.current)
        }

        monitoringReadyRef.current = true
        console.info(
          `[auto-pdf] Baseline set (${baselineCandidates.length} matching); only future new records will auto-open`,
        )
        return
      }

      const candidates = collectAutoOpenCandidates(
        records,
        newKeys,
        openedIdsRef.current,
        pendingIdsRef.current,
      )

      if (candidates.length === 0) return

      console.info(`[auto-pdf] Opening ${candidates.length} new matching PDF(s)`)

      void (async () => {
        for (const candidate of candidates) {
          pendingIdsRef.current.add(candidate.documentId)

          // On listing → maximize + redirect.
          // While viewing a PDF (listing hidden) → background tab, no maximize.
          const listingVisible = document.visibilityState === 'visible'
          const shouldMaximize = listingVisible
          const shouldActivate = listingVisible

          const result = await openPdfInNewTab(candidate.pdfUrl, {
            maximize: shouldMaximize,
            active: shouldActivate,
          })

          if (result.opened) {
            console.info('[auto-pdf] Opened tab', {
              company: candidate.record.CompanyName,
              descriptor: candidate.record.Descriptor,
              maximized: shouldMaximize,
              active: shouldActivate,
              viaExtension: result.viaExtension,
              listingTabHidden: !listingVisible,
            })
          } else {
            console.warn(
              '[auto-pdf] Open blocked (install chrome-extension for background tabs while viewing a PDF)',
              candidate.record.CompanyName,
            )
          }

          openedIdsRef.current = markPdfOpened(candidate.documentId, openedIdsRef.current)
          pendingIdsRef.current.delete(candidate.documentId)
        }
      })()
    },
    [],
  )

  useEffect(() => {
    return () => {
      pendingIdsRef.current.clear()
    }
  }, [])

  return {
    handleNewAnnouncements,
  }
}
