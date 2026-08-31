import { Spinner } from '@/components/ui/Spinner'

type LiveStatusIndicatorProps = {
  isUpdating: boolean
  hasUpdateError: boolean
  lastUpdated: Date | null
  isPaused: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function LiveStatusIndicator({
  isUpdating,
  hasUpdateError,
  lastUpdated,
  isPaused,
}: LiveStatusIndicatorProps) {
  if (isUpdating) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600" role="status">
        <Spinner className="h-3.5 w-3.5 text-blue-600" />
        <span>Updating…</span>
      </div>
    )
  }

  if (hasUpdateError) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700" role="status">
        <span aria-hidden="true">⚠</span>
        <span>Update failed — retrying automatically</span>
      </div>
    )
  }

  if (isPaused) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500" role="status">
        <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
        <span>Paused (tab hidden)</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600" role="status">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-medium text-emerald-700">Live</span>
      {lastUpdated && (
        <span className="text-slate-500">Last updated: {formatTime(lastUpdated)}</span>
      )}
    </div>
  )
}
