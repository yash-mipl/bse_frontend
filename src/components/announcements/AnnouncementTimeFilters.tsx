import type { BseTimeFilters } from '@/types/bseAnnouncement'
import {
  bseFiltersToInputValues,
  getKolkataBseTimestamps,
  inputValuesToBseFilters,
} from '@/utils/bseAnnouncement'

type AnnouncementTimeFiltersProps = {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  filterDate: string
  filterTime: string
  onFilterDateChange: (date: string) => void
  onFilterTimeChange: (time: string) => void
  disabled?: boolean
}

export function AnnouncementTimeFilters({
  enabled,
  onEnabledChange,
  filterDate,
  filterTime,
  onFilterDateChange,
  onFilterTimeChange,
  disabled = false,
}: AnnouncementTimeFiltersProps) {
  const handleToggle = () => {
    const nextEnabled = !enabled
    onEnabledChange(nextEnabled)

    if (nextEnabled && (!filterDate || !filterTime)) {
      const defaults = bseFiltersToInputValues(getKolkataBseTimestamps())
      onFilterDateChange(defaults.date)
      onFilterTimeChange(defaults.time)
    }
  }

  const previewFilters: BseTimeFilters | null =
    enabled && filterDate && filterTime
      ? inputValuesToBseFilters(filterDate, filterTime)
      : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Time filter</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Optional — leave off to use current server time (Asia/Kolkata)
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Use custom date &amp; time
        </label>
      </div>

      {enabled && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Trade date</span>
            <input
              type="date"
              value={filterDate}
              onChange={(event) => onFilterDateChange(event.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Time (IST)</span>
            <input
              type="time"
              step={1}
              value={filterTime}
              onChange={(event) => onFilterTimeChange(event.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>
        </div>
      )}

      {previewFilters && (
        <p className="mt-3 text-xs text-slate-500">
          Request will use: Hr={previewFilters.Hr}, Min={previewFilters.Min}, Sec=
          {previewFilters.Sec}, Tradedt={previewFilters.Tradedt}
        </p>
      )}
    </div>
  )
}
