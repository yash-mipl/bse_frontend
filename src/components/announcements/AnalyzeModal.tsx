import type { BseAnnouncement } from '@/types/bseAnnouncement'

type AnalyzeModalProps = {
  record: BseAnnouncement | null
  onClose: () => void
}

export function AnalyzeModal({ record, onClose }: AnalyzeModalProps) {
  if (!record) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyze-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="analyze-modal-title" className="text-lg font-semibold text-slate-900">
          Analysis coming soon
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Detailed analysis for <span className="font-medium">{record.CompanyName}</span> (
          {record.SCRIP_CD}) will be available in a future release.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
