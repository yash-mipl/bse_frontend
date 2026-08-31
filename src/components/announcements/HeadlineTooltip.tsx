import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type HeadlineTooltipProps = {
  headline: string
  children: ReactNode
}

export function HeadlineTooltip({ headline, children }: HeadlineTooltipProps) {
  const tooltipId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return

    const updatePosition = () => {
      if (!triggerRef.current) return

      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipWidth = 320
      const viewportPadding = 12

      let left = rect.left
      if (left + tooltipWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - tooltipWidth - viewportPadding
      }
      left = Math.max(viewportPadding, left)

      setPosition({
        top: rect.bottom + 8,
        left,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible])

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block max-w-xs cursor-help"
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
      >
        {children}
      </span>

      {isVisible &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[100] max-h-48 w-80 overflow-y-auto rounded-lg border border-slate-200 bg-slate-900 px-3 py-2 text-sm leading-relaxed text-slate-50 shadow-xl"
            style={{ top: position.top, left: position.left }}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
              Full Headline
            </p>
            <p className="whitespace-pre-wrap break-words">{headline}</p>
          </div>,
          document.body,
        )}
    </>
  )
}
