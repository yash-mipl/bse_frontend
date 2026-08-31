import { api } from '@/services/api'
import type { BseAnnouncement } from '@/types/bseAnnouncement'

export type AnnouncementQuickView = {
  sentiment: string
  materiality: string
  headline_summary: string
  key_numbers_short: string
}

export type AnnouncementKeyNumber = {
  metric: string
  value: string
  context: string
}

export type AnnouncementImportantDate = {
  event: string
  date: string
}

export type AnnouncementAnalysis = {
  company_name: string
  scrip_code: string
  category: string
  quick_view: AnnouncementQuickView
  summary: string
  key_points: string[]
  key_numbers: AnnouncementKeyNumber[]
  why_it_matters: string
  positive_factors: string[]
  risks_or_concerns: string[]
  missing_information: string[]
  important_dates: AnnouncementImportantDate[]
  ai_assessment: string
  confidence: {
    level: string
    reason: string
  }
  one_line_summary: string
  companyName: string
  scripCode: string
  materiality: string
  sentiment: string
  rawTextLength: number
  processedAt: string
  extractionMethod?: string
  numPages?: number
  attachmentUrl?: string
  fromCache?: boolean
}

export class AnalyzeApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AnalyzeApiError'
    this.status = status
  }
}

export async function analyzeAnnouncement(
  record: BseAnnouncement,
  signal?: AbortSignal,
): Promise<AnnouncementAnalysis> {
  try {
    return await api.post<AnnouncementAnalysis>('/announcements/analyze', record, { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    const apiError = error as { message?: string; status?: number }
    throw new AnalyzeApiError(
      apiError.message || 'Failed to analyze announcement. Please try again.',
      apiError.status,
    )
  }
}
