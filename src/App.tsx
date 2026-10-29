import { FetchLatestButton } from '@/components/announcements/FetchLatestButton'
import { LiveStatusIndicator } from '@/components/announcements/LiveStatusIndicator'
import { Layout } from '@/components/layout/Layout'
import { useBseAnnouncements } from '@/hooks/useBseAnnouncements'
import { AnnouncementsPage } from '@/pages/AnnouncementsPage'

function App() {
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

  return (
    <Layout
      headerActions={
        <>
          <LiveStatusIndicator
            isUpdating={isUpdating}
            hasUpdateError={hasUpdateError}
            lastUpdated={lastUpdated}
            isPaused={isPaused}
          />
          <FetchLatestButton
            onClick={fetchLatest}
            isLoading={isUpdating}
            disabled={false}
          />
        </>
      }
    >
      <AnnouncementsPage
        announcements={announcements}
        isInitialLoading={isInitialLoading}
        initialError={initialError}
        newRecordKeys={newRecordKeys}
      />
    </Layout>
  )
}

export default App
