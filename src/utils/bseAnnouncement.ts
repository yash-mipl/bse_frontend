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

export function buildBseRequestTimestamps(date: Date = new Date()): {
  Hr: string
  Min: string
  Sec: string
  Tradedt: string
} {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return {
    Hr: String(date.getHours()),
    Min: String(date.getMinutes()),
    Sec: String(date.getSeconds()),
    Tradedt: `${year}${month}${day}`,
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
