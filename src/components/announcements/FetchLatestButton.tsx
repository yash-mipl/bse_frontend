import { Spinner } from '@/components/ui/Spinner'

type FetchLatestButtonProps = {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export function FetchLatestButton({ onClick, isLoading, disabled = false }: FetchLatestButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <>
          <Spinner className="h-4 w-4 text-white" />
          Fetching…
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466 5.5 5.5 0 010-9.802 5.5 5.5 0 017.736 7.304l1.933 1.933a.75.75 0 001.06-1.06l-1.933-1.934zm-2.121 2.122a4 4 0 00-5.656-5.656 4 4 0 105.656 5.656z"
              clipRule="evenodd"
            />
          </svg>
          Fetch Latest
        </>
      )}
    </button>
  )
}
