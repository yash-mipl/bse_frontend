import { useState } from 'react'

import { AnalyzeModal } from '@/components/announcements/AnalyzeModal'
import { HeadlineTooltip } from '@/components/announcements/HeadlineTooltip'
import { Spinner } from '@/components/ui/Spinner'
import type { BseAnnouncement } from '@/types/bseAnnouncement'
import {
  formatAnnouncementType,
  formatBseDateTime,
  truncateWords,
} from '@/utils/bseAnnouncement'

type AnnouncementsTableProps = {
  announcements: BseAnnouncement[]
}

function AnalyzeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 6.285a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633l-.683-2.051zM13.949 13.285a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
    </svg>
  )
}

const stickyActionHeaderClass =
  'sticky top-0 right-0 z-40 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.12)]'

const stickyActionCellClass =
  'sticky right-0 z-10 bg-white px-4 py-3 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.08)] group-hover:bg-slate-50'

export function AnnouncementsTable({ announcements }: AnnouncementsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<BseAnnouncement | null>(null)
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null)

  const handleAnalyze = (record: BseAnnouncement, rowKey: string) => {
    setAnalyzingKey(rowKey)
    setSelectedRecord(record)
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
    setAnalyzingKey(null)
  }

  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-base font-medium text-slate-700">No corporate announcements found.</p>
        <p className="mt-1 text-sm text-slate-500">
          Try fetching again to load the latest BSE announcements.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Scrip Code
                </th>
                <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Company
                </th>
                <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Date &amp; Time
                </th>
                <th className="sticky top-0 z-20 min-w-[260px] bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Headline
                </th>
                <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Announcement Type
                </th>
                <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Meeting Type
                </th>
                <th className={stickyActionHeaderClass}>Action</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((record, index) => {
                const { date, time } = formatBseDateTime(record.DT_TM)
                const { display, isTruncated } = truncateWords(record.HeadLine, 30)
                const rowKey = `${record.SCRIP_CD}-${record.DT_TM}-${index}`

                return (
                  <tr
                    key={rowKey}
                    className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                      {record.SCRIP_CD}
                    </td>
                    <td className="min-w-[180px] px-4 py-3 text-sm text-slate-800">
                      {record.CompanyName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="font-medium text-slate-800">{date}</div>
                      {time && <div className="text-xs text-slate-500">{time}</div>}
                    </td>
                    <td className="min-w-[260px] max-w-sm px-4 py-3 text-sm text-slate-700">
                      {isTruncated ? (
                        <HeadlineTooltip headline={record.HeadLine}>
                          <span>{display}</span>
                        </HeadlineTooltip>
                      ) : (
                        <span>{display}</span>
                      )}
                    </td>
                    <td className="min-w-[160px] px-4 py-3 text-sm text-slate-700">
                      {formatAnnouncementType(record.TypeofAnnounce)}
                    </td>
                    <td className="min-w-[120px] px-4 py-3 text-sm text-slate-700">
                      {record.TypeofMeeting.trim() || '—'}
                    </td>
                    <td className={stickyActionCellClass}>
                      <button
                        type="button"
                        onClick={() => handleAnalyze(record, rowKey)}
                        disabled={analyzingKey === rowKey}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {analyzingKey === rowKey ? (
                          <>
                            <Spinner className="h-3.5 w-3.5 text-blue-700" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            <AnalyzeIcon />
                            Analyze
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnalyzeModal record={selectedRecord} onClose={handleCloseModal} />
    </>
  )
}
