import { useEffect, useState, type ReactNode } from 'react'

import { Spinner } from '@/components/ui/Spinner'
import {
  analyzeAnnouncement,
  AnalyzeApiError,
  type AnnouncementAnalysis,
} from '@/services/announcementAnalysisService'
import type { BseAnnouncement } from '@/types/bseAnnouncement'

type AnalyzeModalProps = {
  record: BseAnnouncement | null
  onClose: () => void
}

function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'positive' | 'negative' | 'neutral' | 'mixed' | 'high' | 'medium' | 'low'
}) {
  const toneClasses = {
    positive: 'bg-emerald-100 text-emerald-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-slate-100 text-slate-700',
    mixed: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-emerald-100 text-emerald-800',
  } as const

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

function sentimentTone(sentiment: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
  const value = sentiment.toLowerCase()
  if (value === 'positive') return 'positive'
  if (value === 'negative') return 'negative'
  if (value === 'mixed') return 'mixed'
  return 'neutral'
}

function materialityTone(materiality: string): 'high' | 'medium' | 'low' {
  const value = materiality.toLowerCase()
  if (value === 'high') return 'high'
  if (value === 'low') return 'low'
  return 'medium'
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  if (!children) return null

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  )
}

function AnalysisContent({ analysis }: { analysis: AnnouncementAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge tone={sentimentTone(analysis.quick_view.sentiment)}>
          {analysis.quick_view.sentiment}
        </Badge>
        <Badge tone={materialityTone(analysis.quick_view.materiality)}>
          {analysis.quick_view.materiality} materiality
        </Badge>
        <Badge tone="neutral">{analysis.category}</Badge>
        {analysis.fromCache && <Badge tone="neutral">Cached</Badge>}
      </div>

      {analysis.one_line_summary && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
          {analysis.one_line_summary}
        </p>
      )}

      {analysis.quick_view.headline_summary && (
        <p className="text-sm text-slate-600">{analysis.quick_view.headline_summary}</p>
      )}

      {analysis.quick_view.key_numbers_short &&
        analysis.quick_view.key_numbers_short !== 'N/A' && (
          <p className="text-sm font-medium text-slate-800">
            Key numbers: {analysis.quick_view.key_numbers_short}
          </p>
        )}

      <Section title="Summary">
        <p className="text-sm leading-relaxed text-slate-700">{analysis.summary}</p>
      </Section>

      <Section title="Key points">
        <BulletList items={analysis.key_points} />
      </Section>

      {analysis.key_numbers.length > 0 && (
        <Section title="Extracted numbers">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Metric</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Value</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Context</th>
                </tr>
              </thead>
              <tbody>
                {analysis.key_numbers.map((item, index) => (
                  <tr key={`${item.metric}-${index}`} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-800">{item.metric}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{item.value}</td>
                    <td className="px-3 py-2 text-slate-600">{item.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {analysis.why_it_matters && (
        <Section title="Why it matters">
          <p className="text-sm leading-relaxed text-slate-700">{analysis.why_it_matters}</p>
        </Section>
      )}

      <Section title="Positive factors">
        <BulletList items={analysis.positive_factors} />
      </Section>

      <Section title="Risks & concerns">
        <BulletList items={analysis.risks_or_concerns} />
      </Section>

      <Section title="Missing information">
        <BulletList items={analysis.missing_information} />
      </Section>

      {analysis.important_dates.length > 0 && (
        <Section title="Important dates">
          <ul className="space-y-2 text-sm text-slate-700">
            {analysis.important_dates.map((item, index) => (
              <li key={`${item.event}-${index}`} className="flex gap-2">
                <span className="font-medium text-slate-900">{item.event}:</span>
                <span>{item.date}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {analysis.ai_assessment && (
        <Section title="AI assessment">
          <p className="text-sm leading-relaxed text-slate-700">{analysis.ai_assessment}</p>
        </Section>
      )}

      {analysis.confidence.reason && (
        <p className="text-xs text-slate-500">
          Confidence: {analysis.confidence.level} — {analysis.confidence.reason}
        </p>
      )}

      <p className="text-xs text-slate-400">
        Processed {new Date(analysis.processedAt).toLocaleString()}
        {analysis.extractionMethod ? ` · Extraction: ${analysis.extractionMethod}` : ''}
        {analysis.numPages ? ` · ${analysis.numPages} page(s)` : ''}
      </p>
    </div>
  )
}

export function AnalyzeModal({ record, onClose }: AnalyzeModalProps) {
  const [analysis, setAnalysis] = useState<AnnouncementAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!record) {
      setAnalysis(null)
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)
    setAnalysis(null)
    setError(null)

    analyzeAnnouncement(record, controller.signal)
      .then((result) => {
        setAnalysis(result)
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return
        }

        const message =
          fetchError instanceof AnalyzeApiError
            ? fetchError.message
            : 'Failed to analyze announcement. Please try again.'

        setError(message)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [record])

  if (!record) return null

  const handleRetry = () => {
    setIsLoading(true)
    setAnalysis(null)
    setError(null)

    analyzeAnnouncement(record)
      .then(setAnalysis)
      .catch((fetchError) => {
        const message =
          fetchError instanceof AnalyzeApiError
            ? fetchError.message
            : 'Failed to analyze announcement. Please try again.'
        setError(message)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyze-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 id="analyze-modal-title" className="text-lg font-semibold text-slate-900">
            Announcement Analysis
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {record.CompanyName} ({record.SCRIP_CD})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Spinner className="h-8 w-8 text-blue-600" />
              <p className="text-sm font-medium text-slate-700">Analyzing announcement…</p>
              <p className="text-xs text-slate-500">
                Fetching PDF, extracting text, and running AI analysis. This may take a moment.
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
              <p className="font-medium">Analysis failed</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && analysis && <AnalysisContent analysis={analysis} />}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
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
