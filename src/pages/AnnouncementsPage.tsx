import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable'
import { AnnouncementsTableSkeleton } from '@/components/announcements/AnnouncementsTableSkeleton'
import { ErrorAlert } from '@/components/announcements/ErrorAlert'
import { SCRIP_CODE_MAX, SCRIP_CODE_MIN } from '@/config/announcements'
import type { BseAnnouncement } from '@/types/bseAnnouncement'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type AnnouncementsPageProps = {
  announcements: BseAnnouncement[]
  isInitialLoading: boolean
  initialError: string | null
  newRecordKeys: Set<string>
}

export function AnnouncementsPage({
  announcements,
  isInitialLoading,
  initialError,
  newRecordKeys,
}: AnnouncementsPageProps) {
  useDocumentTitle('Corporate Announcements')

  const hasExistingData = announcements.length > 0
  const showSkeleton = isInitialLoading && !hasExistingData
  const showTable = hasExistingData || (!isInitialLoading && !initialError)

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 py-3 sm:px-6 lg:px-8">
      {initialError && !hasExistingData && (
        <div className="mb-3 shrink-0">
          <ErrorAlert message={initialError} />
        </div>
      )}

      {showSkeleton && (
        <div className="min-h-0 flex-1">
          <AnnouncementsTableSkeleton />
        </div>
      )}

      {showTable && hasExistingData && (
        <div className="min-h-0 flex-1">
          <AnnouncementsTable
            announcements={announcements}
            newRecordKeys={newRecordKeys}
          />
        </div>
      )}

      {!showSkeleton && !hasExistingData && !initialError && (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div>
            <p className="text-base font-medium text-slate-700">
              No corporate announcements found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Waiting for announcements in scrip range {SCRIP_CODE_MIN}–{SCRIP_CODE_MAX}…
            </p>
          </div>
        </div>
      )}

      {!showSkeleton && !hasExistingData && initialError && (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div>
            <p className="text-base font-medium text-slate-700">
              No corporate announcements found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              The request failed before any records could be loaded.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
