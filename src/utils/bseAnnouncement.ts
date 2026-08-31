import type { BseTimeFilters } from '@/types/bseAnnouncement'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const BSE_DT_TM_PATTERN =
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i

export type FormattedDateTime = {
  date: string
  time: string
}

const KOLKATA_TIMEZONE = 'Asia/Kolkata'

export function getKolkataBseTimestamps(date: Date = new Date()): BseTimeFilters {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: KOLKATA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '0'

  const year = get('year')
  const month = get('month')
  const day = get('day')
  const hour = Number.parseInt(get('hour'), 10)
  const minute = Number.parseInt(get('minute'), 10)

  return {
    Hr: String(hour === 24 ? 0 : hour),
    Min: String(minute),
    // BSE API is unreliable with live seconds — use start of minute
    Sec: '0',
    Tradedt: `${year}${month}${day}`,
  }
}

/** Build timestamps for the current Kolkata minute minus an offset (for BSE fallback). */
export function getKolkataBseTimestampsForMinuteOffset(
  minuteOffset: number = 0,
  baseDate: Date = new Date(),
): BseTimeFilters {
  const adjusted = new Date(baseDate.getTime() + minuteOffset * 60_000)
  return getKolkataBseTimestamps(adjusted)
}

/** Values for HTML date/time inputs from BSE filters. */
export function bseFiltersToInputValues(filters: BseTimeFilters): {
  date: string
  time: string
} {
  const year = filters.Tradedt.slice(0, 4)
  const month = filters.Tradedt.slice(4, 6)
  const day = filters.Tradedt.slice(6, 8)
  const hour = filters.Hr.padStart(2, '0')
  const minute = filters.Min.padStart(2, '0')
  const second = filters.Sec.padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:${second}`,
  }
}

export function inputValuesToBseFilters(date: string, time: string): BseTimeFilters {
  const [year, month, day] = date.split('-')
  const [hour = '0', minute = '0', second = '0'] = time.split(':')

  return {
    Hr: String(Number.parseInt(hour, 10)),
    Min: String(Number.parseInt(minute, 10)),
    Sec: String(Number.parseInt(second, 10)),
    Tradedt: `${year}${month}${day}`,
  }
}

/** Parse BSE DT_TM string without timezone conversion. */
export function formatBseDateTime(dtTm: string): FormattedDateTime {
  const trimmed = dtTm.trim()
  const match = trimmed.match(BSE_DT_TM_PATTERN)

  if (!match) {
    return { date: trimmed, time: '' }
  }

  const [, monthStr, dayStr, yearStr, hourStr, minuteStr, secondStr, ampmStr] = match
  const monthIndex = Number.parseInt(monthStr, 10) - 1
  const day = Number.parseInt(dayStr, 10)
  const monthName = MONTH_NAMES[monthIndex] ?? monthStr

  return {
    date: `${day} ${monthName} ${yearStr}`,
    time: `${hourStr}:${minuteStr}:${secondStr} ${ampmStr.toUpperCase()}`,
  }
}

export function truncateWords(
  text: string,
  maxWords: number,
): { display: string; isTruncated: boolean } {
  const normalized = text.trim()

  if (!normalized) {
    return { display: '—', isTruncated: false }
  }

  const words = normalized.split(/\s+/)

  if (words.length <= maxWords) {
    return { display: normalized, isTruncated: false }
  }

  return {
    display: `${words.slice(0, maxWords).join(' ')}...`,
    isTruncated: true,
  }
}

export function formatAnnouncementType(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return '—'
  return trimmed.replaceAll('_', ' ')
}
