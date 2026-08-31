const SKELETON_ROWS = 6

const columns = [
  'w-16',
  'w-36',
  'w-24',
  'w-48',
  'w-28',
  'w-24',
  'w-20',
] as const

export function AnnouncementsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                'Scrip Code',
                'Company',
                'Date & Time',
                'Headline',
                'Announcement Type',
                'Meeting Type',
                'Action',
              ].map((label) => (
                <th
                  key={label}
                  className="sticky top-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0">
                {columns.map((widthClass, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <div
                      className={`h-3 animate-pulse rounded bg-slate-200 ${widthClass}`}
                      aria-hidden="true"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
