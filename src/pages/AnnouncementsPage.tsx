import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable'
import { AnnouncementsTableSkeleton } from '@/components/announcements/AnnouncementsTableSkeleton'
import { AnnouncementTimeFilters } from '@/components/announcements/AnnouncementTimeFilters'
import { ErrorAlert } from '@/components/announcements/ErrorAlert'
import { FetchLatestButton } from '@/components/announcements/FetchLatestButton'
import { useBseAnnouncements } from '@/hooks/useBseAnnouncements'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function AnnouncementsPage() {
  useDocumentTitle('Corporate Announcements')

  const {
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
  } = useBseAnnouncements()

  const showTableContent = !isInitialLoading
  const hasExistingData = announcements.length > 0

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            BSE Corporate Announcements
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Latest corporate announcements from BSE
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <FetchLatestButton
            onClick={() => void fetchLatest()}
            isLoading={isRefreshing}
            disabled={isInitialLoading}
          />
          {refreshSuccess && (
            <p className="text-sm font-medium text-emerald-600" role="status">
              Announcements updated successfully.
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <AnnouncementTimeFilters
          enabled={useCustomTime}
          onEnabledChange={setUseCustomTime}
          filterDate={filterDate}
          filterTime={filterTime}
          onFilterDateChange={setFilterDate}
          onFilterTimeChange={setFilterTime}
          disabled={isInitialLoading || isRefreshing}
        />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} />
        </div>
      )}

      {isInitialLoading && <AnnouncementsTableSkeleton />}

      {showTableContent && (hasExistingData || !error) && (
        <AnnouncementsTable announcements={announcements} />
      )}

      {showTableContent && !hasExistingData && error && (
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
