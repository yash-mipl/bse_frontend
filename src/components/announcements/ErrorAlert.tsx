type ErrorAlertProps = {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <p className="font-medium">Unable to fetch the latest BSE announcements.</p>
      <p className="mt-1 text-red-700">{message}</p>
      <p className="mt-1 text-red-700">Please try again.</p>
    </div>
  )
}
