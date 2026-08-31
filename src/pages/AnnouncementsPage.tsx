import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable'
import { AnnouncementsTableSkeleton } from '@/components/announcements/AnnouncementsTableSkeleton'
// import { AnnouncementTimeFilters } from '@/components/announcements/AnnouncementTimeFilters'
import { ErrorAlert } from '@/components/announcements/ErrorAlert'
import { FetchLatestButton } from '@/components/announcements/FetchLatestButton'
import { LiveStatusIndicator } from '@/components/announcements/LiveStatusIndicator'
import { MAX_ANNOUNCEMENTS, SCRIP_CODE_MAX, SCRIP_CODE_MIN } from '@/config/announcements'
import { useBseAnnouncements } from '@/hooks/useBseAnnouncements'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AnnouncementsPage() {
  useDocumentTitle('Corporate Announcements')

  const {
    announcements,
    isInitialLoading,
    isUpdating,
    hasUpdateError,
    isPaused,
    lastUpdated,
    newRecordKeys,
    initialError,
    fetchLatest,
  } = useBseAnnouncements()

  const hasExistingData = announcements.length > 0
  const showSkeleton = isInitialLoading && !hasExistingData
  const showTable = hasExistingData || (!isInitialLoading && !initialError)

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            BSE Corporate Announcements
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time announcements — Scrip {SCRIP_CODE_MIN.toLocaleString()}–
            {SCRIP_CODE_MAX.toLocaleString()} — showing latest {announcements.length} of{' '}
            {MAX_ANNOUNCEMENTS}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <FetchLatestButton
            onClick={fetchLatest}
            isLoading={isUpdating}
            disabled={false}
          />
          <LiveStatusIndicator
            isUpdating={isUpdating}
            hasUpdateError={hasUpdateError}
            lastUpdated={lastUpdated}
            isPaused={isPaused}
          />
        </div>
      </div>

      {/* Custom date & time filter disabled — live IST timestamps are used on every poll */}
      {/* <div className="mb-4">
        <AnnouncementTimeFilters ... />
      </div> */}

      {initialError && !hasExistingData && (
        <div className="mb-4">
          <ErrorAlert message={initialError} />
        </div>
      )}

      {showSkeleton && <AnnouncementsTableSkeleton />}

      {showTable && hasExistingData && (
        <AnnouncementsTable
          announcements={announcements}
          newRecordKeys={newRecordKeys}
        />
      )}

      {!showSkeleton && !hasExistingData && !initialError && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">
            No corporate announcements found.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Waiting for announcements in scrip range {SCRIP_CODE_MIN}–{SCRIP_CODE_MAX}…
          </p>
        </div>
      )}

      {!showSkeleton && !hasExistingData && initialError && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">
            No corporate announcements found.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            The request failed before any records could be loaded.
          </p>
        </div>
      )}
    </section>
  )
}
